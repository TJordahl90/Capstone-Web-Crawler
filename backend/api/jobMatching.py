# Use this file to match users to jobs
from api.models import Account, JobPosting

def matchUsersToJobs(account):
    skills = set(account.skills.all()) # Skills are stored as a query set

    matchedDict = {}

    jobs = JobPosting.objects.prefetch_related('requirements').all() # Should be modified for specific roles but for now we can leave it like this

    for job in jobs:
        jobSkills = set(job.requirements.all()) # Get user skills as a set

        matchingSkills = skills & jobSkills # Use intersection for O(1) matching
        numOfMatchingSkills = len(matchingSkills)

        if(numOfMatchingSkills >= 1):
            matchedDict[job.id] = numOfMatchingSkills # Add the matching skills to the dictionary
            #print(f'{account} matched to {job} with {numOfMatchingSkills} matching skills')
    matchedDict = dict(sorted(matchedDict.items(), key=lambda item: item[1], reverse=True)) # Reverse the Array
    
    return matchedDict

def searchForJobs(preference):
    jobTitle = preference.strip().lower() # Take input and strip spaces off ends. Lowercase if necessary

    jobIds = set(JobPosting.objects.filter(title__icontains=jobTitle).values_list('id', flat=True)) # This is more efficient. flat=True returns a 'flat' array instead of an array of tuples

    ''' This is a functional version, I found a better method in the documentation ^
    jobs = JobPosting.objects.filter(title__icontains=jobTitle)
    jobIds = set()
    for job in jobs:
        jobIds.add(job.id)
    '''
    return jobIds