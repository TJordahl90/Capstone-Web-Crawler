# Use this file to match users to jobs
from api.models import Account, JobPosting
from django.db.models import Q, Prefetch

def matchUsersToJobs(account):
    expLevels = set(account.experienceLevels.values_list('id', flat=True))
    careers = set(account.careers.values_list('id', flat=True))
    skills = set(account.skills.values_list('id', flat=True))
    employmentTypes = set(account.employmentTypes.values_list('id', flat=True))
    workModels = set(account.workModels.values_list('id', flat=True))

    jobs = JobPosting.objects.prefetch_related( 'skills', 'careers', 'experienceLevels', 'employmentTypes', 'workModels').all()

    jobScores = {}

    for job in jobs:
        score = 0

        jobSkills = {s.id for s in job.skills.all()}
        jobCareers = {c.id for c in job.careers.all()}
        jobExp = {e.id for e in job.experienceLevels.all()}
        jobEmploymentTypes = {e.id for e in job.employmentTypes.all()}
        jobWorkModels = {w.id for w in job.workModels.all()}

        # Ranking skills
        numJobSkils = len(jobSkills)
        numMatchingSkills = len(skills & jobSkills)
        if(numJobSkils > 0):
            pointsPerSkill = 20 / numJobSkils
            score += pointsPerSkill * numMatchingSkills

        # Ranking experience levels
        if(expLevels & jobExp):
            score += 40
        
        # Ranking careers
        if(careers & jobCareers):
            score += 20
        
        # Ranking employemnt types
        if(employmentTypes & jobEmploymentTypes):
            score += 10
        
        # Ranking work models
        if(workModels & jobWorkModels):
            score += 10

        if(score > 50):
            jobScores[job.id] = score

    rankedJobs = dict(sorted(jobScores.items(), key=lambda item: item[1], reverse=True))

    return dict(list(rankedJobs.items())[:10])

def searchForJobs(preference):
    search = preference.strip().lower() # Take input and strip spaces off ends. Lowercase if necessary

    jobIds = set(JobPosting.objects.filter(
                                            Q(title__icontains=search) | Q(company__icontains=search)
                                           ).values_list('id', flat=True)) # This is more efficient. flat=True returns a 'flat' array instead of an array of tuples

    return jobIds


#This works for job matching, but I found a better method I think so I will keep this here in case
#def matchExperienceLevels(account):
#    expLevelList = set(account.experienceLevels.all())
#
#    # Case where user has no experience level preference
#    if not expLevelList:
#        return [job.id for job in JobPosting.objects.all()]
#    
#    jobList = JobPosting.objects.prefetch_related('experienceLevels').all()
#
#    matchedJobs = []
#    fallbackJobs = [] # Jobs that do not have a listed experience level
#
#    for job in jobList:
#        jobExpLevels = set(job.experienceLevels.all())
#
#        if not jobExpLevels:
#            fallbackJobs.append(job.id)
#            continue 
#
#        if jobExpLevels & expLevelList:
#            matchedJobs.append(job.id)
#
#        #print(jobList)
#        #print(matchedJobs)
#    if(len(matchedJobs) < 15):
#        return matchedJobs + fallbackJobs
#    
#    return matchedJobs
#
#def matchCareerField(account, jobIDs):
#    prefCareers = set(account.careers.all())
#
#    jobs = JobPosting.objects.filter(id__in=jobIDs).prefetch_related('careers')
#
#    matchedJobs = []
#    fallbackJobs = []
#
#    for job in jobs:
#        jobCareers = set(job.careers.all())
#
#        if(prefCareers & jobCareers):
#            matchedJobs.append(job)
#        else:
#            fallbackJobs.append(job)
#    
#    if(len(matchedJobs) < 15):
#        return matchedJobs + fallbackJobs
#
#    return matchedJobs
#
#
#def matchSkills(account, jobIDs):
#    jobs = JobPosting.objects.filter(id__in=jobIDs).prefetch_related('skills')
#
#    skills = set(account.skills.all()) # Skills are stored as a query set
#
#    matchedDict = {}
#    fallbackDict = {}
#
#    for job in jobs:
#        jobSkills = set(job.skills.all()) # Get user skills as a set
#
#        matchingSkills = skills & jobSkills # Use intersection
#        numOfMatchingSkills = len(matchingSkills)
#
#        #if(numOfMatchingSkills >= 1):
#        matchedDict[job.id] = numOfMatchingSkills # Add the matching skills to the dictionary
#            #print(f'{account} matched to {job} with {numOfMatchingSkills} matching skills')
#
#    matchedDict = sorted(matchedDict.items(), key=lambda item: item[1], reverse=True) # Reverse the Array
#    # slice the matchedDict to not return too many items at once
#    top15 = dict(matchedDict[:15])
#
#    return top15
#