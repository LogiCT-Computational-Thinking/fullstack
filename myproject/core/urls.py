from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # API Root
    path('', views.api_root, name='api-root'),
    
    # Authentication endpoints
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/google/', views.google_auth_view, name='google-auth'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/refresh/', views.refresh_token_view, name='refresh-token'),
    
    # User profile endpoints
    path('auth/profile/', views.user_profile_view, name='user-profile'),
    path('auth/profile/update/', views.update_profile_view, name='update-profile'),
    
    # Password reset endpoints
    path('auth/forgot-password/', views.forgot_password_view, name='forgot-password'),
    path('auth/verify-otp/', views.verify_otp_view, name='verify-otp'),
    path('auth/reset-password-otp/', views.reset_password_otp_view, name='reset-password-otp'),
    path('auth/reset-password/', views.reset_password_view, name='reset-password'),
]
