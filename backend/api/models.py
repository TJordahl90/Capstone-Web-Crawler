from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField

class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) # each account is linked to a user
    skills = ArrayField(models.CharField(max_length=20, blank=True), size=15)
    experience = ArrayField(models.CharField(max_length=20, blank=True), size=15) # Shoudl probably be its own table, or at least some kind of multidimensional array.
    certifications = ArrayField(models.CharField(max_length=20, blank=True), size=15) # Same here ^
    accountStatus = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username

class JobPosting(models.Model):
    company = models.CharField(max_length=150)
    title = models.CharField(max_length=100)
    description = models.TextField()  # TextField is better for long text
    requirements = ArrayField(models.CharField(max_length=20), size=15, default=list)
    location = models.CharField(max_length=50, blank=True, null=True)  # Optional is good
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
