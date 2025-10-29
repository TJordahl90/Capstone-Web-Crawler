from django.core.management.base import BaseCommand
from api.models import JobPosting,CommonSkills
from api.web_scrapers import Alkami_Technology, Fugetec, tekreant, TexasInstruments, lockheed_martin

class Command(BaseCommand):
    """Runs all web scrapers in the 'web_scraper' folder"""

    def handle(self, *args, **options):
        
        # list all scrapers here
        scrapers = [
            # Fugetec.fugetec,
            # TexasInstruments.TexInstr,
            lockheed_martin.lockheed_scraper
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

                for job in job_data:
                    existing_job = JobPosting.objects.filter(
                        title=job['title'],
                        company=job['company'],
                        jobURL=job['jobURL'],
                    ).exists()

                    if not existing_job:
                        job_post = JobPosting.objects.create(
                            company=job['company'],
                            title=job['title'],
                            fullDescription=job['fullDescription'],
                            shortDescription=job['shortDescription'],
                            requirements=job['requirements'],
                            careerArea=job['careerArea'],
                            degreeType=job['degreeType'],
                            location=job['location'],
                            datePosted=job['datePosted'],
                            salary=job['salary'],
                            jobURL=job['jobURL'],
                            experienceLevel=job['experienceLevel'],
                            employmentType=job['employmentType'],
                            locationType=job['locationType']
                        )

                        skill_objs = []
                        for skill in job['skills']:
                            obj, _ = CommonSkills.objects.get_or_create(name=skill)
                            skill_objs.append(obj)
                            # print(skill)

                        job_post.skills.set(skill_objs)
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


