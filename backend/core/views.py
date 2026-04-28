import os, csv, json, io, logging, requests
from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .authentication import CustomJWTAuthentication
from django.contrib.auth.hashers import check_password, make_password
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
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
 
logger = logging.getLogger(__name__)


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
            google_requests.Request(), 
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
            google_requests.Request(),
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
            'error': 'This email address is not registered in our system.'
        }, status=status.HTTP_404_NOT_FOUND)
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
        
        # Check if new password is same as old password
        if check_password(new_password, user.password):
            return Response({'error': 'Password baru tidak boleh sama dengan password lama.'}, status=status.HTTP_400_BAD_REQUEST)

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
        
        # Check if new password is same as old password
        if check_password(new_password, user.password):
            return Response({'error': 'Password baru tidak boleh sama dengan password lama.'}, status=status.HTTP_400_BAD_REQUEST)

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
    Get randomized profiling questions (pinned for the session)
    Returns questions + saved state (step, cognitive_answers, pedagogic_answers)
    """
    from .models import ProfilingAttempt, PretestQuestion
    from .serializers import PretestQuestionSerializer
    
    attempt, created = ProfilingAttempt.objects.get_or_create(user=request.user)
    
    if created or attempt.questions.count() == 0:
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
        
        # Combine all questions
        cognitive_questions = cognitive_tp + cognitive_ga + cognitive_ir
        random.shuffle(cognitive_questions)
        
        all_questions = pedagogy_questions + cognitive_questions
        
        # Save to pinned attempt
        attempt.questions.set(all_questions)
        attempt.save()
    else:
        # Pinned questions already exist
        all_questions = list(attempt.questions.all())

    serializer = PretestQuestionSerializer(all_questions, many=True)
    return Response({
        "questions": serializer.data,
        "saved_state": {
            "step": attempt.step,
            "form_data": attempt.form_data,
            "cognitive_answers": attempt.cognitive_answers,
            "pedagogic_answers": attempt.pedagogic_answers
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_profiling_draft(request):
    """
    Saves a draft of the profiling quiz (step, answers).
    POST /api/profiling/save-draft/
    """
    from .models import ProfilingAttempt
    attempt, _ = ProfilingAttempt.objects.get_or_create(user=request.user)
    
    step = request.data.get('step')
    form_data = request.data.get('form_data')
    cog_ans = request.data.get('cognitive_answers')
    ped_ans = request.data.get('pedagogic_answers')
    
    if step is not None:
        attempt.step = step
    if form_data is not None:
        attempt.form_data = form_data
    if cog_ans is not None:
        attempt.cognitive_answers = cog_ans
    if ped_ans is not None:
        attempt.pedagogic_answers = ped_ans
        
    attempt.save()
    return Response({"status": "saved"})


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
    
    # Cleanup profiling attempt on success
    from .models import ProfilingAttempt
    ProfilingAttempt.objects.filter(user=user).delete()
    
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
    Get all active educational materials ordered by week
    """
    materials = Material.objects.filter(is_active=True).order_by('course__week', 'order')
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
    from .models import Course, MaterialProgress, QuizResult, Material
    from .serializers import CourseWithMaterialsSerializer
    from django.db.models import Prefetch

    # Optimize query: filter active courses, prefetch ONLY active materials, select_related quiz
    courses = list(
        Course.objects.filter(is_active=True)
        .prefetch_related(
            Prefetch('materials', queryset=Material.objects.filter(is_active=True).order_by('order'))
        )
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
        course = Course.objects.get(pk=course_pk, is_active=True)
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
    Returns pinned questions for the quiz attempt, including progress and remaining time.
    """
    from .models import Course, Quiz, QuizQuestion, QuizAttempt, QuizResponse
    from .serializers import QuizQuestionSerializer
    from django.utils import timezone

    try:
        course = Course.objects.get(pk=course_pk, is_active=True)
        quiz = Quiz.objects.get(course=course)

        # Access check for students
        if request.user.role not in ['admin', 'teacher']:
            now = timezone.now()
            if not quiz.is_active:
                return Response({'error': 'Kuis ini sedang dinonaktifkan.'}, status=status.HTTP_403_FORBIDDEN)
            if quiz.start_date and now < quiz.start_date:
                local_start = timezone.localtime(quiz.start_date)
                return Response({'error': f'Kuis ini belum dimulai. Silakan kembali pada {local_start.strftime("%d %b %Y %H:%M")} WIB'}, status=status.HTTP_403_FORBIDDEN)
            if quiz.deadline and now > quiz.deadline and not quiz.allow_late_submission:
                return Response({'error': 'Batas waktu pengerjaan kuis ini telah berakhir.'}, status=status.HTTP_403_FORBIDDEN)
        
        # 1. Get or create attempt
        attempt, created = QuizAttempt.objects.get_or_create(user=request.user, quiz=quiz)
        
        # 2. If it's a new attempt OR existing attempt has no questions, pick 5 random questions
        if created or attempt.questions.count() == 0:
            questions_pool = QuizQuestion.objects.filter(quiz=quiz, status='APPROVED').order_by('?')
            if not questions_pool.exists() and request.user.role in ['admin', 'teacher']:
                questions_pool = QuizQuestion.objects.filter(quiz=quiz).order_by('?')
            
            selected_questions = questions_pool[:5]
            attempt.questions.set(selected_questions)
        
        # 3. Get existing responses (draft progress)
        existing_responses = QuizResponse.objects.filter(user=request.user, quiz=quiz)
        responses_dict = {r.question_id: r.userAns for r in existing_responses}
        
        # 4. Calculate remaining time
        now = timezone.now()
        elapsed = (now - attempt.started_at).total_seconds()
        remaining_time = max(0, quiz.time_limit - elapsed)
        
        # 5. Serialize questions and inject user answers
        questions = attempt.questions.all()
        serializer = QuizQuestionSerializer(questions, many=True)
        
        # Add 'user_answer' to each question data
        questions_data = []
        for q_data in serializer.data:
            q_data['user_answer'] = responses_dict.get(q_data['id'], '')
            questions_data.append(q_data)

        return Response({
            "course": course.title,
            "deadline": quiz.deadline,
            "time_limit": quiz.time_limit,
            "remaining_time": int(remaining_time),
            "started_at": attempt.started_at,
            "is_submitted": attempt.is_submitted,
            "questions": questions_data
        })
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found for this course"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def save_quiz_answer(request, course_pk):
    """
    POST /api/courses/<course_pk>/quiz-save-answer/
    Saves a draft answer for a question in a quiz attempt.
    """
    from .models import Course, Quiz, QuizQuestion, QuizResponse
    
    q_id = request.data.get('question_id')
    user_ans = request.data.get('answer', '')
    time_taken = request.data.get('time_taken', 0)

    try:
        course = Course.objects.get(pk=course_pk, is_active=True)
        quiz = Quiz.objects.get(course=course)

        # Access check for students
        if request.user.role not in ['admin', 'teacher']:
            now = timezone.now()
            if not quiz.is_active:
                return Response({'error': 'Kuis ini sedang dinonaktifkan.'}, status=status.HTTP_403_FORBIDDEN)
            if quiz.start_date and now < quiz.start_date:
                local_start = timezone.localtime(quiz.start_date)
                return Response({'error': f'Kuis ini belum dimulai. Silakan kembali pada {local_start.strftime("%d %b %Y %H:%M")} WIB'}, status=status.HTTP_403_FORBIDDEN)
            if quiz.deadline and now > quiz.deadline and not quiz.allow_late_submission:
                return Response({'error': 'Batas waktu pengerjaan kuis ini telah berakhir.'}, status=status.HTTP_403_FORBIDDEN)
        question = QuizQuestion.objects.get(pk=q_id, quiz=quiz)
        
        # Update or create response
        response, created = QuizResponse.objects.update_or_create(
            user=request.user,
            quiz=quiz,
            question=question,
            defaults={
                'userAns': user_ans,
                'time_taken': time_taken
            }
        )
        return Response({"status": "saved", "question_id": q_id})
    except (Course.DoesNotExist, Quiz.DoesNotExist, QuizQuestion.DoesNotExist):
        return Response({"error": "Resource not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def submit_quiz_answers(request, course_pk):
    """
    POST /api/courses/<course_pk>/quiz-submit/
    Submit answers for a quiz, calculate score, and update leaderboard points.
    """
    from .models import Course, Quiz, QuizQuestion, QuizResult, QuizResponse, QuizAttempt
    
    try:
        course = Course.objects.get(pk=course_pk, is_active=True)
        quiz = Quiz.objects.get(course=course)

        # Access check for students
        if request.user.role not in ['admin', 'teacher']:
            now = timezone.now()
            if not quiz.is_active:
                return Response({'error': 'Kuis ini sedang dinonaktifkan.'}, status=status.HTTP_403_FORBIDDEN)
            if quiz.start_date and now < quiz.start_date:
                local_start = timezone.localtime(quiz.start_date)
                return Response({'error': f'Kuis ini belum dimulai. Silakan kembali pada {local_start.strftime("%d %b %Y %H:%M")} WIB'}, status=status.HTTP_403_FORBIDDEN)
            if quiz.deadline and now > quiz.deadline and not quiz.allow_late_submission:
                return Response({'error': 'Batas waktu pengerjaan kuis ini telah berakhir.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Prevent multiple submissions (Only once policy)
        if QuizResult.objects.filter(user=request.user, quiz=quiz).exists():
            return Response({
                "error": "You have already completed this quiz. Results cannot be modified."
            }, status=status.HTTP_400_BAD_REQUEST)
    except (Course.DoesNotExist, Quiz.DoesNotExist):
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = QuizSubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    time_taken = serializer.validated_data.get('time_taken', 0)
    user_responses = serializer.validated_data.get('responses', [])
    
    # Calculate score based on SUBMITTED questions
    total_questions = len(user_responses)
    if total_questions == 0:
        return Response({"error": "No answers submitted"}, status=status.HTTP_400_BAD_REQUEST)

    all_quiz_questions = QuizQuestion.objects.filter(quiz=quiz)

    correct_count = 0
    responses_to_save = []

    for resp in user_responses:
        q_id = resp.get('question_id')
        user_ans = resp.get('answer', '')
        
        try:
            question = all_quiz_questions.get(id=q_id)
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

    # ── Reinforcement Learning (RL) Integration (Asah Otak) ───────────────
    # Run RL evaluation in the background so the response is returned immediately.
    import threading

    def run_rl_evaluation(user, responses):
        try:
            current_cognitive = user.preferences or "3TGR"
            final_recommended_cognitive = None

            for r in responses:
                eval_payload = {
                    "answer": r.userAns or "",
                    "correct_answer": r.question.correctAns or "",
                    "active_question": r.question.question or "",
                    "wrong_count": 0,
                    "cognitive": current_cognitive,
                    "session_id": f"student-{user.id}",
                    "t_answer_seconds": float(r.time_taken),
                    "category": "Penggalang"
                }

                rl_url = f"{settings.LLM_ENGINE_URL}/evaluate"
                rl_res = requests.post(rl_url, json=eval_payload, timeout=10)

                if rl_res.status_code == 200:
                    rl_data = rl_res.json()
                    rl_info = rl_data.get("rl")
                    if rl_info and rl_info.get("next_cognitive"):
                        final_recommended_cognitive = rl_info.get("next_cognitive")

            if final_recommended_cognitive and final_recommended_cognitive != current_cognitive:
                user.preferences = final_recommended_cognitive
                user.save()
                logger.info(f"[RL] Style updated for {user.email}: {current_cognitive} -> {final_recommended_cognitive}")

        except Exception as e:
            logger.error(f"[RL] Background evaluation error: {str(e)}")

    rl_thread = threading.Thread(target=run_rl_evaluation, args=(request.user, responses_to_save), daemon=True)
    rl_thread.start()


    # Mark the attempt as submitted
    try:
        attempt = QuizAttempt.objects.get(user=request.user, quiz=quiz)
        attempt.is_submitted = True
        attempt.save()
    except QuizAttempt.DoesNotExist:
        pass

    # Format response for frontend (Showing only what was answered)
    formatted_questions = []
    # Fetch questions in the order they were submitted to maintain experience
    for resp in user_responses:
        q_id = resp.get('question_id')
        try:
            q = all_quiz_questions.get(id=q_id)
        except QuizQuestion.DoesNotExist:
            continue
            
        user_ans = resp.get('answer', '')
        
        is_correct = False
        if user_ans is not None:
            is_correct = str(user_ans).strip().lower() == str(q.correctAns).strip().lower()
        
        status_label = 'skipped' if user_ans is None else ('correct' if is_correct else 'wrong')
        
        formatted_questions.append({
            'id': q.id,
            'text': q.question,
            'type': q.type,
            'timeSpent': f"{resp.get('time_taken', 0)}s" if resp else '0s',
            'status': status_label,
            'correctAnswer': q.correctAns,
            'userAnswer': user_ans,
            'aiFeedback': q.solution or "No explanation available."
        })

    # Helper for time formatting
    minutes = time_taken // 60
    seconds = time_taken % 60
    time_str = f"{minutes}m {seconds}s"

    return Response({
        'courseTitle': course.title,
        'courseWeek': course.week,
        'finishedAt': qresult.completed_at,
        'totalQuestions': total_questions,
        'correctCount': correct_count,
        'wrongCount': total_questions - correct_count - (total_questions - len(user_responses)),
        'skippedCount': total_questions - len(user_responses),
        'accuracyScore': round(percentage),
        'timeSpent': time_str,
        'questions': formatted_questions
    })


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_quiz_result(request, course_pk):
    """
    GET /api/courses/<course_pk>/quiz-result/
    Returns the formatted result of the latest quiz attempt for this course.
    """
    from .models import Course, Quiz, QuizQuestion, QuizResult, QuizResponse
    
    try:
        course = Course.objects.get(pk=course_pk, is_active=True)
        quiz = Quiz.objects.get(course=course)

        # Access check for students
        if request.user.role not in ['admin', 'teacher']:
            now = timezone.now()
            if not quiz.is_active:
                return Response({'error': 'Kuis ini sedang dinonaktifkan.'}, status=status.HTTP_403_FORBIDDEN)
            if quiz.start_date and now < quiz.start_date:
                local_start = timezone.localtime(quiz.start_date)
                return Response({'error': f'Kuis ini belum dimulai. Silakan kembali pada {local_start.strftime("%d %b %Y %H:%M")} WIB'}, status=status.HTTP_403_FORBIDDEN)
            if quiz.deadline and now > quiz.deadline and not quiz.allow_late_submission:
                return Response({'error': 'Batas waktu pengerjaan kuis ini telah berakhir.'}, status=status.HTTP_403_FORBIDDEN)
    except (Course.DoesNotExist, Quiz.DoesNotExist):
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        qresult = QuizResult.objects.get(user=request.user, quiz=quiz)
    except QuizResult.DoesNotExist:
        return Response({"error": "No result found for this quiz"}, status=status.HTTP_404_NOT_FOUND)

    user_responses = QuizResponse.objects.filter(user=request.user, quiz=quiz).select_related('question')
    total_questions = user_responses.count()

    formatted_questions = []
    for resp in user_responses:
        q = resp.question
        user_ans = resp.userAns
        is_correct = resp.is_correct
        
        status_label = 'correct' if is_correct else 'wrong'
        
        formatted_questions.append({
            'id': q.id,
            'text': q.question,
            'type': q.type,
            'timeSpent': f"{resp.time_taken}s",
            'status': status_label,
            'correctAnswer': q.correctAns,
            'userAnswer': user_ans,
            'aiFeedback': q.solution or "No explanation available."
        })

    minutes = qresult.time_taken // 60
    seconds = qresult.time_taken % 60
    time_str = f"{minutes}m {seconds}s"

    return Response({
        'courseTitle': course.title,
        'courseWeek': course.week,
        'finishedAt': qresult.completed_at,
        'totalQuestions': total_questions,
        'correctCount': int(qresult.score),
        'wrongCount': total_questions - int(qresult.score),
        'skippedCount': 0,
        'accuracyScore': round(qresult.percentage),
        'timeSpent': time_str,
        'questions': formatted_questions
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
        material = Material.objects.get(pk=material_pk, is_active=True, course__is_active=True)
    except Material.DoesNotExist:
        return Response({'error': 'Material not found or inactive'}, status=status.HTTP_404_NOT_FOUND)

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


@api_view(['PATCH'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_update_quiz_settings(request, course_pk):
    """
    PATCH /api/admin/courses/<course_pk>/toggle-quiz/
    Update quiz settings (is_active, start_date, deadline).
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    from .models import Quiz, Course
    try:
        course = Course.objects.get(pk=course_pk)
        quiz, created = Quiz.objects.get_or_create(course=course)
    except Course.DoesNotExist:
        return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

    # Handle explicit changes from request.data
    if 'is_active' in request.data:
        quiz.is_active = request.data['is_active']
    elif not request.data:
        # Fallback for simple toggle call without body
        quiz.is_active = not quiz.is_active

    if 'start_date' in request.data:
        quiz.start_date = request.data['start_date'] or None
    if 'deadline' in request.data:
        quiz.deadline = request.data['deadline'] or None
    
    if 'allow_late_submission' in request.data:
        quiz.allow_late_submission = request.data['allow_late_submission']
    if 'time_limit' in request.data:
        try:
            quiz.time_limit = int(request.data['time_limit'])
        except (ValueError, TypeError):
            pass

    quiz.save()
    return Response({
        "id": quiz.id,
        "course_id": course.id,
        "is_active": quiz.is_active,
        "start_date": quiz.start_date,
        "deadline": quiz.deadline,
        "time_limit": quiz.time_limit,
        "message": "Pengaturan kuis berhasil diperbarui"
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
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_qbank_image_view(request):
    """
    POST /api/admin/qbank/upload-image/
    Upload image specifically for Question Bank options.
    Saves to 'media/asah otak/'
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    image = request.FILES['image']
    
    # Check extension
    ext = os.path.splitext(image.name)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png']:
        return Response({'error': 'Only JPEG and PNG are allowed'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create unique filename
    import time
    filename = f"q_{int(time.time())}_{image.name.replace(' ', '_')}"
    relative_path = os.path.join('asah otak', filename)
    full_path = os.path.join(settings.MEDIA_ROOT, relative_path)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    # Save file
    try:
        with open(full_path, 'wb+') as destination:
            for chunk in image.chunks():
                destination.write(chunk)
                
        # Return the absolute URL
        image_url = request.build_absolute_uri(settings.MEDIA_URL + relative_path)
        # Fix path separator issues if any
        image_url = image_url.replace('\\', '/')
        
        return Response({
            'message': 'Image uploaded successfully',
            'url': image_url
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """
    GET /api/admin/dashboard/stats/
    Get real-time statistics for the admin dashboard.
    """
    if request.user.role not in ['teacher', 'admin']:
        return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    from .models import User, Course, QuizQuestion, QuizResult
    from django.utils import timezone
    from datetime import timedelta

    today = timezone.now().date()
    
    total_users = User.objects.filter(role='student').count()
    total_admins = User.objects.filter(role__in=['admin', 'teacher']).count()
    total_courses = Course.objects.count()
    total_questions = QuizQuestion.objects.count()
    
    # Active today: users who completed at least one quiz today
    active_today = QuizResult.objects.filter(completed_at__date=today).values('user').distinct().count()

    # 1. Activity Data (Last 7 Days)
    activity_data = []
    days_map = {0: 'Senin', 1: 'Selasa', 2: 'Rabu', 3: 'Kamis', 4: 'Jumat', 5: 'Sabtu', 6: 'Minggu'}
    colors_map = ['#8B5CF6', '#EC4899', '#06B6D4', '#FACC15', '#3B82F6', '#10B981', '#6366F1']
    
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        count = QuizResult.objects.filter(completed_at__date=target_date).count()
        day_index = target_date.weekday()
        activity_data.append({
            'name': days_map[day_index],
            'value': count,
            'color': colors_map[day_index]
        })

    # 2. Cognitive Distribution
    from .models import ProfilingArchetype
    all_prefs = User.objects.filter(role='student', is_profiled=True).values_list('preferences', flat=True)
    stats_cog = {}
    for pref in all_prefs:
        if pref and len(pref) >= 3:
            code = pref[-3:].upper()
            stats_cog[code] = stats_cog.get(code, 0) + 1
    
    color_map_archetypes = {
        'PAR': '#7CC1E5', 'TAI': '#10B981', 'PGI': '#F18CBC', 'PGR': '#75DEA4',
        'TAR': '#9B6FD8', 'TGI': '#FFB84D', 'TGR': '#BDBDBD', 'PAI': '#FFB88D',
    }

    archetypes = list(ProfilingArchetype.objects.all())
    cognitive_data = []
    total_profiled = len(all_prefs)
    
    for arch in archetypes:
        count = stats_cog.get(arch.code, 0)
        perc = (count / total_profiled * 100) if total_profiled > 0 else 0
        cognitive_data.append({
            'name': arch.code,
            'value': count,
            'color': color_map_archetypes.get(arch.code, '#CCCCCC'),
            'count': count,
            'percentage': f"{perc:.1f}%"
        })

    # 3. Top Performers (Cumulative)
    from django.db.models import Sum
    top_perf = QuizResult.objects.values('user__name', 'user__student_id', 'user__profilePicture') \
        .annotate(total_points=Sum('points')) \
        .order_by('-total_points')[:6]

    formatted_top_scores = []
    for p in top_perf:
        formatted_top_scores.append({
            'name': p['user__name'],
            'id': p['user__student_id'] or 'N/A',
            'score': f"{p['total_points']:,.0f}".replace(',', '.'),
            'avatar': p['user__profilePicture'] or '/images/welkam_atas.png'
        })

    # 4. Recent Activities
    # Mix of new users and (new materials or quiz submissions)
    from django.contrib.humanize.templatetags.humanize import naturaltime
    recent_qs = QuizResult.objects.order_by('-completed_at')[:3]
    recent_users = User.objects.filter(role='student').order_by('-id')[:2]
    
    recent_activities = []
    for r in recent_qs:
        recent_activities.append({
            'type': 'quiz',
            'action': 'Kuis Selesai:',
            'detail': f"{r.user.name} ({r.quiz.course.title})",
            'time': naturaltime(r.completed_at)
        })
    for u in recent_users:
        recent_activities.append({
            'type': 'user',
            'action': 'Siswa Baru:',
            'detail': u.name,
            'time': naturaltime(u.created_at) if u.created_at else 'Baru saja'
        })

    return Response({
        "total_users": total_users,
        "total_admins": total_admins,
        "total_courses": total_courses,
        "total_questions": total_questions,
        "active_today": active_today,
        "activity_data": activity_data,
        "cognitive_data": cognitive_data,
        "top_scores": formatted_top_scores,
        "recent_activities": recent_activities
    })
