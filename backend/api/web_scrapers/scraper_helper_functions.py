import os, json, re
from openai import OpenAI

#-----------------------BELOW ARE HELPER FUNCTIONS THAT WILL BE USED BY SCRAPERS/APIS---------------------#

def load_keywords(filename):
    try:
        with open(filename, 'r') as file:
            return [line.strip() for line in file if line.strip()]
    except Exception as e:
        print(f"Failed to load keywords: {e}")
        return []
    
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

def tokenizer(description):
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

def extract_experience(description):
    experience = []
    experience_map = {
        r'\bintern\b': 'intern',
        r'\binternship\b': 'intern',
        r'\bentry[\s-]level\b': 'entry',
        r'\bearly[\s-]career\b': 'entry',
        r'\bjunior\b': 'entry',
        r'\bassociate\b(?![’\'\s-]*(degree|in))': 'entry',
        r'\bmid[\s-]level\b': 'mid',
        r'\bmid[\s-]career\b': 'mid',
        r'\bsenior\b': 'senior',
        r'\bsr\.?\b': 'senior',
        # r'\blead\b': 'lead',
        # r'\bleader\b': 'lead',
        r'\bmanager\b': 'management',
        r'\bmgr\.?\b': 'management',
        r'\bsupervisor\b': 'management',
    }

    for pattern, label in experience_map.items():
        if re.search(pattern, description):
            experience.append(label)

    return set(experience)

def extract_degree(description):
    degrees = []
    degree_map = {
        r"\b(master[']?s|m\.s\.|ms|mba)\b": 'masters',
        r"\b(bachelor[']?s|b\.s\.|bs)\b": 'bachelors',
        r"\b(associate[']?s|a\.a\.|a\.s\.)\b": 'associates',
        r"\b(ph\.?d|doctorate|doctoral)\b": 'doctorate',
        r"\b(high[\s-]?school|ged)\b": 'highschool'

    }

    for pattern, label in degree_map.items():
        if re.search(pattern, description):
            degrees.append(label)

    return set(degrees)

def extract_employment_type(description):
    employments = []
    employment_map = {
        r'\bfull[\s-]?time\b': 'fulltime',
        r'\bpart[\s-]?time\b': 'parttime',
        r'\bcontract\b' : 'contract',
        r'\bseasonal\b' : 'contract',
        r'\btemporary\b' : 'temporary'
    }

    for pattern, label in employment_map.items():
        if re.search(pattern, description):
            employments.append(label)

    return set(employments)

def extract_work_model(description):
    workmodels = []
    workmodel_map = {
        r'\bonsite\b': 'onsite',
        r'\bin[\s-]?(person|office)\b': 'onsite',
        r'\b(remote|telework|wfh|work from home)\b': 'remote',
        r'\bhybrid\b': 'hybrid',
    }

    for pattern, label in workmodel_map.items():
        if re.search(pattern, description):
            workmodels.append(label)

    return set(workmodels)


# --------- COMPANY LOGO URLS -------------#
TEXAS_INSTRUMENTS_LOGO = 'https://companieslogo.com/img/orig/TXN-e197f953.png?t=1720244494'    
LOCKHEED_MARTIN_LOGO = 'https://companieslogo.com/img/orig/LMT-db3de619.png?t=1720244492'
JPMCHASE_LOGO = 'https://companieslogo.com/img/orig/JPM-6b337108.png?t=1720244492'
