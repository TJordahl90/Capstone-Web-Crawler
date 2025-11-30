import requests
from bs4 import BeautifulSoup
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import JobPosting


class Command(BaseCommand):
    help = "Scrape real jobs from a company careers page and save them to JobPosting."

    # 🔧 EDIT THESE THREE VALUES FOR YOUR COMPANY
    COMPANY_NAME = "Example Company"
    CAREERS_URL = "https://careers.example.com/jobs"  # put the real careers URL here
    BASE_URL = "https://careers.example.com"          # same domain as above

    HEADERS = {
        "User-Agent": "Mozilla/5.0 (compatible; CapstoneJobCrawler/1.0)"
    }

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f"Scraping jobs from {self.COMPANY_NAME}..."))

        html = self.fetch_page(self.CAREERS_URL)
        if not html:
            self.stdout.write(self.style.ERROR("Could not load careers page."))
            return

        soup = BeautifulSoup(html, "html.parser")

        # 🔧 EDIT THIS SELECTOR TO MATCH ONE JOB CARD ON THE SITE
        # Example: each job is inside <div class="job-card"> ... </div>
        job_cards = soup.select(".job-card")

        self.stdout.write(self.style.SUCCESS(f"Found {len(job_cards)} potential jobs."))

        created = 0
        for card in job_cards:
            job = self.parse_job_card(card)
            if not job:
                continue

            if self.save_job(job):
                created += 1

        self.stdout.write(
            self.style.SUCCESS(f"Finished. Created {created} new jobs for {self.COMPANY_NAME}.")
        )

    def fetch_page(self, url: str) -> str | None:
        """Download the HTML of the page."""
        try:
            resp = requests.get(url, headers=self.HEADERS, timeout=20)
            if resp.status_code != 200:
                self.stderr.write(f"Non-200 status {resp.status_code} from {url}")
                return None
            return resp.text
        except requests.RequestException as e:
            self.stderr.write(f"Request error for {url}: {e}")
            return None

    def parse_job_card(self, card) -> dict | None:
        """
        Turn one 'job card' element into a dict with fields for JobPosting.
        🔧 You MUST edit the CSS selectors below to match the real site.
        """

        # 🔧 TITLE selector (required)
        title_el = card.select_one(".job-title")   # e.g. <h2 class="job-title">
        # 🔧 LOCATION selector (required)
        location_el = card.select_one(".job-location")  # e.g. <span class="job-location">
        # 🔧 LINK selector (required)
        link_el = card.select_one("a")             # the <a> that links to job detail page

        if not title_el or not location_el or not link_el:
            return None

        title = title_el.get_text(strip=True)
        location = location_el.get_text(strip=True)
        href = link_el.get("href", "").strip()
        if not href:
            return None

        job_url = self.build_full_url(href)

        # Optional description
        desc_el = card.select_one(".job-description")  # 🔧 adjust selector
        if desc_el:
            description = desc_el.get_text(" ", strip=True)
        else:
            description = f"{title} at {self.COMPANY_NAME} in {location}."

        # Optional salary
        salary_el = card.select_one(".job-salary")  # 🔧 adjust selector or remove
        salary = salary_el.get_text(strip=True) if salary_el else ""

        # Optional posted date
        date_el = card.select_one(".job-date")  # 🔧 adjust selector or remove
        if date_el:
            date_text = date_el.get_text(strip=True)
            date_posted = self.parse_date(date_text)
        else:
            date_posted = timezone.now().date()

        return {
            "company": self.COMPANY_NAME,
            "title": title,
            "location": location,
            "description": description,
            "summary": f"{title} in {location} at {self.COMPANY_NAME}",
            "salary": salary,
            "job_url": job_url,
            "date_posted": date_posted,
        }

    def build_full_url(self, href: str) -> str:
        """Turn a relative URL into a full URL."""
        href = href.strip()
        if href.startswith("http://") or href.startswith("https://"):
            return href
        if href.startswith("/"):
            return self.BASE_URL + href
        return self.BASE_URL + "/" + href

    def parse_date(self, text: str):
        """Try to parse a date string from the site; fall back to today."""
        text = text.replace("Posted", "").strip()
        for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%b %d, %Y"):
            try:
                return datetime.strptime(text, fmt).date()
            except ValueError:
                continue
        return timezone.now().date()

    def save_job(self, job: dict) -> bool:
        """
        Save a job into JobPosting, avoiding duplicates by jobURL.
        Returns True if a new row was created.
        """
        obj, created = JobPosting.objects.get_or_create(
            jobURL=job["job_url"],
            defaults={
                "company": job["company"],
                "title": job["title"],
                "description": job["description"],
                "summary": job["summary"],
                "location": job["location"],
                "datePosted": job["date_posted"],
                "salary": job["salary"],
            },
        )
        return created
