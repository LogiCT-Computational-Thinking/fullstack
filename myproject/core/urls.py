from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # API Root
    path('', views.api_root, name='api-root'),

    # ── Media file serving (iframe-friendly) ──────────────────────────────
    # Endpoint khusus agar file bisa ditampilkan di iframe tanpa blokir
    path('media/<path:file_path>', views.serve_media_file, name='serve-media-file'),

    # Authentication endpoints
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/google/', views.google_auth_view, name='google-auth'),
    path('auth/google/admin/', views.google_admin_auth_view, name='google-admin-auth'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/refresh/', views.refresh_token_view, name='refresh-token'),
    
    # User profile endpoints
    path('auth/profile/', views.user_profile_view, name='user-profile'),
    path('auth/profile/update/', views.update_profile_view, name='update-profile'),
    path('auth/profile/upload-photo/', views.upload_profile_picture_view, name='upload-photo'),
    path('auth/profiling/student-info/', views.update_student_info_view, name='update-student-info'),
    path('auth/student-classes/', views.get_student_classes, name='student-classes'),
    
    # Profiling endpoints
    path('profiling/questions/', views.get_profiling_questions, name='profiling-questions'),
    path('profiling/cognitive-submit/', views.submit_cognitive_answers, name='cognitive-submit'),
    path('profiling/submit/', views.submit_profiling_answers, name='profiling-submit'),
    path('profiling/upload-csv/', views.bulk_upload_questions, name='profiling-upload-csv'),
    path('profiling/update-weights/', views.bulk_update_weights, name='profiling-update-weights'),
    path('profiling-tester/', views.profiling_tester_view, name='profiling-tester'),
    
    # Password reset endpoints
    path('auth/forgot-password/', views.forgot_password_view, name='forgot-password'),
    path('auth/verify-otp/', views.verify_otp_view, name='verify-otp'),
    path('auth/reset-password-otp/', views.reset_password_otp_view, name='reset-password-otp'),
    path('auth/reset-password/', views.reset_password_view, name='reset-password'),
    
    # Educational Materials
    path('materials/', views.get_materials_view, name='get-materials'),
    path('materials/<int:material_pk>/complete/', views.mark_material_complete, name='mark-material-complete'),
    path('courses/', views.get_courses_view, name='get-courses'),
    path('courses/<int:course_pk>/quiz/', views.get_course_quiz, name='get-course-quiz'),
    path('courses/<int:course_pk>/quiz-submit/', views.submit_quiz_answers, name='submit-quiz-answers'),
    path('courses/<int:course_pk>/quiz-complete/', views.mark_quiz_complete, name='mark-quiz-complete'),
    path('courses/<int:course_pk>/leaderboard/', views.get_quiz_leaderboard, name='quiz-leaderboard'),

    # Question Bank Management (Admin)
    path('admin/qbank/', views.get_admin_qbank, name='admin-qbank'),
    path('admin/qbank/<int:pk>/', views.update_qbank_question, name='admin-qbank-update'),
    path('admin/materials/', views.manage_admin_materials, name='admin-materials'),

    # Course Management (Admin)
    path('admin/courses/', views.admin_manage_courses, name='admin-courses'),
    path('admin/courses/<int:pk>/delete/', views.admin_delete_course, name='admin-delete-course'),
    path('admin/courses/<int:pk>/toggle/', views.admin_toggle_course, name='admin-toggle-course'),
    path('admin/courses/<int:course_pk>/materials/', views.admin_upload_material_to_course, name='admin-upload-material'),

    # Update file on existing material (inline upload)
    path('admin/materials/<int:pk>/', views.admin_update_material, name='admin-update-material'),
]
