# Use this file to match users to jobs
from api.models import Account, JobPosting

def matchUsersToJobs(account):
    skills = set(account.skills.all()) # Skills are stored as a query set

    jobMatches = []

    jobs = JobPosting.objects.prefetch_related('requirements').all() # Should be modified for specific roles but for now we can leave it like this

    for job in jobs:
        jobSkills = set(job.requirements.all())

        matchingSkills = skills & jobSkills
        numOfMatchingSkills = len(matchingSkills)

        if(numOfMatchingSkills >= 1):
            jobMatches.append(job.id)
            print(f'{account} matched to {job} with {numOfMatchingSkills} matching skills')
            
    return jobMatches

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