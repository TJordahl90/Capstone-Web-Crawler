import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time, logging, re, csv
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
from .scraper_helper_functions import *

def BankofAmerica():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', filename='job_scraper.log')
    options = Options()
    options.add_argument("--headless")
    # driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver = webdriver.Chrome(service=Service(ChromeDriverManager(driver_version="141.0.7390.108").install()), options=options)
    wait = WebDriverWait(driver, 15)

    skill_keywords = load_keywords("keywords_skills.txt")
    career_keywords = load_keywords("keywords_careers.txt")
    date_format = "%b %d, %Y"
    job_data = []
    
    try:
        url = "https://careers.bankofamerica.com/en-us/job-search?ref=search&start=0&rows=10&search=jobsByLocation&filters=area%3DTechnology&searchstring=Dallas%2C+TX&searchstring=Fort+Worth%2C+TX&searchstring=Addison%2C+TX"

        driver.get(url)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "aem-wrap--job-search-results-listing")))

        # Click View All jobs button
        try:
            view_all_container = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "pagination__nav")))
            view_all = view_all_container.find_element(By.CLASS_NAME, "nav__view-all")
            driver.execute_script("arguments[0].click();", view_all)
            print("Clicked 'View All' button")
            time.sleep(3)
        except TimeoutException:
            print("No 'View All' button found")
        except Exception as e:
            print(f"Error with 'View All' button: {e}")

        # Get all the job links
        job_links = []
        job_search_results = driver.find_elements(By.CLASS_NAME, "job-search-results-listing__item")
        for job in job_search_results:
            try:
                link_element = job.find_element(By.TAG_NAME, "a")
                link = link_element.get_attribute("href")
                if link: job_links.append(link)
            except Exception:
                continue
        
        print(f"Found {len(job_links)} total job links.")

        # Extract data and format each job posting
        for idx, link in enumerate(job_links):
            try:
                job_details = {}
                driver.get(link)
                body_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "job-description-body")))
                sidebar_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "job-description-sidebar")))

                # Save Company/urls
                job_details['company'] = 'Bank of America'
                job_details['jobURL'] = link
                job_details['logoURL'] = BANK_OF_AMERICA_LOGO

                # Save Title
                title = body_element.find_element(By.CSS_SELECTOR, "h1.job-description-body__title").text.strip()
                job_details['title'] = title

                # Save description
                description_element = body_element.find_element(By.CSS_SELECTOR, "div.job-description-body__internal")
                raw_html = description_element.get_attribute("innerHTML")
                soup = BeautifulSoup(raw_html, "html.parser")

                for tag in soup.find_all(["b", "strong"]):
                    header_text = tag.get_text(strip=True)
                    if header_text.endswith(":"):
                        tag.insert_before("<<HEADER_BREAK>>")

                for li in soup.find_all("li"):
                    li_text = li.get_text(" ", strip=True)
                    li.replace_with(f"• {li_text}")

                for tag in soup.find_all(["p", "ul", "br"]):
                    tag.insert_after("\n")

                description = soup.get_text(separator="\n", strip=True)
                description = description.replace("<<HEADER_BREAK>>", "\n\n")
                description = re.sub(r'\n{3,}', '\n\n', description)
                job_details['description'] = description.strip()
                
                # Complete job post text for keyword parsing
                complete_jobpost = (title + "\n" + description).lower()
                tokens = tokenizer(complete_jobpost)

                # Save AI summary
                job_details['summary'] = extract_job_posting_summary(complete_jobpost)

                # Save skills, careers, and degrees
                job_details['skills'] = extract_skills_and_careers(tokens, complete_jobpost, skill_keywords)
                job_details['careers'] = extract_skills_and_careers(tokens, complete_jobpost, career_keywords)
                job_details['degrees'] = extract_degree(complete_jobpost)

                # Save employ types, experiences and work models
                employ_type_element = sidebar_element.find_element(By.CLASS_NAME, "job-information__type")
                employ_type = employ_type_element.find_element(By.CSS_SELECTOR, "span").text.strip().lower()
                job_details['employmentTypes'] = extract_employment_type(employ_type)
                job_details['experienceLevels'] = extract_experience(title.lower(), complete_jobpost)
                job_details['workModels'] = ['onsite']

                # Save location, dateposted, salary
                location_section = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "location-cta")))
                location = location_section.find_element(By.CLASS_NAME, "location__name").text.strip()
                job_details['location'] = location

                date_element = body_element.find_element(By.CSS_SELECTOR, "span.js-posted-date.posted-date")
                raw_date = re.sub(r"Posted\s*", "", date_element.text).strip()
                job_details['datePosted'] = datetime.strptime(raw_date, date_format).date()
                job_details['salary'] = None

                # Save the new job
                job_data.append(job_details)

                print(f"Scraped job {idx + 1}/{len(job_links)}: {title}")
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
                "experienceLevels", "employmentTypes", "workModels", "location", "datePosted", 
                "salary", "jobURL", "logoURL"  
            ]
            with open("bank_of_america_data.csv", "w", newline="", encoding="utf-8") as file:
                writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(job_data)

            print(f"Successfully scraped details for {len(job_data)} jobs and saved to bank_of_america_data.csv")
        else:
            print("No detailed job information was collected.")

        return job_data

    finally:
        driver.quit()

if __name__ == "__main__":
    BankofAmerica()
