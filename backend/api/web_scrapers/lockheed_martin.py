from bs4 import BeautifulSoup, NavigableString
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
from .scraper_ai import extract_job_details_with_openai

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def extract_short_description(soup):
    """Extracts the short description (important part of full description)"""
    start = soup.find("b", string=re.compile(r"Description", re.I))
    end = soup.find("b", string=re.compile(r"Basic Qualifications", re.I))
    if not start: return

    elements = [str(start)]
    for node in start.next_siblings:
        if node == end: break
        elements.append(str(node))

    section_html = "".join(elements)
    section_soup = BeautifulSoup(section_html, "html.parser")
    return section_soup.get_text(separator="\n", strip=True).strip()
   

def extract_requirements(soup):
    """Extracts requirements as  a block of text"""
    start = soup.find("b", string=re.compile(r"Basic Qualifications", re.I))
    end = soup.find("b", string=re.compile(r"(Security Clearance Statement|Clearance Statement|Clearance Level)", re.I))
    if not start: return ""

    elements = [str(start)]
    for node in start.next_siblings:
        if node == end: break
        elements.append(str(node))

    section_html = "".join(elements)
    section_soup = BeautifulSoup(section_html, "html.parser")
    return section_soup.get_text(separator="\n", strip=True).strip()

def lockheed_scraper():
    """Scrapes all the data"""
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

        cyber_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Cyber']")))
        driver.execute_script("arguments[0].click();", cyber_checkbox)
        time.sleep(3)

        data_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Data Science']")))
        driver.execute_script("arguments[0].click();", data_checkbox)
        time.sleep(3)

        ai_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[contains(@data-display, 'AI/Machine Learning')]")))
        driver.execute_script("arguments[0].click();", ai_checkbox)
        time.sleep(3)

        it_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Information Technology']")))
        driver.execute_script("arguments[0].click();", it_checkbox)
        time.sleep(3)

        software_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Software Engineering']")))
        driver.execute_script("arguments[0].click();", software_checkbox)
        time.sleep(3)
        
        systems_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Systems Engineering']")))
        driver.execute_script("arguments[0].click();", systems_checkbox)
        time.sleep(3)

        state_toggle = wait.until(EC.presence_of_element_located((By.ID, "region-toggle")))
        driver.execute_script("arguments[0].click();", state_toggle)
        time.sleep(2)

        texas_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Texas, United States']")))
        driver.execute_script("arguments[0].click();", texas_checkbox)
        time.sleep(5)

        # Find and click "Show All" using JavaScript
        try:
            show_all = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "pagination-show-all")))
            driver.execute_script("arguments[0].click();", show_all)
            print("Clicked 'Show All' button")
            time.sleep(3)
        except TimeoutException:
            print("No 'Show All' button found - likely too few results on page")
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

                job_details = {
                    "company": "Lockheed Martin", "title": "", "fullDescription": "", "shortDescription": "", "requirements": "",
                    "skills": [], "location": "", "datePosted": "", "salary": "", "jobURL": job["link"], 
                    "experienceLevel": "", "employmentType": "", "locationType": "", "degreeType": [], "careerArea": [] 
                } 

                try:
                    # Find the job header and extract title & location
                    job_header_container = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "ajd_header__job-heading")))

                    title_element = job_header_container.find_element(By.CLASS_NAME, "ajd_header__job-title")
                    title = title_element.text.strip()
                    job_details['title'] = title

                    location_element = job_header_container.find_element(By.ID, "collapsible-locations")
                    location = location_element.text.strip()
                    job_details['location'] = location

                    # Find the job description, clean it, and extract requirements/date
                    job_body_container = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "ats-description")))

                    date_element = job_body_container.find_element(By.CSS_SELECTOR, ".job-date.job-info")
                    date_string = date_element.text.split(':')[-1].strip()
                    job_details['datePosted'] = datetime.strptime(date_string, date_format)

                    # Format with soup
                    raw_html = job_body_container.get_attribute("innerHTML")
                    clean_soup = BeautifulSoup(raw_html, "html.parser")
                    raw_soup = BeautifulSoup(raw_html, "html.parser")

                    for br in clean_soup.find_all("br"):
                        br.replace_with("\n")

                    for bold in clean_soup.find_all(["b", "strong"]):
                        bold.insert_before("\n\n")

                    cleaned_text = clean_soup.get_text(separator="\n", strip=True)
                    full_description = f"{title}\n{location}\n{cleaned_text}"
                    job_details["fullDescription"] = full_description

                    job_details['requirements'] = extract_requirements(raw_soup)
                    job_details['shortDescription'] = extract_short_description(raw_soup)

                    extracted_details = extract_job_details_with_openai(full_description)

                    if extracted_details:
                        job_details['skills'] = extracted_details.get('skills', [])
                        job_details["careerArea"] = extracted_details.get("careerArea", [])
                        job_details["degreeType"] = extracted_details.get("degreType", [])
                        job_details["salary"] = extracted_details.get("salary", None)
                        job_details["experienceLevel"] = extracted_details.get("experienceLevel", None)
                        job_details["employmentType"] = extracted_details.get("employmentType", None)
                        job_details["locationType"] = extracted_details.get("locationType", None)
                    else:
                        print("Error extracting job details using OpenAI API.")

                except Exception as e:
                    print(f"Error extracting data: {e}")

                # Add to job_data list for return
                job_data.append(job_details)

                print(f"Scraped job {i + 1}/{len(job_links)}: {job_details['title']}")
                # Add a small delay between job page visits
                time.sleep(1)

            except Exception as e:
                print(f"Error processing job page {job['link']}: {e}")

        # Save detailed job information to JSON
        if job_data:
            fieldnames = [
                "company", "title", "fullDescription", "shortDescription", "requirements", "skills", "location", "datePosted", 
                "salary", "jobURL", "experienceLevel", "employmentType", "locationType", "degreeType", "careerArea" 
            ]
            with open("lockheed_martin_data.csv", "w", newline="", encoding="utf-8") as file:
                writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(job_data)

            print(f"Successfully scraped details for {len(job_data)} jobs and saved to lockheed_martin_data.csv")
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


# If running this script directly
if __name__ == "__main__":
    lockheed_scraper()