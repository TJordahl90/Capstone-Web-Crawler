from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone

class CommonSkills(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class CommonPreferences(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) # each account is linked to a user
    resume = models.FileField(upload_to='api/uploads', blank=True, null=True)
    headline = models.CharField(max_length=50, blank=True, null=True)
    hometown = models.CharField(max_length=50, blank=True, null=True)
    skills = models.ManyToManyField(CommonSkills, blank=True)
    preferences = models.ManyToManyField(CommonPreferences, blank=True)

    def __str__(self):
        return self.user.username

class Education(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='education')
    institution = models.CharField(max_length=100)
    degree = models.CharField(max_length=50)
    major = models.CharField(max_length=50)
    minor = models.CharField(max_length=50, blank=True, null=True)
    graduationDate = models.DateField(null=True, blank=True)
    gpa = models.FloatField(blank=True, null=True)

    def __str__(self):
        return self.institution
    
class Experience(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='experience')
    company = models.CharField(max_length=50)
    title = models.CharField(max_length=50)
    startDate = models.DateField(blank=True, null=True)
    endDate = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.company
    
class Project(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    startDate = models.DateField(blank=True, null=True)
    endDate = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.title
    
class JobPosting(models.Model):
    company = models.CharField(max_length=150)
    title = models.CharField(max_length=200)
    description = models.TextField()  # TextField is better for long text
    requirements = models.ManyToManyField(CommonSkills, related_name='job_posting', blank=True)
    location = models.CharField(max_length=150, blank=True, null=True)  # Optional is good
    datePosted = models.CharField(max_length=50, null=True, blank=True)
    salary = models.CharField(max_length=255, blank=True, null=True)  # Optional seems better
    jobURL = models.URLField(max_length=500)

    def __str__(self):
        return f'{self.title} at {self.company}'
    
class ChatBotHistory(models.Model):
    question = models.TextField(blank=True, null=True)
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