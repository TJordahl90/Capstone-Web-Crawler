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
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
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
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
import shutil

def _err(status_code: int, code: str, message: str, *, field: str | None = None, details: str | dict | None = None):
    payload = {"error": {"code": code, "message": message}}
    if field: payload["error"]["field"] = field
    if details is not None: payload["error"]["details"] = details
    return Response(payload, status=status_code)

def _coerce_bool(val):
    if isinstance(val, bool):
        return val
    if val is None:
        return None
    return str(val).strip().lower() in {"1", "true", "yes", "on"}

def _coerce_int(val, default=None, *, min_value=None, max_value=None):
    try:
        i = int(val)
        if min_value is not None and i < min_value: return default
        if max_value is not None and i > max_value: return default
        return i
    except (TypeError, ValueError):
        return default

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def CsrfTokenView(request):
    """Create csrf token and send to frontend"""
    csrf_token = get_token(request) # built-in function that creates csrf tokens
    return JsonResponse({'csrfToken': csrf_token})

class CreateUserView(APIView):
    """Register New User"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return _err(400, "missing_email", "Email is required.", field="email")
        try:
            validate_email(email)
        except ValidationError:
            return _err(422, "invalid_email", "Email format is invalid.", field="email")

        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    serializer.save()
            except Exception as e:
                return _err(500, "create_user_failed", "Could not create user.", details=str(e))
            return Response(serializer.data, status=201)
        return _err(400, "validation_error", "Invalid fields.", details=serializer.errors)

def sendEmailVerification(email, subject, message, templateName, context):
    msg = EmailMultiAlternatives(subject, message, settings.EMAIL_HOST_USER, email)

    if(templateName):
        htmlContent = render_to_string(templateName, context)
        msg.attach_alternative(htmlContent, 'text/html')
    
    msg.send(fail_silently=False)


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

        subject = 'Verification Code for Northstar Jobs'
        message = f'Your verification code is {code}'
        recipient = [email]
        context = {'code': code, 'user': user}

        sendEmailVerification(recipient, subject, message, 'emails/emailVerification.html', context)

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
            userFilePath = os.path.join(settings.MEDIA_ROOT, f'uploads/user_{user.id}')
            if(os.path.exists(userFilePath)):
                shutil.rmtree(userFilePath)
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
        errors = {}

        if (name_data := request.data.get('name')):
            user_serializer = UserSerializer(user, data=name_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                errors['name'] = user_serializer.errors

        if (personal_data := request.data.get('personal')):
            account_serializer = AccountSerializer(account, data=personal_data, partial=True)
            if account_serializer.is_valid():
                account_serializer.save()
            else:
                errors['personal'] = account_serializer.errors

        def set_keywords(field_name, model, values):
            try:
                objs = model.objects.filter(name__in=values)
                getattr(account, field_name).set(objs)
            except Exception as e:
                errors[field_name] = str(e)

        if (skills := request.data.get('skills')) is not None:
            set_keywords("skills", CommonSkills, skills)

        if (careers := request.data.get('careers')) is not None:
            set_keywords("careers", CommonCareers, careers)

        if (exp_levels := request.data.get('experienceLevels')) is not None:
            set_keywords("experienceLevels", CommonExperienceLevels, exp_levels)

        if (emp_types := request.data.get('employmentTypes')) is not None:
            set_keywords("employmentTypes", CommonEmploymentTypes, emp_types)

        if (work_models := request.data.get('workModels')) is not None:
            set_keywords("workModels", CommonWorkModels, work_models)

        if (education := request.data.get('education')) is not None:
            education_serializer = EducationSerializer(data=education, many=True)
            if education_serializer.is_valid():
                account.educations.all().delete()
                education_serializer.save(account=account)
            else:
                errors['education'] = education_serializer.errors

        if (experience := request.data.get('experience')) is not None:
            experience_serializer = ExperienceSerializer(data=experience, many=True)
            if experience_serializer.is_valid():
                account.experiences.all().delete()
                experience_serializer.save(account=account)
            else:
                errors['experience'] = experience_serializer.errors

        if errors:
            return Response(errors, status=400)

        return Response({'user': UserSerializer(user).data, 'account': AccountSerializer(account).data}, status=200)
        
class KeywordsView(APIView):
    """Retrieves list of careers/skills keywords"""
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            skills = list(CommonSkills.objects.values_list("name", flat=True))
            careers = list(CommonCareers.objects.values_list("name", flat=True))
            experienceLevels = list(CommonExperienceLevels.objects.values_list("name", flat=True))
            employmentTypes = list(CommonEmploymentTypes.objects.values_list("name", flat=True))
            workModels = list(CommonWorkModels.objects.values_list("name", flat=True))

            return Response({
                "skills": skills,
                "careers": careers,
                "experienceLevels": experienceLevels,
                "employmentTypes": employmentTypes,
                "workModels": workModels,
            }, status=200)
        except Exception:
            return Response({"error": "Error finding skills or careers in database"}, status=404)

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
    user = request.user
    account = user.account
    searchTerm = request.GET.get('search', '').strip()

    filters = request.data.get("filters", {}) # need to implement
    print(f'filters: {filters}')
    print(f'search: {searchTerm}')
    
    page_number = request.data.get("page", 1)

    savedJobIDs = SavedJob.objects.filter(account=account).values_list('jobPosting_id', flat=True)

    jobs = JobPosting.objects.exclude(id__in=savedJobIDs).prefetch_related(
        'skills',
        'careers',
        'degrees',
        'experienceLevels',
        'employmentTypes',
        'workModels'
    ).order_by('-datePosted')
    
    if(searchTerm):
        jobs = jobs.filter(
            Q(title__icontains=searchTerm) |
            Q(company__icontains=searchTerm) |
            Q(skills__name__icontains=searchTerm)
        ).distinct()

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
    #print(serializedJobs)
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
    
def parseResume(account, resume):

    text = extract_text_from_pdf(resume) #run the resume parser and stores data in pasrsed_data
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
        degreeType = edu.get('degree', '')
        degreeType = re.sub(r"[^a-z\s]", "", degreeType)
        try:
            degreeObj = CommonDegrees.objects.get(name__icontains=degreeType.split()[0])
        except(CommonDegrees.DoesNotExist, IndexError):
            print(f'{degreeType} degree type does not exist, skipping this degree')
            continue
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

    return parsed_data

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
                    encryptedBytes = f.read()

                decryptedFileBytes = decryptFile(encryptedBytes)

                response = HttpResponse(decryptedFileBytes, content_type='application/pdf')
                response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'

                return response
            except FileNotFoundError:
                return Response({"error": "Resume file not found"}, status=404)
            
        return Response({"error": "No resume found"}, status=404)
    
    def put(self, request):
        user = request.user
        account = Account.objects.get(user=user)
        newResume = request.FILES.get('resume')

        if account.resume:
            account.resume.delete(save=False)  # uses Django storage; safe if file missing

        if(not newResume):
            return Response({"error": "No file uploaded"}, status=400)
        
        account.skills.clear()
        Education.objects.filter(account=account).delete()
        Experience.objects.filter(account=account).delete()
        Project.objects.filter(account=account).delete()

        parseResume(account, newResume)
        
        account.saveResume(newResume)


        return Response({"message": "Resume replaced successfully"}, status=200)


    def post(self, request):
        try:
            user = request.user
            account = Account.objects.get(user=user)
            resume_file = request.FILES.get('resume')

            if not resume_file:
                return Response({"error": "No file uploaded"}, status=400)
            
            account.saveResume(resume_file)
            parsed_data = parseResume(account, resume_file)

            return Response({
                        'message': 'Resume uploaded and parsed successfully',
                            'parsed_data': parsed_data
                        }, status=201)

        except Exception as e:
            print('Error in file upload') 
            return Response({
                "error": "An error occurred while processing the resume",
                "details": str(e)
            }, status=500)
        
client = OpenAI(api_key=os.getenv('ai_api_key')) # Initialize OpenAI client

class InterviewPrepChatBotView(APIView):
    "Generates interview questions and provides feedback on user responses"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = request.user.account
        job_id = request.GET.get('job_id')

        # one_day_ago = timezone.now() - timedelta(days=1)
# chat_today = ChatBotHistory.objects.filter(account=account, timestamp__gte=one_day_ago).count()
# if chat_today >= 4:
#     return Response({"error": "You have reached your limit of 4 questions per day. Please try again tommorow."}, status=429)

        
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

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = request.user.account

        topStats = {}

        # Get top job
        try:
            topJobs = matchUsersToJobs(account)

            if(topJobs):
                topJobId, topScore = list(topJobs.items())[0]
                job = JobPosting.objects.get(id=topJobId)
                serializedJob = JobPostingSerializer(job, context={'request': request}).data
                topStats['topJob'] = {'job': serializedJob, 'score': int(topScore)}

        except IndexError:
            print('Matched jobs dictionary is empty')
        except JobPosting.DoesNotExist:
            print(f'Job with ID {topJobId} does not exist')
        except Exception as e:
            print(f'An unexptected error occured: {e}')

        # Newest Job added
        try:
            newestJob = JobPosting.objects.order_by('-id').first()
            if(newestJob):
                serializedNewestJob = JobPostingSerializer(newestJob, context={'request': request}).data
                topStats['newestJob'] = serializedNewestJob
        except Exception as e:
            print(f'An unexpected error occured: {e}')

        # Get top skill
        try:
            topSkill = (
                            CommonSkills.objects
                            .annotate(count=Count('job_postings'))
                            .order_by('-count')
                            .first()
                          )
            if(topSkill):
                topStats['topSkill'] = {'skillName': topSkill.name, 'skillCount': topSkill.count}
        except Exception as e:
            print(f'An unexpected error ocurred: {e}')
        
        # Get top career
        try:
            topCareer = (
                                CommonCareers.objects
                                .annotate(count=Count('job_postings'))
                                .order_by('-count')
                                .first()
                        )
            if(topCareer):
                topStats['topCareer'] = {'career': topCareer.name, 'count': topCareer.count}
        except Exception as e:
            print(f'An unexpected error ocurred: {e}')
        
        return Response(topStats, status=200)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getEmailPreference(request):
    return Response({'emailPreference': str(request.user.account.notify_by_email)})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def updateEmailPreference(request):
    emailPreference = request.data.get("emailPreference", None)
    if emailPreference is None:
        return Response({"detail": "emailPreference is required"}, status=400)
    
    print(emailPreference)
    if(isinstance(emailPreference, bool)):
        account = request.user.account
        account.notify_by_email = emailPreference
        account.save(update_fields=['notify_by_email'])
        return Response({'emailPreference': account.notify_by_email}, status=200)
    else:
        return Response({"detail": "emdasailPreference must be a boolean"}, status=400)