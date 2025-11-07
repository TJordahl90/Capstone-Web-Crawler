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
            model="gpt-4o-mini",
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
    
def extract_job_experience_fallback(job_description_text):
    system_prompt = """
    You are an AI assistant that classifies job listings by experience level.

    Your task: Given a job description, respond ONLY with one of the following exact words:
    - intern
    - entry
    - mid
    - senior
    - lead
    - management

    Rules:
    - Do not explain your reasoning.
    - Do not include any extra text or punctuation.
    - If no clear experience level is found, choose the best match based on implied seniority.
    """

    user_prompt = f"""Determine the experience level from this job description:\n\n{job_description_text}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt.strip()},
                {"role": "user", "content": user_prompt.strip()}
            ],
            temperature=0,
            max_tokens=5
        )

        result = response.choices[0].message.content.strip().lower()

        valid_levels = {"intern", "entry", "mid", "senior", "lead", "management"}
        return result if result in valid_levels else None

    except Exception as e:
        print(f"An unexpected error occurred in fallback: {e}")
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

def extract_experience(title, description):
    experience = []
    experience_map = {
        r'\bintern\b': 'intern',
        r'\binternship\b': 'intern',
        r'\bco[-\s]?op\b': 'intern',
        r'\bsummer\b': 'intern',
        r'\bentry[\s-]?level\b': 'entry',
        r'\bearly[\s-]?career\b': 'entry',
        r'\bjunior\b': 'entry',
        r'\bassociate\b': 'entry',
        r'\b(graduate|new[\s-]?grad)\b': 'entry',
        r'\bmid[\s-]level\b': 'mid',
        r'\bmid[\s-]career\b': 'mid',
        r'\bintermediate\b': 'mid',
        r'\bsenior\b': 'senior',
        r'\bsr\.?\b': 'senior',
        r'\blead\b': 'lead',
        r'\bleader\b': 'lead',
        r'\bmanager\b': 'management',
        r'\bmgr\.?\b': 'management',
        r'\bsupervisor\b': 'management',
    }
    experience_years_map = {
        r'(\d+)\s*\+\s*years?',
        r'(\d+)\s*years?\s*\+',
        r'(\d+)\s*(?:or\s+more|and\s+more)\s+years?',
        r'(\d+)(?:\+)?\s+years?\s+(?:of\s+)?experience',
        r'experience\s*:\s*(\d+)(?:\+)?',
        r'(\d+)\s*-\s*(\d+)\s+years?',
        r'minimum\s+(?:of\s+)?(\d+)\s+years?',
        r'at\s+least\s+(\d+)\s+years?'
    }

    # First Case - Keyword match
    for pattern, label in experience_map.items():
        if re.search(pattern, title):
            experience.append(label)

    # Backup Case - Experience in years match
    if not experience:
        for pattern in experience_years_map:
            match = re.search(pattern, description)
            if match:
                if match.lastindex and match.lastindex > 1 and match.group(2):
                    years = int(match.group(1))
                else:
                    years = int(match.group(1))

                if years <= 1:
                    experience.append('intern')
                elif years <= 2:
                    experience.append('entry')
                elif years <= 4:
                    experience.append('mid')
                elif years <= 7:
                    experience.append('senior')
                elif years <= 10:
                    experience.append('lead')
                elif years <= 12:
                    experience.append('management')
                break

    # Last Case - Use AI
    if not experience:
        ai_level = extract_job_experience_fallback(description)
        if ai_level: 
            experience.append(ai_level)
        
    return set(experience)

def extract_degree(description):
    degrees = []
    degree_map = {
        r"\b(master[']?s|m\.s\.|ms|mba|graduate)\b": 'masters',
        r"\b(bachelor[']?s|b\.s\.|bs|under[\s-]?graduate)\b": 'bachelors',
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
JPMC_LOGO = 'https://cdn.brandfetch.io/idB8rdGiLv/w/200/h/200/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B'
BANK_OF_AMERICA_LOGO = 'https://companieslogo.com/img/orig/BAC-e7995069.png?t=1720244490'
