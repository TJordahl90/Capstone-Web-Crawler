from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import time
import csv
import logging
import random
import os
import re
from datetime import datetime

# Try to import helper functions, but provide fallbacks if not available
try:
    from .scraper_helper_functions import (
        load_keywords, tokenizer, extract_skills_and_careers, 
        extract_degree, extract_experience, extract_work_model,
        extract_employment_type, extract_job_posting_summary, 
        JPMC_LOGO
    )
    HELPERS_AVAILABLE = True
except ImportError:
    HELPERS_AVAILABLE = False
    logging.warning("scraper_helper_functions not available, using fallback functions")

# JPMC_LOGO = "https://logo.clearbit.com/jpmorganchase.com" ublock origin blocks this link

# Fallback functions if helper module is not available
def load_keywords_fallback(filename):
    """Fallback function to load keywords from file"""
    try:
        if not os.path.exists(filename):
            logging.warning(f"Keywords file not found: {filename}")
            return []
        with open(filename, 'r', encoding='utf-8') as f:
            keywords = [line.strip().lower() for line in f if line.strip()]
        logging.info(f"Loaded {len(keywords)} keywords from {filename}")
        return keywords
    except Exception as e:
        logging.error(f"Failed to load keywords from {filename}: {e}")
        return []

def tokenizer_fallback(text):
    """Simple tokenizer fallback"""
    import re
    return re.findall(r'\b\w+\b', text.lower())

def extract_skills_and_careers_fallback(tokens, text, keywords):
    """Fallback function to extract skills/careers"""
    if not keywords:
        return []
    found = []
    text_lower = text.lower()
    for keyword in keywords:
        if keyword.lower() in text_lower:
            if keyword not in found:
                found.append(keyword)
    return found

def extract_degree_fallback(text):
    """Fallback function to extract degree requirements"""
    degrees = []
    text_lower = text.lower()
    
    degree_patterns = {
        "Bachelor's": ["bachelor", "bs ", "b.s.", "ba ", "b.a.", "undergraduate degree"],
        "Master's": ["master", "ms ", "m.s.", "ma ", "m.a.", "mba", "graduate degree"],
        "PhD": ["phd", "ph.d", "doctorate", "doctoral"],
        "Associate": ["associate degree", "associate's"]
    }
    
    for degree, patterns in degree_patterns.items():
        for pattern in patterns:
            if pattern in text_lower:
                if degree not in degrees:
                    degrees.append(degree)
                break
    
    # If no specific degree found, check for general education requirements
    if not degrees:
        if any(term in text_lower for term in ["degree required", "bachelor's or equivalent", "4-year degree", "college degree"]):
            degrees.append("Bachelor's")
    
    return degrees

