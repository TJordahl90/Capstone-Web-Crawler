from django.core.management.base import BaseCommand
from api.models import *
from api.web_scrapers import TexasInstruments, LockheedMartin, JSearchAPI

class Command(BaseCommand):
    """Runs all web scrapers in the 'web_scraper' folder"""

    def handle(self, *args, **options):
        
        # list all scrapers here
        scrapers = [
            # Fugetec.fugetec,
            TexasInstruments.TexInstr,
            # LockheedMartin.lockheed_scraper
            # JSearchAPI.jsearch_api
        ]

        # for scraping log
        jobs_saved = 0
        self.stdout.write(self.style.SUCCESS('Starting web scraping...'))

        for scraper in scrapers:
            try: 
                job_data = scraper() # runs scraper function
                jobs_saved = 0

                for job in job_data:
                    try:
                        existing_job = JobPosting.objects.filter(
                            title=job['title'],
                            company=job['company'],
                            jobURL=job['jobURL'],
                        ).exists()

                        if not existing_job:
                            job_post = JobPosting.objects.create(
                                company=job['company'],
                                title=job['title'],
                                description=job['description'],
                                summary=job['summary'],
                                requirements="",
                                location=job['location'],
                                datePosted=job['datePosted'],
                                salary=job['salary'],
                                jobURL=job['jobURL'],
                            )

                            skill_names = job['skills']
                            career_names = job['careers']
                            degree_names = job['degrees']
                            experience_names = job['experienceLevels']
                            employment_names = job['employmentTypes']
                            workmodel_names = job['workModels']

                            skill_objs = CommonSkills.objects.filter(name__in=skill_names)
                            career_objs = CommonCareers.objects.filter(name__in=career_names)
                            degree_objs = CommonDegrees.objects.filter(name__in=degree_names)
                            experience_objs = CommonExperienceLevels.objects.filter(name__in=experience_names)
                            employment_objs = CommonEmploymentTypes.objects.filter(name__in=employment_names)
                            workmodel_objs = CommonWorkModels.objects.filter(name__in=workmodel_names)

                            job_post.skills.set(skill_objs)
                            job_post.careers.set(career_objs)
                            job_post.degrees.set(degree_objs)
                            job_post.experienceLevels.set(experience_objs)
                            job_post.employmentTypes.set(employment_objs)
                            job_post.workModels.set(workmodel_objs)
                            jobs_saved += 1

                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f'Error saving job "{job.get("title", "Unknown Title")}" from {scraper.__name__}: {str(e)}')
                        )

                self.stdout.write(
                    self.style.SUCCESS(f'{scraper.__name__}: {jobs_saved} jobs saved')
                )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error in {scraper.__name__}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Scraping complete.')
        )


