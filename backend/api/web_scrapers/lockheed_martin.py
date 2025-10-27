from bs4 import BeautifulSoup, NavigableString
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import ElementClickInterceptedException, TimeoutException, StaleElementReferenceException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import time, csv, logging, re
from .scraper_ai import extract_job_details_with_openai

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def extract_short_description(soup):
    """Extracts the short description (important part of full description)"""
    description_lines = []
    start_tag = soup.find('b', string=re.compile(r'Description:?'))

    if start_tag:
        current_node = start_tag.find_parent('p') if start_tag.find_parent('p') else start_tag
        current_node = current_node.next_sibling
        current_line_text = ""

        while current_node:
            is_stop_header = (current_node.name == 'b' and re.search(r'Basic Qualifications:?', current_node.get_text(strip=True)))
            if is_stop_header:
                if current_line_text.strip():
                    cleaned_line = re.sub(r'\s+', ' ', current_line_text.strip())
                    description_lines.append(cleaned_line)
                break

            if isinstance(current_node, NavigableString):
                current_line_text += str(current_node)
            elif current_node.name == 'br':
                if current_line_text.strip():
                    cleaned_line = re.sub(r'\s+', ' ', current_line_text.strip())
                    description_lines.append(cleaned_line)
                current_line_text = ""
            elif current_node.name == 'p':
                p_text = current_node.get_text(separator=' ', strip=True)
                if p_text:
                    if current_line_text.strip():
                         cleaned_line = re.sub(r'\s+', ' ', current_line_text.strip())
                         description_lines.append(cleaned_line)
                    cleaned_p = re.sub(r'\s+', ' ', p_text)
                    description_lines.append(cleaned_p)
                    current_line_text = "" 
            elif current_node.name == 'b':
                 tag_text = current_node.get_text(separator=' ', strip=True)
                 if tag_text:
                     if current_line_text.strip():
                          cleaned_line = re.sub(r'\s+', ' ', current_line_text.strip())
                          description_lines.append(cleaned_line)
                     description_lines.append('')
                     description_lines.append(tag_text)
                     current_line_text = ""

            current_node = current_node.next_sibling

        if current_line_text.strip():
             cleaned_line = re.sub(r'\s+', ' ', current_line_text.strip())
             description_lines.append(cleaned_line)

    return '\n'.join(line for line in description_lines if line or line=='').strip()

