import os, json, re
from openai import OpenAI

#-----------------------BELOW ARE HELPER FUNCTIONS THAT WILL BE USED BY SCRAPERS/APIS---------------------#

def load_keywords(filename):
    try:
        with open(filename, 'r') as file:
            keywords = [line.strip() for line in file if line.strip()]

        keyword_map = {kw.lower(): kw for kw in keywords}
        return keyword_map
    
    except Exception as e:
        print(f"Failed to load keywords: {e}")
        return {}
    

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
    - Intern
    - Entry
    - Mid
    - Senior
    - Lead
    - Management

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
    description = description.lower()
    tokens = set(re.findall(regex_pattern, description))
    return tokens


def extract_skills_and_careers(tokens, description, keyword_map):
    keywords_found = []
    description = description.lower()

    for key_lower, key_upper in keyword_map.items():
        if (key_lower in tokens) or (" " in key_lower and key_lower in description):
            keywords_found.append(key_upper)
    return list(set(keywords_found))


def extract_experience(title, description):
    title = title.lower()
    description = description.lower()

    experience = []
    experience_map = {
        r'\bintern\b': 'Intern',
        r'\binternship\b': 'Intern',
        r'\bco[-\s]?op\b': 'Intern',
        r'\bsummer\b': 'Intern',
        r'\bentry[\s-]?level\b': 'Entry',
        r'\bearly[\s-]?career\b': 'Entry',
        r'\bjunior\b': 'Entry',
        r'\bassociate\b': 'Entry',
        r'\b(graduate|new[\s-]?grad)\b': 'Entry',
        r'\bmid[\s-]level\b': 'Mid',
        r'\bmid[\s-]career\b': 'Mid',
        r'\bintermediate\b': 'Mid',
        r'\bsenior\b': 'Senior',
        r'\bsr\.?\b': 'Senior',
        r'\blead\b': 'Lead',
        r'\bleader\b': 'Lead',
        r'\bmanager\b': 'Management',
        r'\bmgr\.?\b': 'Management',
        r'\bsupervisor\b': 'Management',
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
                    experience.append('Intern')
                elif years <= 2:
                    experience.append('Entry')
                elif years <= 4:
                    experience.append('Mid')
                elif years <= 7:
                    experience.append('Senior')
                elif years <= 10:
                    experience.append('Lead')
                elif years <= 12:
                    experience.append('Management')
                break

    # Last Case - Use AI
    if not experience:
        ai_level = extract_job_experience_fallback(description)
        if ai_level: 
            experience.append(ai_level)
        
    return set(experience)

def extract_degree(description):
    description = description.lower()
    degrees = []
    degree_map = {
        r"\b(master[']?s|m\.s\.|ms|mba|graduate)\b": 'Masters',
        r"\b(bachelor[']?s|b\.s\.|bs|under[\s-]?graduate)\b": 'Bachelors',
        r"\b(associate[']?s|a\.a\.|a\.s\.)\b": 'Associates',
        r"\b(ph\.?d|doctorate|doctoral)\b": 'Doctorate',
        r"\b(high[\s-]?school|ged)\b": 'Highschool'
    }

    for pattern, label in degree_map.items():
        if re.search(pattern, description):
            degrees.append(label)

    return set(degrees)

def extract_employment_type(description):
    description = description.lower()
    employments = []
    employment_map = {
        r'\bfull[\s-]?time\b': 'Full-Time',
        r'\bpart[\s-]?time\b': 'Part-Time',
        r'\bcontract\b' : 'Contract',
        r'\bseasonal\b' : 'Contract',
        r'\btemporary\b' : 'Temporary',
        r'\binternship\b' : 'Internship'
    }

    for pattern, label in employment_map.items():
        if re.search(pattern, description):
            employments.append(label)

    return set(employments)

def extract_work_model(description):
    description = description.lower()
    workmodels = []
    workmodel_map = {
        r'\bonsite\b': 'On-site',
        r'\bin[\s-]?(person|office)\b': 'On-site',
        r'\b(remote|telework|wfh|work from home)\b': 'Remote',
        r'\bhybrid\b': 'Hybrid',
    }

    for pattern, label in workmodel_map.items():
        if re.search(pattern, description):
            workmodels.append(label)

    return set(workmodels)

# --------- COMPANY LOGO URLS -------------#
TEXAS_INSTRUMENTS_LOGO = 'https://cdn.brandfetch.io/idjx-GI6U-/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B'    
LOCKHEED_MARTIN_LOGO = 'https://cdn.brandfetch.io/idDGntMzIS/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B'
JPMC_LOGO = 'https://cdn.brandfetch.io/idB8rdGiLv/w/200/h/200/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B'
BANK_OF_AMERICA_LOGO = 'https://cdn.brandfetch.io/ide4lTCz-B/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B'
