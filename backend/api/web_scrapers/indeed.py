from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
try:
    import undetected_chromedriver as uc
    UNDETECTED_AVAILABLE = True
except ImportError:
    UNDETECTED_AVAILABLE = False
    print("⚠️  undetected-chromedriver not installed. Install with: pip install undetected-chromedriver")
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import time
import random
import re
import os
import logging

class IndeedAdvancedScraper:
    def __init__(self, search_url, max_jobs=50, speed_mode='balanced', resume_file='indeed_progress.xlsx'):
        self.search_url = search_url
        self.max_jobs = max_jobs
        self.jobs = []
        self.jobs_scraped = 0
        self.speed_mode = speed_mode
        self.resume_file = resume_file
        self.scraped_urls = set()  # Track already scraped job URLs
        
        # Load existing jobs if resuming
        self.load_existing_jobs()
        
        # Load keywords for skill/career extraction
        self.skill_keywords = self.load_keywords("keywords_skills.txt")
        self.career_keywords = self.load_keywords("keywords_careers.txt")
        
        # Setup Chrome
        chrome_options = Options()
        
        # Check if using undetected chromedriver
        use_undetected = UNDETECTED_AVAILABLE
        
        if use_undetected:
            print("🎭 Using UNDETECTED ChromeDriver (stealth mode)")
            # Undetected chromedriver handles most anti-detection automatically
            self.driver = uc.Chrome(
                options=chrome_options,
                version_main=None  # Auto-detect Chrome version
            )
        else:
            print("🚀 Using standard ChromeDriver")
            # Advanced anti-detection
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # More stealth options
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-infobars')
            chrome_options.add_argument('--disable-browser-side-navigation')
            chrome_options.add_argument('--disable-gpu')
            
            # Clear cookies/cache each run
            chrome_options.add_argument('--incognito')
            chrome_options.add_argument('--disable-extensions')
            chrome_options.add_argument('--disable-plugins-discovery')
            
            # More realistic user agent with random version
            chrome_version = random.randint(115, 121)
            chrome_options.add_argument(f'--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chrome_version}.0.0.0 Safari/537.36')
            
            # Randomize screen size
            screen_sizes = ['1920,1080', '1366,768', '1440,900', '1536,864', '1600,900']
            chrome_options.add_argument(f'--window-size={random.choice(screen_sizes)}')
            
            # Language settings
            chrome_options.add_argument('--lang=en-US')
            chrome_options.add_experimental_option('prefs', {
                'intl.accept_languages': 'en-US,en',
                'credentials_enable_service': False,
                'profile.password_manager_enabled': False
            })
            
            self.driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()),
                options=chrome_options
            )
            
            # Execute advanced stealth scripts
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            # Override plugins
            chrome_version = random.randint(115, 121)
            self.driver.execute_cdp_cmd('Network.setUserAgentOverride', {
                "userAgent": f'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chrome_version}.0.0.0 Safari/537.36'
            })
            
            # Add more realistic navigator properties
            self.driver.execute_script("""
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en']
                });
            """)
        self.driver.maximize_window()
    
    def load_existing_jobs(self):
        """Load previously scraped jobs to avoid duplicates"""
        try:
            if os.path.exists(self.resume_file):
                # Support both CSV and Excel
                if self.resume_file.endswith('.csv'):
                    df = pd.read_csv(self.resume_file)
                else:
                    df = pd.read_excel(self.resume_file)
                
                self.jobs = df.to_dict('records')
                self.scraped_urls = set(df['url'].tolist())
                self.jobs_scraped = len(self.jobs)
                print(f"📂 Loaded {self.jobs_scraped} existing jobs from {self.resume_file}")
                print(f"🎯 Will scrape {self.max_jobs - self.jobs_scraped} more jobs")
            else:
                print(f"📝 Starting fresh - no existing data found")
        except Exception as e:
            print(f"⚠️  Could not load existing jobs: {e}")
            print(f"📝 Starting fresh")
    
    def load_keywords(self, filename):
        """Load keywords from file"""
        try:
            if not os.path.exists(filename):
                print(f"⚠️  Keywords file not found: {filename}, using empty list")
                return []
            with open(filename, 'r', encoding='utf-8') as f:
                keywords = [line.strip().lower() for line in f if line.strip()]
            print(f"✅ Loaded {len(keywords)} keywords from {filename}")
            return keywords
        except Exception as e:
            print(f"⚠️  Failed to load keywords from {filename}: {e}")
            return []
    
    def tokenizer(self, text):
        """Simple tokenizer"""
        return re.findall(r'\b\w+\b', text.lower())
    
    def extract_skills_and_careers(self, text, keywords):
        """Extract skills or careers from text with word boundary matching"""
        if not keywords:
            return []
        found = []
        text_lower = text.lower()
        
        for keyword in keywords:
            keyword_lower = keyword.lower()
            
            # Skip single letter keywords (too generic)
            if len(keyword_lower) <= 2:
                continue
            
            # Use word boundaries for short keywords (3-4 chars)
            if len(keyword_lower) <= 4:
                # Check if it's a standalone word
                pattern = r'\b' + re.escape(keyword_lower) + r'\b'
                if re.search(pattern, text_lower):
                    if keyword not in found:
                        found.append(keyword)
            else:
                # For longer keywords, simple substring match is fine
                if keyword_lower in text_lower:
                    if keyword not in found:
                        found.append(keyword)
        
        return found
    
    def extract_degree(self, text):
        """Extract MINIMUM degree requirement from text"""
        text_lower = text.lower()
        
        # Degree hierarchy (lowest to highest)
        degree_hierarchy = {
            "High School": 0,
            "Associate": 1,
            "Bachelor's": 2,
            "Master's": 3,
            "PhD": 4
        }
        
        degree_patterns = {
            "High School": ["high school", "hs diploma", "ged"],
            "Associate": ["associate degree", "associate's", "2-year degree"],
            "Bachelor's": ["bachelor", "bs ", "b.s.", "ba ", "b.a.", "undergraduate degree", "4-year degree"],
            "Master's": ["master", "ms ", "m.s.", "ma ", "m.a.", "mba", "graduate degree"],
            "PhD": ["phd", "ph.d", "doctorate", "doctoral"]
        }
        
        found_degrees = []
        
        # Find all mentioned degrees
        for degree, patterns in degree_patterns.items():
            for pattern in patterns:
                if pattern in text_lower:
                    found_degrees.append(degree)
                    break
        
        # If no degrees found, check for general degree requirements
        if not found_degrees:
            if any(term in text_lower for term in ["degree required", "bachelor's or equivalent", "college degree"]):
                return "Bachelor's"
            elif any(term in text_lower for term in ["no degree", "degree not required"]):
                return "Not Required"
            else:
                return "Not Specified"
        
        # Return the LOWEST degree (minimum requirement)
        min_degree = min(found_degrees, key=lambda d: degree_hierarchy[d])
        return min_degree
    
    def extract_experience_from_yoe(self, text):
        """Extract experience level from years of experience in description"""
        text_lower = text.lower()
        
        patterns = [
            r'(\d+)\s*\+\s*years?',
            r'plus\s+(\d+)\s+years?',
            r'\((\d+)\+\s*years?\)',
            r'(\d+)\s*-\s*\d+\s*years?',
            r'(\d+)\s+to\s+\d+\s+years?',
            r'(\d+)\s+or\s+more\s+years?',
            r'minimum\s+of\s+(\d+)\s+years?',
            r'at\s+least\s+(\d+)\s+years?',
        ]
        
        years_found = []
        for pattern in patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                try:
                    years = int(match)
                    years_found.append(years)
                except ValueError:
                    continue
        
        if not years_found:
            return ['Entry Level']
        
        max_years = max(years_found)
        
        if max_years < 3:
            return ['Entry Level']
        elif 3 <= max_years <= 7:
            return ['Mid Level']
        else:
            return ['Senior']
    
    def extract_work_model(self, text):
        """Extract work model from text"""
        text_lower = text.lower()
        models = []
        
        if 'remote' in text_lower or 'work from home' in text_lower:
            models.append('Remote')
        if 'hybrid' in text_lower:
            models.append('Hybrid')
        if 'on-site' in text_lower or 'onsite' in text_lower or 'in-office' in text_lower:
            models.append('On-site')
        
        return models if models else ['Not Specified']
    
    def human_delay(self, min_sec=None, max_sec=None):
        """Human-like delay with speed modes"""
        if min_sec is None or max_sec is None:
            if self.speed_mode == 'fast':
                min_sec, max_sec = 8, 15  # FAST
            elif self.speed_mode == 'balanced':
                min_sec, max_sec = 18, 28  # BALANCED
            elif self.speed_mode == 'aggressive':
                min_sec, max_sec = 10, 18  # AGGRESSIVE (new!)
            else:  # safe
                min_sec, max_sec = 30, 45  # SAFE
        
        delay = random.uniform(min_sec, max_sec)
        print(f"⏳ {self.speed_mode.upper()} mode: waiting {delay:.1f}s")
        time.sleep(delay)
    
    def extract_job_details(self, job_card):
        """Click job and extract ALL details with advanced analysis"""
        try:
            # RE-FETCH the job card element to ensure it's fresh
            try:
                job_id = job_card.get_attribute("data-jk") or job_card.get_attribute("id")
                if job_id:
                    # Find the fresh element by its ID
                    job_card = self.driver.find_element(By.CSS_SELECTOR, f"[data-jk='{job_id}']")
            except:
                pass  # If can't refresh, use original
            
            # Get basic info and click
            title_element = job_card.find_element(By.CSS_SELECTOR, "h2.jobTitle a")
            title = title_element.text
            
            # Get job URL first to check if already scraped
            job_link = title_element.get_attribute("href")
            
            # Clean the job link
            if job_link:
                # Remove any tracking parameters to get clean URL
                if '?' in job_link and 'jk=' in job_link:
                    # Extract just the job key part
                    import urllib.parse
                    parsed = urllib.parse.urlparse(job_link)
                    # Keep the clean base URL
                    job_link = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            
            # Check if we already scraped this job
            if job_link and job_link in self.scraped_urls:
                print(f"\n⏭️  SKIPPING (already scraped): {title[:40]}...")
                return None
            
            try:
                company = job_card.find_element(By.CSS_SELECTOR, "[data-testid='company-name']").text
                # Clean up company name - remove "We are" artifacts
                if company and company.strip():
                    company = company.strip()
                else:
                    company = "N/A"
            except:
                company = "N/A"
            
            try:
                location = job_card.find_element(By.CSS_SELECTOR, "[data-testid='text-location']").text
            except:
                location = "N/A"
            
            print(f"\n📋 [{self.jobs_scraped + 1}] {title[:50]}...")
            
            # Scroll and click with retry logic
            for attempt in range(3):
                try:
                    # Re-find title element (might have gone stale)
                    title_element = job_card.find_element(By.CSS_SELECTOR, "h2.jobTitle a")
                    self.driver.execute_script("arguments[0].scrollIntoView(true);", title_element)
                    time.sleep(1)
                    
                    # Get the job title before clicking (to verify panel updates)
                    expected_title = title_element.text.strip()
                    
                    title_element.click()
                    time.sleep(2)  # Initial wait
                    
                    # CRITICAL: Wait for the job details panel to update with THIS job's title
                    # The panel should show the same title we just clicked
                    panel_updated = False
                    max_wait = 15 if self.speed_mode in ['aggressive', 'fast'] else 10  # Wait longer for fast modes
                    
                    for wait_attempt in range(max_wait):  # Try for up to 15 seconds in aggressive mode
                        try:
                            # Check if panel title matches what we clicked
                            panel_title_elements = self.driver.find_elements(By.CSS_SELECTOR, ".jobsearch-JobInfoHeader-title span")
                            if panel_title_elements:
                                panel_title = panel_title_elements[0].text.strip()
                                if expected_title.lower() in panel_title.lower() or panel_title.lower() in expected_title.lower():
                                    panel_updated = True
                                    print(f"   ✅ Panel updated to correct job!")
                                    break
                        except:
                            pass
                        time.sleep(1)
                    
                    if not panel_updated:
                        print(f"   ⚠️  Panel didn't update - SKIPPING this job to avoid duplicate!")
                        return None  # Skip this job instead of continuing with wrong data
                    
                    time.sleep(2)  # Extra wait for full load
                    break
                except Exception as e:
                    if attempt < 2:
                        print(f"   ⚠️  Click attempt {attempt + 1} failed, retrying...")
                        time.sleep(2)
                    else:
                        print(f"   ❌ Could not click job after 3 attempts")
                        return None
            
            # Extract basic details
            description = "N/A"
            try:
                # Wait for description to load
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.ID, "jobDescriptionText"))
                )
                desc_element = self.driver.find_element(By.ID, "jobDescriptionText")
                description = desc_element.text
                
                # Verify we got actual content (not duplicate)
                if len(description) < 100:
                    print(f"   ⚠️  Description too short ({len(description)} chars), might be duplicate")
                else:
                    print(f"   ✅ Description: {len(description)} characters")
            except Exception as e:
                print(f"   ⚠️  Description not found: {e}")
            
            employment_type = "N/A"
            try:
                emp_elements = self.driver.find_elements(By.CSS_SELECTOR, "span.css-1u1g3ig")
                for elem in emp_elements:
                    text = elem.text.strip()
                    if text.startswith('-'):
                        text = text[1:].strip()
                    if any(keyword in text.lower() for keyword in ['full-time', 'part-time', 'contract', 'temporary', 'internship']):
                        employment_type = text
                        print(f"   ✅ Type: {employment_type}")
                        break
            except:
                pass
            
            salary = "N/A"
            try:
                salary_element = self.driver.find_element(By.CSS_SELECTOR, "span.css-1oc7tea")
                salary = salary_element.text
                print(f"   ✅ Salary: {salary}")
            except:
                try:
                    salary_elements = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='attribute_snippet_testid']")
                    for elem in salary_elements:
                        text = elem.text
                        if "$" in text:
                            salary = text
                            print(f"   ✅ Salary: {salary}")
                            break
                except:
                    pass
            
            logo_url = "N/A"
            try:
                logo_element = self.driver.find_element(By.CSS_SELECTOR, "img.jobsearch-JobInfoHeader-logo")
                logo_url = logo_element.get_attribute("src")
                print(f"   ✅ Logo found")
            except:
                try:
                    logo_element = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='jobsearch-JobInfoHeader-logo-overlay-lower']")
                    logo_url = logo_element.get_attribute("src")
                    print(f"   ✅ Logo found (alt)")
                except:
                    pass
            
            job_url = self.driver.current_url
            
            # Add to scraped URLs set
            self.scraped_urls.add(job_url)
            
            # DUPLICATE CHECK: Verify this is actually a different job
            # Check if description is unique (first 200 chars)
            try:
                desc_preview = description[:200] if description != "N/A" and isinstance(description, str) else ""
                if desc_preview and len(self.jobs) > 0:
                    # Check last 5 jobs
                    recent_jobs = self.jobs[-5:] if len(self.jobs) >= 5 else self.jobs
                    for recent_job in recent_jobs:
                        recent_desc = recent_job.get('description', '')
                        if isinstance(recent_desc, str) and len(recent_desc) > 200:
                            if desc_preview in recent_desc[:200]:
                                print(f"   ⚠️  WARNING: Description matches recent job - possible duplicate!")
                                break
            except Exception as e:
                print(f"   ⚠️  Error in duplicate check: {e}")
            
            # ADVANCED ANALYSIS (like JPMC scraper)
            skills = []
            careers = []
            degree = "Not Specified"
            experience_levels = ["Entry Level"]
            work_models = ["Not Specified"]
            
            if description != "N/A":
                complete_text = (title + "\n\n" + description).lower()
                
                # Extract skills and careers
                skills = self.extract_skills_and_careers(complete_text, self.skill_keywords)
                careers = self.extract_skills_and_careers(complete_text, self.career_keywords)
                
                # Extract MINIMUM degree requirement
                degree = self.extract_degree(complete_text)
                
                # Extract experience level from years of experience
                experience_levels = self.extract_experience_from_yoe(description)
                
                # Extract work models
                work_models = self.extract_work_model(complete_text)
                
                print(f"   📊 Skills: {len(skills)}, Careers: {len(careers)}")
                print(f"   🎓 Min Degree: {degree}")
                print(f"   💼 Experience: {', '.join(experience_levels)}")
                print(f"   🏢 Work Model: {', '.join(work_models)}")
            
            job_data = {
                'title': title,
                'company': company,
                'location': location,
                'employment_type': employment_type,
                'salary': salary,
                'description': description,
                'logo_url': logo_url,
                'url': job_url,
                'skills': ', '.join(skills) if skills else 'None',
                'careers': ', '.join(careers) if careers else 'None',
                'degree_required': degree,
                'experience_levels': ', '.join(experience_levels),
                'work_models': ', '.join(work_models),
                'scraped_at': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            print(f"   ✅ COMPLETE!")
            return job_data
            
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            import traceback
            print(f"   Full traceback:")
            traceback.print_exc()
            return None
    
    def scrape_all_pages(self):
        """Scrape multiple pages until max_jobs reached"""
        try:
            print("="*60)
            print(f"🌙 OVERNIGHT MODE: {self.speed_mode.upper()}")
            print(f"🎯 Target: {self.max_jobs} jobs")
            
            if self.speed_mode == 'safe':
                est_time = (self.max_jobs * 27.5) / 60
                print(f"⏱️  Estimated time: {est_time:.1f} minutes (~{est_time/60:.1f} hours)")
            
            print("="*60)
            
            print(f"\n🌐 Loading: {self.search_url}")
            self.driver.get(self.search_url)
            time.sleep(3)
            
            if "captcha" in self.driver.page_source.lower():
                print("\n⚠️  CAPTCHA detected! Please solve it...")
                input("Press ENTER after solving CAPTCHA...")
            
            page_num = 1
            
            while self.jobs_scraped < self.max_jobs:
                print(f"\n{'='*60}")
                print(f"📄 PAGE {page_num}")
                print(f"{'='*60}")
                
                try:
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.CLASS_NAME, "job_seen_beacon"))
                    )
                except:
                    print("⚠️  No jobs found. Stopping.")
                    break
                
                job_cards = self.driver.find_elements(By.CLASS_NAME, "job_seen_beacon")
                print(f"Found {len(job_cards)} jobs on page {page_num}")
                
                if not job_cards:
                    break
                
                # Track how many jobs we've processed on this page
                jobs_on_this_page = 0
                
                while jobs_on_this_page < len(job_cards):
                    if self.jobs_scraped >= self.max_jobs:
                        print(f"\n🎯 Reached target: {self.max_jobs} jobs!")
                        break
                    
                    # RE-FETCH job cards each iteration (prevents stale elements)
                    try:
                        job_cards = self.driver.find_elements(By.CLASS_NAME, "job_seen_beacon")
                        if jobs_on_this_page >= len(job_cards):
                            break  # No more jobs on this page
                        
                        job_card = job_cards[jobs_on_this_page]
                    except:
                        print(f"⚠️  Could not fetch job card {jobs_on_this_page}")
                        break
                    
                    job_data = self.extract_job_details(job_card)
                    
                    if job_data:  # Only count if not a duplicate
                        self.jobs.append(job_data)
                        self.jobs_scraped += 1
                        
                        # Auto-save every 10 jobs
                                                
                        # Auto-save every 10 jobs
                        if self.jobs_scraped % 10 == 0:
                            self.save_results(filename='indeed_progress.csv')
                            print(f"\n💾 AUTO-SAVED! Progress: {self.jobs_scraped}/{self.max_jobs}")
                        
                        # Auto-pause every 75 jobs for 1 hour (VPN switch time) - if enabled
                        if self.use_pauses and self.jobs_scraped % 75 == 0 and self.jobs_scraped < self.max_jobs:
                            print("\n" + "="*60)
                            print(f"⏸️  CHECKPOINT: {self.jobs_scraped} jobs scraped!")
                            print("⏰ PAUSING FOR 1 HOUR")
                            print("💡 Perfect time to:")
                            print("   1. Switch VPN to different location")
                            print("   2. Let Indeed 'forget' about you")
                            print("   3. Grab a snack! 🍕")
                            print("="*60)
                            
                            # Save before pausing
                            self.save_results(filename='indeed_progress.csv')
                            
                            # Store current page URL before pause
                            current_url = self.driver.current_url
                            
                            # Count down 1 hour (3600 seconds) - or use shorter for testing
                            pause_time = 3600  # Change to 120 for 2-minute test
                            for remaining in range(pause_time, 0, -60):
                                mins = remaining // 60
                                print(f"⏳ Resuming in {mins} minutes...", end='\r')
                                time.sleep(60)
                            
                            print("\n✅ Resuming scraping!")
                            print("🔄 Refreshing page to continue...")
                            
                            # Refresh the page after pause
                            self.driver.refresh()
                            time.sleep(5)
                            
                            # Check for sign-in screen or popup
                            sign_in_detected = False
                            current_page_url = self.driver.current_url
                            
                            # Check URL for sign-in redirect
                            if "sign" in current_page_url.lower() or "login" in current_page_url.lower():
                                sign_in_detected = True
                                print("\n⚠️  SIGN-IN REDIRECT DETECTED!")
                                print("🔓 Going back to previous page...")
                                self.driver.back()  # Go back instead of starting over
                                time.sleep(5)
                            
                            # Check for sign-in popup/modal (multiple strategies)
                            try:
                                # Look for common sign-in modal close buttons
                                close_selectors = [
                                    "button[aria-label='Close']",
                                    "button.icl-CloseButton",
                                    ".popover-x-button-close",
                                    "[data-testid='modal-close-button']",
                                    "button.gnav-SignInButton-iconButtonClose",
                                    ".gnav-header-modal-close"
                                ]
                                
                                for selector in close_selectors:
                                    try:
                                        close_btn = self.driver.find_element(By.CSS_SELECTOR, selector)
                                        if close_btn.is_displayed():
                                            print("🔓 Found sign-in popup close button!")
                                            close_btn.click()
                                            time.sleep(2)
                                            sign_in_detected = True
                                            break
                                    except:
                                        continue
                                
                                # If no close button, try pressing ESC key
                                if not sign_in_detected:
                                    from selenium.webdriver.common.keys import Keys
                                    from selenium.webdriver.common.action_chains import ActionChains
                                    
                                    # Check if modal exists
                                    modals = self.driver.find_elements(By.CSS_SELECTOR, "[role='dialog'], .modal, .popover")
                                    if modals:
                                        print("🔓 Attempting to close modal with ESC key...")
                                        ActionChains(self.driver).send_keys(Keys.ESCAPE).perform()
                                        time.sleep(2)
                                        sign_in_detected = True
                                
                            except Exception as e:
                                pass
                            
                            if sign_in_detected:
                                print("✅ Sign-in popup handled!")
                                
                                # Double-check if jobs are visible now
                                try:
                                    self.driver.find_element(By.CLASS_NAME, "job_seen_beacon")
                                except:
                                    print("⚠️  Jobs still not visible after sign-in handling")
                                    print("👆 Please manually close any popups in the browser")
                                    input("Press ENTER after closing popups...")
                            
                            # Check for CAPTCHA
                            if "captcha" in self.driver.page_source.lower():
                                print("\n🤖 CAPTCHA detected after pause!")
                                print("👆 Please solve it in the browser...")
                                input("Press ENTER after solving CAPTCHA...")
                            
                            # Wait for jobs to reload
                            try:
                                WebDriverWait(self.driver, 15).until(
                                    EC.presence_of_element_located((By.CLASS_NAME, "job_seen_beacon"))
                                )
                                print("✅ Page refreshed successfully!")
                            except:
                                print("⚠️  Jobs not found, reloading search...")
                                self.driver.get(self.search_url)
                                time.sleep(5)
                                try:
                                    WebDriverWait(self.driver, 15).until(
                                        EC.presence_of_element_located((By.CLASS_NAME, "job_seen_beacon"))
                                    )
                                    print("✅ Search page reloaded!")
                                except:
                                    print("❌ Could not reload jobs. May need manual intervention.")
                                    input("Press ENTER to try continuing...")
                            
                            print("="*60)
                        
                        if self.jobs_scraped < self.max_jobs:
                            self.human_delay()
                    else:
                        # If duplicate, just add small delay and continue
                        time.sleep(random.uniform(1, 3))
                    
                    # Move to next job on this page
                    jobs_on_this_page += 1
                
                if self.jobs_scraped >= self.max_jobs:
                    break
                
                print(f"\n➡️  Moving to next page...")
                try:
                    next_button = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='pagination-page-next']")
                    self.driver.execute_script("arguments[0].scrollIntoView(true);", next_button)
                    time.sleep(2)
                    next_button.click()
                    time.sleep(random.uniform(4, 7))
                    page_num += 1
                except:
                    print("⚠️  No more pages. Stopping.")
                    break
            
            self.save_results(filename='indeed_final_results.csv')
            
            print("\n" + "="*60)
            print(f"✨ SCRAPING COMPLETE!")
            print(f"📊 Total jobs: {len(self.jobs)}")
            print(f"💾 Final save: indeed_final_results.csv")
            print("="*60)
            
        except KeyboardInterrupt:
            print("\n\n⚠️  INTERRUPTED! Saving...")
            self.save_results(filename='indeed_interrupted.csv')
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            self.save_results(filename='indeed_error_save.csv')
        finally:
            print("\n🔒 Closing browser...")
            time.sleep(2)
            self.driver.quit()
    
    def scrape_first_page(self):
        """Test mode - first page only"""
        try:
            print("="*60)
            print("🧪 TEST MODE: First Page Only")
            print("="*60)
            
            print(f"\n🌐 Loading: {self.search_url}")
            self.driver.get(self.search_url)
            time.sleep(3)
            
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "job_seen_beacon"))
            )
            
            job_cards = self.driver.find_elements(By.CLASS_NAME, "job_seen_beacon")
            print(f"\n📄 Found {len(job_cards)} jobs")
            
            for i, job_card in enumerate(job_cards):
                if self.jobs_scraped >= self.max_jobs:
                    break
                
                job_data = self.extract_job_details(job_card)
                
                if job_data:  # Only count if not duplicate
                    self.jobs.append(job_data)
                    self.jobs_scraped += 1
                    
                    if self.jobs_scraped % 10 == 0:
                        self.save_results(filename='indeed_progress.csv')
                    
                    if i < len(job_cards) - 1:
                        self.human_delay()
                else:
                    # Small delay for duplicates
                    time.sleep(random.uniform(1, 3))
            
            self.save_results()
            
            print("\n" + "="*60)
            print(f"✨ Test Complete! Jobs: {len(self.jobs)}")
            print("="*60)
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            print("\n🔒 Closing browser...")
            time.sleep(3)
            self.driver.quit()
    
    def save_results(self, filename='indeed_test_results.csv'):
        """Save to CSV or Excel with locked file handling"""
        if self.jobs:
            df = pd.DataFrame(self.jobs)
            
            # Ensure proper column order
            column_order = [
                'title', 'company', 'location', 'employment_type', 'salary',
                'description', 'logo_url', 'url', 'skills', 'careers',
                'degree_required', 'experience_levels', 'work_models', 'scraped_at'
            ]
            
            # Reorder columns (only include columns that exist)
            df = df[[col for col in column_order if col in df.columns]]
            
            # Clean any commas or newlines in text fields that might break CSV
            for col in df.columns:
                if df[col].dtype == 'object':  # Text columns
                    df[col] = df[col].apply(lambda x: str(x).replace('\n', ' ').replace('\r', ' ') if pd.notna(x) else x)
            
            # Try to save, handle locked file
            save_successful = False
            for attempt in range(3):
                try:
                    # Determine format from filename
                    if filename.endswith('.csv'):
                        df.to_csv(filename, index=False, encoding='utf-8-sig', quoting=1)
                        print(f"\n💾 Saved to {filename}")
                        save_successful = True
                        break
                    else:
                        try:
                            df.to_excel(filename, index=False)
                            print(f"\n💾 Saved to {filename}")
                            save_successful = True
                            break
                        except ImportError:
                            csv_filename = filename.replace('.xlsx', '.csv')
                            df.to_csv(csv_filename, index=False, encoding='utf-8-sig', quoting=1)
                            print(f"\n💾 Saved to {csv_filename} (CSV - openpyxl not installed)")
                            save_successful = True
                            break
                except PermissionError:
                    if attempt < 2:
                        print(f"\n⚠️  File is locked (probably open in Excel)")
                        print(f"   Attempt {attempt + 1}/3 - Retrying in 3 seconds...")
                        time.sleep(3)
                    else:
                        # Save to backup file
                        backup_filename = filename.replace('.csv', '_backup.csv').replace('.xlsx', '_backup.xlsx')
                        try:
                            if backup_filename.endswith('.csv'):
                                df.to_csv(backup_filename, index=False, encoding='utf-8-sig', quoting=1)
                            else:
                                df.to_excel(backup_filename, index=False)
                            print(f"\n⚠️  Original file locked! Saved to {backup_filename} instead")
                            save_successful = True
                        except:
                            print(f"\n❌ Could not save file - please close Excel and try again!")
                except Exception as e:
                    print(f"\n❌ Error saving: {e}")
                    break
            
            if save_successful:
                print("\n📊 DATA SUMMARY:")
                print(f"   Total jobs: {len(self.jobs)}")
                print(f"   With descriptions: {sum(1 for j in self.jobs if j.get('description', 'N/A') != 'N/A')}")
                print(f"   With salary: {sum(1 for j in self.jobs if j.get('salary', 'N/A') != 'N/A')}")
                print(f"   With skills: {sum(1 for j in self.jobs if j.get('skills', 'None') != 'None')}")
        else:
            print("\n⚠️  No jobs to save")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🌙 INDEED ADVANCED SCRAPER")
    print("="*60)
    print("\n📊 Choose mode:")
    print("   [1] TEST - First page (~15 jobs)")
    print("   [2] FULL - All pages until target")
    print("\n⚡ Speed: fast/balanced/safe")
    print("="*60)
    
    mode = input("\nMode (1=test, 2=full) [1]: ").strip() or '1'
    
    if mode == '2':
        target = int(input("How many jobs? [500]: ").strip() or '500')
        
        # Speed selection
        print("\n⚡ Speed options:")
        print("   safe       → 30-45 sec/job (~5 hrs for 500)")
        print("   balanced   → 18-28 sec/job (~3 hrs for 500)")
        print("   aggressive → 10-18 sec/job (~2 hrs for 500)")
        print("   fast       → 8-15 sec/job  (~1.5 hrs for 500)")
        speed = input("Choose speed [balanced]: ").strip().lower() or 'balanced'
        
        # Ask about pauses
        use_pauses = input("\nUse 1-hour pauses every 75 jobs? (y/n) [n]: ").strip().lower()
        
        # Check for existing save files
        possible_files = [
            'indeed_progress.csv',
            'indeed_test_results.csv', 
            'indeed_final_results.csv',
            'indeed_interrupted.csv',
            'indeed_error_save.csv'
        ]
        
        resume_file = 'indeed_progress.csv'
        for f in possible_files:
            if os.path.exists(f):
                print(f"\n📁 Found existing file: {f}")
                use_it = input(f"Resume from this file? (y/n) [y]: ").strip().lower()
                if use_it != 'n':
                    resume_file = f
                    break
        
        print(f"\n🌙 OVERNIGHT MODE")
        print(f"🎯 Target: {target} jobs")
        print(f"💾 Save file: {resume_file}")
        print(f"⏸️  Pauses: {'YES (every 75 jobs)' if use_pauses == 'y' else 'NO (continuous)'}")
        
        if use_pauses != 'y':
            print(f"⏱️  Est: {(target * 37.5) / 3600:.1f} hours continuous")
        else:
            sessions = target // 75
            print(f"⏱️  Est: {sessions} hours of pauses + ~{(target * 37.5) / 3600:.1f} hours scraping")
    else:
        target = 15
        speed = input("\nSpeed (fast/balanced/safe) [balanced]: ").strip().lower() or 'balanced'
        resume_file = 'indeed_progress.csv'
        use_pauses = False
    
    input("\n✅ Press ENTER to start...")
    
    url = "https://www.indeed.com/jobs?q=computer&l=Dallas,+TX&radius=100"
    
    scraper = IndeedAdvancedScraper(url, max_jobs=target, speed_mode=speed, resume_file=resume_file)
    
    # Store pause preference
    scraper.use_pauses = (use_pauses == 'y') if mode == '2' else False
    
    if mode == '2':
        scraper.scrape_all_pages()
    else:
        scraper.scrape_first_page()
