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

