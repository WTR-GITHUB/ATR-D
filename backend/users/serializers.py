# backend/users/serializers.py

# User management serializers for A-DIENYNAS system
# Defines serializers for user registration, authentication, and profile management
# CHANGE: Atkurtas teisingas CustomTokenObtainPairSerializer, kuris paveldi iš TokenObtainPairSerializer

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    JWT token serializeris - sukuria prisijungimo tokenus su papildoma informacija
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['roles'] = user.roles
        token['full_name'] = f"{user.first_name} {user.last_name}"
        return token

class UserSerializer(serializers.ModelSerializer):
    """
    User serializer for CRUD operations
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'roles', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change functionality
    """
    old_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, style={'input_type': 'password'})

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Neteisingas senas slaptažodis.')
        return value

    def validate_new_password(self, value):
        validate_password(value, self.context['request'].user)
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user 