from django.db import models
from django.contrib.auth.models import User

class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) # each account is linked to a user
    skills = models.TextField(default='[]') # We need to implement it like this to work with SQLite. We can either change it to have a new skills model, or change it when we change to Postgres
    experience = models.TextField(default='[]') # Same as here ^
    certifications = models.TextField(default='[]')
    accountStatus = models.BooleanField(default=False)
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.user.username

class JobPosting(models.Model):
    company = models.CharField(max_length=150)
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=2000)
    requirements = models.CharField(max_length=2000)
    location = models.CharField(max_length=50)
    datePosted = models.DateField()
    salary = models.CharField(max_length=255)
    jobURL = models.CharField(max_length=255)

    def __str__(self):
        return self.title

class SavedJob(models.Model):
    applied = models.BooleanField(default=False)
    jobPosting = models.ForeignKey(JobPosting, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    def __str__(self):
        return self.jobPosting.title

class JobTrends(models.Model):
    industry = models.CharField(max_length=255)
    totalPostings = models.IntegerField()
    averageSalary = models.DecimalField(decimal_places=2, max_digits=10)
    trendingScore = models.FloatField()
    lastUpdated = models.DateField()

    def __str__(self):
        return self.industry
    
class Education(models.Model):
    educationLevel = models.CharField(max_length=50)
    institution = models.CharField(max_length=100)
    major = models.CharField(max_length=50)
    minor = models.CharField(max_length=50, blank=True, null=True)
    graduationDate = models.DateField()
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    def __str__(self):
        return self.institution

class Verification(models.Model):
    email = models.TextField(blank=False, null=False)
    code = models.CharField(max_length = 8, blank=False, null=False)

    def __str__(self):
        return self.email
