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
    # Only verified AND opted-in users
    accounts = Account.objects.filter(notify_by_email=True).iterator()

    for account in accounts:
        try:
            # skip if they toggled off
            if not account.notify_by_email:
                print(f'{account} opted out of emails')
                continue

            matchedJobs = matchUsersToJobs(account)

            # If the user is not matched to enough jobs, dont send an email
            if len(matchedJobs) < 3:
                print(f'not enough jobs match for {account}')
                continue

            top3 = dict(list(matchedJobs.items())[:3])

            job_score = {}
            for jobID, score in top3.items():
                job_score[JobPosting.objects.get(id=jobID)] = int(score)

            # skip if no email on file
            if not account.user.email:
                print(f'no email for {account}')
                continue

            email = [account.user.email]
            subject = 'Your Personalized Job Matches Are Available!'
            message = 'Here are some jobs that might fit your preferences and skills!\n'
            for job, score in job_score.items():
                message += f'{job.title} at {job.company} -- {score}% match!\n'

            htmlMessage = render_to_string(
                'emails/jobNotifications.html',
                {'user': account.user, 'job_score': job_score}
            )

            sendNotificationEmail(email, subject, message, htmlMessage)

        except Exception as e:
            print(f'Error matching {account}: {e}')