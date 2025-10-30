"""
    Serializers converts python models into JSON format and vise-versa
    views.py functions will call these functions to format the data
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

class CreateUserSerializer(serializers.ModelSerializer): 
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        """Check that the email is not already being used."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def create(self, validated_data):
        """Creates the user and account"""
        user = User.objects.create_user(**validated_data, is_active=False) # function to create user w/ data & hash password
        Account.objects.create(user = user)
        return user

class VerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Verification
        fields = ['code', 'email']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name']

class CommonSkillsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonSkills
        fields = ['id', 'name']

class CommonCareersSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonCareers
        fields = ['id', 'name']

class CommonDegreesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonDegrees
        fields = ['id', 'name']

class CommonExperienceLevelsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonExperienceLevels
        fields = ['id', 'name']

class CommonEmploymentTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonEmploymentTypes
        fields = ['id', 'name']

class CommonWorkModelsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonWorkModels
        fields = ['id', 'name']

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'institution', 'degree', 'major', 'minor', 'graduationDate', 'gpa']

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'company', 'title', 'startDate', 'endDate', 'description']

class ProjectSerializer(serializers.ModelSerializer):
    class meta:
        model = Project
        fields = ['id', 'account', 'title', 'description', 'startDate', 'endDate']

class AccountSerializer(serializers.ModelSerializer):
    skills = CommonSkillsSerializer(many=True, read_only=True)
    careers = CommonCareersSerializer(many=True, read_only=True)
    experienceLevels = CommonExperienceLevelsSerializer(many=True, read_only=True)
    employmentTypes = CommonEmploymentTypesSerializer(many=True, read_only=True)
    workModels = CommonWorkModelsSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)

    class Meta:
        model = Account
        fields = ['user', 'resume', 'headline', 'hometown', 'skills', 'careers', 'experienceLevels', 'employmentTypes', 'workModels', 'education', 'experience']
        extra_kwargs = {"user": {"read_only": True}}

class JobPostingSerializer(serializers.ModelSerializer):
    skills = CommonSkillsSerializer(many=True, read_only=True)    
    careers = CommonCareersSerializer(many=True, read_only=True)
    degrees = CommonDegreesSerializer(many=True, read_only=True)
    experienceLevels = CommonExperienceLevelsSerializer(many=True, read_only=True)
    employmentTypes = CommonEmploymentTypesSerializer(many=True, read_only=True)
    workModels = CommonWorkModelsSerializer(many=True, read_only=True)
    matchPercent = serializers.IntegerField(read_only=True)
    is_saved = serializers.SerializerMethodField()
    applied_status = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = [
            'id', 'company', 'title', 'description', 'summary', 'requirements', 
            'skills', 'careers', 'degrees', 'experienceLevels', 'employmentTypes', 'workModels',
            'location', 'datePosted', 'salary', 'jobURL', 'matchPercent', 'is_saved', 'applied_status'
        ]

    def get_is_saved(self, job):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return SavedJob.objects.filter(account=request.user.account, jobPosting=job).exists()
        return False
    
    def get_applied_status(self, job):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            try:
                saved_job = SavedJob.objects.get(account=request.user.account, jobPosting=job)
                return saved_job.applied
            except SavedJob.DoesNotExist:
                return False
        return False

class ChatBotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatBotHistory
        fields = ['id', 'question', 'response', 'timestamp', 'specificJob', 'account']

class JobStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobStatistics
        fields = ['id', 'category', 'numberOfJobs', 'date']