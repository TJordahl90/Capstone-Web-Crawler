from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import ElementClickInterceptedException, TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
import time
import csv
import re
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def load_requirement_keywords(filename="message.txt"):
    requirement_keywords = []

    try:
        with open(filename, 'r') as file:
            for line in file:
                # Remove whitespace and add non-empty lines to array
                keyword = line.strip()
                if keyword:  # Skip empty lines
                    requirement_keywords.append(keyword)

        print(f"Successfully loaded {len(requirement_keywords)} keywords from {filename}")
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
    except Exception as e:
        print(f"Error loading file: {e}")

    return requirement_keywords


def extract_requirements(description, requirement_keywords):
    requirements = []

    description_lower = description.lower()

    # Experience regex patterns
    experience_patterns = [
        r'(\d+)\s*\+\s*years?',  # 5+ years
        r'(\d+)\s*years?\s*\+',  # 5 years+
        r'(\d+)\s*(?:or\s+more|and\s+more)\s+years?',  # 5 or more years
        r'(\d+)(?:\+)?\s+years?\s+(?:of\s+)?experience',  # 5+ years of experience
        r'experience\s*:\s*(\d+)(?:\+)?',  # experience: 5+
        r'(\d+)\s*-\s*(\d+)\s+years?',  # 5 - 7 years
        r'minimum\s+(?:of\s+)?(\d+)\s+years?',  # minimum of 5 years
        r'at\s+least\s+(\d+)\s+years?'  # at least 5 years
    ]

    for pattern in experience_patterns:
        experience_match = re.search(pattern, description_lower)
        if experience_match:
            if len(experience_match.groups()) == 2:
                min_years, max_years = experience_match.groups()
                years_required = f"{min_years}-{max_years}"
            else:
                years_required = experience_match.group(1)
            requirements.append(years_required)
            break

    # Education detection and normalization
    degree_patterns = {
        r'\b(?:bachel(?:or|[^\w\s]{1,3}s)?)\b': 'bachelors',
        r'\b(?:master(?:s|[^\w\s]{1,3}s)?)\b': 'masters',
        r'\b(?:associate(?:s|[^\w\s]{1,3}s)?)\b': 'associates',
        r'\bph\.?d\.?\b': 'phd'
    }

    for pattern, label in degree_patterns.items():
        if re.search(pattern, description_lower):
            requirements.append(label)

    # Keyword matching
    words = set(re.findall(r'\b\w+\b', description_lower))
    for keyword in requirement_keywords:
        keyword_lower = keyword.lower()
        if " " not in keyword_lower:
            if keyword_lower in words:
                requirements.append(keyword)
        else:
            if keyword_lower in description_lower:
                requirements.append(keyword)

    return requirements


