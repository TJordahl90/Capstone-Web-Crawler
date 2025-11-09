try:
    import undetected_chromedriver as uc
    UNDETECTED_AVAILABLE = True
except ImportError:
    UNDETECTED_AVAILABLE = False
    from selenium import webdriver
    
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import random
import re
import os
from datetime import datetime

def load_keywords(filename):
    """Load keywords from file"""
    try:
        if not os.path.exists(filename):
            return []
        with open(filename, 'r', encoding='utf-8') as f:
            return [line.strip() for line in f if line.strip()]
    except:
        return []

def extract_skills_and_careers(text, keywords):
    """Extract skills or careers"""
    if not keywords:
        return []
    found = []
    text_lower = text.lower()
    for keyword in keywords:
        keyword_lower = keyword.lower()
        
        # Skip very short keywords (too generic)
        if len(keyword_lower) <= 2:
            continue
        
        # Use word boundaries to avoid partial matches
        pattern = r'\b' + re.escape(keyword_lower) + r'\b'
        if re.search(pattern, text_lower):
            if keyword not in found:
                found.append(keyword)
    
    return found

def extract_degree(text):
    """Extract minimum degree requirement"""
    text_lower = text.lower()
    
    degree_hierarchy = {
        "Associate": 1,
        "Bachelor's": 2,
        "Master's": 3,
        "PhD": 4
    }
    
    # More specific patterns with context
    degree_patterns = {
        "PhD": [
            r'\bph\.?d\b',
            r'\bdoctorate\b',
            r'\bdoctoral degree\b'
        ],
        "Master's": [
            r'\bmaster\'?s? degree\b',
            r'\bm\.?s\.?\b(?! office)',
            r'\bm\.?a\.?\b',
            r'\bmba\b',
            r'\bgraduate degree\b'
        ],
        "Bachelor's": [
            r'\bbachelor\'?s? degree\b',
            r'\bb\.?s\.?\b(?! required)',
            r'\bb\.?a\.?\b',
            r'\bundergraduate degree\b',
            r'\b4-year degree\b',
            r'\bbachelors?\b'
        ],
        "Associate": [
            r'\bassociate\'?s? degree\b',
            r'\bassociates?\b',
            r'\b2-year degree\b',
            r'\baa degree\b',
            r'\bas degree\b'
        ]
    }
    
    requirement_keywords = [
        'required', 'requires', 'require', 'minimum', 'must have',
        'preferred', 'desired', 'seeking', 'looking for'
    ]
    
    found_degrees = []
    
    for degree, patterns in degree_patterns.items():
        for pattern in patterns:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                start = max(0, match.start() - 100)
                end = min(len(text_lower), match.end() + 100)
                context = text_lower[start:end]
                
                is_requirement = any(keyword in context for keyword in requirement_keywords)
                
                if is_requirement and degree not in found_degrees:
                    found_degrees.append(degree)
                    break
    
    if not found_degrees:
        if re.search(r'degree required|must have.*degree|requires.*degree', text_lower):
            return ["Bachelor's"]
        return []
    
    # Return list with minimum degree
    return [min(found_degrees, key=lambda d: degree_hierarchy[d])]

def extract_experience(text):
    """Extract experience level based on years required"""
    text_lower = text.lower()
    
    patterns = [
        r'(\d+)\s*\+\s*years?',
        r'(\d+)\s+to\s+(\d+)\s+years?',
        r'(\d+)\s*-\s*(\d+)\s+years?',
        r'minimum\s+(?:of\s+)?(\d+)\s+years?',
        r'at least\s+(\d+)\s+years?',
        r'(\d+)\s+years?\s+(?:of\s+)?(?:experience|exp)',
    ]
    
    years_found = []
    
    for pattern in patterns:
        matches = re.finditer(pattern, text_lower)
        for match in matches:
            start = max(0, match.start() - 50)
            end = min(len(text_lower), match.end() + 50)
            context = text_lower[start:end]
            
            exp_keywords = ['experience', 'exp', 'background', 'work history']
            if any(keyword in context for keyword in exp_keywords):
                numbers = [int(g) for g in match.groups() if g and g.isdigit()]
                years_found.extend(numbers)
    
    if not years_found:
        entry_indicators = [
            'entry level', 'entry-level', 'junior', 'recent grad',
            'new grad', 'no experience required', '0 years'
        ]
        if any(indicator in text_lower for indicator in entry_indicators):
            return ['Entry Level']
        return []
    
    max_years = max(years_found)
    
    if max_years <= 2:
        return ['Entry Level']
    elif 3 <= max_years <= 5:
        return ['Mid Level']
    else:
        return ['Senior']

