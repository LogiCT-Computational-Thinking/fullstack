import os, csv, json, io
from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password, make_password
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

from .models import User
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    GoogleAuthSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordOTPSerializer,
    PretestQuestionSerializer,
    ProfilingSubmissionSerializer
)
from .models import User, PretestQuestion, Pretest, PretestResponse
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
import random
from django.utils import timezone
from datetime import timedelta


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API Root - Welcome page with available endpoints
    """
    return Response({
        'message': 'Welcome to LogiCT API',
        'version': '1.0.0',
        'endpoints': {
            'authentication': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'google_auth': '/api/auth/google/',
                'logout': '/api/auth/logout/',
                'refresh_token': '/api/auth/refresh/',
                'profile': '/api/auth/profile/',
                'update_profile': '/api/auth/profile/update/',
                'forgot_password': '/api/auth/forgot-password/',
                'verify_otp': '/api/auth/verify-otp/',
                'reset_password_otp': '/api/auth/reset-password-otp/',
            },
            'admin': '/admin/',
            'documentation': '/api/docs/',
        },
        'status': 'Server is running'
    })


def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user
    POST /api/auth/register/
    Body: {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123",
        "password_confirm": "password123",
        "role": "student"
    }
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login user with email and password
    POST /api/auth/login/
    Body: {
        "email": "john@example.com",
        "password": "password123"
    }
    """
    serializer = UserLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check password
    if not check_password(password, user.password):
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    tokens = get_tokens_for_user(user)
    
    return Response({
        'message': 'Login successful',
        'user': UserSerializer(user).data,
        'tokens': tokens
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_view(request):
    """
    Authenticate user with Google OAuth
    POST /api/auth/google/
    Body: {
        "token": "google-id-token",
        "role": "student"  // optional, defaults to "student"
    }
    """
    print("=== Google Auth Request ===")
    print(f"Request data: {request.data}")
    
    serializer = GoogleAuthSerializer(data=request.data)
    if not serializer.is_valid():
        print(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    token = serializer.validated_data['token']
    role = serializer.validated_data.get('role', 'student')
    
    print(f"Token received: {token[:50]}...")
    print(f"Role: {role}")
    print(f"Google Client ID: {settings.GOOGLE_OAUTH_CLIENT_ID}")
    
    try:
        # Verify Google token
        print("Verifying Google token...")
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_OAUTH_CLIENT_ID,
            clock_skew_in_seconds=10  # Allow 10 seconds clock skew tolerance
        )
        
        print(f"Token verified successfully. User info: {idinfo}")
        
        # Get user info from Google
        email = idinfo.get('email')
        name = idinfo.get('name')
        picture = idinfo.get('picture')
        
        if not email:
            print("ERROR: Email not provided by Google")
            return Response({
                'error': 'Email not provided by Google'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Creating/getting user: {email}")
        
        # Check if user exists, if not create new user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'name': name,
                'role': role,
                'profilePicture': picture,
                'password': ''  # No password for Google auth users
            }
        )
        
        print(f"User {'created' if created else 'found'}: {user.email}")
        
        # Update profile picture if changed
        if not created and picture and user.profilePicture != picture:
            user.profilePicture = picture
            user.save()
        
        tokens = get_tokens_for_user(user)
        
        print("Google auth successful!")
        
        return Response({
            'message': 'Google authentication successful',
            'user': UserSerializer(user).data,
            'tokens': tokens,
            'is_new_user': created
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        print(f"ValueError during token verification: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Invalid Google token',
            'detail': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Authentication failed',
            'detail': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user
    POST /api/auth/logout/
    Body: {
        "refresh": "refresh-token"
    }
    Note: Token blacklist is disabled, so tokens remain valid until expiry.
    Client should remove tokens from storage.
    """
    # Simply return success - client will remove tokens from localStorage
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """
    Get current user profile
    GET /api/auth/profile/
    """
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """
    Update current user profile
    PUT/PATCH /api/auth/profile/update/
    Body: {
        "name": "New Name",
        "profilePicture": "url"
    }
    """
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_token_view(request):
    """
    Refresh access token
    POST /api/auth/refresh/
    Body: {
        "refresh": "refresh-token"
    }
    """
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        
        return Response({
            'access': str(token.access_token)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Invalid token',
            'detail': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    """
    Send OTP via email
    POST /api/auth/forgot-password/
    Body: { "email": "user@example.com" }
    """
    serializer = ForgotPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    try:
        user = User.objects.get(email=email)
        
        # Generate 6-digit OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        user.otp = otp
        user.otp_created_at = timezone.now()
        user.save()
        
        # Send email
        subject = 'Your LogiCT OTP'
        message = f'Hi {user.name},\n\nYour OTP for password reset is: {otp}\n\nThis OTP is valid for 10 minutes. If you did not request this, please ignore this email.'
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return Response({
            'message': 'OTP has been sent to your email'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'message': 'If your email is registered, you will receive an OTP shortly'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Failed to send OTP',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request):
    """
    Verify OTP
    POST /api/auth/verify-otp/
    Body: { "email": "user@example.com", "otp": "123456" }
    """
    serializer = VerifyOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    otp = serializer.validated_data['otp']
    
    try:
        user = User.objects.get(email=email)
        
        # Check OTP
        if user.otp != otp:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check expiry (10 minutes)
        if timezone.now() > user.otp_created_at + timedelta(minutes=10):
            return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_otp_view(request):
    """
    Reset password with OTP
    POST /api/auth/reset-password-otp/
    Body: { "email": "user@example.com", "otp": "123456", "new_password": "...", "confirm_password": "..." }
    """
    serializer = ResetPasswordOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    otp = serializer.validated_data['otp']
    new_password = serializer.validated_data['new_password']
    
    try:
        user = User.objects.get(email=email)
        
        # Verify OTP again
        if user.otp != otp:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
            
        if timezone.now() > user.otp_created_at + timedelta(minutes=10):
            return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password
        user.password = make_password(new_password)
        user.otp = None  # Clear OTP after use
        user.otp_created_at = None
        user.save()
        
        return Response({'message': 'Password has been reset successfully'}, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    """
    Reset password using token
    POST /api/auth/reset-password/
    Body: { "uidb64": "...", "token": "...", "new_password": "...", "confirm_password": "..." }
    """
    serializer = ResetPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    uidb64 = serializer.validated_data['uidb64']
    token = serializer.validated_data['token']
    new_password = serializer.validated_data['new_password']
    
    try:
        # Decode user id
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        
        # Verify token
        if not default_token_generator.check_token(user, token):
            return Response({
                'error': 'Invalid or expired token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.password = make_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password has been reset successfully'
        }, status=status.HTTP_200_OK)
        
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({
            'error': 'Invalid user identification'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'Reset password failed',
            'detail': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


# =========================================================
# 6️⃣ PROFILING QUIZ LOGIC
# =========================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_profiling_questions(request):
    """
    Get randomized profiling questions (21 total: 6 pedagogy, 15 cognitive)
    """
    # 1. Select 1 random question for each level (1-6) of Pedagogy
    pedagogy_questions = []
    for level in range(1, 7):
        q = PretestQuestion.objects.filter(
            category='PROFILING_PEDAGOGY', 
            level=level
        ).order_by('?').first()
        if q:
            pedagogy_questions.append(q)
            
    # 2. Select 5 random questions for each Cognitive category
    cognitive_tp = list(PretestQuestion.objects.filter(category='PROFILING_COGNITIVE_TP').order_by('?')[:5])
    cognitive_ga = list(PretestQuestion.objects.filter(category='PROFILING_COGNITIVE_GA').order_by('?')[:5])
    cognitive_ir = list(PretestQuestion.objects.filter(category='PROFILING_COGNITIVE_IR').order_by('?')[:5])
    
    all_questions = pedagogy_questions + cognitive_tp + cognitive_ga + cognitive_ir
    
    # Randomize order
    random.shuffle(all_questions)
    
    serializer = PretestQuestionSerializer(all_questions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_profiling_answers(request):
    """
    Submit profiling responses and calculate result (e.g., "2TAR")
    """
    serializer = ProfilingSubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    user = request.user
    responses_data = serializer.validated_data['responses']
    
    # Create a Pretest record for this profiling
    pretest = Pretest.objects.create(user=user, result="Profiling")
    
    # Store answers for lookup
    answers_map = {r['question_id']: r['answer'] for r in responses_data}
    
    # -----------------------------------------------------
    # 1. PEDAGOGY SCORING (Sequential Levels 1-6)
    # -----------------------------------------------------
    final_level = 1
    for level in range(1, 7):
        # Find the question in our answers for this level
        level_q = PretestQuestion.objects.filter(
            pk__in=answers_map.keys(), 
            category='PROFILING_PEDAGOGY', 
            level=level
        ).first()
        
        if not level_q:
            continue # Should not happen if frontend is correct
            
        user_ans = answers_map[level_q.id]
        is_correct = user_ans.strip().lower() == level_q.correctAns.strip().lower()
        
        # Save response
        PretestResponse.objects.create(
            user=user,
            question=level_q,
            response_value=None,
            answer=is_correct
        )
        
        if is_correct:
            final_level = level
        else:
            # If wrong, we stop here. 
            # If wrong at Level 1, level remains 1. 
            # If wrong at level N, level is N-1.
            break
            
    # -----------------------------------------------------
    # 2. COGNITIVE SCORING (Sum-based, Threshold 18)
    # -----------------------------------------------------
    def get_cognitive_label(category, label1, label2):
        qs = PretestQuestion.objects.filter(pk__in=answers_map.keys(), category=category)
        total_score = 0
        for q in qs:
            ans = answers_map[q.id]
            try:
                val = int(ans)
                total_score += val
                # Save response
                PretestResponse.objects.create(
                    user=user,
                    question=q,
                    response_value=val,
                    answer=True # Cognitive scale is not correct/incorrect
                )
            except ValueError:
                pass
        return label2 if total_score > 18 else label1

    label_tp = get_cognitive_label('PROFILING_COGNITIVE_TP', 'T', 'P')
    label_ga = get_cognitive_label('PROFILING_COGNITIVE_GA', 'G', 'A')
    label_ir = get_cognitive_label('PROFILING_COGNITIVE_IR', 'I', 'R')
    
    # -----------------------------------------------------
    # 3. COMBINE & SAVE
    # -----------------------------------------------------
    result_code = f"{final_level}{label_tp}{label_ga}{label_ir}"
    
    user.preferences = result_code
    user.is_profiled = True
    user.save()
    
    # Update pretest result
    pretest.result = result_code
    pretest.score = float(final_level) # Just as a reference
    pretest.save()
    
    return Response({
        'message': 'Profiling completed successfully',
        'result_code': result_code,
        'is_profiled': user.is_profiled
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def bulk_upload_questions(request):
    """
    Bulk upload profiling questions via CSV
    Expects CSV with columns: question, type, category, level, option, correctAns, image_filename
    """
    if 'file' not in request.FILES:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
    csv_file = request.FILES['file']
    decoded_file = csv_file.read().decode('utf-8')
    io_string = io.StringIO(decoded_file)
    reader = csv.DictReader(io_string)
    
    count = 0
    for row in reader:
        # Parse options if it exists and is a JSON string
        options = []
        if row.get('option'):
            try:
                options = json.loads(row['option'])
            except:
                options = [opt.strip() for opt in row['option'].split('|')] if '|' in row['option'] else []

        PretestQuestion.objects.create(
            question=row['question'],
            type=row['type'],
            category=row['category'],
            level=int(row.get('level', 1)),
            option=options,
            correctAns=row.get('correctAns', ''),
            image=row.get('image_filename', None) # Note: file must exist in media/questions/
        )
        count += 1
        
    return Response({'message': f'Successfully uploaded {count} questions'})


@permission_classes([IsAuthenticated])
def profiling_tester_view(request):
    """
    A simple view to test the profiling quiz flow
    """
    return render(request, 'core/profiling_tester.html')
