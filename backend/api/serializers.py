"""
    Serializers converts python models into JSON format and vise-versa
    views.py functions will call these functions to format the data
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import *

class CreateUserSerializer(serializers.ModelSerializer): 
    """Serializer for new user registering"""

    class Meta:
        """Deserialize the user model fields below"""
        model = User
        fields = ['email', 'username', 'password', 'first_name', 'last_name']
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

        # set_password() and save() are built-in functions
        user.set_password(validated_data['password']) # hashes the password- security measure
        user.save() # saves user object to database
    
        account = Account (
            user = user
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

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['user', 'skills', 'experience', 'certifications', 'accountStatus']
        extra_kwargs = {"user": {"read_only": True}}