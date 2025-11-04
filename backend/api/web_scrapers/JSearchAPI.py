from .scraper_helper_functions import *
from django.utils import dateparse, timezone
import requests, os, csv

api_key = os.getenv('JSEARCH_API_KEY')
url = "https://jsearch.p.rapidapi.com/search"
api_host = "jsearch.p.rapidapi.com"

# TO DO: create list of job positions, make a single query for each position for better results

querystring = {
    # "query": "Technology jobs in the DFW Texas area",
    "query": "Software engineering jobs in Dallas-Fort Worth, Texas",
    "page": "1",
    "num_pages": "1" # increase for more jobs (200 a month total)
}

headers = {
    "x-rapidapi-key": api_key,
    "x-rapidapi-host": api_host
}

def jsearch_api():
    try:
        response = requests.get(url, headers=headers, params=querystring)

        if response.status_code == 200:
            results = response.json()
            jobs_list = results.get('data')
            job_data = []

            skill_keywords = load_keywords("keywords_skills.txt")
            career_keywords = load_keywords("keywords_careers.txt")

            if jobs_list:
                print(f"Successfully found {len(jobs_list)} jobs:")
                print("----")

                for job in jobs_list:
                    print(f"{job.get('job_title')} from {job.get('employer_name')}")

                    job_details = {}
                    title = job.get('job_title', '')
                    description = job.get('job_description', '')
                    is_remote = job.get('job_is_remote', False)
                    raw_date = job.get('job_posted_at_datetime_utc')
                    salary = job.get('job_salary')
                    min_salary = job.get('job_min_salary')
                    max_salary = job.get('job_max_salary')
                    apply_link = job.get('job_apply_link')
                    other_apply_links = job.get('apply_options')
                    city = job.get('job_city')
                    state = job.get('job_state')
                    employment_types = []

                    for type in job.get('job_employment_types', []):
                        employment_types.append(type.lower())

                    if not apply_link and other_apply_links:
                        for option in other_apply_links:
                            if option.get('is_direct'):
                                apply_link = option.get('apply_link')
                                break

                        if not apply_link:    
                            apply_link = other_apply_links[0].get("apply_link")

                    complete_post = (title + description).lower()
                    tokens = tokenizer(complete_post)

                    job_details['company'] = job.get('employer_name', '')
                    job_details['title'] = title
                    job_details['description'] = description
                    job_details['summary'] = "This will be the AI summary. Not included until testing is done." # extract_job_posting_summary(complete_post)
                    job_details['skills'] = extract_skills_and_careers(tokens, complete_post, skill_keywords)
                    job_details['careers'] = extract_skills_and_careers(tokens, complete_post, career_keywords)
                    job_details['degrees'] = extract_degree(complete_post)
                    job_details['experienceLevels'] = extract_experience(complete_post)
                    job_details['employmentTypes'] = employment_types

                    # need to get logo url from json 

                    if is_remote:
                        job_details['workModels'] = ['remote']
                    else:
                        job_details['workModels'] = extract_work_model(complete_post.lower())

                    job_details['location'] = f'{city}, {state}'

                    if raw_date:
                        job_details['datePosted'] = dateparse.parse_datetime(raw_date)    
                    else:
                        job_details['datePosted'] = timezone.now()

                    if salary:
                        job_details['salary'] = f"${salary}"
                    elif min_salary and max_salary:
                        job_details['salary'] = f'${min_salary} - ${max_salary}'
                    else:
                        job_details['salary'] = None

                    job_details['jobURL'] = apply_link

                    job_data.append(job_details)

                if job_data:
                    fieldnames = [
                        "company", "title", "description", "summary", "skills", "careers", "degrees", 
                        "experienceLevels", "employmentTypes", "workModels", "location", "datePosted", "salary", "jobURL",
                    ]
                    with open("jsearch-api.csv", "w", newline="", encoding="utf-8") as file:
                        writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction='ignore')
                        writer.writeheader()
                        writer.writerows(job_data)

                    print(f"Successfully obtained details for {len(job_data)} jobs and saved to jsearch-api.csv")
                else:
                    print("No detailed job information was collected.")

                return job_data

            else:
                print("Request was successful, but no jobs were found for this query.")

        else:
            print(f"Error: Request failed with status code {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    jsearch_api()
