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
from .resumeParser import extract_text_from_pdf, parser
import os
from openai import OpenAI
from datetime import datetime

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
        serializer = CreateUserSerializer(data=request.data) # deserialize registration data
        if serializer.is_valid():  # built-in function that validates data
            serializer.save() # saves serialized valid data
            return Response(serializer.data, status=status.HTTP_201_CREATED) # sends response to frontend
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) # or sends error msg

class LoginView(APIView):
    """Handles user authentication and returns session id"""
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            account = Account.objects.get(user=user)
            user_serialized_data = UserSerializer(user).data
            account_serialized_data = AccountSerializer(account).data

            response = {
                'user': user_serialized_data,
                'account': account_serialized_data
            }
            return Response(response, status=200)
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
    """Updates user account details"""
    permission_classes = [IsAuthenticated]

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

        if skills_data is not None:
            try:
                skills_list = []
                for skill in skills_data:
                    new_skill, created_bool = CommonSkills.objects.get_or_create(name=skill)
                    skills_list.append(new_skill)
                account.skills.set(skills_list)
            except Exception as e:
                errors['skills'] = str(e)

        if preferences_data is not None:
            try:
                preferences_list = []
                for preference in preferences_data:
                    new_preference, created_bool = CommonPreferences.objects.get_or_create(name=preference)
                    preferences_list.append(new_preference)
                account.preferences.set(preferences_list)
            except Exception as e:
                errors['preferences'] = str(e)

        if education_data:
            education_serializer = EducationSerializer(data=education_data)
            if education_serializer.is_valid():
                if account.education:
                    account.education.delete()
                instance = education_serializer.save()
                account.education = instance
            else:
                errors['education'] = education_serializer.errors

        if experience_data:
            experience_serializer = ExperienceSerializer(data=experience_data)
            if experience_serializer.is_valid():
                if account.experience:
                    account.experience.delete()
                instance = experience_serializer.save()
                account.experience = instance
            else:
                errors['experience'] = experience_serializer.errors

        account.save()
        user_serialized_data = UserSerializer(user).data
        account_serialized_data = AccountSerializer(account).data

        response = {
            'user': user_serialized_data,
            'account': account_serialized_data
        }

        if errors:
            return Response(errors, status=400)
        return Response(response, status=200)

class CreateVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        serializer = CreateUserSerializer(data=request.data)


        delInstance = Verification.objects.filter(email=email)
        try:
            delInstance.delete()
        except(delInstance.DoesNotExist):
            pass

        if(serializer.is_valid()):
            code = str(random.randint(100000, 999999))

            message = f'Your verification code is: {code}'
            subject = 'Verification Code for DFWork Account'
            recipient = [email]

            instance = Verification(email=email, code=code)
            instance.save()
            sendMail(recipient, subject, message)

            serializer = VerificationSerializer(instance)
            return(Response(serializer.data, status=status.HTTP_201_CREATED))
        return(Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST))
    
    def get(self, request):
        email = request.GET.get('email')
        code = request.GET.get('code')
        #print(f'email: {email} code: {code}')

        #print(f'email: {email} type: {type(email)} code: {code} type: {type(code)}')

        verificationEntry = Verification.objects.get(email=email)
        if(str(code) == str(verificationEntry.code)):
            verificationEntry.delete()
            return Response({'message': 'Verification successful'}, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def JobMatchingView(request):
    userAccount = Account.objects.get(user=request.user) # Get user account
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
    # IMPLEMENT FILTERING - will probably need to expand job posting model to include experience, type, etc
    all_jobs = JobPosting.objects.all()
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
        parsed_data = parser(text)
        
        #Automatically adds it to the profile
        if parsed_data.get("skills"):
            skills_list = []
            for skill in parsed_data["skills"]:
                new_skill, created = CommonSkills.objects.get_or_create(name=skill)
                skills_list.append(new_skill)
            account.skills.set(skills_list)
        
        if parsed_data.get("education"):
            edu_serializer = EducationSerializer(data=parsed_data["education"], many=True)
            if edu_serializer.is_valid():
                for edu in edu_serializer.save():
                    account.education = edu

        if parsed_data.get("experience"):
            exp_serializer = ExperienceSerializer(data=parsed_data["experience"], many=True)
            if exp_serializer.is_valid():
                for exp in exp_serializer.save():
                    account.experience = exp

        return Response({
        "message": "Resume uploaded and parsed successfully",
        "parsed_data": parsed_data
        }, status=201)

client = OpenAI(api_key=os.getenv("ai_api_key")) # Initialize OpenAI client

class InterviewPrepChatBotView(APIView):
    """Handles Interview chatbot AI"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = Account.objects.get(user=request.user)
        skills = ", ".join([s.name for s in account.skills.all()])
        preferences = ", ".join([p.name for p in account.preferences.all()])
        education = str(account.education) if account.education else "No education data"
        experience = str(account.experience) if account.experience else "No experience data"
        headline = str(account.headline) if account.headline else "No headline data"

        past_questions_list = list(ChatBotHistory.objects.filter(account=account).values_list('question', flat=True))
        past_questions = ", ".join(past_questions_list)
        job_id = request.GET.get('job_id')
        prompt = ""
        
        # todo - generate different question types (technical, behavioral, situational, general) randomizer?
        # todo - figure out how to limit to 3 questions a day

        if job_id:
            try:
                job_posting = JobPosting.objects.get(id=job_id)
                prompt = (
                    f"You are an AI job interview coach. Generate a job interview question based on the company details.\n" # i think we need better prompt
                    f'Here is the details for the job the applicant is applying for:\n'
                    f'Job Title: {job_posting.title}\n'
                    f'Company: {job_posting.company}\n'
                    f'Description: {job_posting.description}\n'
                    # f"Here is the applicant background:\n"
                    # F"Headline: {headline}\n"
                    # f"Skills: {skills}\n"
                    # f"Preferences: {preferences}\n"
                    # f"Education: {education}\n"
                    # f"Experience: {experience}\n"
                    f"IMPORTANT: This is the applicants chat history, avoid asking the same question\n"
                    f"History: {past_questions}\n" 
                    f"Only output the interview question."
                )
            except JobPosting.DoesNotExist:
                return Response({"error": "Job posting not found."}, status=404)
        else:
            prompt = (
                    f"You are an AI job interview coach. Generate a job interview question based on the applicant details and general behavioral/situational questions.\n"
                    f"Here is the applicant background:\n"
                    F"Headline: {headline}\n"
                    f"Skills: {skills}\n"
                    f"Preferences: {preferences}\n"
                    f"Education: {education}\n"
                    f"Experience: {experience}\n"
                    f"IMPORTANT: This is the applicants chat history, avoid asking the same question\n"
                    f"History: {past_questions}\n" 
                    f"Only output the interview question."
                )

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo", # not sure what model yet using for now
                messages=[{"role": "user", "content": prompt}],
            )

            question = response.choices[0].message.content.strip()

            try:
                if job_id:
                    chatBotHistoryInput = ChatBotHistory.objects.create(question=question, time=datetime.now().time(), specificJob=job_posting, account=account)
                else:
                    chatBotHistoryInput = ChatBotHistory.objects.create(question=question, time=datetime.now().time(), account=account)
                
            except Exception as e:
                print(e)

            return Response({"message": question})

        except Exception as e:
            return Response({"error": str(e)}, status=500)
    

    def post(self, request):
        user_response = request.data.get("response")
        bot_question = request.data.get("question")

        prompt = (
            f"You are an AI job interview coach. An applicant was asked the following question.\n"
            f"Question: {bot_question}"
            f"The applicant provided this response\n"
            f"Response: {user_response}"
            f"Can you analyze their response and provide feedback with strengths, weakness, and an improved response."
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