def extract_experience_from_yoe(text):
    """Extract experience level based on years of experience mentioned in job description"""
    import re
    
    text_lower = text.lower()
    
    # Regex patterns to match years of experience
    # Matches: "5+ years", "5 + years", "plus 5 years", "(5+ years)", "5-7 years", "5 to 7 years"
    patterns = [
        r'(\d+)\s*\+\s*years?',  # 5+ years, 5 + years
        r'plus\s+(\d+)\s+years?',  # plus 5 years
        r'\((\d+)\+\s*years?\)',  # (5+ years)
        r'(\d+)\s*-\s*\d+\s*years?',  # 5-7 years (captures first number)
        r'(\d+)\s+to\s+\d+\s+years?',  # 5 to 7 years
        r'(\d+)\s+or\s+more\s+years?',  # 5 or more years
        r'minimum\s+of\s+(\d+)\s+years?',  # minimum of 5 years
        r'at\s+least\s+(\d+)\s+years?',  # at least 5 years
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
        # No years mentioned, assume Entry Level
        return ['Entry Level']
    
    # Use the maximum years found (most stringent requirement)
    max_years = max(years_found)
    
    if max_years < 3:
        return ['Entry Level']
    elif 3 <= max_years <= 7:
        return ['Mid Level']
    else:  # 7+ years
        return ['Senior']

def extract_experience_fallback(title):
    """Fallback function to extract experience level from title"""
    title_lower = title.lower()
    levels = []
    
    if any(word in title_lower for word in ['senior', 'sr.', 'lead', 'principal', 'staff']):
        levels.append('Senior')
    elif any(word in title_lower for word in ['junior', 'jr.', 'entry', 'associate']):
        levels.append('Entry Level')
    elif any(word in title_lower for word in ['mid', 'intermediate']):
        levels.append('Mid Level')
    
    return levels if levels else ['Not Specified']

def extract_work_model_fallback(text):
    """Fallback function to extract work model"""
    text_lower = text.lower()
    models = []
    
    if 'remote' in text_lower or 'work from home' in text_lower:
        models.append('Remote')
    if 'hybrid' in text_lower:
        models.append('Hybrid')
    if 'on-site' in text_lower or 'onsite' in text_lower or 'in-office' in text_lower:
        models.append('On-site')
    
    return models if models else ['Not Specified']

# Use helper functions if available, otherwise use fallbacks
if HELPERS_AVAILABLE:
    load_keywords_func = load_keywords
    tokenizer_func = tokenizer
    extract_skills_and_careers_func = extract_skills_and_careers
    extract_degree_func = extract_degree
    extract_experience_func = extract_experience
    extract_work_model_func = extract_work_model
    extract_employment_func = extract_employment_type
else:
    load_keywords_func = load_keywords_fallback
    tokenizer_func = tokenizer_fallback
    extract_skills_and_careers_func = extract_skills_and_careers_fallback
    extract_degree_func = extract_degree_fallback
    extract_experience_func = extract_experience_fallback
    extract_work_model_func = extract_work_model_fallback

def extract_date_posted(driver):
    """Extract date posted from job meta elements - format: MM/DD/YYYY, HH:MM AM/PM"""
    try:
        date_elements = driver.find_elements(By.CSS_SELECTOR, "span.job-meta__subitem")
        for element in date_elements:
            text = element.text.strip()
            # Look for date format: 11/03/2025, 08:00 AM
            if "/" in text and "," in text and ("AM" in text or "PM" in text):
                try:
                    # Parse format: MM/DD/YYYY, HH:MM AM/PM
                    date_obj = datetime.strptime(text, "%m/%d/%Y, %I:%M %p")
                    return date_obj
                except ValueError as e:
                    logging.warning(f"Could not parse date: {text} - {e}")
                    continue
        return None
    except Exception as e:
        logging.error(f"Error extracting date posted: {e}")
        return None

def extract_location_texas(driver):
    """Extract only Texas locations from job meta pin items"""
    try:
        # Find all location pin items
        location_elements = driver.find_elements(By.CSS_SELECTOR, "span.job-meta__pin-item")
        
        texas_locations = []
        for element in location_elements:
            text = element.text.strip()
            # Check if location contains TX
            if ", TX," in text or ", Texas," in text:
                texas_locations.append(text)
        
        # Return the first Texas location found, or None if no Texas location
        if texas_locations:
            return texas_locations[0]
        
        logging.warning("No Texas location found in job listing")
        return None
        
    except Exception as e:
        logging.error(f"Error extracting location: {e}")
        return None

def extract_employment_type_jpmc(driver):
    """Extract employment type from job meta elements"""
    try:
        employment_type_elements = driver.find_elements(By.CSS_SELECTOR, "span.job-meta__subitem")
        for element in employment_type_elements:
            text = element.text.lower()
            if "full time" in text or "part time" in text or "contract" in text:
                return element.text.strip()
        return None
    except Exception as e:
        logging.error(f"Error extracting employment type: {e}")
        return None

def extract_salary_jpmc(driver):
    """Extract salary text directly from job meta elements (simplified, no cleaning)."""
    try:
        salary_elements = driver.find_elements(By.CSS_SELECTOR, "span.job-meta__subitem")
        import re

        for element in salary_elements:
            text = element.text
            if "$" in text and any(char.isdigit() for char in text):
                # Match a typical salary format like "$90,000 - $120,000" or "$120,000/year"
                match = re.search(r"\$\s?[\d,]+(?:\s*-\s*\$\s?[\d,]+)?(?:\s*(?:per\s+year|/year|annual|annually))?", text, re.IGNORECASE)
                if match:
                    return match.group()
        return None

    except Exception as e:
        logging.error(f"Error extracting salary: {e}")
        return None


def jpmc_scraper():
    """Scrapes JPMorgan Chase job postings for computer-related positions in Dallas, TX area"""
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    skill_keywords = load_keywords_func("keywords_skills.txt")
    career_keywords = load_keywords_func("keywords_careers.txt")
    job_data = []

    # Setup Chrome options and Chrome driver
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)

    # driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver = webdriver.Chrome(service=Service(ChromeDriverManager(driver_version="141.0.7390.108").install()), options=chrome_options)
    wait = WebDriverWait(driver, 15)

    try:
        # Navigate to JPMC jobs page
        base_url = "https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/jobs"
        params = "?keyword=Computer&lastSelectedFacet=CATEGORIES&location=Dallas%2C+TX%2C+United+States&locationId=300000020678217&locationLevel=city&mode=location&radius=50&radiusUnit=MI&selectedCategoriesFacet=300000086152753%3B300000086152508%3B300000086251864%3B300026872751543%3B300000086251911%3B300000086250134"
        
        driver.get(base_url + params)
        logging.info("Navigated to JPMC jobs page")
        time.sleep(3)

        # Accept cookies if present
        try:
            cookie_button = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.ID, "cookie-accept-button"))
            )
            cookie_button.click()
            logging.info("Accepted cookies")
            time.sleep(1)
        except TimeoutException:
            logging.info("No cookie banner found")

        # Scroll to load all jobs
        logging.info("Scrolling to load all job listings...")
        last_height = driver.execute_script("return document.body.scrollHeight")
        scroll_attempts = 0
        max_scrolls = 20
        
        while scroll_attempts < max_scrolls:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            new_height = driver.execute_script("return document.body.scrollHeight")
            
            if new_height == last_height:
                break
            
            last_height = new_height
            scroll_attempts += 1

        logging.info("Finished scrolling")

        # Extract job links
        job_links = []
        
        try:
            links = driver.find_elements(By.CSS_SELECTOR, "a.job-grid-item__link")
            
            for link in links:
                href = link.get_attribute("href")
                if href:
                    job_links.append({"link": href})
            
            logging.info(f"Found {len(job_links)} job postings")
            
        except NoSuchElementException:
            logging.error("Could not find job links")
        except Exception as e:
            logging.error(f"Error extracting job links: {e}")

        if len(job_links) == 0:
            logging.warning("No job links found. Exiting.")
            return []

        # Process each job
        for i, job in enumerate(job_links):
            try:
                logging.info(f"Processing job {i + 1}/{len(job_links)}")
                
                driver.get(job["link"])
                
                # Random wait to avoid detection
                wait_time = random.uniform(3, 7)
                time.sleep(wait_time)
                
                job_details = {}
                
                try:
                    # Wait for page to load
                    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "job-details__title")))
                    
                    # Extract basic information
                    job_details['company'] = 'JPMorgan Chase'
                    job_details['jobURL'] = job['link']
                    job_details['logoURL'] = JPMC_LOGO
                    
                    # Extract title
                    try:
                        title_element = driver.find_element(By.CLASS_NAME, "job-details__title")
                        title = title_element.text.strip()
                        job_details['title'] = title
                    except NoSuchElementException:
                        job_details['title'] = None
                        logging.warning("Title not found")
                    
                    # Extract description
                    try:
                        description_element = driver.find_element(By.CLASS_NAME, "job-details__description-content")
                        raw_html = description_element.get_attribute("innerHTML")
                        soup = BeautifulSoup(raw_html, "html.parser")

                        for li in soup.find_all("li"):
                            li_text = li.get_text(" ", strip=True)
                            li.replace_with(f"• {li_text}")

                        for p in soup.find_all("p"):
                            p.insert_before("<<BREAK>>")

                        for tag in soup.find_all(["ul", "br"]):
                            tag.insert_after("\n")

                        description = soup.get_text(separator="\n", strip=True)
                        description = description.replace("<<BREAK>>", "\n\n")
                        description = re.sub(r"\n{3,}", "\n\n", description).strip()
                        job_details['description'] = description
                    except NoSuchElementException:
                        job_details['description'] = None
                        logging.warning("Description not found")
                    
                    # Extract Texas location only
                    location = extract_location_texas(driver)
                    job_details['location'] = location
                    
                    # Skip this job if no Texas location found
                    if location is None:
                        logging.info(f"Skipping job {i + 1} - No Texas location found")
                        continue
                    
                    # Extract date posted
                    job_details['datePosted'] = extract_date_posted(driver)
                    
                    # Extract salary
                    job_details['salary'] = extract_salary_jpmc(driver)
                    
                    # Process text for skills and careers extraction
                    if job_details.get('title') and job_details.get('description'):
                        complete_jobpost = (job_details['title'] + "\n\n" + job_details['description']).lower()
                        tokens = tokenizer_func(complete_jobpost)
                        
                        job_details['skills'] = extract_skills_and_careers_func(tokens, complete_jobpost, skill_keywords)
                        job_details['careers'] = extract_skills_and_careers_func(tokens, complete_jobpost, career_keywords)
                        job_details['degrees'] = extract_degree_func(complete_jobpost)
                        
                        # Extract experience level from description based on years of experience
                        job_details['experienceLevels'] = extract_experience_func(title.lower(), job_details['description'])
                        
                        # Extract employment type
                        # employment_type = extract_employment_type_jpmc(driver)
                        job_details['employmentTypes'] = extract_employment_func(complete_jobpost)
                        
                        # Extract work models
                        work_models = extract_work_model_func(complete_jobpost)
                        # If empty, default to On-Site
                        job_details['workModels'] = work_models if work_models else ['On-site']
                    else:
                        job_details['skills'] = []
                        job_details['careers'] = []
                        job_details['degrees'] = []
                        job_details['experienceLevels'] = []
                        job_details['workModels'] = ['On-site']  # Default to On-Site
                    
                    job_details['summary'] = "no summary for now" #extract_job_posting_summary(complete_jobpost)
                    
                except TimeoutException:
                    logging.error(f"Timeout loading job page: {job['link']}")
                    continue
                except Exception as e:
                    logging.error(f"Error extracting data from job page: {e}")
                    continue
                
                job_data.append(job_details)
                logging.info(f"Scraped job {i + 1}/{len(job_links)}: {job_details.get('title', 'Unknown')}")
                
            except Exception as e:
                logging.error(f"Error processing job page {job['link']}: {e}")
                continue

        # Save to CSV
        if job_data:
            fieldnames = [
                "company", "title", "description", "summary", "skills", "careers", "degrees",
                "experienceLevels", "employmentTypes", "workModels", "location", "datePosted",
                "salary", "jobURL", "logoURL"
            ]
            
            with open("jpmc_jobs_detailed.csv", "w", newline="", encoding="utf-8") as file:
                writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(job_data)
            
            logging.info(f"Successfully scraped details for {len(job_data)} jobs and saved to jpmc_jobs_detailed.csv")
        else:
            logging.warning("No detailed job information was collected.")

        return job_data

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        try:
            with open("error_page.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            logging.info("Saved page HTML to error_page.html for troubleshooting")
        except:
            logging.error("Could not save debug HTML")
        return []

    finally:
        driver.quit()

if __name__ == "__main__":
    jpmc_scraper()
