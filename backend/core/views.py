import os, csv, json, io
from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .authentication import CustomJWTAuthentication
from django.contrib.auth.hashers import check_password, make_password
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

from .models import User, QuizQuestion, PretestQuestion, Pretest, PretestResponse, Material
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
    QuizQuestionSerializer,
    ProfilingSubmissionSerializer,
    UpdateStudentInfoSerializer,
    MaterialSerializer,
    QuizResultSerializer,
    QuizSubmissionSerializer
)
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
import random
from django.utils import timezone
from datetime import timedelta
from django.http import FileResponse, Http404
from django.views.decorators.clickjacking import xframe_options_exempt
import mimetypes


# ─── Serve Media File (iframe-friendly) ──────────────────────────────────────
# Endpoint khusus untuk menampilkan file di iframe di frontend.
# @xframe_options_exempt  → hapus header X-Frame-Options: deny
# Content-Disposition: inline → tampil di browser, bukan langsung download

@xframe_options_exempt
@permission_classes([AllowAny])
def serve_media_file(request, file_path):
    """
    GET /api/media/<file_path>
    Serve file dari MEDIA_ROOT dengan izin iframe (tanpa X-Frame-Options deny).
    """
    full_path = os.path.join(settings.MEDIA_ROOT, file_path)

    if not os.path.exists(full_path):
        raise Http404('File tidak ditemukan.')

    # Deteksi content type
    content_type, _ = mimetypes.guess_type(full_path)
    content_type = content_type or 'application/octet-stream'

    response = FileResponse(
        open(full_path, 'rb'),
        content_type=content_type,
    )
    # 'inline' → tampil di browser / iframe
    filename = os.path.basename(full_path)
    response['Content-Disposition'] = f'inline; filename="{filename}"'

    # Izinkan embed dari frontend (localhost:5173)
    response['X-Frame-Options'] = 'ALLOWALL'

    return response


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
                'update_student_info': '/api/auth/profiling/student-info/',
                'submit_cognitive': '/api/profiling/cognitive-submit/',
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
        
        # Update profile picture if not set
        if not created and picture and not user.profilePicture:
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
@permission_classes([AllowAny])
def google_admin_auth_view(request):
    """
    POST /api/auth/google/admin/
    Google OAuth khusus Admin Portal.
    - Hanya menerima akun yang SUDAH TERDAFTAR dengan role admin/teacher.
    - TIDAK membuat akun baru (aman dari self-registration).
    """
    serializer = GoogleAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    token = serializer.validated_data['token']

    try:
        # 1. Verifikasi token Google
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_OAUTH_CLIENT_ID,
            clock_skew_in_seconds=10
        )

        email = idinfo.get('email')
        if not email:
            return Response({'error': 'Email tidak ditemukan dari akun Google.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Cari user yang SUDAH ada di database — TIDAK buat baru
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Akun dengan email ini tidak terdaftar di sistem. Hubungi superadmin.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 3. Validasi role — hanya admin/teacher yang boleh masuk
        if user.role not in ['admin', 'teacher']:
            return Response(
                {'error': 'Akses ditolak. Akun ini tidak memiliki hak akses Admin Portal.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 4. Update foto profil jika belum ada
        picture = idinfo.get('picture')
        if picture and not user.profilePicture:
            user.profilePicture = picture
            user.save()

        tokens = get_tokens_for_user(user)

        return Response({
            'message': 'Google authentication successful',
            'user': UserSerializer(user).data,
            'tokens': tokens,
            'is_new_user': False
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({'error': 'Token Google tidak valid.', 'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': 'Autentikasi gagal.', 'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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
def upload_profile_picture_view(request):
    """
    Upload profile picture file
    POST /api/auth/profile/upload-photo/
    """
    if 'photo' not in request.FILES:
        return Response({'error': 'No photo provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    photo = request.FILES['photo']
    user = request.user
    
    # Create path: media/avatars/avatar_user_id.ext
    ext = os.path.splitext(photo.name)[1]
    filename = f"avatar_{user.id}{ext}"
    relative_path = os.path.join('avatars', filename)
    full_path = os.path.join(settings.MEDIA_ROOT, relative_path)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    # Save file
    with open(full_path, 'wb+') as destination:
        for chunk in photo.chunks():
            destination.write(chunk)
            
    # Update user model with URL
    photo_url = request.build_absolute_uri(settings.MEDIA_URL + relative_path)
    user.profilePicture = photo_url
    user.save()
    
    return Response({
        'message': 'Profile picture uploaded successfully',
        'url': photo_url,
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_student_info_view(request):
    """
    Update student information from profiling quiz
    POST /api/auth/profiling/student-info/
    """
    user = request.user
    serializer = UpdateStudentInfoSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Student information updated successfully',
            'user': UserSerializer(user).data
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
@permission_classes([IsAuthenticated])
def get_profiling_questions(request):
    """
    Get randomized profiling questions (21 total: 6 pedagogy, 15 cognitive)
    """
    # 1. Select 1 random question for each level (1-6) of Pedagogy
    pedagogy_questions = []
    missing_levels = []
    for level in range(1, 7):
        q = PretestQuestion.objects.filter(
            category='PROFILING_PEDAGOGY', 
            level=level
        ).order_by('?').first()
        if q:
            pedagogy_questions.append(q)
        else:
            missing_levels.append(level)
            
    if missing_levels:
        print(f"Warning: Missing pedagogy questions for levels: {missing_levels}")

    # 2. Select 5 random questions for each Cognitive category
    cognitive_tp = list(PretestQuestion.objects.filter(category='PROFILING_COGNITIVE_TP').order_by('?')[:5])
    cognitive_ga = list(PretestQuestion.objects.filter(category='PROFILING_COGNITIVE_GA').order_by('?')[:5])
    cognitive_ir = list(PretestQuestion.objects.filter(category='PROFILING_COGNITIVE_IR').order_by('?')[:5])
    
    # Combine all questions
    cognitive_questions = cognitive_tp + cognitive_ga + cognitive_ir
    random.shuffle(cognitive_questions)
    
    all_questions = pedagogy_questions + cognitive_questions
    
    serializer = PretestQuestionSerializer(all_questions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_profiling_answers(request):
    """
    Submit profiling responses and calculate result (e.g., "2TAR")
    """
    print(f"=== Profiling Submission ===")
    print(f"User: {request.user}")
    print(f"Authenticated: {request.user.is_authenticated}")
    print(f"Data received: {request.data}")
    
    serializer = ProfilingSubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        print(f"Validation Errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    user = request.user
    responses_data = serializer.validated_data['responses']
    print(f"Processing {len(responses_data)} responses")
    
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
            print(f"Pedagogy Loop: Level {level} question not found in answers. Stopping.")
            break
            
        user_ans = str(answers_map[level_q.id])
        
        # Check if it's a multi-select type
        if level_q.type in ['multi_select', 'multi_select_image']:
            # Handle multiple answers (comma or | separated)
            user_ans_set = set([a.strip().lower() for a in user_ans.replace('[', '').replace(']', '').replace('"', '').split(',') if a.strip()])
            correct_ans_set = set([a.strip().lower() for a in level_q.correctAns.replace('[', '').replace(']', '').replace('"', '').split(',') if a.strip()])
            
            # If comma split results in 1 item, try pipe
            if len(user_ans_set) <= 1 and '|' in user_ans:
                user_ans_set = set([a.strip().lower() for a in user_ans.split('|') if a.strip()])
            if len(correct_ans_set) <= 1 and '|' in level_q.correctAns:
                correct_ans_set = set([a.strip().lower() for a in level_q.correctAns.split('|') if a.strip()])
                
            is_correct = user_ans_set == correct_ans_set
        else:
            is_correct = user_ans.strip().lower() == level_q.correctAns.strip().lower()
        
        # Save or update response
        PretestResponse.objects.update_or_create(
            user=user,
            question=level_q,
            defaults={
                'response_value': user_ans, # Save raw string for pedagogy too
                'answer': is_correct
            }
        )
        
        if is_correct:
            print(f"Pedagogy Loop: Level {level} CORRECT. Setting final_level to {level}")
            final_level = level
        else:
            print(f"Pedagogy Loop: Level {level} WRONG (User: '{user_ans}', Correct: '{level_q.correctAns}'). Stopping.")
            # If wrong at Level 1, level remains 1. 
            # If wrong at level N, level is N-1.
            break
            
    # -----------------------------------------------------
    # 2. COGNITIVE SCORING (Sum-based, Threshold 18)
    # -----------------------------------------------------
    def get_cognitive_data(category, label1, label2):
        qs = PretestQuestion.objects.filter(pk__in=answers_map.keys(), category=category)
        total_score = 0
        for q in qs:
            ans = answers_map[q.id]
            try:
                # Ensure we handle empty strings or non-numeric answers safely
                val = int(ans) if ans and str(ans).strip() else 0
                total_score += val
                # Save or update response
                PretestResponse.objects.update_or_create(
                    user=user,
                    question=q,
                    defaults={
                        'response_value': val,
                        'answer': True # Cognitive scale is not correct/incorrect
                    }
                )
            except (ValueError, TypeError):
                pass
        
        # Mapping Score (5-30) to slider value (0-100) where 18 is 50
        # 18 is 0% distance from center (UI value 50)
        # 5 is 100% distance to left (UI value 0)
        # 30 is 100% distance to right (UI value 100)
        if total_score < 18:
            # Range 5 to 18 (13 units) mapping to 0 to 50
            normalized_value = 50 - ((18 - total_score) / (18 - 5) * 50)
        elif total_score > 18:
            # Range 18 to 30 (12 units) mapping to 50 to 100
            normalized_value = 50 + ((total_score - 18) / (30 - 18) * 50)
        else:
            normalized_value = 50.0

        label = label2 if total_score > 18 else label1
        return label, round(normalized_value, 2)

    label_tp, user.cog_tp_value = get_cognitive_data('PROFILING_COGNITIVE_TP', 'T', 'P')
    label_ga, user.cog_ga_value = get_cognitive_data('PROFILING_COGNITIVE_GA', 'G', 'A')
    label_ir, user.cog_ir_value = get_cognitive_data('PROFILING_COGNITIVE_IR', 'I', 'R')
    
    # -----------------------------------------------------
    # 3. CT FRAMEWORK SCORING (Normalized Composition)
    # -----------------------------------------------------
    # Fetch all questions involved in this pretest
    all_qs = PretestQuestion.objects.filter(pk__in=answers_map.keys())
    
    ct_scores = {
        'decomposition': 0.0,
        'abstraction': 0.0,
        'pattern': 0.0,
        'algorithm': 0.0
    }
    
    total_earned_points = 0.0
    
    for q in all_qs:
        user_ans = answers_map[q.id]
        is_correct = False
        
        # Determine if correct (reusing logic from Pedagogy section or similar)
        if q.type in ['multi_select', 'multi_select_image']:
            user_ans_set = set([a.strip().lower() for a in user_ans.replace('[', '').replace(']', '').replace('"', '').split(',') if a.strip()])
            correct_ans_set = set([a.strip().lower() for a in q.correctAns.replace('[', '').replace(']', '').replace('"', '').split(',') if a.strip()])
            if len(user_ans_set) <= 1 and '|' in user_ans:
                user_ans_set = set([a.strip().lower() for a in user_ans.split('|') if a.strip()])
            if len(correct_ans_set) <= 1 and '|' in q.correctAns:
                correct_ans_set = set([a.strip().lower() for a in q.correctAns.split('|') if a.strip()])
            is_correct = user_ans_set == correct_ans_set
        elif q.category in ['GENERAL', 'PROFILING_PEDAGOGY'] or q.category.startswith('PROFILING_COGNITIVE'):
            # For cognitive questions, the 'answer' is usually a numeric value (1-6) from Scale
            # However, the user asked for CT framework weights to be applied to "answered correct"
            # Cognitive Profiling (Scale 1-6) questions don't really have a "correct" answer in the traditional sense.
            # But the user's request "jika dijawab benar" implies we should treat them as correct if possible 
            # OR perhaps CT framework weights mainly apply to Pedagogy and other "scored" questions?
            # Actually, most profiling questions have correct answers.
            is_correct = user_ans.strip().lower() == q.correctAns.strip().lower()
        
        if is_correct:
            ct_scores['decomposition'] += q.weight_decomposition
            ct_scores['abstraction'] += q.weight_abstraction
            ct_scores['pattern'] += q.weight_pattern
            ct_scores['algorithm'] += q.weight_algorithm
            total_earned_points += (q.weight_decomposition + q.weight_abstraction + q.weight_pattern + q.weight_algorithm)

    # Normalize to 100% total
    if total_earned_points > 0:
        user.ct_decomposition = round((ct_scores['decomposition'] / total_earned_points) * 100, 2)
        user.ct_abstraction = round((ct_scores['abstraction'] / total_earned_points) * 100, 2)
        user.ct_pattern = round((ct_scores['pattern'] / total_earned_points) * 100, 2)
        user.ct_algorithm = round((ct_scores['algorithm'] / total_earned_points) * 100, 2)
    else:
        # Default if no questions answered correctly or weights are zero
        user.ct_decomposition = 25.0
        user.ct_abstraction = 25.0
        user.ct_pattern = 25.0
        user.ct_algorithm = 25.0
    
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
        'is_profiled': user.is_profiled,
        'user': UserSerializer(user).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_cognitive_answers(request):
    """
    Save cognitive responses only, without finishing the profiling.
    """
    serializer = ProfilingSubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    user = request.user
    responses_data = serializer.validated_data['responses']
    
    # Check if a pretest already exists for this profiling or create a placeholder
    pretest, created = Pretest.objects.get_or_create(
        user=user, 
        result="Profiling In Progress",
        defaults={'score': 0.0}
    )
    
    for r in responses_data:
        try:
            question = PretestQuestion.objects.get(pk=r['question_id'])
            val = int(r['answer'])
            
            # Save or update response
            PretestResponse.objects.update_or_create(
                user=user,
                question=question,
                defaults={
                    'response_value': val,
                    'answer': True # Cognitive doesn't have "wrong" answer
                }
            )
        except Exception as e:
            print(f"Error saving cognitive response: {e}")
            continue
            
    return Response({'message': 'Cognitive answers saved successfully'})


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
    reader = list(csv.DictReader(io_string)) # Read all into list for two-pass or better handling
    
    # --- PHASE 1: VALIDATION ---
    missing_files = []
    questions_dir = os.path.join(settings.MEDIA_ROOT, 'questions')
    
    # Ensure directory exists check (optional but good)
    if not os.path.exists(questions_dir):
        os.makedirs(questions_dir, exist_ok=True)

    for row_idx, row in enumerate(reader, start=2): # Start at 2 for CSV header
        # Check question image
        q_img = row.get('image_filename')
        if q_img:
            if not os.path.exists(os.path.join(questions_dir, q_img)):
                missing_files.append(f"Row {row_idx}: Question image '{q_img}' not found in media/questions/")
        
        # Check option images for image-based types
        q_type = row.get('type', '')
        if '_image' in q_type and row.get('option'):
            try:
                opts = json.loads(row['option'])
            except:
                opts = [opt.strip() for opt in row['option'].split('|')] if '|' in row['option'] else []
            
            for opt_img in opts:
                if not os.path.exists(os.path.join(questions_dir, opt_img)):
                    missing_files.append(f"Row {row_idx}: Option image '{opt_img}' not found in media/questions/")

    if missing_files:
        return Response({
            'error': 'Missing image files',
            'details': missing_files
        }, status=status.HTTP_400_BAD_REQUEST)

    # --- PHASE 2: UPLOAD ---
    count = 0
    for row in reader:
        # Parse options if it exists and is a JSON string
        options = []
        if row.get('option'):
            try:
                options = json.loads(row['option'])
            except:
                options = [opt.strip() for opt in row['option'].split('|')] if '|' in row['option'] else []

        # Safely parse level
        raw_level = row.get('level')
        try:
            level_val = int(raw_level) if raw_level and str(raw_level).strip() else 1
        except (ValueError, TypeError):
            level_val = 1

        # Prepare image path for Django ImageField (must be relative to MEDIA_ROOT)
        img_filename = row.get('image_filename')
        image_path = None
        if img_filename:
            image_path = f"questions/{img_filename}" if not img_filename.startswith('questions/') else img_filename

        PretestQuestion.objects.create(
            question=row.get('question', ''),
            type=row.get('type', 'multiple_choice'),
            category=row.get('category', 'GENERAL'),
            level=level_val,
            option=options,
            correctAns=row.get('correctAns', ''),
            image=image_path,
            weight_decomposition=float(row.get('weight_decomposition', 0) or 0),
            weight_abstraction=float(row.get('weight_abstraction', 0) or 0),
            weight_pattern=float(row.get('weight_pattern', 0) or 0),
            weight_algorithm=float(row.get('weight_algorithm', 0) or 0)
        )
        count += 1
        
    return Response({'message': f'Successfully uploaded {count} questions'})


@api_view(['POST'])
@permission_classes([AllowAny]) # Change to IsAuthenticated/isAdmin in production
def bulk_update_weights(request):
    """
    Surgical update of question weights via CSV.
    Expects CSV with columns: id (or question_id), weight_decomposition, weight_abstraction, weight_pattern, weight_algorithm
    """
    if 'file' not in request.FILES:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
    csv_file = request.FILES['file']
    decoded_file = csv_file.read().decode('utf-8')
    io_string = io.StringIO(decoded_file)
    reader = csv.DictReader(io_string)
    
    count = 0
    errors = []
    
    for row_idx, row in enumerate(reader, start=2):
        q_id = row.get('id') or row.get('question_id')
        if not q_id:
            errors.append(f"Row {row_idx}: Missing question ID")
            continue
            
        try:
            question = PretestQuestion.objects.get(id=q_id)
            question.weight_decomposition = float(row.get('weight_decomposition', 0) or 0)
            question.weight_abstraction = float(row.get('weight_abstraction', 0) or 0)
            question.weight_pattern = float(row.get('weight_pattern', 0) or 0)
            question.weight_algorithm = float(row.get('weight_algorithm', 0) or 0)
            question.save()
            count += 1
        except PretestQuestion.DoesNotExist:
            errors.append(f"Row {row_idx}: Question with ID {q_id} not found")
        except Exception as e:
            errors.append(f"Row {row_idx}: Error updating ID {q_id} - {str(e)}")
            
    return Response({
        'message': f'Successfully updated weights for {count} questions',
        'errors': errors if errors else None
    })


@permission_classes([IsAuthenticated])
def profiling_tester_view(request):
    """
    A simple view to test the profiling quiz flow
    """
    return render(request, 'core/profiling_tester.html')
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_classes(request):
    """
    Get all unique class types and their numbers
    """
    from .models import StudentClass
    from .serializers import StudentClassSerializer
    
    classes = StudentClass.objects.all()
    serializer = StudentClassSerializer(classes, many=True)
    return Response(serializer.data)
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_materials_view(request):
    """
    Get all educational materials ordered by week
    """
    materials = Material.objects.all().order_by('course__week', 'order')
    serializer = MaterialSerializer(materials, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_courses_view(request):
    """
    GET /api/courses/
    Returns all ACTIVE courses with nested materials + real progress.
    Progress = (completed materials + completed quiz) / (total materials + 1).
    """
    from .models import Course, MaterialProgress, QuizResult
    from .serializers import CourseWithMaterialsSerializer

    # Optimize query: prefetch materials, select_related quiz
    courses = list(
        Course.objects.prefetch_related('materials')
        .select_related('quiz')
        .order_by('week', 'id')
    )

    completed_mats = set(
        MaterialProgress.objects.filter(user=request.user).values_list('material_id', flat=True)
    )
    completed_quizzes = set(
        QuizResult.objects.filter(user=request.user).values_list('quiz_id', flat=True)
    )

    serializer = CourseWithMaterialsSerializer(courses, many=True, context={'request': request})
    data = serializer.data

    for course_data, course_obj in zip(data, courses):
        all_materials = course_obj.materials.all()
        mats_count = len(all_materials)
        
        # Cek apakah quiz ada (OnetoOne reverse relation)
        quiz_obj = getattr(course_obj, 'quiz', None)
        has_quiz = quiz_obj is not None
        
        # Total item = jumlah materi + 1 (kuis asah otak)
        total_items = mats_count + (1 if has_quiz else 0)
        
        if total_items == 0:
            course_data['progress'] = 0
            continue
            
        done_mats = sum(1 for m in all_materials if m.id in completed_mats)
        done_quiz = 1 if (has_quiz and quiz_obj.id in completed_quizzes) else 0
        
        course_data['progress'] = round(((done_mats + done_quiz) / total_items) * 100)

    return Response(data)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def mark_quiz_complete(request, course_pk):
    """
    POST /api/courses/<course_pk>/quiz-complete/
    Tandai quiz Asah Otak sebagai selesai.
    """
    from .models import Course, Quiz, QuizResult

    try:
        course = Course.objects.get(pk=course_pk)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

    quiz_obj = getattr(course, 'quiz', None)
    if not quiz_obj:
        # Buat quiz otomatis jika belum ada database-nya
        quiz_obj = Quiz.objects.create(course=course)

    qresult, created = QuizResult.objects.get_or_create(
        user=request.user,
        quiz=quiz_obj,
        defaults={'percentage': 100, 'passed': True}
    )
    
    if created or qresult.points == 0:
        qresult.calculate_points()
        qresult.save()

    return Response({
        'course_id': course.id,
        'quiz_id': quiz_obj.id,
        'completed_at': qresult.completed_at,
        'already_done': not created
    })


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_course_quiz(request, course_pk):
    """
    GET /api/courses/<course_pk>/quiz/
    Returns all questions for the quiz associated with this course.
    """
    from .models import Course, Quiz, QuizQuestion
    from .serializers import QuizQuestionSerializer

    try:
        course = Course.objects.get(pk=course_pk)
        quiz = Quiz.objects.get(course=course)
        questions = QuizQuestion.objects.filter(quiz=quiz, status='APPROVED').order_by('id')
        
        # Jika tidak ada yang approved, coba ambil semua if admin/teacher, 
        # tapi untuk student hanya yang APPROVED.
        if not questions.exists() and request.user.role in ['admin', 'teacher']:
             questions = QuizQuestion.objects.filter(quiz=quiz).order_by('id')

        serializer = QuizQuestionSerializer(questions, many=True)
        return Response({
            "course": course.title,
            "questions": serializer.data
        })
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found for this course"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def submit_quiz_answers(request, course_pk):
    """
    POST /api/courses/<course_pk>/quiz-submit/
    Submit answers for a quiz, calculate score, and update leaderboard points.
    """
    from .models import Course, Quiz, QuizQuestion, QuizResult, QuizResponse
    
    try:
        course = Course.objects.get(pk=course_pk)
        quiz = Quiz.objects.get(course=course)
    except (Course.DoesNotExist, Quiz.DoesNotExist):
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = QuizSubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    time_taken = serializer.validated_data.get('time_taken', 0)
    user_responses = serializer.validated_data.get('responses', [])
    
    # Calculate score
    questions = QuizQuestion.objects.filter(quiz=quiz)
    total_questions = questions.count()
    if total_questions == 0:
        return Response({"error": "Quiz has no questions"}, status=status.HTTP_400_BAD_REQUEST)

    correct_count = 0
    responses_to_save = []

    for resp in user_responses:
        q_id = resp.get('question_id')
        user_ans = resp.get('answer', '')
        
        try:
            question = questions.get(id=q_id)
            is_correct = str(user_ans).strip().lower() == str(question.correctAns).strip().lower()
            if is_correct:
                correct_count += 1
            
            responses_to_save.append(QuizResponse(
                quiz=quiz,
                question=question,
                user=request.user,
                userAns=user_ans,
                is_correct=is_correct,
                time_taken=resp.get('time_taken', 0)
            ))
        except QuizQuestion.DoesNotExist:
            continue

    # Bulk create responses
    QuizResponse.objects.filter(user=request.user, quiz=quiz).delete() # Cleanup old attempts
    QuizResponse.objects.bulk_create(responses_to_save)

    percentage = (correct_count / total_questions) * 100
    passed = percentage >= 60 # Default passing grade

    # Update or create result
    qresult, created = QuizResult.objects.update_or_create(
        user=request.user,
        quiz=quiz,
        defaults={
            'score': correct_count,
            'total_score': total_questions,
            'percentage': percentage,
            'passed': passed,
            'time_taken': time_taken,
        }
    )
    
    # Calculate gamification points
    qresult.calculate_points()
    qresult.save()

    return Response({
        'id': qresult.id,
        'score': correct_count,
        'total_questions': total_questions,
        'percentage': percentage,
        'points': qresult.points,
        'passed': passed,
        'completed_at': qresult.completed_at
    })


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_quiz_leaderboard(request, course_pk):
    """
    GET /api/courses/<course_pk>/leaderboard/
    Returns top students for a specific quiz.
    """
    from .models import Quiz, QuizResult
    
    try:
        quiz = Quiz.objects.get(course_id=course_pk)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    # Get top 10 results by points
    results = QuizResult.objects.filter(quiz=quiz).order_by('-points', 'time_taken')[:10]
    serializer = QuizResultSerializer(results, many=True)
    
    return Response({
        "quiz_title": quiz.course.title,
        "leaderboard": serializer.data
    })


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def mark_material_complete(request, material_pk):
    """
    POST /api/materials/<material_pk>/complete/
    Tandai material sebagai selesai.
    """
    from .models import Material, MaterialProgress

    try:
        material = Material.objects.get(pk=material_pk)
    except Material.DoesNotExist:
        return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)

    progress_obj, created = MaterialProgress.objects.get_or_create(
        user=request.user,
        material=material,
    )

    return Response({
        'material_id': material.pk,
        'completed_at': progress_obj.completed_at,
        'already_done': not created
    })


# =========================================================
# 📚 ADMIN COURSE MANAGEMENT
# =========================================================

@api_view(['GET', 'POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_manage_courses(request):
    """
    GET  /api/admin/courses/  → Daftar semua courses (active + inactive) + nested materials
    POST /api/admin/courses/  → Buat course baru {title, description, week}
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    from .models import Course, Quiz
    from .serializers import CourseWithMaterialsSerializer, CourseSerializer

    if request.method == 'GET':
        courses = Course.objects.prefetch_related('materials').order_by('week', 'id')
        serializer = CourseWithMaterialsSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data)

    # POST — buat course baru
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        course = serializer.save()
        # Otomatis buatkan Quiz kosong untuk course baru
        Quiz.objects.get_or_create(course=course)
        return Response(
            CourseWithMaterialsSerializer(course, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_delete_course(request, pk):
    """
    DELETE /api/admin/courses/<pk>/
    Hapus course beserta semua materialnya.
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    from .models import Course
    try:
        course = Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    course.delete()
    return Response({"message": "Course berhasil dihapus"}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_toggle_course(request, pk):
    """
    PATCH /api/admin/courses/<pk>/toggle/
    Toggle is_active status of a course.
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    from .models import Course
    try:
        course = Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    course.is_active = not course.is_active
    course.save()
    return Response({
        "id": course.id,
        "title": course.title,
        "is_active": course.is_active,
        "message": f"Course {'diaktifkan' if course.is_active else 'dinonaktifkan'}"
    })


@api_view(['GET', 'POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_upload_material_to_course(request, course_pk):
    """
    GET  /api/admin/courses/<course_pk>/materials/ — List all materials for this course.
    POST /api/admin/courses/<course_pk>/materials/ — Upload a new material file.
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    from .models import Course
    from .serializers import MaterialSerializer

    try:
        course = Course.objects.get(pk=course_pk)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        materials = Material.objects.filter(course=course).order_by('order')
        serializer = MaterialSerializer(materials, many=True, context={'request': request})
        return Response(serializer.data)

    # POST
    serializer = MaterialSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(course=course)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================================================
# 7️⃣ QUESTION BANK MANAGEMENT (ADMIN)
# =========================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_admin_materials(request):
    """
    Get or Create new Material
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        materials = Material.objects.all().order_by('course__week', 'order')
        serializer = MaterialSerializer(materials, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        try:
            from .models import Course
            
            # Find an existing course or create a dummy one if no course provided
            course_id = request.data.get('course')
            
            if course_id:
                course = Course.objects.filter(id=course_id).first()
            else:
                course = Course.objects.first()
                if not course:
                    course = Course.objects.create(title="LogiCT Fundamentals", description="Default Course")
            
            # Pass original request.data (contains both fields and files) directly!
            serializer = MaterialSerializer(data=request.data)
            if serializer.is_valid():
                # .save() handles injecting the missing course model instance
                serializer.save(course=course)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print("ERROR IN MATERIALS POST:", tb)
            return Response({"error": str(e), "traceback": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_update_material(request, pk):
    """
    PATCH  /api/admin/materials/<pk>/ — Update file or fields of an existing material.
    DELETE /api/admin/materials/<pk>/ — Delete a material.
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    try:
        material = Material.objects.get(pk=pk)
    except Material.DoesNotExist:
        raise Http404('Material tidak ditemukan.')

    if request.method == 'DELETE':
        material.delete()
        return Response({"message": "Material berhasil dihapus"}, status=status.HTTP_200_OK)

    serializer = MaterialSerializer(material, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_qbank(request):
    """
    Get all questions for the question bank.
    Filters by status: PENDING, APPROVED, REJECTED
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response({"error": "Admin/Teacher access required"}, status=status.HTTP_403_FORBIDDEN)
    
    status_filter = request.query_params.get('status', None)
    if status_filter:
        questions = QuizQuestion.objects.filter(status=status_filter).order_by('-id')
    else:
        questions = QuizQuestion.objects.all().order_by('-id')
    
    serializer = QuizQuestionSerializer(questions, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_qbank_question(request, pk):
    """
    Update a question's status, feedback, or content.
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response({"error": "Admin/Teacher access required"}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        question = QuizQuestion.objects.get(pk=pk)
    except QuizQuestion.DoesNotExist:
        return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # We use partial=True to allow updating only status/feedback
    serializer = QuizQuestionSerializer(question, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