def extract_employment_type(text):
    """Extract employment type from job description"""
    text_lower = text.lower()
    employment_types = []
    
    if 'full-time' in text_lower or 'full time' in text_lower:
        employment_types.append('Full-time')
    if 'part-time' in text_lower or 'part time' in text_lower:
        employment_types.append('Part-time')
    if 'contract' in text_lower or 'contractor' in text_lower:
        employment_types.append('Contract')
    if 'temporary' in text_lower or 'temp' in text_lower:
        employment_types.append('Temporary')
    if 'internship' in text_lower or 'intern' in text_lower:
        employment_types.append('Internship')
    
    return employment_types if employment_types else []

def extract_work_model(location_text):
    """Extract work model from location text"""
    work_models = []
    if location_text:
        loc_lower = location_text.lower()
        # Normalize different types of dashes and spaces
        for dash in ['\u2011', '–', '—', '-']:
            loc_lower = loc_lower.replace(dash, '-')
        loc_lower = loc_lower.replace('\u00a0', ' ').replace('\u202f', ' ')
        loc_lower = re.sub(r'\s+', ' ', loc_lower).strip()
        
        if 'remote' in loc_lower:
            work_models.append('Remote')
        if 'hybrid' in loc_lower:
            work_models.append('Hybrid')
        if ('on-site' in loc_lower or 'onsite' in loc_lower or
            'on site' in loc_lower or 'in-person' in loc_lower or
            'in person' in loc_lower or ' site' in loc_lower or
            loc_lower == 'site'):
            work_models.append('On-site')
    
    return work_models