def extract_requirements(soup):
    """Extracts requirements as  a block of text"""
    requirements_lines = []
    start_header = soup.find('b', string=re.compile(r'Basic Qualifications:?'))

    if start_header:
        current_node = start_header
        current_line_text = ""

        while current_node:
            is_stop_header = (current_node.name == 'b' and re.search(r'Security Clearance Statement:?', current_node.get_text(strip=True)))
            if is_stop_header:
                if current_line_text.strip():
                    cleaned_line = re.sub(r'\s+', ' ', current_line_text.strip())
                    requirements_lines.append(cleaned_line)
                break

            if isinstance(current_node, NavigableString):
                current_line_text += str(current_node)

            elif current_node.name == 'br':
                if current_line_text.strip():
                    cleaned_line = re.sub(r'\s+', ' ', current_line_text.strip())
                    requirements_lines.append(cleaned_line)
                current_line_text = ""

            elif current_node.name:
                tag_text = current_node.get_text(separator=' ', strip=True)
                if tag_text:
                     if current_line_text.strip():
                          cleaned_line = re.sub(r'\s+', ' ', current_line_text.strip())
                          requirements_lines.append(cleaned_line)
                          current_line_text = ""
                     requirements_lines.append(tag_text)

            current_node = current_node.next_sibling

        if current_line_text.strip():
             cleaned_line = re.sub(r'\s+', ' ', current_line_text.strip())
             if not requirements_lines or requirements_lines[-1] != cleaned_line:
                requirements_lines.append(cleaned_line)

    return '\n'.join(requirements_lines).strip()

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

        # cyber_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Cyber']")))
        # driver.execute_script("arguments[0].click();", cyber_checkbox)
        # time.sleep(3)

        data_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Data Science']")))
        driver.execute_script("arguments[0].click();", data_checkbox)
        time.sleep(3)

        # ai_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[contains(@data-display, 'AI/Machine Learning')]")))
        # driver.execute_script("arguments[0].click();", ai_checkbox)
        # time.sleep(3)

        it_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Information Technology']")))
        driver.execute_script("arguments[0].click();", it_checkbox)
        time.sleep(3)

        # software_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Software Engineering']")))
        # driver.execute_script("arguments[0].click();", software_checkbox)
        # time.sleep(3)
        
        # systems_checkbox = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@data-display='Systems Engineering']")))
        # driver.execute_script("arguments[0].click();", systems_checkbox)
        # time.sleep(3)

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

        job_links = []
        final_job_elements = [] # To store elements found after potential scrolling

        print("Starting scroll process to load all jobs...")
        last_job_count = 0
        scroll_attempts = 0
        max_scroll_attempts = 15
        final_job_elements = []

        while scroll_attempts < max_scroll_attempts:
            try:
                # --- FIX: Re-find the container INSIDE the loop ---
                results_container = driver.find_element(By.ID, "search-results-list")
                # --- END FIX ---
                
                # Find current job elements using the precise selector inside the loop
                current_job_elements = results_container.find_elements(By.CSS_SELECTOR, "ul > li")
                current_job_count = len(current_job_elements)
                print(f"Found {current_job_count} jobs so far...")

                # Store the LATEST list found
                final_job_elements = current_job_elements 

                # If count hasn't increased after a scroll, assume done
                if current_job_count == last_job_count and last_job_count > 0:
                    print("Scrolling finished. No new jobs loaded.")
                    break

                last_job_count = current_job_count

                # Scroll down
                print("Scrolling down...")
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

                # Wait for new content to potentially load
                time.sleep(4) # Increased wait slightly for loading

            except StaleElementReferenceException:
                # If the container itself goes stale *during* an iteration, 
                # just print a warning and the loop will try to re-find it next time.
                print("Warning: results_container became stale during scroll loop iteration. Retrying...")
                time.sleep(1) # Small pause before retrying
            except NoSuchElementException:
                print("Error: Could not find results_container during scroll loop. Stopping scroll.")
                break # Exit loop if container disappears
            except Exception as scroll_e:
                print(f"Error during scrolling loop: {scroll_e}")
                break # Exit loop on other errors

            scroll_attempts += 1
            if scroll_attempts == max_scroll_attempts:
                 print("Warning: Reached max scroll attempts. Might not have loaded all jobs.")


        job_links = []
        try:
            # Process the FINAL list of elements found AFTER scrolling
            print(f"Processing {len(final_job_elements)} potentially loaded job elements for links...")
            for job_element in final_job_elements:

                try:
                    # Find the 'a' tag within this specific element
                    link_element = job_element.find_element(By.CSS_SELECTOR, "a")
                    link = link_element.get_attribute("href")
                    if link:
                        # Add duplicate check
                        if not any(d['link'] == link for d in job_links):
                             job_links.append({"link": link})
                except StaleElementReferenceException:
                    print("Warning: Stale element encountered during final link extraction. Skipping.")
                    continue
                except NoSuchElementException:
                    print("Warning: Found li element without direct 'a' tag in final processing, skipping.")
                    continue
                except Exception as e:
                    print(f"Error processing one final job element for link: {e}")

            print(f"Extracted {len(job_links)} unique job links from primary method.")

        except Exception as final_find_e:
            print(f"Error finding/processing final job elements after scroll: {final_find_e}")

        print(f"\n>>> Final collected job_links count: {len(job_links)}")

        for i, job in enumerate(job_links):
            try:
                print(f"Processing job {i + 1}/{len(job_links)}")
                driver.get(job["link"])

                job_details = {
                    "company": "Lockheed Martin", "title": "", "fullDescription": "", "shortDescription": "", "requirements": [],
                    "skills": [], "location": "", "datePosted": "", "salary": "", "jobURL": job["link"], 
                    "experienceLevel": "", "employmentType": "", "locationType": "", "degreeType": [], "fieldOfStudy": [] 
                } 

                try:

                    # temp fix to skip empty job links
                    if i == 0:
                        print("Skipped first job because its empty")
                        continue

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
                    job_details['datePosted'] = date_element.text.split(':')[-1].strip()

                    raw_html = job_body_container.get_attribute("innerHTML")
                    soup = BeautifulSoup(raw_html, "html.parser")

                    job_details['requirements'] = extract_requirements(soup)
                    job_details['shortDescription'] = extract_short_description(soup)

                    # Futher formatting and cleaning
                    for br in soup.find_all("br"):
                        br.replace_with("\n")

                    for bold in soup.find_all(["b", "strong"]):
                        bold.insert_before("\n\n")

                    cleaned_text = soup.get_text(separator="\n", strip=True)
                    full_description = f"{title}\n{location}\n{cleaned_text}"
                    job_details["fullDescription"] = full_description

                    extracted_details = extract_job_details_with_openai(full_description)
                    if extracted_details:
                        job_details['skills'] = extracted_details.get('skills', [])
                        job_details["fieldOfStudy"] = extracted_details.get("fieldOfStudy", [])
                        job_details["degreeType"] = extracted_details.get("degreType", [])
                        job_details["salary"] = extracted_details.get("salary", None)
                        job_details["experienceLevel"] = extracted_details.get("experienceLevel", None)
                        job_details["employmentType"] = extracted_details.get("employmentType", None)
                        job_details["locationType"] = extracted_details.get("locationType", None)

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
                "salary", "jobURL", "experienceLevel", "employmentType", "locationType", "degreeType", "fieldOfStudy" 
            ]
            with open("lockheed_martin.csv", "w", newline="", encoding="utf-8") as file:
                writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(job_data)


            print(f"Successfully scraped details for {len(job_data)} jobs and saved to lockheed_martin.csv")
        else:
            print("No detailed job information was collected.")

        print(f"Scraped {len(job_data)} jobs from Lockheed Martin")
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