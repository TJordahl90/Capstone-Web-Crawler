import re
import fitz  # uses PyMuPDF to accept pdf

def extract_text_from_pdf(pdf_file):
    text = ""
    with fitz.open(stream=pdf_file.read(), filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def parser(text):
    parsed = {
        "name": None,
        "email": None,
        "phone": None,
        "skills": [],
        "education": [],
        "experience": []
    }

    # Gets name assuming the first line of the resume has the name
    lines = text.strip().split('\n')
    for line in lines:
        if line.strip():
            parsed["name"] = line.strip()
            break

    # Gets email
    emailSearch = re.search(r"[\w\.-]+@[\w\.-]+", text)
    if emailSearch:
        parsed["email"] = emailSearch.group(0)

    # Gets phone number
    phoneSearch = re.search(r"(\+?\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}", text)
    if phoneSearch:
        parsed["phone"] = phoneSearch.group(0)

    # Gets skills 
    skills_section = re.search(r"(?i)(skills|technical skills)\s*[:\n]+(.+?)(\n\n|$)", text, re.DOTALL)
    if skills_section:
        skills_text = skills_section.group(2)
        parsed["skills"] = [skill.strip() for skill in re.split(r",|\n", skills_text) if skill.strip()]

    # Gets education 
    educationSearch = re.findall(r"(?i)(Bachelor|Master|PhD|B\.Sc|M\.Sc|B.A|M.A)[^\n]*", text)
    parsed["education"] = educationSearch

    # Gets experience 
    experienceSearch = re.findall(r"(?i)(?:\d{4}\s*-\s*\d{4}|experience|internship|project)[^\n]*", text)
    parsed["experience"] = experienceSearch

    return parsed
