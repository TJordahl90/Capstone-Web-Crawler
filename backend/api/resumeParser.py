import re
#import fitz  # PyMuPDF
import pdfplumber
#import spacy
from api.models import CommonSkills
from django.core.files.uploadedfile import SimpleUploadedFile
from openai import OpenAI
import os
import json
from .models import *

def extract_text_from_pdf(pdf_file):
    text = ""
    pdf_file.open('rb')

    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            text+=page.extract_text() + '\n'
            
    pdf_file.seek(0)

    return text

def extractSkills(text):
    # Filter all the text to get rid of needless characters
    text = text.lower()
    cleanText = text.encode("ascii", "ignore").decode()
    cleanText = re.sub(r"\s+", " ", cleanText).strip()
    words = re.findall(r"\w+", cleanText)
    textSet = set(words)
    #print(textSet)

    # Get a set of all the common skills from the db
    skills = CommonSkills.objects.values_list('name', flat=True)
    skillSet = set(skill.lower() for skill in skills)
    #print(skillSet)

    # Find the intersection and save all the users skills
    overlappedSkills = textSet & skillSet
    #print(overlappedSkills)

    return overlappedSkills



def parser(text):
    parsed = {
        "education": [],
        "experience": []
    }

    # Split into lines
    lines = text.strip().split('\n')

    # Name (first non-empty line)
    for line in lines:
        if line.strip():
            parsed["name"] = line.strip()
            break
    
    # Section headers to identify sections
    section_headers = {
        "education": ["education", "academic background"],
        "experience": ["experience", "work experience", "professional experience", "internship"],
        "projects": ["projects", "engineering projects"],
    }

    def detect_section(line):
        line_lower = line.lower()
        for section, keywords in section_headers.items():
            if any(keyword in line_lower for keyword in keywords):
                return section
        if line.isupper() and len(line.split()) < 5:
            return "misc"  # All caps, probably a section
        return None

    current_section = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        section = detect_section(line)
        if section and section != current_section:
            current_section = section
            continue

        if current_section == "education":
            parsed["education"].append(line)
        elif current_section == "experience":
            parsed["experience"].append(line)
        elif current_section == "projects":
            parsed.setdefault("projects", []).append(line)

    prompt = (
        "I will be giving you parsed text from a user's resume. "
        "It is your task to extract all education, experience, and project data "
        "and return it in JSON format. "
        "The JSON should have three keys: Education, Experience, and Projects. "
        "Each field can have multiple entries. "
        "Education entries should include: institution, degree (associate's, bachelor's, master's, etc), major, minor, graduationDate, and gpa. "
        "Experience entries should include: company, jobTitle, startDate, endDate, and description. "
        "Project entries should include: title, startDate, endDate, and description. "
        "If there is an error, return an empty JSON object. "
        f"Here is the parsed text: {text}"
    )

    client = OpenAI(api_key=os.getenv("ai_api_key")) # Initialize OpenAI client

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", # not sure what model yet using for now
            messages=[{"role": "user", "content": prompt}],
        )
        content = response.choices[0].message.content

        # Convert to a dict
        parsedJson = json.loads(content)
        return parsedJson
    except json.JSONDecodeError:
        print("Model output was not valid JSON")
        return {}
    except Exception as e:
        print(f'Error getting the response: {e}')
        return {}

'''
def testFunc():
    uploaded = SimpleUploadedFile("resume.pdf", open("api/JulianOndrey_Resume.pdf", "rb").read(), content_type="application/pdf")
    text = extract_text_from_pdf(uploaded)
    parsedData = parser(text)
'''