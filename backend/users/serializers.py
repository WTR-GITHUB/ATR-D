# backend/users/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

# Authentication Serializers
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
    Vartotojų serializatorius - valdo vartotojų duomenų serializavimą
    """
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'birth_date', 
            'phone_number', 'roles', 'contract_number', 'is_active', 
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """
        Sukuria naują vartotoją su užšifruotu slaptažodžiu
        """
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        """
        Atnaujina vartotojo duomenis
        """
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user 