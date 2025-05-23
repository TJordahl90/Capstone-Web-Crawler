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
from .models import ResumeParser
from .resumeParser import extract_text_from_pdf, parser
import os

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
    matchedJobs = JobPosting.objects.filter(id__in=matchedJobIds)
    
    jobList = []
    for job in matchedJobs:
        serializedJob = JobPostingSerializer(job).data
        count = matchedJobIds.get(job.id, 0)
        total = job.requirements.count() or 1
        percentage = round(count / total * 100)
        serializedJob['matchPercent'] = percentage
        jobList.append(serializedJob)

    jobList.sort(key=lambda x: x['matchPercent'], reverse=True) # this sorts the job list by percentage
    return Response(jobList, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def JobSearchingView(request):
    search_term = request.GET.get('search', '').strip()
    if not search_term:
        return Response([], status=200)
    
    searchedJobsIds = searchForJobs(search_term) # Call function
    foundJobs = JobPosting.objects.filter(id__in=searchedJobsIds) # Get jobs based on returned IDs
    serializedJobs = JobPostingSerializer(foundJobs, many=True).data # Serialize job postings for frontend
    return Response(serializedJobs, status=200) # Send jobs to frontend

@api_view(['GET'])
@permission_classes([AllowAny])
def AllJobsView(request):
    """Returns all available jobs"""
    all_jobs = JobPosting.objects.all()
    serialized = JobPostingSerializer(all_jobs, many=True)
    return Response(serialized.data, status=200)

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
        
        return Response({"message": "Resume uploaded successfully"}, status=201)