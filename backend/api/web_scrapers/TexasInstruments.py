import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
import time, logging, re, csv
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import pathlib
from .scraper_helper_functions import *
# from summarizer import getJobSummary

current_file_path = pathlib.Path(__file__)
base_dir = current_file_path.parent.resolve()
skills_file = base_dir / "keywords_skills.txt"
careers_file = base_dir / "keywords_careers.txt"

def load_skill_keywords():
    try:
        with open(skills_file, 'r') as file:
            return [line.strip() for line in file if line.strip()]
    except Exception as e:
        print(f"Failed to load skill keywords: {e}")
        return []
    
def load_career_keywords():
    try:
        with open(careers_file, 'r') as file:
            return [line.strip() for line in file if line.strip()]
    except Exception as e:
        print(f"Failed to load keywords: {e}")
        return []
    
def complete_jobposting_tokenizer(description):
    # regex_pattern = r'\b(?:[a-z0-9]+(?:[\+\#\.\/][a-z0-9]+)*|\.[a-z0-9]+(?:[\+\#\.\/][a-z0-9]+)*)\b'
    # regex_pattern = r'(?<!\w)([a-z0-9]+(?:[\+\#\.\/\-][a-z0-9]+)*|\.[a-z0-9]+(?:[\+\#\.\/\-][a-z0-9]+)*)(?!\w)'
    regex_pattern = r'(?<!\w)([a-z0-9]+(?:[\+\#\.\/\-][a-z0-9]+)*[\+\#]*|\.[a-z0-9]+(?:[\+\#\.\/\-][a-z0-9]+)*[\+\#]*)(?!\w)'
    description_lower = description.lower()
    tokens = set(re.findall(regex_pattern, description_lower))
    return tokens

def extract_skills_and_careers(tokens, description, keywords):
    keywords_found = []
    for keyword in keywords:
        if (keyword in tokens) or (" " in keyword and keyword in description):
            keywords_found.append(keyword)
    return list(set(keywords_found))

def extract_experience(tokens, description):
    experience = []
    experience_years = [
        r'(\d+)\s*\+\s*years?',
        r'(\d+)\s*years?\s*\+',
        r'(\d+)\s*(?:or\s+more|and\s+more)\s+years?',
        r'(\d+)(?:\+)?\s+years?\s+(?:of\s+)?experience',
        r'experience\s*:\s*(\d+)(?:\+)?',
        r'(\d+)\s*-\s*(\d+)\s+years?',
        r'minimum\s+(?:of\s+)?(\d+)\s+years?',
        r'at\s+least\s+(\d+)\s+years?'
    ]
    experience_names = {
        r'\bintern(ship)?\b': 'intern',
        r'\bentry(-|\s)?level\b': 'entry',
        r'\bjunior\b': 'junior',
        r'\bassociate\b(?![’\'\s-]*degree)': 'associate',
        r'\bmid(-|\s)?(level)?\b': 'mid',
        r'\bsenior\b': 'senior',
        r'\bleader\b': 'lead',
        r'\bmanager\b': 'manager',
    }

    for pattern, label in experience_names.items():
        if re.search(pattern, description):
            experience.append(label)

    if not experience:
        for pattern in experience_years:
            match = re.search(pattern, description)
            if match:
                years = int(match.group(1))
                if years <= 1: experience.append('intern')
                elif years <= 2: experience.append('entry')
                elif years <= 4: experience.append('junior')
                elif years <= 6: experience.append('mid')
                elif years <= 8: experience.append('senior')
                elif years <= 10: experience.append('lead')
                break

    return experience

