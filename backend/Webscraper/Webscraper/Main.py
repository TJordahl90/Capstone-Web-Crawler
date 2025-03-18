#Libraries
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

#files
import Alkami_Technology
import Fugetec
import tekreant

def main():
    csv_filename = 'job_listings.csv'

    # Clear the CSV file by opening it in write mode
    with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
        pass  # This will create an empty file

    for i in range(1, 26):  # Loop from 1 to 25
        if i == 1:
            Alkami_Technology.alkami_technology()
        elif i == 2:
            Fugetec.fugetec()
        elif i == 3:
            tekreant.tekreant()
        # Add more cases as needed
        elif i == 25:
            print(f"{i} is twenty-five")
        else:
            print(f"{i} is another number")
            # Default case to end the program
            print("Ending the program.")
            sys.exit()

if __name__ == "__main__":
    main()