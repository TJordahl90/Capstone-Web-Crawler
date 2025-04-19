import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
import time
import logging
import traceback
import re
from webdriver_manager.chrome import ChromeDriverManager

def load_requirement_keywords(filename="message.txt"):
    try:
        with open(filename, 'r') as file:
            return [line.strip() for line in file if line.strip()]
    except Exception as e:
        print(f"Failed to load keywords: {e}")
        return []

def extract_requirements(description, requirement_keywords):
    requirements = []
    description_lower = description.lower()

    experience_patterns = [
        r'(\d+)\s*\+\s*years?',
        r'(\d+)\s*years?\s*\+',
        r'(\d+)\s*(?:or\s+more|and\s+more)\s+years?',
        r'(\d+)(?:\+)?\s+years?\s+(?:of\s+)?experience',
        r'experience\s*:\s*(\d+)(?:\+)?',
        r'(\d+)\s*-\s*(\d+)\s+years?',
        r'minimum\s+(?:of\s+)?(\d+)\s+years?',
        r'at\s+least\s+(\d+)\s+years?'
    ]

    for pattern in experience_patterns:
        match = re.search(pattern, description_lower)
        if match:
            requirements.append(f"{match.group(1)}-{match.group(2)}" if len(match.groups()) == 2 else match.group(1))
            break

    degree_patterns = {
        r'\bbachel(?:or|[^\w\s]{1,3}s)?\b': 'bachelors',
        r'\bmaster(?:s|[^\w\s]{1,3}s)?\b': 'masters',
        r'\bassociate(?:s|[^\w\s]{1,3}s)?\b': 'associates',
        r'ph\.?d\.?': 'phd'
    }

    for pattern, label in degree_patterns.items():
        if re.search(pattern, description_lower):
            requirements.append(label)

    words = set(re.findall(r'\b\w+\b', description_lower))
    for keyword in requirement_keywords:
        keyword_lower = keyword.lower()
        if (keyword_lower in words) or (" " in keyword_lower and keyword_lower in description_lower):
            requirements.append(keyword)

    return list(set(requirements))

def TexInstr():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', filename='job_scraper.log')
    requirement_keywords = load_requirement_keywords()

    options = Options()
    options.add_argument("--headless")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    job_data = []
    try:
        url = "https://careers.ti.com/en/sites/CX/jobs?location=Dallas%2C+TX%2C+United+States&locationId=300000056282337&locationLevel=city&mode=location&radius=25&radiusUnit=MI"
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

        for idx, link in enumerate(links):
            try:
                driver.get(link)
                WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "job-details__title")))

                title = driver.find_element(By.CSS_SELECTOR, "h1.job-details__title").text.strip()
                try:
                    location = driver.find_element(By.CSS_SELECTOR, "span[data-bind='html: postingLocationsContent']").text.strip()
                except:
                    location = "Not found"

                try:
                    body_text = driver.find_element(By.TAG_NAME, "body").text
                    description = re.sub(r'\s+', ' ', body_text).strip()
                    if "JOB DESCRIPTION" in description:
                        description = description.split("JOB DESCRIPTION", 1)[-1]
                    if "ABOUT US" in description:
                        description = description.split("ABOUT US", 1)[0]
                except:
                    description = ""

                requirements = extract_requirements(description, requirement_keywords)
                if len(requirements) < 5:
                    continue

                subitems = driver.find_elements(By.CSS_SELECTOR, "span.job-meta__subitem")
                for el in subitems:
                    if re.match(r'\d{2}/\d{2}/\d{4}', el.text):  # crude date match
                        job_details['posting_date'] = el.text.strip()
                        posting_date = job_details['posting_date']
                        break

                salary = "N/A"
                try:
                    page_text = driver.find_element(By.TAG_NAME, "body").text
                    match = re.search(r'\$[\d,]+(?:\s*-\s*\$[\d,]+)?', page_text)
                    if match:
                        salary = match.group(0)
                except:
                    pass

                job_data.append({
                    "Company Name": "Texas Instruments",
                    "Job Title": title,
                    "Job Description": description,
                    "Location": location,
                    "Application Link": link,
                    "requirements": requirements,
                    "salary": salary,
                    "posting_date": posting_date
                })

                print(f"Scraped job {idx + 1}/{len(links)}: {title}")
                time.sleep(1)

            except Exception as e:
                logging.error(f"Error scraping job {link}: {str(e)}")
                continue

        print(f"Scraped {len(job_data)} jobs from Texas Instruments")
        return job_data

    finally:
        driver.quit()

if __name__ == "__main__":
    TexInstr()
