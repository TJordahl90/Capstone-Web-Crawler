from django.shortcuts import render
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import permission_classes
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.conf import settings
import random
from django.shortcuts import get_object_or_404
from django.http import JsonResponse, HttpResponse
from .jobMatching import matchUsersToJobs, searchForJobs
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser
#from .models import ResumeParser
from .resumeParser import * # We need all the functions from this file
import os
from openai import OpenAI
from datetime import datetime, timedelta
from django.db.models import Sum
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay, TruncYear

@permission_classes([AllowAny])
@ensure_csrf_cookie
def CsrfTokenView(request):
    """Create csrf token and send to frontend"""
    csrf_token = get_token(request) # built-in function that creates csrf tokens
    return JsonResponse({'csrfToken': csrf_token})

def sendMail(to, subject, message):
    send_mail(subject, message, settings.EMAIL_HOST_USER, to, fail_silently=False)

class CreateUserView(APIView):
    """Register a new user"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        Verification.objects.filter(email__iexact=email).delete()
        code = str(random.randint(100000, 999999))
        Verification.objects.create(email=email, code=code)

        message = f'Your verification code is: {code}'
        subject = 'Verification Code for Northstar Jobs'
        recipient = [email]
        sendMail(recipient, subject, message)
        return Response({"message": "Verification code sent."}, status=status.HTTP_201_CREATED)
    
    def get(self, request):
        email = request.GET.get('email')
        code = request.GET.get('code')
        try:
            user = User.objects.get(email__iexact=email)
            verificationEntry = Verification.objects.get(email__iexact=email, code=code)
            verificationEntry.delete()
            user.is_active = True
            user.save()
            return Response({'message': 'Verification successful'}, status=status.HTTP_200_OK)
        except (User.DoesNotExist, Verification.DoesNotExist):
            return Response({"error": "Invalid verification code or email."}, status=status.HTTP_404_NOT_FOUND)
        
class LoginView(APIView):
    """Handles user authentication and returns session id"""
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user:
            first_time_login = user.last_login is None
            login(request, user)
            user_serializer = UserSerializer(user).data
            return Response({'first_time_login': first_time_login, 'user': user_serializer}, status=200)
        return Response({"error": "Invalid credentials"}, status=400)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        response = Response({"message": "Logged out of account"}, status=200)
        response.delete_cookie(settings.SESSION_COOKIE_NAME, path='/')
        response.delete_cookie(settings.CSRF_COOKIE_NAME, path='/')
        return response

class UserProfileView(APIView):
    """Fetches authenticated user details"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CreateUserSerializer(request.user)
        return Response(serializer.data)
    
class AccountView(APIView): 
    """Handles user account details"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_serializer = UserSerializer(request.user).data
        account_serializer = AccountSerializer(request.user.account).data
        return Response({'user': user_serializer, 'account': account_serializer}, status=200)

    def patch(self, request):
        user = request.user
        account = user.account

        user_data = request.data.get('user')
        account_data = request.data.get('account')
        skills_data = request.data.get('skills')
        preferences_data = request.data.get('preferences')
        education_data = request.data.get('education')
        experience_data = request.data.get('experience')
        errors = {}

        if user_data:
            user_serializer = UserSerializer(user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                errors['user'] = user_serializer.errors

        if account_data:
            account_serializer = AccountSerializer(account, data=account_data, partial=True)
            if account_serializer.is_valid():
                account_serializer.save()
            else:
                errors['account'] = account_serializer.errors

        if skills_data:
            try:
                skills_list = [CommonSkills.objects.get_or_create(name=skill)[0] for skill in skills_data]
                account.skills.set(skills_list)
            except Exception as e:
                errors['skills'] = str(e)

        if preferences_data:
            try:
                preferences_list = [CommonPreferences.objects.get_or_create(name=pref)[0] for pref in preferences_data]
                account.preferences.set(preferences_list)
            except Exception as e:
                errors['preferences'] = str(e)

        if education_data:
            education_serializer = EducationSerializer(data=education_data, many=True)
            if education_serializer.is_valid():
                account.education.all().delete()
                education_serializer.save(account=account)
            else:
                errors['education'] = education_serializer.errors

        if experience_data:
            experience_serializer = ExperienceSerializer(data=experience_data, many=True)
            if experience_serializer.is_valid():
                account.experience.all().delete()
                experience_serializer.save(account=account)
            else:
                errors['experience'] = experience_serializer.errors

        user_serialized_data = UserSerializer(user).data
        account_serialized_data = AccountSerializer(account).data

        if errors:
            return Response(errors, status=400)
        return Response({'user': user_serialized_data, 'account': account_serialized_data}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def JobMatchingView(request):
    userAccount = Account.objects.get(user=request.user) # Get user account
    # We should add a page system to not call all the jobs at once.
    matchedJobIds = matchUsersToJobs(userAccount) # Call job matching function
    matchedJobs = list(JobPosting.objects.filter(id__in=matchedJobIds.keys()))
    
    for job in matchedJobs:
        count = matchedJobIds.get(job.id, 0)
        total = job.requirements.count() or 1
        job.matchPercent = round(count / total * 100)

    matchedJobs.sort(key=lambda x: x.matchPercent, reverse=True) # this sorts the job list by percentage
    serializedJobs = JobPostingSerializer(matchedJobs, many=True, context={'request': request}).data
    return Response(serializedJobs, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def JobSearchingView(request):
    search_term = request.GET.get('search', '').strip()
    if not search_term:
        return Response([], status=200)
    
    searchedJobsIds = searchForJobs(search_term) # Call function
    foundJobs = JobPosting.objects.filter(id__in=searchedJobsIds) # Get jobs based on returned IDs
    serializedJobs = JobPostingSerializer(foundJobs, many=True, context={'request': request}).data # Serialize job postings for frontend
    return Response(serializedJobs, status=200) # Send jobs to frontend

@api_view(['POST'])
@permission_classes([AllowAny])
def AllJobsView(request):
    """Returns all available jobs"""
    filters = request.data.get("filters", {})
    pageNumber = 1 # We need to update the frontend to pass which page the user is on so we dont pull too much at a time from the database

    # IMPLEMENT FILTERING - will probably need to expand job posting model to include experience, type, etc

    start = (pageNumber - 1) * 15
    end = start + 15
    all_jobs = JobPosting.objects.order_by('-id')[start:end]
    
    serializedJobs = JobPostingSerializer(all_jobs, many=True, context={'request': request}).data
    return Response(serializedJobs, status=200)

class BookmarkJobView(APIView):
    """Saves a job to account, deletes a saved job, and lists all saved jobs"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = Account.objects.get(user=request.user)
        saved_jobs = SavedJob.objects.filter(account=account)
        job_postings = [saved_job.jobPosting for saved_job in saved_jobs]
        serializedJobs = JobPostingSerializer(job_postings, many=True, context={'request': request}).data
        for job in serializedJobs:
            job['is_saved'] = True
        return Response(serializedJobs, status=200)

    def post(self, request, job_id):
        account = Account.objects.get(user=request.user)
        job_posting = JobPosting.objects.get(id=job_id)
        SavedJob.objects.get_or_create(jobPosting=job_posting, account=account)
        return Response({"message": "successfully saved "}, status=201)
    
    def delete(self, request, job_id):
        account = Account.objects.get(user=request.user)
        job_posting = JobPosting.objects.get(id=job_id)
        SavedJob.objects.filter(jobPosting=job_posting, account=account).delete()
        return Response({"message": "successfully deleted saved job"}, status=200)

