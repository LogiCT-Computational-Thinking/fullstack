from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg, Sum
from .models import QuizResult

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_dashboard_stats(request):
    """
    Endpoint untuk mengambil statistik dashboard mahasiswa.
    Menghitung durasi belajar, percobaan, akurasi, dan pilar CT.
    """
    user = request.user
    
    # 1. Ambil semua hasil kuis mahasiswa ini
    results = QuizResult.objects.filter(user=user)
    
    # 2. Hitung Metrik Utama (Quick Stats)
    total_attempts = results.count()
    avg_accuracy = results.aggregate(Avg('percentage'))['percentage__avg'] or 0.0
    topics_completed = results.filter(passed=True).count()
    total_seconds = results.aggregate(Sum('time_taken'))['time_taken__sum'] or 0
    
    # Konversi detik ke format "Xh Ym"
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    study_duration = f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m"
    
    # 3. Skor CT Fondasi (Radar Chart)
    ct_distribution = {
        "decomposition": user.ct_decomposition,
        "abstraction": user.ct_abstraction,
        "pattern": user.ct_pattern,
        "algorithm": user.ct_algorithm
    }
    
    # Overall Score adalah rata-rata dari 4 pilar
    ct_scores = [user.ct_decomposition, user.ct_abstraction, user.ct_pattern, user.ct_algorithm]
    overall_score = sum(ct_scores) / 4 if any(ct_scores) else 0
    
    # 4. Cognitive Style (Untuk Profil)
    cognitive_style = {
        "tp": user.cog_tp_value,
        "ga": user.cog_ga_value,
        "ir": user.cog_ir_value
    }
    
    return Response({
        "quick_stats": {
            "study_duration": study_duration,
            "attempt": total_attempts,
            "accuracy": round(avg_accuracy, 1),
            "topics_completed": topics_completed
        },
        "ct_distribution": ct_distribution,
        "overall_score": round(overall_score, 1),
        "cognitive_style": cognitive_style,
        "mastery_streak": 0 # Placeholder untuk pengembangan selanjutnya
    })