def lockheed_scraper():
    job_data = []  # Initialize job_data list

    # Setup Chrome options
    chrome_options = Options()
    # Uncomment the line below if you want to run headless
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")

    # Initialize the Chrome driver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

    try:
        # Navigate to the Lockheed Martin jobs page
        driver.get("https://www.lockheedmartinjobs.com/search-jobs")

        # Wait for the page to load
        time.sleep(3)

        # Check if CCPA alert is present and close it if it is
        try:
            ccpa_alert = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.ID, "ccpa-alert"))
            )
            # Look for close button or accept button in the alert
            close_buttons = driver.find_elements(By.CSS_SELECTOR,
                                                 "#ccpa-alert button, #ccpa-alert .close, #ccpa-alert .accept")
            if close_buttons:
                close_buttons[0].click()
                time.sleep(1)
        except:
            print("No CCPA alert found or couldn't close it")

        # Click on the Career Area toggle to expand it
        career_toggle = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "category-toggle"))
        )

        # Use JavaScript to click the element if normal click doesn't work
        driver.execute_script("arguments[0].click();", career_toggle)

        # Wait for the checkboxes to appear
        time.sleep(2)

        # Find the Information Technology checkbox
        ai_checkbox = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[contains(@data-display, 'AI/Machine Learning')]"))
        )
        print(f"AI checkbox found: {ai_checkbox.get_attribute('data-display')}")

        it_checkbox = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@data-display='Information Technology']"))
        )

        driver.execute_script("arguments[0].click();", ai_checkbox)
        time.sleep(3)

        # Re-locate the IT checkbox
        it_checkbox = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@data-display='Information Technology']"))
        )
        driver.execute_script("arguments[0].click();", it_checkbox)

        # Wait for the page to update
        time.sleep(3)

        # Click on the State toggle to expand it
        state_toggle = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "region-toggle"))
        )
        driver.execute_script("arguments[0].click();", state_toggle)

        # Wait for the checkboxes to appear
        time.sleep(2)

        # Find the Texas checkbox
        texas_checkbox = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@data-display='Texas, United States']"))
        )

        # Use JavaScript to click the checkbox
        driver.execute_script("arguments[0].click();", texas_checkbox)

        # Wait for the page to update - longer wait to ensure jobs load
        time.sleep(5)

        # Find and click "Show All" using JavaScript
        try:
            show_all = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "pagination-show-all"))
            )
            driver.execute_script("arguments[0].click();", show_all)
            print("Clicked 'Show All' button")

            # Wait for all jobs to load - this needs to be longer since all jobs are loading
            time.sleep(15)  # Increased wait time
        except Exception as e:
            print(f"Could not find or click 'Show All' button: {e}")

        # Ensure jobs have loaded by waiting for a specific number of results or timeout
        try:
            # Wait until job results are present
            WebDriverWait(driver, 20).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".job-result"))
            )
        except TimeoutException:
            print("Timeout waiting for job results to load. Proceeding anyway.")

        # First collect all job links from the search results page
        job_links = []

        # Find all job listings
        job_elements = driver.find_elements(By.CSS_SELECTOR, ".search-results-job")

        print(f"Found {len(job_elements)} job listings")

        # If no jobs found, try alternative selectors
        if len(job_elements) == 0:
            job_elements = driver.find_elements(By.CSS_SELECTOR, ".job-result")
            print(f"Using alternative selector, found {len(job_elements)} job listings")

        # Process each job element to collect links
        for job in job_elements:
            try:
                link_element = job.find_element(By.CSS_SELECTOR, "a")
                title = link_element.text.strip()
                link = link_element.get_attribute("href")

                if not title:
                    title_element = job.find_element(By.CSS_SELECTOR, ".job-result-title")
                    title = title_element.text.strip()

                job_links.append({"title": title, "link": link})
            except Exception as e:
                print(f"Error processing job element: {e}")

        # If no job links found, try direct approach
        if len(job_links) == 0:
            print("No job links found. Trying direct approach...")
            all_links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/job/']")
            for link in all_links:
                title = link.text.strip()
                href = link.get_attribute("href")
                if title and href:
                    job_links.append({"title": title, "link": href})
            print(f"Direct approach found {len(job_links)} job links")

        # Save initial job links to CSV
        if job_links:
            with open("lockheed_martin_job_links.csv", "w", newline="", encoding="utf-8") as file:
                writer = csv.DictWriter(file, fieldnames=["title", "link"])
                writer.writeheader()
                writer.writerows(job_links)
            print(f"Saved {len(job_links)} job links to lockheed_martin_job_links.csv")

        # Now visit each job page and scrape details
        detailed_jobs = []

        requirement_keywords = load_requirement_keywords()

        for i, job in enumerate(job_links):
            try:
                print(f"Processing job {i + 1}/{len(job_links)}: {job['title']}")

                # Navigate to the job page
                driver.get(job["link"])

                # Wait for page to load
                time.sleep(3)

                # Create a job details dictionary
                job_details = {
                    "title": job["title"],
                    "short_title": "",  # Will hold title up to comma
                    "url": job["link"],
                    "job_id": "",  # Added job_id field
                    "location": "",
                    "date_posted": "",
                    "salary_range": "",
                    "description": "",
                    "requirements": ""
                }

                # Extract job title up to comma
                try:
                    title_element = WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".ajd_header__job-title"))
                    )
                    full_title = title_element.text.strip()
                    # Extract title up to first comma if one exists
                    comma_pos = full_title.find(',')
                    if comma_pos > 0:
                        job_details["short_title"] = full_title[:comma_pos].strip()
                    else:
                        job_details["short_title"] = full_title
                except Exception as e:
                    print(f"Could not find or parse job title: {e}")

                # Extract date posted
                try:
                    date_element = driver.find_element(By.CSS_SELECTOR, ".job-date")
                    date_text = date_element.text.strip()
                    # Extract just the date part
                    if "Date posted:" in date_text:
                        job_details["date_posted"] = date_text.replace("Date posted:", "").strip()
                    else:
                        job_details["date_posted"] = date_text
                except Exception as e:
                    print(f"Could not find date posted: {e}")

                # Location
                try:
                    location_element = driver.find_element(By.ID, "collapsible-locations")
                    full_location_text = location_element.text.strip()
                except Exception as e:
                    try:
                        location_element = driver.find_element(By.CSS_SELECTOR, ".ajd_header__location")
                        full_location_text = location_element.text.strip()
                    except Exception as e2:
                        print(f"Could not find location: {e2}")
                        full_location_text = ""

                if full_location_text:
                    locations = [loc.strip() for loc in full_location_text.split(";")]
                    texas_or_remote = [
                        loc for loc in locations
                        if loc.lower().endswith(", texas") or "remote" in loc.lower()
                    ]

                    if not texas_or_remote:
                        print("Skipping job — not in Texas or Remote.")
                        continue  # Skip this job and go to the next

                    job_details["location"] = "; ".join(texas_or_remote)
                else:
                    print("Skipping job — no location found.")
                    continue

                # Description
                cleaned_text = ""
                try:
                    # Find the job description container
                    description_div = WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CLASS_NAME, "ats-description"))
                    )

                    # Get the inner HTML of that div
                    raw_html = description_div.get_attribute("innerHTML")

                    # Use BeautifulSoup to clean and structure it
                    soup = BeautifulSoup(raw_html, "html.parser")

                    # Replace <br> with newlines
                    for br in soup.find_all("br"):
                        br.replace_with("\n")

                    # Optional: Add spacing before bold/strong headers
                    for bold in soup.find_all(["b", "strong"]):
                        bold.insert_before("\n\n")

                    # Extract plain text
                    cleaned_text = soup.get_text(separator="", strip=True)

                    # OPTIONAL: Only grab everything after "Description:"
                    keyword = "Description:"
                    index = cleaned_text.find(keyword)
                    if index != -1:
                        cleaned_text = cleaned_text[index + len(keyword):].strip()

                    job_details["description"] = cleaned_text

                except Exception as e:
                    print(f"Error extracting description: {e}")

                # Extract requirements
                requirements = extract_requirements(cleaned_text, requirement_keywords)
                requirements = list(set(requirements))  # Remove duplicates
                job_details['requirements'] = requirements

                # Skip job if fewer than 5 requirements
                if len(requirements) < 5:
                    print(f"Skipping job - only {len(requirements)} requirements found")
                    continue

                # Extract salary information using regex
                try:
                    # Get full page text (useful for regex matching)
                    page_text = driver.find_element(By.TAG_NAME, "body").text

                    # Regex for salary range (e.g., $88,000 - $152,490)
                    salary_pattern = r'\$[\d,]+(?:\s*-\s*\$[\d,]+)?'
                    salary_match = re.search(salary_pattern, page_text)

                    if salary_match:
                        salary_text = salary_match.group(0).strip()

                        # Try to find the end of the sentence for more context
                        sentence_end = page_text.find('.', salary_match.end())
                        start_pos = salary_match.start()

                        if sentence_end != -1:
                            salary_snippet = page_text[start_pos:sentence_end + 1].strip()
                            job_details["salary_range"] = salary_snippet
                        else:
                            job_details["salary_range"] = salary_text

                    else:
                        job_details["salary_range"] = "No salary listed"

                except Exception as e:
                    print(f"Error extracting salary: {e}")
                    job_details["salary_range"] = "N/A"

                # Add job details to list
                detailed_jobs.append(job_details)

                # Add to job_data list for return
                job_data.append({
                    "Company Name": "Lockheed Martin",
                    "Job Title": job_details["title"],
                    "Job Description": job_details["description"],
                    "Location": job_details["location"],
                    "Application Link": job_details["url"],
                    "requirements": job_details["requirements"],
                    "salary": job_details["salary_range"],
                    "posting_date": job_details["date_posted"]
                })

                print(f"Scraped job {i + 1}/{len(job_links)}: {job_details['title']}")
                # Add a small delay between job page visits
                time.sleep(1)

            except Exception as e:
                print(f"Error processing job page {job['link']}: {e}")

        # Save detailed job information to CSV
        if detailed_jobs:
            with open("lockheed_martin_detailed_jobs.csv", "w", newline="", encoding="utf-8") as file:
                writer = csv.DictWriter(file, fieldnames=["title", "short_title", "url", "job_id",
                                                         "location", "date_posted", "salary_range",
                                                         "description", "requirements"])
                writer.writeheader()
                writer.writerows(detailed_jobs)

            print(f"Successfully scraped details for {len(detailed_jobs)} jobs and saved to lockheed_martin_detailed_jobs.csv")
        else:
            print("No detailed job information was collected.")

        print(f"Scraped {len(job_data)} jobs from Lockheed Martin")
        return job_data  # Return job_data after processing all jobs

    except Exception as e:
        print(f"An error occurred: {e}")
        # Save HTML for debugging
        try:
            with open("error_page.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print("Saved page HTML to error_page.html for troubleshooting")
        except:
            print("Could not save debug HTML")
        return []

    finally:
        # Close the browser
        driver.quit()


# If running this script directly
if __name__ == "__main__":
    lockheed_scraper()