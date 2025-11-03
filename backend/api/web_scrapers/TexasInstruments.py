import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
import time, logging, csv
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
from .scraper_helper_functions import *

def TexInstr():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', filename='job_scraper.log')
    skill_keywords = load_keywords("keywords_skills.txt")
    career_keywords = load_keywords("keywords_careers.txt")

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
                job_details = {}

                WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1.job-details__title")))

                # Save Company/url
                job_details['company'] = 'Texas Instruments'
                job_details['jobURL'] = link

                # Save Title
                title = driver.find_element(By.CSS_SELECTOR, "h1.job-details__title").text.strip()
                job_details['title'] = title

                # Save description
                description_header_element = driver.find_element(By.XPATH, f"//h2[contains(text(), 'Job Description')]")
                qualifications_header_element = driver.find_element(By.XPATH, f"//h2[contains(text(), 'Qualifications')]")
                description = description_header_element.find_element(By.XPATH, "following-sibling::div[contains(@class, 'job-details__description-content')]").text
                qualifications = qualifications_header_element.find_element(By.XPATH, "following-sibling::div[contains(@class, 'job-details__description-content')]").text
                job_details['description'] = description + '\n\n' + qualifications

                # Complete job post text for keyword parsing
                complete_jobpost = (title + description + qualifications).lower()
                jobpost_tokens = tokenizer(complete_jobpost)

                # Save short AI summary
                job_details['summary'] = "This will be the AI summary. Not included until testing is done." # extract_job_posting_summary(complete_jobpost)

                # Save other pieces by parsing the job posting
                job_details['skills'] = extract_skills_and_careers(jobpost_tokens, complete_jobpost, skill_keywords)
                job_details['careers'] = extract_skills_and_careers(jobpost_tokens, complete_jobpost, career_keywords)

                job_details['experienceLevels'] = extract_experience(complete_jobpost)

                # Texas Instruments doesnt mention employment type, workmodels, salary in descriptions, assuming they are all onsite/fulltime/tbd
                job_details['employmentTypes'] = ['fulltime']
                job_details['workModels'] = ['onsite']
                job_details['salary'] = None

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
                        job_details['degrees'] = extract_degree(value.lower())

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
                "company", "title", "description", "summary", "skills", "careers", "degrees", 
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
