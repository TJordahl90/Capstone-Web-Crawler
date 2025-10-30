from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone

# e.g. Python, Node.Js, AWS, OOP, Git
class CommonSkills(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
# e.g. Software Engineering, Information Technology
class CommonCareers(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
# e.g. Bachelors, Masters
class CommonDegrees(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
    
# e.g. Entry, Mid, Senior
class CommonExperienceLevels(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
    
# e.g. Full-Time, Part-Time
class CommonEmploymentTypes(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
    
# e.g. On-site, Hybrid, Remote
class CommonWorkModels(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    resume = models.FileField(upload_to='api/uploads', blank=True, null=True)
    headline = models.CharField(max_length=50, blank=True, null=True)
    hometown = models.CharField(max_length=50, blank=True, null=True)
    skills = models.ManyToManyField(CommonSkills, related_name='accounts', blank=True)    
    careers = models.ManyToManyField(CommonCareers, related_name='accounts', blank=True)
    experienceLevels = models.ManyToManyField(CommonExperienceLevels, related_name='accounts', blank=True)
    employmentTypes = models.ManyToManyField(CommonEmploymentTypes, related_name='accounts', blank=True)    
    workModels = models.ManyToManyField(CommonWorkModels, related_name='accounts', blank=True)

    def __str__(self):
        return self.user.username

class Education(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='educations')
    institution = models.CharField(max_length=100)
    degree = models.ForeignKey(CommonDegrees, on_delete=models.SET_NULL, related_name='educations', blank=True, null=True)
    major = models.CharField(max_length=50)
    minor = models.CharField(max_length=50, blank=True, null=True)
    graduationDate = models.CharField(max_length=50, blank=True, null=True)
    gpa = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return self.institution
    
class Experience(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=50)
    title = models.CharField(max_length=50)
    startDate = models.CharField(max_length=50, blank=True, null=True)
    endDate = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.company
    
class Project(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    startDate = models.CharField(max_length=50, blank=True, null=True)
    endDate = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.title
    
class JobPosting(models.Model):
    company = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    fullDescription = models.TextField()
    shortDescription = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    skills = models.ManyToManyField(CommonSkills, related_name='job_postings', blank=True)
    careers = models.ManyToManyField(CommonCareers, related_name='job_postings', blank=True)
    degrees = models.ManyToManyField(CommonDegrees, related_name='job_postings', blank=True)
    experienceLevels = models.ManyToManyField(CommonExperienceLevels, related_name='job_postings', blank=True)
    employmentTypes = models.ManyToManyField(CommonEmploymentTypes, related_name='job_postings', blank=True)
    workModels = models.ManyToManyField(CommonWorkModels, related_name='job_postings', blank=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    datePosted = models.DateField(null=True, blank=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    jobURL = models.URLField(max_length=500)

    def __str__(self):
        return f'{self.title} at {self.company}'
    
class ChatBotHistory(models.Model):
    question = models.TextField(blank=True, null=True)
    response = models.TextField(blank=True, null=False)
    timestamp = models.DateTimeField(default=timezone.now)
    specificJob = models.ForeignKey(JobPosting, on_delete=models.CASCADE, null=True, blank=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.question

class SavedJob(models.Model):
    applied = models.BooleanField(default=False)
    jobPosting = models.ForeignKey(JobPosting, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    def __str__(self):
        return self.jobPosting.title

class JobTrend(models.Model):
    # ADD MORE TRENDS (TOP TRENDING SKILLS, IN DEMAND JOBS, ETC)
    industry = models.CharField(max_length=255)
    totalPostings = models.IntegerField()
    averageSalary = models.DecimalField(decimal_places=2, max_digits=10)
    trendingScore = models.FloatField()
    lastUpdated = models.DateField()

    def __str__(self):
        return self.industry

class Verification(models.Model):
    email = models.TextField(blank=False, null=False)
    code = models.CharField(max_length = 8, blank=False, null=False)

    def __str__(self):
        return self.email

class JobStatistics(models.Model):
    category = models.CharField(max_length=15, blank=False, null=False)
    numberOfJobs = models.IntegerField()
    date = models.DateField()

    def __str__(self):
        return f'{self.category} jobs: {self.numberOfJobs}'