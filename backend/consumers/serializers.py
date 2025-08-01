from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    StudentParent,
    StudentCurator,
    StudentSubjectLevel,
    MentorSubject
)
from lessons.models import Subject, Level

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = f"{user.first_name} {user.last_name}"
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'birth_date', 
                 'phone_number', 'contract_number', 'is_active')
        read_only_fields = ('last_login', 'date_joined')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class StudentParentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentParent
        fields = '__all__'

class StudentCuratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentCurator
        fields = '__all__'



class StudentSubjectLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSubjectLevel
        fields = '__all__'

class MentorSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorSubject
        fields = '__all__' 