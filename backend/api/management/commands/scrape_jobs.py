from django.core.management.base import BaseCommand
from api.models import JobPosting
from api.web_scrapers import Alkami_Technology, Fugetec, tekreant

class Command(BaseCommand):
    """Runs all web scrapers in the 'web_scraper' folder"""

    def handle(self, *args, **options):
        
        # list all scrapers here
        scrapers = [
            Fugetec.fugetec,
            tekreant.tekreant,
            # continue...
        ]

        # for scraping log
        jobs_saved = 0
        total_jobs_saved = 0
        self.stdout.write(self.style.SUCCESS('Starting web scraping...'))

        for scraper in scrapers:
            try: 
                job_data = scraper() # runs scraper function
                jobs_saved = 0

                for job in job_data :     
                    # checks if job already exists         
                    existing_job = JobPosting.objects.filter(
                        title = job['Job Title'],
                        company = job['Company Name'],
                        jobURL = job['Application Link'],
                    ).exists()

                    # creates job object, saves to database
                    if not existing_job:
                        JobPosting.objects.create(
                            company = job['Company Name'],
                            title = job['Job Title'],
                            description = job['Job Description'],
                            location = job['Location'],
                            jobURL = job['Application Link'],

                            requirements='',
                            datePosted=None,
                            salary='',
                        )
                        jobs_saved += 1

                    self.stdout.write(
                        self.style.SUCCESS(f'{scraper.__name__}: {jobs_saved} jobs saved')
                    )
                    total_jobs_saved += jobs_saved

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error in {scraper.__name__}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Scraping complete. Total jobs saved {total_jobs_saved}')
        )