def TexInstr():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', filename='job_scraper.log')
    skill_keywords = load_skill_keywords()
    career_keywords = load_career_keywords()

    options = Options()
    options.add_argument("--headless")
    # driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver = webdriver.Chrome(service=Service(ChromeDriverManager(driver_version="141.0.7390.108").install()), options=options)
    date_format = "%m/%d/%Y, %I:%M %p"

    job_data = []
    try:
        url = "https://careers.ti.com/en/sites/CX/jobs?lastSelectedFacet=CATEGORIES&location=Dallas%2C+TX%2C+United+States&locationId=300000056282337&locationLevel=city&mode=location&radius=25&radiusUnit=MI&selectedCategoriesFacet=300000068853972%3B300000068853892"

        driver.get(url)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "job-list-item__link")))

        last_count = 0
        scroll_attempts = 0
        while scroll_attempts < 10:
            job_links = driver.find_elements(By.CLASS_NAME, "job-list-item__link")
            if len(job_links) == last_count:
                break
            last_count = len(job_links)
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            scroll_attempts += 1

        links = [link.get_attribute('href') for link in job_links if link.get_attribute('href')]
        print(f"Found {len(links)} total job links.")

        for idx, link in enumerate(links):
            try:
                driver.get(link)
                job_details = {
                    "company": "Texas Instruments", "title": "", "description": "", "summary": "", "requirements": "",
                    "skills": [], "careers": [], "degrees": [], "experienceLevels": [], "employmentTypes": [], "workModels": [],   
                    "location": "", "datePosted": None, "salary": "", "jobURL": link,  
                } 

                WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1.job-details__title")))

                # Save Title
                title = driver.find_element(By.CSS_SELECTOR, "h1.job-details__title").text.strip()
                job_details['title'] = title

                # Complete job post text for keyword parsing
                jobpost_elements = driver.find_elements(By.CLASS_NAME, "job-details__section")
                jobpost = "\n\n".join([element.text for element in jobpost_elements[1:]])
                complete_jobpost = (title + "\n\n" + jobpost).lower()
                jobpost_tokens = complete_jobposting_tokenizer(complete_jobpost)

                # Save short AI summary
                # job_details['summary'] = getJobSummary(complete_jobpost)
                job_details['summary'] = extract_job_posting_summary(complete_jobpost)

                # Save portion of actual job posting
                header_element = driver.find_element(By.XPATH, f"//h2[contains(text(), 'Job Description')]")
                job_details['description'] = header_element.find_element(By.XPATH, "following-sibling::div[contains(@class, 'job-details__description-content')]").text
                
                # Save requirements section of job posting
                header_element = driver.find_element(By.XPATH, f"//h2[contains(text(), 'Qualifications')]")
                job_details['requirements'] = header_element.find_element(By.XPATH, "following-sibling::div[contains(@class, 'job-details__description-content')]").text
                
                # Save other pieces by parsing the job posting
                job_details['skills'] = extract_skills_and_careers(jobpost_tokens, complete_jobpost, skill_keywords)
                job_details['careers'] = extract_skills_and_careers(jobpost_tokens, complete_jobpost, career_keywords)

                job_details['experienceLevels'] = extract_experience(jobpost_tokens, complete_jobpost)

                # Texas Instruments doesnt mention employment type or workmodels in descriptions, assuming they are all onsite/fulltime
                job_details['employmentTypes'] = ['full-time']
                job_details['workModels'] = ['on-site']

                WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "ul.job-meta__list")))
                meta_item_elements = driver.find_elements(By.CSS_SELECTOR, "li.job-meta__item")
               
                # Save date, degree, and locations
                for item in meta_item_elements:
                    label = item.find_element(By.CSS_SELECTOR, "span.job-meta__title").text.strip()
                    value = item.find_element(By.CSS_SELECTOR, "span.job-meta__subitem").text.strip()
                    
                    if "Posting Date" in label:
                        formatted_date = datetime.strptime(value, date_format)
                        job_details['datePosted'] = formatted_date.date()
                    
                    if "Degree Level" in label:
                        job_details['degrees'] = [value]

                    if "Locations" in label:
                        locations_list = []
                        location_elements = item.find_elements(By.CSS_SELECTOR, "span.job-meta__pin-item")
                        
                        for location in location_elements:
                            if "TX" in location.text:   
                                locations_list.append(location.text.strip())

                        job_details['location'] = " / ".join(locations_list)

                job_data.append(job_details)

                print(f"Scraped job {idx + 1}/{len(links)}: {title}")
                time.sleep(1)

            except NoSuchElementException:
                print(f"An element was attempted to be scraped but was not found. Job will be skipped.")
                continue
            except Exception as e:
                logging.error(f"Error scraping job {link}: {str(e)}")
                continue

        if job_data:
            fieldnames = [
                "company", "title", "description", "summary", "requirements","skills", "careers", "degrees", 
                "experienceLevels", "employmentTypes", "workModels", "location", "datePosted", "salary", "jobURL",  
            ]
            with open("texas_instruments_data.csv", "w", newline="", encoding="utf-8") as file:
                writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(job_data)

            print(f"Successfully scraped details for {len(job_data)} jobs and saved to texas_instruments_data.csv")
        else:
            print("No detailed job information was collected.")

        return job_data

    finally:
        driver.quit()

if __name__ == "__main__":
    TexInstr()
