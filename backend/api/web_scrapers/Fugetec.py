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


def fugetec():
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        filename='job_scraper.log'
    )

    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in background

    # Setup the webdriver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

    # Prepare to store job data
    job_data = []
    job_links_array = []  # Array to store job links

    try:
        # Use Selenium to load the page
        driver.get("https://fugetec.com/careers")

        # Wait for the search button to be present
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'button.btn.btn-primary'))
        )

        # Click the search button
        search_button = driver.find_element(By.CSS_SELECTOR, 'button.btn.btn-primary')
        search_button.click()

        # Wait for job links to be present after clicking the search button
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'btn-danger'))
        )

        # Get the page source and parse it with BeautifulSoup
        html_content = driver.page_source
        soup = BeautifulSoup(html_content, 'html.parser')
        job_links = soup.find_all('a', class_=lambda x: x and 'btn-danger' in x.split())

        # Store the links in the array
        for link in job_links:
            href = link.get('href')
            if href:
                job_links_array.append(href)
                logging.info(f"Found job link: {href}")

        # Print the total number of links found
        logging.info(f"Total job links found: {len(job_links_array)}")

        # Iterate through each job link and scrape details
        for job_url in job_links_array:
            try:
                # Navigate to the job page
                logging.info(f"Accessing job page: {job_url}")
                driver.get(job_url)

                # Wait for the job details to load
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, 'job-title'))
                )

                # Get the page content and parse it
                job_html = driver.page_source
                job_soup = BeautifulSoup(job_html, 'html.parser')

                # Extract job title
                job_title_element = job_soup.find('h4', class_='job-title')
                job_title = job_title_element.text.strip() if job_title_element else "N/A"

                # Extract job location
                location_element = job_soup.find('span', string=re.compile(r'.*TX.*'))
                location = location_element.text.strip() if location_element else "N/A"

                # Extract job description
                description_element = job_soup.find('div', class_='job-description')
                description = ""
                if description_element:
                    # Join all paragraph texts to form the complete description
                    paragraphs = description_element.find_all('p')
                    description = " ".join([p.text.strip() for p in paragraphs])

                # Add the company name
                company = "Fugetec"

                # Format the job data USING THE EXACT FIELD NAMES expected by scrape_jobs.py
                job_data.append({
                    'Company Name': company,
                    'Job Title': job_title,
                    'Job Description': description,
                    'Location': location,
                    'Application Link': job_url
                })

                print(f"Successfully scraped: {job_title}")

                # Add a small delay to avoid overloading the server
                time.sleep(1)

            except Exception as e:
                logging.error(f"Error scraping job {job_url}: {str(e)}")
                logging.error(traceback.format_exc())

        return job_data

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        logging.error(traceback.format_exc())
        return []

    finally:
        # Close the WebDriver
        driver.quit()
        logging.info("WebDriver closed")

# If running this file directly
if __name__ == "__main__":
    fugetec()
