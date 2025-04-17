import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
import time
import csv
import logging
import re
from webdriver_manager.chrome import ChromeDriverManager

def tekreant():
    import traceback
    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in background
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    try:
        # Setup the webdriver
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        logging.info("WebDriver initialized successfully")

        # Main careers page URL
        careers_url = "https://www.tekreant.com/careers"
        logging.info(f"Accessing careers page: {careers_url}")

        # Use Selenium to load the page
        driver.get(careers_url)

        # Wait for the page to load (adjust selector based on actual page structure)
        try:
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.ID, "openPositions"))
            )
            logging.info("Page loaded successfully")
        except TimeoutException:
            logging.warning("Timeout waiting for page to load completely, proceeding anyway")

        # Additional wait to ensure dynamic content is loaded
        time.sleep(5)

        # Get the page source and parse with BeautifulSoup
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, "html.parser")

        # Save the page source for debugging
        with open("tekreant_page_source.html", "w", encoding="utf-8") as f:
            f.write(page_source)
        logging.info("Page source saved to tekreant_page_source.html for debugging")

        # Store job data
        job_data = []

        # Find the jobs section - adjust the selector based on the actual HTML structure
        jobs_section = soup.find(id="openPositions") or soup.find(class_="jobs-container")

        # If we can't find a specific container, look at the entire page
        if not jobs_section:
            jobs_section = soup
            logging.warning("Could not find specific jobs container, searching entire page")

        # Find all job cards/listings - adjust these selectors based on the actual HTML
        job_cards = jobs_section.find_all(class_="job-card") or \
                    jobs_section.find_all(class_="position-card") or \
                    jobs_section.find_all(class_="opportunity-card")

        # If no specific job cards found, try to find groups of elements that might represent jobs
        if not job_cards:
            logging.warning("No job cards found with expected classes, trying alternative approach")
            # Look for headings that might be job titles
            job_titles = jobs_section.find_all(['h3', 'h4', 'h5'])
            logging.info(f"Found {len(job_titles)} potential job titles")

            # Extract job information based on these title elements
            for title_elem in job_titles:
                try:
                    # Try to determine if this is actually a job title
                    # For example, it might be within a job card container or followed by job details
                    job_container = title_elem.parent or title_elem.find_parent('div')

                    if job_container:
                        title = title_elem.text.strip()
                        logging.info(f"Processing job title: {title}")

                        # Try to find primary description - look at siblings or children of the parent
                        description_texts = []
                        seen_texts = set()  # Add this line to track seen texts

                        # Find all p elements that might contain description text
                        description_elems = job_container.find_all('p')
                        for desc_elem in description_elems:
                            text = desc_elem.text.strip()
                            if text and text not in seen_texts:  # Add this condition
                                description_texts.append(text)
                                seen_texts.add(text)  # Add this line to mark text as seen
                                logging.info(f"Found description text: {text[:50]}...")

                        # Look specifically for location class elements with description
                        location_elems = job_container.find_all(class_="location")
                        for loc_elem in location_elems:
                            # Try to find span elements within the location element
                            spans = loc_elem.find_all('span')
                            for span in spans:
                                text = span.text.strip()
                                if text:
                                    description_texts.append(text)
                                    logging.info(f"Found location span text: {text[:50]}...")

                        # Join all description texts with a space
                        description = " ".join(description_texts) if description_texts else "No Description Found"

                        # Look for location information - default to Irving, TX if not found
                        location_text = None
                        for string in job_container.strings:
                            if re.search(r"Irving|TX|Texas", string, re.IGNORECASE):
                                location_text = string.strip()
                                break

                        location = location_text if location_text else "Irving, TX"

                        job_data.append({
                            'Job Title': title,
                            'Company Name': "Tekreant",
                            'Job Description': description,
                            'Location': location,
                            'Application Link': careers_url
                        })
                        logging.info(f"Extracted job: {title}")
                except Exception as e:
                    logging.error(f"Error processing job title: {e}")
                    logging.error(traceback.format_exc())
        else:
            logging.info(f"Found {len(job_cards)} job cards")

            # Extract information from each job card
            for card in job_cards:
                try:
                    # Extract job title
                    title_elem = card.find(['h3', 'h4']) or card.find(class_=["job-title", "position-title"])
                    title = title_elem.text.strip() if title_elem else "No Title Found"

                    # Extract job description - collect all description text
                    description_texts = []
                    seen_texts = set()  # Add this line

                    # Check for regular description elements
                    desc_elems = card.find_all('p')
                    for desc_elem in desc_elems:
                        if 'location' not in desc_elem.get('class', []):  # Exclude location class for now
                            text = desc_elem.text.strip()
                            if text and text not in seen_texts:  # Add this condition
                                description_texts.append(text)
                                seen_texts.add(text)  # Add this line

                    # Specifically look for content in location class elements with spans
                    location_elements = card.find_all(class_="location")
                    for loc_elem in location_elements:
                        spans = loc_elem.find_all('span')
                        for span in spans:
                            text = span.text.strip()
                            if text and text not in seen_texts:  # Add this condition
                                description_texts.append(text)
                                seen_texts.add(text)  # Add this line

                    # Create complete description by joining all text pieces
                    description = " ".join(description_texts) if description_texts else "No Description Found"

                    # Extract location or use default
                    location = "Irving, TX"  # Default location

                    # Store the job data
                    job_data.append({
                        'Job Title': title,
                        'Company Name': "Tekreant",
                        'Job Description': description,
                        'Location': location,
                        'Application Link': careers_url
                    })
                    logging.info(f"Extracted job: {title}")
                except Exception as e:
                    logging.error(f"Error extracting job information: {e}")

        return job_data

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        import traceback
        logging.error(traceback.format_exc())
        return []

    finally:
        # Always close the driver
        if 'driver' in locals():
            driver.quit()
            logging.info("WebDriver closed")

# used for views.py to import and call function
if __name__ == "__main__":
    jobs = tekreant()
    
