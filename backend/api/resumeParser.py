import re
import fitz  # PyMuPDF

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

    # Split into lines
    lines = text.strip().split('\n')

    # Name (first non-empty line)
    for line in lines:
        if line.strip():
            parsed["name"] = line.strip()
            break

    # Email and phone
    email_search = re.search(r"[\w\.-]+@[\w\.-]+", text)
    if email_search:
        parsed["email"] = email_search.group(0)

    phone_search = re.search(r"(\+?\d{1,3})?[\s\.-]?\(?\d{3}\)?[\s\.-]?\d{3}[\s\.-]?\d{4}", text)
    if phone_search:
        parsed["phone"] = phone_search.group(0)

    # Section headers to identify sections
    section_headers = {
        "skills": ["skills", "technical skills", "core competency"],
        "education": ["education", "academic background"],
        "experience": ["experience", "work experience", "professional experience", "internship"],
        "projects": ["projects", "engineering projects"],
        "awards": ["awards", "scholarships", "grants"]
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

        if current_section == "skills":
            skills = [s.strip() for s in re.split(r"[,:•|\-]", line) if s.strip()]
            parsed["skills"].extend(skills)
        elif current_section == "education":
            parsed["education"].append(line)
        elif current_section == "experience":
            parsed["experience"].append(line)
        elif current_section == "projects":
            parsed.setdefault("projects", []).append(line)
        elif current_section == "awards":
            parsed.setdefault("awards", []).append(line)
        elif current_section == "misc":
            parsed.setdefault("other", []).append(line)

    return parsed
