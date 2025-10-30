import os
from django.conf import settings
from django.core.management.base import BaseCommand
from api.models import CommonSkills, CommonCareers

class Command(BaseCommand):
    """Updates the CommonSkills and CommonCareers tables with provided text file"""

    def load_data_from_file(self, filename):
        file_path = os.path.join(settings.BASE_DIR, 'api', 'web_scrapers', filename)
        
        data = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    cleaned_line = line.strip()
                    if cleaned_line and not cleaned_line.startswith("##"):
                        data.append(cleaned_line)
            return data
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error reading {filename}: {e}'))
            return None

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Updating skills...'))
        skills = self.load_data_from_file("keywords_skills.txt")
        existing = 0
        new = 0

        try: 
            for skill in skills:
                obj, created = CommonSkills.objects.get_or_create(name=skill)
                if created: new += 1
                else: existing += 1
            self.stdout.write(self.style.SUCCESS(f'Added: {new} new skills. Skipped: {existing} existing skills.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error in skill saving.: {str(e)}'))
    
        self.stdout.write(self.style.SUCCESS('Updating careers...'))
        careers = self.load_data_from_file("keywords_careers.txt")
        existing = 0
        new = 0

        try: 
            for career in careers:
                obj, created = CommonCareers.objects.get_or_create(name=career)
                if created: new += 1
                else: existing += 1

            self.stdout.write(self.style.SUCCESS(f'Added: {new} new careers. Skipped: {existing} existing careers.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error in career saving.: {str(e)}'))

        self.stdout.write(
            self.style.SUCCESS(f'Done saving skills and careers.')
        )


