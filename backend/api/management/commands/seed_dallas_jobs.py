from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random

from api.models import JobPosting


class Command(BaseCommand):
    help = "Create fake JobPosting entries in the Dallas–Fort Worth area."

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=1000,
            help="Number of jobs to create (default: 1000)",
        )

    def handle(self, *args, **options):
        count = options["count"]

        companies = [
            "Lockheed Martin",
            "Texas Instruments",
            "Bank of America",
            "JPMorgan Chase",
            "AT&T",
            "Toyota North America",
            "American Airlines",
            "Charles Schwab",
            "Liberty Mutual",
            "Raytheon",
        ]

        titles = [
            "Software Engineer",
            "Backend Developer",
            "Full Stack Developer",
            "Data Engineer",
            "DevOps Engineer",
            "Cloud Engineer",
            "QA Engineer",
            "Business Analyst",
            "Data Analyst",
            "Product Manager",
        ]

        locations = [
            "Dallas, TX",
            "Fort Worth, TX",
            "Arlington, TX",
            "Plano, TX",
            "Irving, TX",
            "Richardson, TX",
            "Frisco, TX",
            "Garland, TX",
            "Mesquite, TX",
            "Grand Prairie, TX",
        ]

        salary_ranges = [
            "$70,000 - $90,000",
            "$80,000 - $100,000",
            "$90,000 - $120,000",
            "$100,000 - $130,000",
        ]

        today = timezone.now().date()
        created = 0

        self.stdout.write(self.style.SUCCESS(f"Seeding {count} DFW jobs..."))

        for i in range(count):
            company = random.choice(companies)
            title = random.choice(titles)
            location = random.choice(locations)
            salary = random.choice(salary_ranges)

            # Spread dates over the last ~30 days
            date_posted = today - timedelta(days=random.randint(0, 30))

            # Simple unique-ish URL so we don't accidentally conflict
            slug_company = company.lower().replace(" ", "-")
            slug_title = title.lower().replace(" ", "-")
            job_url = (
                f"https://example.com/jobs/dallas-ft-worth/"
                f"{slug_company}/{slug_title}/{today.strftime('%Y%m%d')}-{i}"
            )

            JobPosting.objects.create(
                company=company,
                title=title,
                description=(
                    f"{title} role at {company} based in {location}. "
                    "This is a seeded test job for the Dallas–Fort Worth area."
                ),
                summary=f"{title} in {location} at {company}",
                location=location,
                datePosted=date_posted,
                salary=salary,
                jobURL=job_url,
                # skills / careers / etc. left empty on purpose
            )

            created += 1

        self.stdout.write(self.style.SUCCESS(f"Created {created} Dallas–Fort Worth jobs."))
