import requests
import sys
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
import os
import django
from datetime import datetime

# Setup Django
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
sys.path.append(BASE_DIR)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')  
django.setup()

from api.models import JobPosting
# Import scraping modules
import Alkami_Technology
import Fugetec
import tekreant

# Saves a job entry to the JobPosting model
def saveTodb(job):
    JobPosting.objects.create(
        company=job.get("company"),
        title=job.get("title"),
        description=job.get("description", "No description"),
        requirements=job.get("requirements", "No requirements"),
        location=job.get("location", "Unknown"),
        datePosted=datetime.today().date(),
        salary=job.get("salary"),
        jobURL=job.get("url"),
    )
    print(f"Saved: {job.get('title')} at {job.get('company')}")

# Processes and saves scraped jobs into the database
def processedScrapedJobs(jobs):
    if not jobs:
        print("No jobs to process.")
        return
    
    for job in jobs:
        saveTodb(job)

# Main function
def main():
    scrapers = [
        Alkami_Technology.alkami_technology,
        Fugetec.fugetec,
        tekreant.tekreant,
    ]
    
    for i, scraper in enumerate(scrapers, start=1):
        print(f"Running scraper {i}...")
        try:
            jobs = scraper()
            if jobs:
                processedScrapedJobs(jobs)
            else:
                print(f"Scraper {i} returned no jobs.")
        except Exception as e:
            print(f"Error running scraper {i}: {e}")
            traceback.print_exc()

if __name__ == "__main__":
    main()
