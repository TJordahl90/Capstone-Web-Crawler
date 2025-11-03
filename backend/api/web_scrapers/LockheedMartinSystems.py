#### THIS SCRAPER ONLY OBTAINS SYSTEMS ENGINEERING JOBS FROM LOCKHEED
### 
##
#

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import time, csv, logging, re
from datetime import datetime
from .scraper_helper_functions import *

def extract_description(soup):
    """Extracts the description from rest of job posting"""
    start = soup.find("b", string=re.compile(r"Description", re.I))
    end = soup.find("strong", string=re.compile(r"Lockheed Martin is an equal opportunity", re.I))
    if not start: return ""

    elements = [str(start)]
    for node in start.next_siblings:
        if node == end: break
        elements.append(str(node))

    section_html = "".join(elements)
    section_soup = BeautifulSoup(section_html, "html.parser")

    for br in section_soup.find_all("br"):
        br.replace_with("\n")
    for bold in section_soup.find_all(["b", "strong"]):
        bold.insert_before("\n\n")

    return section_soup.get_text(separator="\n", strip=True).strip()
   
def lockheed_scraper():
    """Scrapes all the data"""
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    skill_keywords = load_keywords("keywords_skills.txt")
    career_keywords = load_keywords("keywords_careers.txt")
    job_data = [] 

    # Setup Chrome options and Chrome driver
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")

    # driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver = webdriver.Chrome(service=Service(ChromeDriverManager(driver_version="141.0.7390.108").install()), options=chrome_options)
    wait = WebDriverWait(driver, 15)
    date_format = '%b. %d, %Y'

    try:
        driver.get("https://www.lockheedmartinjobs.com/search-jobs")
        time.sleep(3)

        # Check if CCPA alert is present and close it if it is
        try:
            ccpa_alert = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "ccpa-alert")))
            close_buttons = driver.find_elements(By.CSS_SELECTOR, "#ccpa-alert button, #ccpa-alert .close, #ccpa-alert .accept")
            if close_buttons:
                close_buttons[0].click()
                time.sleep(1)
        except:
            print("No CCPA alert found or couldn't close it")

        # Click on the Career Area toggle to expand it and find all the job checkboxes
        career_toggle = wait.until(EC.element_to_be_clickable((By.ID, "category-toggle")))
        driver.execute_script("arguments[0].click();", career_toggle)
        time.sleep(2)

        systems_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Systems Engineering']")))
        driver.execute_script("arguments[0].click();", systems_checkbox)
        time.sleep(3)

        state_toggle = wait.until(EC.presence_of_element_located((By.ID, "region-toggle")))
        driver.execute_script("arguments[0].click();", state_toggle)
        time.sleep(2)

        texas_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Texas, United States']")))
        driver.execute_script("arguments[0].click();", texas_checkbox)
        time.sleep(3)

        try:
            dallas_toggle = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Dallas, Texas, United States']")))
            driver.execute_script("arguments[0].click();", dallas_toggle)
            time.sleep(3)
        except TimeoutException:
            print("Dallas toggle not found, skipping...")

        try:
            fortworth_toggle = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Fort Worth, Texas, United States']")))
            driver.execute_script("arguments[0].click();", fortworth_toggle)
            time.sleep(3)
        except TimeoutException:
            print("Fort-Worth toggle not found, skipping...")

        try:
            grandprairie_toggle = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Grand Prairie, Texas, United States']")))
            driver.execute_script("arguments[0].click();", grandprairie_toggle)
            time.sleep(3)
        except TimeoutException:
            print("Grand Prairie toggle not found, skipping...")


        # Find and click "Show All" using JavaScript
        try:
            show_all_container = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "pagination-all")))
            show_all = show_all_container.find_element(By.CLASS_NAME, "pagination-show-all")
            driver.execute_script("arguments[0].click();", show_all)
            print("Clicked 'Show All' button")
            time.sleep(5)
        except TimeoutException:
            print("No 'Show All' button found")
        except Exception as e:
            print(f"Could not click 'Show All' button: {e}")

        # Ensure jobs have loaded by waiting for a specific number of results or timeout
        try:
            wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "#search-results-list > ul > li")))
            print("Job list items appear to be loaded.")
        except TimeoutException:
            print("Timeout waiting for job results to load. Proceeding anyway.")


        # Extract the job links from the search results page
        job_links = []

        try:
            results_container = driver.find_element(By.ID, "search-results-list")
            job_elements = results_container.find_elements(By.CSS_SELECTOR, "ul > li > a[href*='/job/']")
            print(f"Found {len(job_elements)} job postings so far...")

            for job in job_elements:
                link = job.get_attribute("href")
                if link: job_links.append({"link": link})

            print(f"Saved {len(job_links)} total links using primary method.")

        except NoSuchElementException:
            print("Job header not found, skipping job listing.")
        except Exception as e:
            print(f"Error obtaining the job links using primary method: {e}")

        if len(job_links) == 0:
            try:
                print("No job links found using primary method. Trying backup method...")
                link_elements = driver.find_elements(By.CSS_SELECTOR, "a[href*='/job/']")

                for link_element in link_elements:
                    link = link_element.get_attribute("href")
                    if link: job_links.append({"link": link})

                print(f"Saved {len(job_links)} total links using backup method.")

            except NoSuchElementException:
                print("Job header not found, skipping job listing.")    
            except Exception as e:
                print(f"Error obtaining the job links using backup method: {e}")

        for i, job in enumerate(job_links):
            try:
                print(f"Processing job {i + 1}/{len(job_links)}")
                driver.get(job["link"])
                job_details = {} 

                try:
                    # Extract all the needed data
                    job_details['company'] = 'Lockheed Martin'
                    job_details['jobURL'] = job['link']
                    job_details['salary'] = None

                    job_header_container = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "ajd_header__job-heading")))
                    title_element = job_header_container.find_element(By.CLASS_NAME, "ajd_header__job-title")
                    title = title_element.text.strip()
                    job_details['title'] = title

                    location_element = job_header_container.find_element(By.ID, "collapsible-locations")
                    location = location_element.text.strip()
                    job_details['location'] = location

                    job_body_container = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "ats-description")))
                    date_element = job_body_container.find_element(By.CSS_SELECTOR, ".job-date.job-info")
                    date_string = date_element.text.split(':')[-1].strip()
                    job_details['datePosted'] = datetime.strptime(date_string, date_format)

                    # Format with soup
                    raw_html = job_body_container.get_attribute("innerHTML")
                    soup = BeautifulSoup(raw_html, "html.parser")
                    description = extract_description(soup)

                    complete_jobpost = (title + "\n\n" + soup.get_text(separator="\n", strip=True)).lower()
                    tokens = tokenizer(complete_jobpost)

                    job_details['description'] = description
                    job_details['summary'] = "This will be the AI summary. Not included until testing is done."
                    job_details['skills'] = extract_skills_and_careers(tokens, complete_jobpost, skill_keywords)
                    job_details['careers'] = extract_skills_and_careers(tokens, complete_jobpost, career_keywords)
                    job_details['degrees'] = extract_degree(complete_jobpost)
                    job_details['experienceLevels'] = extract_experience(title.lower())
                    job_details['employmentTypes'] = extract_employment_type(complete_jobpost)
                    job_details['workModels'] = extract_work_model(complete_jobpost)

                except Exception as e:
                    print(f"Error extracting data: {e}")

                job_data.append(job_details)

                print(f"Scraped job {i + 1}/{len(job_links)}: {job_details['title']}")
                time.sleep(1)

            except Exception as e:
                print(f"Error processing job page {job['link']}: {e}")

        # Save detailed job information to JSON
        if job_data:
            fieldnames = [
                "company", "title", "description", "summary", "skills", "careers", "degrees", 
                "experienceLevels", "employmentTypes", "workModels", "location", "datePosted", "salary", "jobURL",
            ]
            with open("lockheed_martin_systems_data.csv", "w", newline="", encoding="utf-8") as file:
                writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(job_data)

            print(f"Successfully scraped details for {len(job_data)} jobs and saved to lockheed_martin_systems_data.csv")
        else:
            print("No detailed job information was collected.")

        return job_data

    except Exception as e:
        print(f"An error occurred: {e}")
        try:
            with open("error_page.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print("Saved page HTML to error_page.html for troubleshooting")
        except:
            print("Could not save debug HTML")
        return []

    finally:
        driver.quit()

if __name__ == "__main__":
    lockheed_scraper()

