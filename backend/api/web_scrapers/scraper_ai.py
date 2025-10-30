import os, json
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


    