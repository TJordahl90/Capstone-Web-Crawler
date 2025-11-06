from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import time
import random

class IndeedDetailedScraper:
    def __init__(self, search_url, max_jobs=50):
        self.search_url = search_url
        self.max_jobs = max_jobs
        self.jobs = []
        self.jobs_scraped = 0
        
        # Setup Chrome
        chrome_options = Options()
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        print("🚀 Starting Chrome browser...")
        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=chrome_options
        )
        
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        self.driver.maximize_window()
    
    def human_delay(self, min_sec=20, max_sec=35):
        """Human-like delay"""
        delay = random.uniform(min_sec, max_sec)
        print(f"⏳ Reading... {delay:.1f}s")
        time.sleep(delay)
    
    def extract_job_details(self, job_card):
        """Click job and extract ALL details"""
        try:
            # Get basic info and click
            title_element = job_card.find_element(By.CSS_SELECTOR, "h2.jobTitle a")
            title = title_element.text
            
            try:
                company = job_card.find_element(By.CSS_SELECTOR, "[data-testid='company-name']").text
            except:
                company = "N/A"
            
            try:
                location = job_card.find_element(By.CSS_SELECTOR, "[data-testid='text-location']").text
            except:
                location = "N/A"
            
            print(f"\n📋 [{self.jobs_scraped + 1}] {title[:50]}...")
            
            # Scroll and click
            self.driver.execute_script("arguments[0].scrollIntoView(true);", title_element)
            time.sleep(1)
            title_element.click()
            time.sleep(3)
            
            # NOW EXTRACT DETAILED INFO
            
            # 1. JOB DESCRIPTION
            description = "N/A"
            try:
                desc_element = self.driver.find_element(By.ID, "jobDescriptionText")
                description = desc_element.text
                print(f"   ✅ Description: {len(description)} characters")
            except Exception as e:
                print(f"   ⚠️  Description not found: {e}")
            
            # 2. EMPLOYMENT TYPE (Full-time, Part-time, etc.)
            employment_type = "N/A"
            try:
                # Look for the employment type span
                emp_elements = self.driver.find_elements(By.CSS_SELECTOR, "span.css-1u1g3ig")
                for elem in emp_elements:
                    text = elem.text.strip()
                    # Remove the leading dash if present
                    if text.startswith('-'):
                        text = text[1:].strip()
                    if any(keyword in text.lower() for keyword in ['full-time', 'part-time', 'contract', 'temporary', 'internship']):
                        employment_type = text
                        print(f"   ✅ Type: {employment_type}")
                        break
            except Exception as e:
                print(f"   ⚠️  Employment type not found: {e}")
            
            # 3. SALARY
            salary = "N/A"
            try:
                # Try the specific salary class
                salary_element = self.driver.find_element(By.CSS_SELECTOR, "span.css-1oc7tea")
                salary = salary_element.text
                print(f"   ✅ Salary: {salary}")
            except:
                try:
                    # Fallback: Look for any salary info
                    salary_elements = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='attribute_snippet_testid']")
                    for elem in salary_elements:
                        text = elem.text
                        if "$" in text or "hour" in text.lower() or "year" in text.lower():
                            salary = text
                            print(f"   ✅ Salary: {salary}")
                            break
                except:
                    print(f"   ⚠️  Salary not found")
            
            # 4. COMPANY LOGO
            logo_url = "N/A"
            try:
                logo_element = self.driver.find_element(By.CSS_SELECTOR, "img.jobsearch-JobInfoHeader-logo")
                logo_url = logo_element.get_attribute("src")
                print(f"   ✅ Logo found")
            except:
                try:
                    # Alternative logo selector
                    logo_element = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='jobsearch-JobInfoHeader-logo-overlay-lower']")
                    logo_url = logo_element.get_attribute("src")
                    print(f"   ✅ Logo found (alt)")
                except:
                    print(f"   ⚠️  Logo not found")
            
            # 5. JOB URL (get current URL after clicking)
            job_url = self.driver.current_url
            
            job_data = {
                'title': title,
                'company': company,
                'location': location,
                'employment_type': employment_type,
                'salary': salary,
                'description': description,
                'logo_url': logo_url,
                'url': job_url,
                'scraped_at': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            print(f"   ✅ COMPLETE: {title[:40]}...")
            return job_data
            
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            return None
    
    def scrape_first_page(self):
        """Scrape ONLY the first page for testing"""
        try:
            print("="*60)
            print("🧪 TEST MODE: Scraping First Page Only")
            print("="*60)
            
            # Load page
            print(f"\n🌐 Loading: {self.search_url}")
            self.driver.get(self.search_url)
            time.sleep(3)
            
            # Wait for jobs to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "job_seen_beacon"))
            )
            
            # Get all job cards on page
            job_cards = self.driver.find_elements(By.CLASS_NAME, "job_seen_beacon")
            print(f"\n📄 Found {len(job_cards)} jobs on first page")
            
            # Scrape each job
            for i, job_card in enumerate(job_cards):
                if self.jobs_scraped >= self.max_jobs:
                    break
                
                job_data = self.extract_job_details(job_card)
                
                if job_data:
                    self.jobs.append(job_data)
                    self.jobs_scraped += 1
                    
                    # Human delay between jobs
                    if i < len(job_cards) - 1:  # Don't delay after last job
                        self.human_delay(20, 35)
            
            # Save results
            self.save_results()
            
            print("\n" + "="*60)
            print(f"✨ Test Complete!")
            print(f"📊 Jobs scraped: {len(self.jobs)}")
            print("="*60)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            print("\n🔒 Closing browser in 3 seconds...")
            time.sleep(3)
            self.driver.quit()
    
    def save_results(self, filename='indeed_test_results.xlsx'):
        """Save to Excel/CSV"""
        if self.jobs:
            df = pd.DataFrame(self.jobs)
            
            # Try Excel first
            try:
                df.to_excel(filename, index=False)
                print(f"\n💾 Saved to {filename}")
            except ImportError:
                csv_filename = filename.replace('.xlsx', '.csv')
                df.to_csv(csv_filename, index=False)
                print(f"\n💾 Saved to {csv_filename}")
            
            # Print summary
            print("\n📊 DATA SUMMARY:")
            print(f"   Total jobs: {len(self.jobs)}")
            print(f"   With descriptions: {sum(1 for j in self.jobs if j['description'] != 'N/A')}")
            print(f"   With salary: {sum(1 for j in self.jobs if j['salary'] != 'N/A')}")
            print(f"   With logo: {sum(1 for j in self.jobs if j['logo_url'] != 'N/A')}")
        else:
            print("\n⚠️  No jobs to save")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🧪 INDEED SCRAPER - TEST MODE (First Page Only)")
    print("="*60)
    print("\n✅ Will extract:")
    print("   • Job title, company, location")
    print("   • Employment type (Full-time, Part-time, etc.)")
    print("   • Salary")
    print("   • Full job description")
    print("   • Company logo URL")
    print("   • Job posting URL")
    print("\n⏱️  Timing: 20-35 seconds per job")
    print("📄 Scraping: FIRST PAGE ONLY (for testing)")
    print("="*60)
    
    input("\nPress ENTER to start scraping...")
    
    # Entry-level tech jobs
    url = "https://www.indeed.com/jobs?q=technology&l=Fort+Worth%2C+TX&radius=50&sc=0kf%3Aexplvl%28ENTRY_LEVEL%29%3B&from=searchOnDesktopSerp&vjk=a2e1725afbe534d5&advn=9112618986767135"
    
    # Test with first page only (usually ~15 jobs)
    scraper = IndeedDetailedScraper(url, max_jobs=15)
    scraper.scrape_first_page()
