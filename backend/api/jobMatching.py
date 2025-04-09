# Use this file to match users to jobs

def matchUsersToJobs(userSkills, jobs):
    if(not userSkills or not jobs): # No need to run the function if the user has no skills or no jobs are available
        return set()
    
    matchedJobs = set() # This will be what we return to the user. Set to ensure no duplicates
    userSkills = set(skills.lower() for skills in userSkills) # Lowercase set for comparison. Ensures no duplicates and is hashed for quick comparison
    
    for job in jobs:
        jobSkills = set(skills.lower() for skills in job.requirements) # Same as skills ^

        matchingSkills = userSkills & jobSkills # & is the intersection operator for sets, so this will compare the intersection of the user/job skill sets and return that set

        if(matchingSkills):
            print(f'User matches with: {job.title} at {job.company} with {len(matchingSkills)} matching skills: {matchingSkills}')
            matchedJobs.add(job.id) # Will be returning a set of job IDs
        
    return(matchedJobs)