class DocumentView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def get(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        
        if account.resume:
            try:
                file_path = account.resume.path
                with open(file_path, 'rb') as f:
                    response = HttpResponse(f.read(), content_type='application/pdf')
                    response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
                    return response
            except FileNotFoundError:
                return Response({"error": "Resume file not found"}, status=404)
            
        return Response({"error": "No resume found"}, status=404)

    def post(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        resume_file = request.FILES.get('resume')
        
        if not resume_file:
            return Response({"error": "No file uploaded"}, status=400)
        
        account.resume = resume_file
        account.save()

        text = extract_text_from_pdf(resume_file) #run the resume parser and stores data in pasrsed_data
        skills = extractSkills(text)
        parsed_data = parser(text)
        
        #Automatically adds it to the profile
        if skills:
            skillObjects = []
            for skill in skills:
                skillObjects.append(CommonSkills.objects.get(name=skill))
            account.skills.add(*skillObjects)

        # Helper function to parse dates
        def parse_date(date_str):
            if not date_str or date_str.lower() in ['present', 'current']:
                return None
            # Try to parse MM/YYYY or YYYY formats
            for fmt in ('%m/%Y', '%Y-%m-%d', '%Y'):
                try:
                    return datetime.strptime(date_str, fmt).date()
                except ValueError:
                    continue
            return None

        # Parse education data
        education_list = parsed_data.get('Education', [])
        for edu in education_list:
            try:
                Education.objects.create(
                    account=account,
                    institution=edu.get('institution', ''),
                    degree=edu.get('degree', ''),
                    major=edu.get('major', ''),
                    minor=edu.get('minor', ''),
                    graduationDate=parse_date(edu.get('graduationDate')),
                    gpa=edu.get('gpa')
                )
            except Exception as e:
                print(f'Error saving education: {e}')

        # Parse experience data
        experience_list = parsed_data.get('Experience', [])
        for exp in experience_list:
            try:
                Experience.objects.create(
                    account=account,
                    company=exp.get('company', ''),
                    title=exp.get('jobTitle', ''),
                    startDate=parse_date(exp.get('startDate')),
                    endDate=parse_date(exp.get('endDate')),
                    description=exp.get('description', '')
                )
            except Exception as e:
                print(f'Error saving experience: {e}')

        # Parse project data
        project_list = parsed_data.get('Projects', [])
        for proj in project_list:
            try:
                Project.objects.create(
                    account=account,
                    title=proj.get('title', ''),
                    description=proj.get('description', ''),
                    startDate=parse_date(proj.get('startDate')),
                    endDate=parse_date(proj.get('endDate'))
                )
            except Exception as e:
                print(f'Error saving project: {e}')


        return Response({
                    'message': 'Resume uploaded and parsed successfully',
                        'parsed_data': parsed_data
                    }, status=201)

client = OpenAI(api_key=os.getenv('ai_api_key')) # Initialize OpenAI client

class InterviewPrepChatBotView(APIView):
    """Handles Interview chatbot AI"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = Account.objects.get(user=request.user)

        # UNCOMMENT BELOW TO ACTIVATE THE CHATBOT DAILY LIMIT
        # one_day_ago = timezone.now() - timedelta(days=1)
        # questions_today = ChatBotHistory.objects.filter(account=account, timestamp__gte=one_day_ago).count()
        # if questions_today >= 3:
        #     return Response({"error": "You have eached your limit of 3 questions per day. Please try again tommorow."}, status=429)


        past_questions_list = list(ChatBotHistory.objects.filter(account=account).values_list('question', flat=True))
        past_questions = ", ".join(past_questions_list)
        job_id = request.GET.get('job_id')
        job_posting = None
        prompt = ""
        
        if job_id:
            try:
                job_posting = JobPosting.objects.get(id=job_id)
                prompt = (
                    f"You are an AI job interview coach. Your task is to generate 3 unique and insightful interview questions based on the provided job application description.\n"
                    f'Here is the details for the job the applicant is applying for:\n'
                    f'Job Title: {job_posting.title}\n'
                    f'Company: {job_posting.company}\n'
                    f'Description: {job_posting.description}\n'
                    f"IMPORTANT: Do not ask any of the following previously asked questions:\n"
                    f"History: {past_questions}\n" 
                    f"Format the output ONLY as a numbered list (e.g., '1. ...\\n2. ...\\n3. ...')."
                )
            except JobPosting.DoesNotExist:
                return Response({"error": "Job posting not found."}, status=404)
        else:
            skills = ", ".join([s.name for s in account.skills.all()])
            preferences = ", ".join([p.name for p in account.preferences.all()])
            education = str(account.education) if account.education else "No education data"
            experience = str(account.experience) if account.experience else "No experience data"
            headline = str(account.headline) if account.headline else "No headline data"

            prompt = (
                f"You are an AI job interview coach. Your task is to generate 3 unique and insightful interview questions based on the applicant details.\n"
                f"Here is the applicant background:\n"
                F"Headline: {headline}\n"
                f"Skills: {skills}\n"
                f"Preferences: {preferences}\n"
                f"Education: {education}\n"
                f"Experience: {experience}\n"
                f"IMPORTANT: Do not ask any of the following previously asked questions:\n"
                f"History: {past_questions}\n" 
                f"Format the output ONLY as a numbered list (e.g., '1. ...\\n2. ...\\n3. ...')."
            )
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo", # not sure what model yet using for now
                messages=[{"role": "user", "content": prompt}],
            )

            questions_text = response.choices[0].message.content.strip()
            questions_list = [q.strip() for q in questions_text.split('\n') if q.strip()]

            for q in questions_list:
                cleaned_question = q.split('. ', 1)[-1]
                ChatBotHistory.objects.create(question=cleaned_question, specificJob=job_posting, account=account)

            return Response({"message": questions_list})

        except Exception as e:
            return Response({"error": str(e)}, status=500)
    

    def post(self, request):
        user_response = request.data.get("answer")
        bot_question = request.data.get("question")

        prompt = (
            f"You are an AI job interview coach. An applicant was asked the following question.\n"
            f"Question: {bot_question}"
            f"The applicant provided this response\n"
            f"Response: {user_response}"
            f"Can you analyze their response and provide overall feedback, strengths, areas that need improvement, and an example response."
            f"Only output the response."
        )
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
            )

            response = response.choices[0].message.content.strip()
            return Response({"message": response})

        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
class ApplicationStatusView(APIView):
    """Sets a job posting to already applied to"""
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        try:
            account = Account.objects.get(user=request.user)
            job_posting = JobPosting.objects.get(id=job_id)
            saved_job, created = SavedJob.objects.get_or_create(jobPosting=job_posting, account=account)
            saved_job.applied = True
            saved_job.save()
            return Response({"message": "successfully applied to job"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
@permission_classes([IsAuthenticated])
def updateJobStatistics():
    try:
        count = int(JobPosting.objects.count())
        jobDataInstance = JobStatistics.objects.create(category='IT', numberOfJobs=count, date=datetime.now().date())
        print('Created new entry in DB')
    except Exception as e:
        print(str(e))

class JobDataVisualization(APIView):
    permission_classes = [IsAuthenticated]

class JobStatisticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request): # We need to have an option on the frotnend for what we want to filter by. Week, month, year, etc then we can complete this simply.
        print('hit the get function')
        stats = (JobStatistics.objects.annotate(month=TruncMonth('date'))
                                .values('month', 'category')
                                .annotate(totalJobs=Sum('numberOfJobs'))
                                .order_by('month')
                ) # returns in this format: <QuerySet [{'category': 'IT', 'month': datetime.date(2025, 9, 1), 'totalJobs': 240}]> depending on filter option (TruncMonth, TruncWeek, TruncYear, etc)
        
        return Response(list(stats))