from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from .models import User


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that works with our User model
    """
    
    def get_user(self, validated_token):
        """
        Attempts to find and return a user using the given validated token.
        """
        try:
            user_id = validated_token.get('user_id')
        except KeyError:
            raise exceptions.AuthenticationFailed('Token contained no recognizable user identification')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')

        if not user.is_active:
            raise exceptions.AuthenticationFailed('User is inactive')

        return user
