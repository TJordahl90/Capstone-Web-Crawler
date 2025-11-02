import os, json, re
from openai import OpenAI

client = OpenAI(api_key=os.getenv('ai_api_key')) # Initialize OpenAI client

def extract_job_posting_summary(job_description_text):
    system_prompt = """
		You are an expert AI specialized in summarizing job listings.
    	Summarize the following job posting in 2–3 concise sentences.
    	Focus on the main responsibilities, the ideal candidate profile, and what makes the job appealing.
    	Avoid any details not explicitly stated.
    """

    user_prompt = f"Extract the required information from the following job description:\n\n{job_description_text}"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", # can use a gpt-4 model for better accuracy less hallucinations
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=150
        )

        summary = response.choices[0].message.content.strip()
        return summary

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

#-----------------------BELOW ARE HELPER FUNCTIONS THAT EXTRACT TYPICAL DATA FROM JOB POSTINGS---------------------#

def tokenizer(description):
    # regex_pattern = r'(?<!\w)([a-z0-9]+(?:[\+\#\.\/\-][a-z0-9]+)*[\+\#]*|\.[a-z0-9]+(?:[\+\#\.\/\-][a-z0-9]+)*[\+\#]*)(?!\w)'
    # regex_pattern = r"[\w\.#\+\-\/’‘']+"
    regex_pattern = r'(?<!\w)([a-z0-9]+(?:[\+\#\.\/\-’‘\'_][a-z0-9]+)*[\+\#]*|\.[a-z0-9]+(?:[\+\#\.\/\-’‘\'_][a-z0-9]+)*[\+\#]*)(?!\w)'
    description_lower = description.lower()
    tokens = set(re.findall(regex_pattern, description_lower))
    return tokens

def extract_skills_and_careers(tokens, description, keywords):
    keywords_found = []
    for keyword in keywords:
        if (keyword in tokens) or (" " in keyword and keyword in description):
            keywords_found.append(keyword)
    return list(set(keywords_found))

def extract_experience(title):
    experience = []
    experience_map = {
        r'\bintern\b': 'intern',
        r'\binternship\b': 'intern',
        r'\bentry[\s-]level\b': 'entry',
        r'\bearly[\s-]career\b': 'entry',
        r'\bjunior\b': 'entry',
        r'\bassociate\b(?![’\'\s-]*degree)': 'entry',
        r'\bmid[\s-]level\b': 'mid',
        r'\bmid[\s-]career\b': 'mid',
        r'\bsenior\b': 'senior',
        r'\bsr\.?\b': 'senior',
        r'\blead\b': 'lead',
        r'\bmanager\b': 'management',
        r'\bmgr\.?\b': 'management',
        r'\bsupervisor\b': 'management',
    }

    for pattern, label in experience_map.items():
        if re.search(pattern, title):
            experience.append(label)

    return experience

def extract_degree(description):
    degrees = []
    degree_map = {
        r"\bbachelor[']?s degree\b": 'bachelors',
        r"\bmaster[']?s degree\b": 'masters',
        r"\bassociate[']?s degree\b": 'associates',
        # need BS MS PHD DR highschool
    }

    for pattern, label in degree_map.items():
        if re.search(pattern, description):
            degrees.append(label)

    return degrees

def extract_employment_type(description):
    employments = []
    employment_map = {
        r'\bfull[\s-]time\b': 'full-time',
        r'\bpart[\s-]time\b': 'part-time',
    }

    for pattern, label in employment_map.items():
        if re.search(pattern, description):
            employments.append(label)

    return employments

def extract_work_model(description):
    workmodels = []
    workmodel_map = {
        r'\bonsite\b': 'on-site',
        r'\bremote\b': 'remote',
        r'\bhybrid\b': 'hybrid',
    }

    for pattern, label in workmodel_map.items():
        if re.search(pattern, description):
            workmodels.append(label)

    return workmodels

    