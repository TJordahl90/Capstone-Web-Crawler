import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, WebDriverException
import time
import traceback
import re
from webdriver_manager.chrome import ChromeDriverManager


def alkami_technology():
    """
    Scrapes job postings from Alkami Technology's career page.

    Returns:
        list: A list of dictionaries containing job information.
    """
    print("Starting Alkami Technology scraper...")

    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in background
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Setup the webdriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    # Prepare to store job data
    job_data = []

    try:
        # Use Selenium to load the page
        driver.get(
            "https://recruiting2.ultipro.com/ALK1000ALKMI/JobBoard/14a93591-2185-4546-9bdb-db71739b106a/?q=&o=postedDateDesc")

        # Wait for job links to be present
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'opportunity-link'))
        )

        # Parse the page source with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, "html.parser")

        # Find all job links
        job_links = soup.find_all('a', class_='opportunity-link break-word')

        # Store links to crawl
        links_to_crawl = []

        # Collect initial job links
        for link_element in job_links:
            link = link_element.get('href')
            full_link = f"https://recruiting2.ultipro.com{link}"
            links_to_crawl.append(full_link)

        print(f"Found {len(links_to_crawl)} Alkami job listings to process")

        # Crawl each job page
        for job_url in links_to_crawl:
            try:
                # Load the specific job page
                driver.get(job_url)

                # Wait for page to load completely
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, 'body'))
                )

                # Wait a bit more for dynamic content
                time.sleep(2)

                # Refresh the page source to ensure we have the most current content
                driver.refresh()
                time.sleep(2)

                # Create BeautifulSoup object for this specific page
                job_page_soup = BeautifulSoup(driver.page_source, "html.parser")

                # Extract job details with more robust selectors
                job_title_element = job_page_soup.find('h1') or job_page_soup.find('a', class_='opportunity-link')
                job_title = job_title_element.text.strip() if job_title_element else "No Title Found"

                # Company Name (static for this case)
                company_name = "Alkami Technology"

                # Job Description with multiple fallback methods
                job_description_element = (
                        job_page_soup.find('p', class_='opportunity-description') or
                        job_page_soup.find('div', class_='job-description') or
                        job_page_soup.find('div', id='job-description') or
                        job_page_soup.find('div', class_='job-content')
                )

                job_description = job_description_element.get_text(
                    strip=True) if job_description_element else "No Description Found"

                # Location - try to find it, fallback to default
                location_element = job_page_soup.find('span', class_='opportunity-location')
                location = location_element.text.strip() if location_element else "Remote in US (Plano, TX option)"

                # Format the job data USING THE EXACT FIELD NAMES expected by scrape_jobs.py
                job_data.append({
                    'Company Name': company_name,
                    'Job Title': job_title,
                    'Job Description': job_description,
                    'Location': location,
                    'Application Link': job_url
                })

                print(f"Successfully scraped: {job_title}")

                # Add a small delay between requests to avoid overwhelming the server
                time.sleep(1)

            except Exception as e:
                print(f"Error scraping job at {job_url}:")
                print(traceback.format_exc())
                continue

        print(f"Alkami Technology scraping complete. Found {len(job_data)} jobs.")
        return job_data

    except Exception as e:
        print(f"An error occurred during Alkami Technology scraping: {e}")
        traceback.print_exc()
        return []

    finally:
        # Always close the driver
        driver.quit()


# For testing the function directly
if __name__ == "__main__":
    jobs = alkami_technology()
    print(f"Total jobs found: {len(jobs)}")
    for job in jobs:
        print(f"Job: {job['Job Title']} at {job['Company Name']}")
