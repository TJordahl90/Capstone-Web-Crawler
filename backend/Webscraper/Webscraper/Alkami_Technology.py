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
import csv
import logging
import traceback
import re
from webdriver_manager.chrome import ChromeDriverManager

def alkami_technology():
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in background

    # Setup the webdriver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

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

                # Refresh the page source
                driver.refresh()
                time.sleep(2)

                # Create BeautifulSoup object for this specific page
                job_page_soup = BeautifulSoup(driver.page_source, "html.parser")

                # Debug: Print entire page source
                print("Page Source:")
                print(driver.page_source[:1000])  # Print first 1000 characters

                # Extract job details with more robust selectors
                job_title_element = job_page_soup.find('h1') or job_page_soup.find('a', class_='opportunity-link')
                job_title = job_title_element.text.strip() if job_title_element else "No Title Found"

                # Company Name (static for this case)
                company_name = "Alkami Technology"

                # Job Description with multiple fallback methods
                job_description_element = (
                        job_page_soup.find('p', class_='opportunity-description') or
                        job_page_soup.find('div', class_='job-description') or
                        job_page_soup.find('div', id='job-description')
                )
                job_description = job_description_element.get_text(
                    strip=True) if job_description_element else "No Description Found"

                # Location
                location = "Remote in US (Plano, TX option)"

                # Application Link
                application_link = job_url

                # Store the job data
                job_data.append({
                    'Job Title': job_title,
                    'Company Name': company_name,
                    'Job Description': job_description,
                    'Location': location,
                    'Application Link': application_link
                })

                # Print for verification
                print(f"Scraped: {job_title}")

                # Optional: Add a small delay
                time.sleep(1)

            except Exception as e:
                print(f"Detailed error scraping {job_url}:")
                print(traceback.format_exc())
                continue

        # Save to CSV
        import csv

        csv_filename = 'job_listings.csv'
        with open(csv_filename, 'a', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['Job Title', 'Company Name', 'Job Description', 'Location', 'Application Link']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for job in job_data:
                writer.writerow(job)

        print(f"Jobs saved to {csv_filename}")

    except Exception as e:
        print(f"An error occurred: {e}")
        traceback.print_exc()

    finally:
        # Always close the driver
        driver.quit()