def ziprecruiter_scraper(search_url="https://www.ziprecruiter.com/jobs-search?search=IT+Support&location=Dallas%2C+TX&refine_by_location_type=&radius=25&refine_by_employment=employment_type%3Aall", max_jobs=1000, speed_mode='aggressive'):
    """
    Main scraper function that returns job data in Django-compatible format
    """
    print("="*60)
    print(f"🚀 ZIPRECRUITER SCRAPER")
    print(f"🎯 Target: {max_jobs} jobs")
    print("="*60)
    
    job_data = []
    jobs_scraped = 0
    scraped_urls = set()
    last_description = None
    
    # Load keywords
    skill_keywords = load_keywords("keywords_skills.txt")
    career_keywords = load_keywords("keywords_careers.txt")
    
    # Setup Chrome
    if UNDETECTED_AVAILABLE:
        print("🎭 Using UNDETECTED ChromeDriver")
        options = uc.ChromeOptions()
        options.add_argument('--disable-backgrounding-occluded-windows')
        options.add_argument('--disable-renderer-backgrounding')
        options.add_argument('--disable-background-timer-throttling')
        options.add_argument('--disable-ipc-flooding-protection')
        driver = uc.Chrome(options=options)
    else:
        print("🚀 Using standard ChromeDriver")
        chrome_options = Options()
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--disable-backgrounding-occluded-windows')
        chrome_options.add_argument('--disable-renderer-backgrounding')
        chrome_options.add_argument('--disable-background-timer-throttling')
        chrome_options.add_argument('--disable-ipc-flooding-protection')
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=chrome_options
        )
    
    driver.maximize_window()
    
    def human_delay():
        """Delay based on speed mode"""
        if speed_mode == 'fast':
            delay = random.uniform(3, 6)
        elif speed_mode == 'aggressive':
            delay = random.uniform(5, 10)
        else:
            delay = random.uniform(15, 25)
        time.sleep(delay)
    
    def wait_for_description_change(max_attempts=5):
        """Wait for description to actually change from previous job"""
        nonlocal last_description
        
        for attempt in range(max_attempts):
            try:
                current_description = ""
                
                # Try multiple selectors
                selectors = [
                    ".text-primary.whitespace-pre-line",
                    "div.text-primary[class*='whitespace']",
                    "[data-testid='jobDescriptionText']",
                    "div[class*='job_description']"
                ]
                
                for selector in selectors:
                    try:
                        desc_elem = driver.find_element(By.CSS_SELECTOR, selector)
                        current_description = desc_elem.text
                        if len(current_description) > 100:
                            break
                    except:
                        continue
                
                if len(current_description) > 100 and current_description != last_description:
                    last_description = current_description
                    return current_description
                
                time.sleep(2)
                
            except Exception:
                time.sleep(2)
                continue
        
        return ""
    
    try:
        # Load the initial search URL
        print(f"\n🌐 Loading initial search page...")
        driver.get(search_url)
        time.sleep(3)
        
        page = 1
        
        while jobs_scraped < max_jobs:
            print(f"\n{'='*60}")
            print(f"📄 PAGE {page}")
            print(f"{'='*60}")
            
            # Wait for job cards
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "article[id^='job-card']"))
                )
            except:
                print("⚠️  No job cards found")
                break
            
            job_cards = driver.find_elements(By.CSS_SELECTOR, "article[id^='job-card']")
            print(f"Found {len(job_cards)} jobs")
            
            for idx in range(len(job_cards)):
                if jobs_scraped >= max_jobs:
                    break
                
                try:
                    # Re-fetch cards
                    job_cards = driver.find_elements(By.CSS_SELECTOR, "article[id^='job-card']")
                    
                    if idx >= len(job_cards):
                        break
                    
                    card = job_cards[idx]
                    job_id = card.get_attribute("id")
                    
                    # Check duplicate
                    if job_id in scraped_urls:
                        continue
                    
                    # Extract basic info
                    title = card.find_element(By.CSS_SELECTOR, "h2").text.strip()
                    
                    try:
                        company = card.find_element(By.CSS_SELECTOR, "[data-testid='job-card-company']").text.strip()
                    except:
                        company = ""
                    
                    # Location extraction
                    combined_loc = ""
                    location = ""
                    
                    try:
                        a_loc = card.find_element(By.CSS_SELECTOR, "a[data-testid='job-card-location']")
                        city_state = (a_loc.get_attribute("innerText") or a_loc.text or "").strip()
                        
                        p_container = a_loc.find_element(By.XPATH, "./ancestor::p[1]")
                        span_bits = []
                        for s in p_container.find_elements(By.TAG_NAME, "span"):
                            txt = (s.get_attribute("innerText") or s.text or "").strip()
                            if txt:
                                span_bits.append(txt)
                        
                        right_side = " ".join(span_bits).strip()
                        combined_loc = (f"{city_state} {right_side}".strip() if city_state else right_side).strip()
                        
                        if "•" in combined_loc:
                            location = combined_loc.split("•", 1)[0].strip()
                        elif "·" in combined_loc:
                            location = combined_loc.split("·", 1)[0].strip()
                        else:
                            location = city_state or combined_loc
                    except:
                        pass
                    
                    # Extract work models
                    work_models = extract_work_model(combined_loc)
                    
                    try:
                        salary = card.find_element(By.XPATH, ".//p[contains(text(), '$')]").text.strip()
                    except:
                        salary = None
                    
                    try:
                        employment_type_text = card.find_element(By.XPATH, ".//p[contains(text(), 'Full-time') or contains(text(), 'Part-time') or contains(text(), 'Contract')]").text.strip()
                    except:
                        employment_type_text = ""
                    
                    # Extract logo URL from job card
                    logo_url = None
                    try:
                        logo_img = card.find_element(By.TAG_NAME, "img")
                        logo_url = logo_img.get_attribute("src")
                    except:
                        pass
                    
                    # Extract job URL
                    job_url = ""
                    try:
                        company_link = card.find_element(By.CSS_SELECTOR, "a[data-testid='job-card-company']")
                        href = company_link.get_attribute("href")
                        if href:
                            if href.startswith('/'):
                                job_url = f"https://www.ziprecruiter.com{href}"
                            else:
                                job_url = href
                    except:
                        clean_id = job_id.replace("job-card-", "")
                        job_url = f"https://www.ziprecruiter.com/c/{clean_id}"
                    
                    # Click for description
                    description = ""
                    
                    try:
                        link = card.find_element(By.CSS_SELECTOR, "button[aria-label*='View']")
                        driver.execute_script("window.focus();")
                        link.click()
                        time.sleep(5)
                        
                        try:
                            desc_elem = driver.find_element(By.CSS_SELECTOR, ".text-primary.whitespace-pre-line")
                            driver.execute_script("arguments[0].scrollIntoView(true);", desc_elem)
                            time.sleep(1)
                        except:
                            pass
                        
                        description = wait_for_description_change()
                    except:
                        pass
                    
                    scraped_urls.add(job_id)
                    
                    # Analysis
                    complete_text = (title + " " + description).lower()
                    skills = extract_skills_and_careers(complete_text, skill_keywords)
                    careers = extract_skills_and_careers(complete_text, career_keywords)
                    
                    # Special case: IT → Information Technology
                    if re.search(r'\bIT\b', title + " " + description):
                        if "information technology" not in [c.lower() for c in careers]:
                            careers.append("Information Technology")
                    
                    degrees = extract_degree(complete_text)
                    experience_levels = extract_experience(description if description else title)
                    employment_types = extract_employment_type(employment_type_text + " " + complete_text)
                    
                    # Only add jobs with skills
                    if skills:
                        job_details = {
                            'company': company if company else "Unknown",
                            'title': title,
                            'description': description,
                            'summary': "",  # ZipRecruiter doesn't provide summaries
                            'skills': skills,
                            'careers': careers,
                            'degrees': degrees,
                            'experienceLevels': experience_levels,
                            'employmentTypes': employment_types,
                            'workModels': work_models,
                            'location': location,
                            'datePosted': None,  # ZipRecruiter doesn't show posting dates
                            'salary': salary,
                            'jobURL': job_url,
                            'logoURL': logo_url
                        }
                        
                        job_data.append(job_details)
                        jobs_scraped += 1
                        
                        print(f"✅ [{jobs_scraped}] {title[:50]}...")
                    
                    human_delay()
                    
                except Exception as e:
                    print(f"❌ Error: {e}")
                    continue
            
            if jobs_scraped >= max_jobs:
                break
            
            # Go to next page
            print(f"\n🔄 Going to next page...")
            page += 1
            next_page_url = search_url + f"&page={page}"
            driver.get(next_page_url)
            time.sleep(3)
        
        print("\n" + "="*60)
        print(f"✨ SCRAPING COMPLETE!")
        print(f"Total scraped: {len(job_data)} jobs")
        print("="*60)
        
        # Save to CSV
        if job_data:
            import csv
            fieldnames = [
                "company", "title", "description", "summary", "skills", "careers", "degrees", 
                "experienceLevels", "employmentTypes", "workModels", "location", "datePosted", 
                "salary", "jobURL", 'logoURL'
            ]
            
            csv_filename = "ziprecruiter_jobs.csv"
            with open(csv_filename, "w", newline="", encoding="utf-8") as file:
                writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                
                # Convert lists to comma-separated strings for CSV
                for job in job_data:
                    job_copy = job.copy()
                    for field in ['skills', 'careers', 'degrees', 'experienceLevels', 'employmentTypes', 'workModels']:
                        if isinstance(job_copy.get(field), list):
                            job_copy[field] = ', '.join(job_copy[field])
                    writer.writerow(job_copy)
            
            print(f"💾 Saved to {csv_filename}")
        
        return job_data
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return job_data
        
    finally:
        driver.quit()


if __name__ == "__main__":
    # Test the scraper
    jobs = ziprecruiter_scraper(max_jobs=10)
    print(f"\nReturned {len(jobs)} jobs")
    if jobs:
        print("\nSample job:")
        print(jobs[0])