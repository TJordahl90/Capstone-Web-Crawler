from .models import Account, JobPosting, User
from .jobMatching import *
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string

def sendNotificationEmail(email, subject, message, htmlMessage):
    msg = EmailMultiAlternatives(subject, message, settings.EMAIL_HOST_USER, email)
    msg.attach_alternative(htmlMessage, 'text/html')
    msg.send(fail_silently=False)

def notifyUsers():
    accounts = Account.objects.filter(emailVerification=True).iterator()

    for account in accounts:
        try:
            print(f'Account processing: {account}')
            matchedJobs = matchUsersToJobs(account)

            # If the user is not matched to enough jobs, dont send an email
            if(len(matchedJobs) < 3):
                print(f'not enough jobs match for {account}')
                continue

            top3 = dict(list(matchedJobs.items())[:3])

            job_score = {}
            for jobID, score in top3.items():
                score = int(score)
                job_score[JobPosting.objects.get(id=jobID)] = score

            email = [account.user.email]
            subject = 'Your Personalized Job Matches Are Available!'
            message = f'Here are some jobs that might fit your preferences and skills! \n'
            for job, score in job_score.items():
                message = message + f'{job.title} at {job.company} -- {score}% match!\n'

            print(message)
            htmlMessage = render_to_string(
                'emails/jobNotifications.html',
                {'user': account.user, 'job_score': job_score}
            )

            sendNotificationEmail(email, subject, message, htmlMessage)

        except Exception as e:
            print(f'Error matching {account}: {e}')