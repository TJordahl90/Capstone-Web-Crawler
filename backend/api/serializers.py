"""
    Serializers converts python models into JSON format and vise-versa
    views.py functions will call these functions to format the data
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

class CreateUserSerializer(serializers.ModelSerializer): 
    """Serializer for new user registering"""
    resume = serializers.FileField(required=False)

    class Meta:
        """Deserialize the user model fields below"""
        model = User
        fields = ['email', 'username', 'password', 'first_name', 'last_name', 'resume']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        """Creates the user and account"""
        
        # user object created and data set
        user = User(
            email = validated_data['email'],
            username = validated_data['username'],
            first_name = validated_data['first_name'],
            last_name = validated_data['last_name']
        )
        resume = validated_data.pop('resume', None)

        # set_password() and save() are built-in functions
        user.set_password(validated_data['password']) # hashes the password- security measure
        user.save() # saves user object to database

        account = Account (
            user = user,
            resume = resume,
        )

        account.save()
        return user # returns user object to views.py function call

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

class CommonPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonPreferences
        fields = ['id', 'name']

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'grade', 'institution', 'degree', 'major', 'minor', 'graduationDate', 'gpa']

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'company', 'title', 'location', 'startDate', 'description']

class AccountSerializer(serializers.ModelSerializer):
    skills = CommonSkillsSerializer(many=True, read_only=False)
    preferences = CommonPreferencesSerializer(many=True, read_only=False)
    education = EducationSerializer(many=False, read_only=False)
    experience = ExperienceSerializer(many=False, read_only=False)

    class Meta:
        model = Account
        fields = ['user', 'resume', 'headline', 'hometown', 'skills', 'preferences', 'education', 'experience']
        extra_kwargs = {"user": {"read_only": True}}

class JobPostingSerializer(serializers.ModelSerializer):
    requirements = CommonSkillsSerializer(many=True, read_only=True)
    matchPercent = serializers.IntegerField(read_only=True)
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = ['id', 'company', 'title', 'description', 'requirements', 'location', 'datePosted', 'salary', 'jobURL', 'matchPercent', 'is_saved']

    def get_is_saved(self, job):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return SavedJob.objects.filter(account=request.user.account, jobPosting=job).exists()
        return False

class ChatBotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatBotHistory
        fields = ['id', 'question', 'time', 'speficJob', 'account']