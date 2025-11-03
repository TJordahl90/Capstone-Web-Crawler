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
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay, TruncYear
from collections import Counter

@api_view(['GET'])
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
    
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        userCode = str(request.data.get('verificationCode'))
        newPassword = request.data.get('newPassword')
        # Get user account
        try:
            user = User.objects.get(email__iexact=email)
            verificationEntry = Verification.objects.get(email__iexact=email)
            verificationCode = str(verificationEntry.code)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
            
        print(f'user: {user} \nreal code: {verificationCode} \nUser code: {userCode}') 

        if(verificationCode == userCode):
            user.set_password(newPassword)
            user.save()
            verificationEntry.delete()
            return Response({'message': 'Password reset successful!'}, status=200)        
        else:
            return Response({'error': 'Invalid code.'}, status=400)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        response = Response({"message": "Logged out of account"}, status=200)
        response.delete_cookie(settings.SESSION_COOKIE_NAME, path='/')
        response.delete_cookie(settings.CSRF_COOKIE_NAME, path='/')
        return response

class DeleteUserView(APIView):
    """Handles deleting user account"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        user = request.user
        try:
            user.delete()
            return Response({"message": "Account successfully deleted"}, status=204)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)

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
        # preferences_data = request.data.get('preferences')
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

        # UPDATE THIS TO INCLUDE NEW ACCOUNT FIELDS CAREERS, ETC
        # if preferences_data:
        #     try:
        #         preferences_list = [CommonPreferences.objects.get_or_create(name=pref)[0] for pref in preferences_data]
        #         account.preferences.set(preferences_list)
        #     except Exception as e:
        #         errors['preferences'] = str(e)

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

    orderedJobs = []
    for jobID, score in sorted(matchedJobIds.items(), key=lambda item: item[1], reverse=True):
        job = next((j for j in matchedJobs if j.id == jobID), None)
        if job:
            job.matchPercent = score
            orderedJobs.append(job)
    
    serializedJobs = JobPostingSerializer(orderedJobs, many=True, context={'request': request}).data
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
    filters = request.data.get("filters", {}) # need to implement
    
    page_number = request.data.get("page", 1)

    jobs = JobPosting.objects.order_by('-id').prefetch_related(
        'skills',
        'careers',
        'degrees',
        'experienceLevels',
        'employmentTypes',
        'workModels'
    )
    
    #print(filters)
    #Filter if necessary by each field
    if(filters.get('employmentType')):
       jobs = jobs.filter(employmentTypes__name__in=filters['employmentType']).distinct()

    if(filters.get('experienceLevel')):
        jobs = jobs.filter(experienceLevels__name__in=filters['experienceLevel'])

    if(filters.get('location')):
        jobs = jobs.filter(workModels__name__in=filters['location'])

    total_count = jobs.count()
    start = (page_number - 1) * 15
    end = start + 15
    paginated_jobs = jobs[start:end]
    
    serializedJobs = JobPostingSerializer(paginated_jobs, many=True, context={'request': request}).data
    return Response({'count': total_count, 'jobs': serializedJobs}, status=200)

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
        #print(parsed_data)

        #Automatically adds it to the profile
        if skills:
            skillObjects = []
            for raw in skills:
                skill = (raw or "").strip()
                if not skill:
                    continue
                try:
                    # case-insensitive fetch
                    obj = CommonSkills.objects.get(name__iexact=skill)
                except CommonSkills.DoesNotExist:
                    # create if truly missing
                    obj = CommonSkills.objects.create(name=skill)
                except CommonSkills.MultipleObjectsReturned:
                    # if duplicates exist with different casing, pick one
                    obj = CommonSkills.objects.filter(name__iexact=skill).first()
                skillObjects.append(obj)
            if skillObjects:
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

        # Get education data
        educationList = parsed_data.get('Education', [])
        
        # Create education objects
        for edu in educationList:
            degreeType = edu['degree']
            degreeObj = CommonDegrees.objects.get(name__icontains=degreeType.split()[0])

            try:
                Education.objects.create(
                    account=account,
                    institution=edu.get('institution', ''),
                    degree=degreeObj,
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
    "Generates interview questions and provides feedback on user responses"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = request.user.account
        job_id = request.GET.get('job_id')

        one_day_ago = timezone.now() - timedelta(days=1)
        chat_today = ChatBotHistory.objects.filter(account=account, timestamp__gte=one_day_ago).count()
        if chat_today >= 4:
            return Response({"error": "You have reached your limit of 4 questions per day. Please try again tommorow."}, status=429)
        
        try:
            job_posting = JobPosting.objects.get(id=job_id)
            past_questions = ", ".join(list(ChatBotHistory.objects.filter(account=account).values_list('question', flat=True)))
            prompt = (
                f"You are an AI job interview coach. Your task is to generate 4 unique and insightful interview questions based on the provided job application description.\n"
                f'Here is the details for the job the applicant is applying for:\n'
                f'Job Title: {job_posting.title}\n'
                f'Company: {job_posting.company}\n'
                f'Description: {job_posting.description}\n'
                f"IMPORTANT: Do not ask any of the following previously asked questions:\n"
                f"History: {past_questions}\n" 
                f"Format the output ONLY as a list, with each line starting with 'question: ' ('question: ...\nquestion: ...\nquestion: ...')."
            )

            try:
                ai_response = client.chat.completions.create(model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}]) # can set custom temperature for more creativity
                questions_text = ai_response.choices[0].message.content.strip()
                questions_list = [q.strip() for q in questions_text.split('\n') if q.strip()]
                formatted_questions = []
                for q in questions_list:
                    new_question = q.split('question: ', 1)[-1]
                    ChatBotHistory.objects.create(question=new_question, specificJob=job_posting, account=account)
                    formatted_questions.append(new_question)
                
                return Response({"message": formatted_questions}, status=201)
            
            except Exception as e:
                return Response({"error": str(e)}, status=500)
            
        except JobPosting.DoesNotExist:
            return Response({"error": "Job posting not found."}, status=404)


    def post(self, request):
        user_response = request.data.get("answer")
        ai_question = request.data.get("question")

        try:
            chat = ChatBotHistory.objects.get(account=request.user.account, question=ai_question)
            chat.response = user_response
            chat.save()

            prompt = (
                f"You are an AI job interview coach. An applicant was asked the following question.\n"
                f"Question: {ai_question}\n"
                f"The applicant provided this response\n"
                f"Response: {user_response}\n"
                f"Analyze the applicant's response. Provide feedback ONLY in the following format, using these exact headings:\n\n"
                f"**Overall Feedback:**\n"
                f"[Provide a 2-3 sentence summary of the response's effectiveness.]\n\n"
                f"**Strengths:**\n"
                f"- [List 1-2 specific strengths of the answer.]\n\n"
                f"**Areas for Improvement:**\n"
                f"- [List 1-2 specific, actionable areas for improvement.]\n\n"
                f"**Example Response:**\n"
                f"[Provide an ideal, concise example response to the question.]"
            )

            try:
                ai_response = client.chat.completions.create(model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}])
                feedback_text = ai_response.choices[0].message.content.strip()
                return Response({"message": feedback_text})

            except Exception as e:
                return Response({"error": str(e)}, status=500)
            
        except ChatBotHistory.DoesNotExist:
            return Response({"error": "Chat history not found"}, status=404)
        
class InterviewSummaryView(APIView):
    """Gives user an overall summary on their interview chat"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = request.user.account
        
        chat_history_pairs = list(ChatBotHistory.objects.filter(account=account).values_list('question', 'response'))
        if not chat_history_pairs:
            return Response({"error": "No chat history found to generate a grade."}, status=404)

        conversation_history = ""
        for question, response in chat_history_pairs:
            conversation_history += f"Q: {question}\nA: {response}\n\n"

        prompt = (
            f"You are an expert career coach providing a final summary of a mock interview."
            f"Based on the conversation below, provide an complete overview and a letter grade.\n\n"
            f"CONVERSATION HISTORY:\n{conversation_history}\n"
            f"YOUR TASK:\n"
            f"1.Grade: Assign a single letter grade (A, B, C, D, or F).\n"
            f"2.Analysis: Write a 4-6 sentence summary of the candidate's performance. Identify one key strength and one major area for improvement that was evident across all their answers.\n"
            f"3.Hired: Determine whether you would employ the user to this job position based on the results of their mock interview. Answer with either 'yes' or 'no'.\n"
            f"Format the output ONLY as a list, with each line starting with 'data: ' ('data: (letter grade)\ndata: (analysis)\ndata: (hired)')."
        )

        try:
            ai_response = client.chat.completions.create(model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}])
            summary_text = ai_response.choices[0].message.content.strip()
            summary_list = [s.strip() for s in summary_text.split('\n') if s.strip()]
            formatted_summary = []
            for s in summary_list:
                formatted_summary.append(s.split('data: ', 1)[-1])

            return Response(formatted_summary, status=201)

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
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            # For skills
            skillCounts = (
                            CommonSkills.objects
                            .annotate(count=Count('job_postings'))
                            .values('name', 'count')
                            .order_by('-count')
                          )
            
            topSkills = skillCounts[:10]

            # For career area
            careerAreas = (
                                CommonCareers.objects
                                .annotate(count=Count('job_postings'))
                                .values('name', 'count')
                                .order_by('-count')
                          )
            topCareers = careerAreas[:5]

            # For work models
            topWorkModels = (
                                CommonWorkModels.objects
                                .annotate(count=Count('job_postings'))
                                .values('name', 'count')
                            )

            topExperienceLevels = (
                                    CommonExperienceLevels.objects
                                    .annotate(count=Count('job_postings'))
                                    .filter(count__gt=0)
                                    .values('name', 'count')
                                  )

            topEmploymentTypes = (
                                    CommonEmploymentTypes.objects
                                    .annotate(count=Count('job_postings'))
                                    .values('name', 'count')
                                 )
            return Response({'topSkills': topSkills, 'topCareerAreas': topCareers, 'topWorkModels': topWorkModels, 'topExperienceLevels': topExperienceLevels, 'topEmploymentTypes': topEmploymentTypes}, status=200)
        
        except Exception as e:
            print(str(e))
            return Response({'error': str(e)}, status=500)
