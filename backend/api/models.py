from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField

class CommonSkills(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class CommonPreferences(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Education(models.Model):
    grade = models.CharField(max_length=50)
    institution = models.CharField(max_length=100)
    degree = models.CharField(max_length=50)
    major = models.CharField(max_length=50)
    minor = models.CharField(max_length=50, blank=True, null=True)
    graduationDate = models.DateField()
    gpa = models.FloatField()

    def __str__(self):
        return self.institution
    
class Experience(models.Model):
    company = models.CharField(max_length=50)
    title = models.CharField(max_length=50)
    location = models.CharField(max_length=50, blank=True, null=True)
    startDate = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.company
    
class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) # each account is linked to a user
    photo = models.ImageField(upload_to='api/uploads', blank=True, null=True)
    resume = models.FileField(upload_to='api/uploads', blank=True, null=True)
    headline = models.CharField(max_length=50, blank=True, null=True)
    pronouns = models.CharField(max_length=25, blank=True, null=True)
    hometown = models.CharField(max_length=50, blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    skills = models.ManyToManyField(CommonSkills, blank=True)
    preferences = models.ManyToManyField(CommonPreferences, blank=True)
    education = models.OneToOneField(Education, blank=True, null=True, on_delete=models.SET_NULL)
    experience = models.OneToOneField(Experience, blank=True, null=True, on_delete=models.SET_NULL)
    accountStatus = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username

class JobPosting(models.Model):
    company = models.CharField(max_length=150)
    title = models.CharField(max_length=100)
    description = models.TextField()  # TextField is better for long text
    requirements = models.ManyToManyField(CommonSkills, related_name='job_posting', blank=True)
    location = models.CharField(max_length=150, blank=True, null=True)  # Optional is good
    datePosted = models.DateField(null=True, blank=True)  # Allow NULL and blank values
    salary = models.CharField(max_length=255, blank=True, null=True)  # Optional seems better
    jobURL = models.URLField()  # URLField is better for URLs

    def __str__(self):
        return f'{self.title} at {self.company}'

class SavedJob(models.Model):
    applied = models.BooleanField(default=False)
    jobPosting = models.ForeignKey(JobPosting, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    def __str__(self):
        return self.jobPosting.title

class JobTrend(models.Model):
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
