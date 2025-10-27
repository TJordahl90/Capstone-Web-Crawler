# Use this file to match users to jobs
from api.models import Account, JobPosting
from django.db.models import Q

def matchUsersToJobs(account):
    skills = set(account.skills.all()) # Skills are stored as a query set

    matchedDict = {}

    jobs = JobPosting.objects.prefetch_related('skills').all() # Should be modified for specific roles but for now we can leave it like this

    for job in jobs:
        jobSkills = set(job.skills.all()) # Get user skills as a set

        matchingSkills = skills & jobSkills # Use intersection for O(1) matching
        numOfMatchingSkills = len(matchingSkills)

        if(numOfMatchingSkills >= 1):
            matchedDict[job.id] = numOfMatchingSkills # Add the matching skills to the dictionary
            #print(f'{account} matched to {job} with {numOfMatchingSkills} matching skills')

    matchedDict = sorted(matchedDict.items(), key=lambda item: item[1], reverse=True) # Reverse the Array
    # slice the matchedDict to not return too many items at once
    top15 = dict(matchedDict[:15])

    return top15

def searchForJobs(preference):
    search = preference.strip().lower() # Take input and strip spaces off ends. Lowercase if necessary

    jobIds = set(JobPosting.objects.filter(
                                            Q(title__icontains=search) | Q(company__icontains=search)
                                           ).values_list('id', flat=True)) # This is more efficient. flat=True returns a 'flat' array instead of an array of tuples

    return jobIds