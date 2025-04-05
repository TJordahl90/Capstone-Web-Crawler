def matchUserToJobs(user, jobs):
    matches = []

    skills = set(skills.lower() for skills in user.skills.all())
