import os, json
from openai import OpenAI

client = OpenAI(api_key=os.getenv('ai_api_key')) # Initialize OpenAI client


def extract_job_details_with_openai(job_description_text):
    system_prompt = """
    You are an expert job description parser. Analyze the provided job description text 
    and extract the specified information. Respond ONLY with a valid JSON object 
    containing the following keys:
    - "skills": A list of relevant technical skills, tools, methodologies, and programming languages mentioned (e.g. Java, Python, SQL, Agile, Linux, Git, Embedded Systems, RTOS, AWS, machine learning, etc.). These skills will be used for a job to profile matching feature, so the skills should be common and not to long.
    - "fieldOfStudy": A list of academic fields or majors mentioned as requirements (list of strings). Include related fields if mentioned.
    - "degreeType": A list of degree levels mentioned (e.g., "Bachelor's", "Masters", "PhD", "Associates") (list of strings).
    - "salary": The salary or salary range mentioned as a single string (e.g., "$100,000 - $120,000", "Up to $50/hour"). If not found, return null.
    - "experienceLevel": The required experience level as a single string (e.g., "Internship", "Entry", "Mid", "Senior", "Experienced Professional"). Normalize common terms. If not found, return null.
    - "employmentType": The type of employment as a single string (e.g., "Full-Time", "Part-Time", "Contract"). Normalize common terms. If not found, return null.
    - "locationType": The work location type as a single string (e.g., "On-Site", "Hybrid", "Remote"). Normalize common terms. If not found, return null.

    If a list field has no items, return an empty list ([]). Do not add any explanations or introductory text outside the JSON object.
    """

    user_prompt = f"Extract the required information from the following job description:\n\n{job_description_text}"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=1000
        )

        json_output_string = response.choices[0].message.content
        extracted_data = json.loads(json_output_string)
        
        return extracted_data

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

    