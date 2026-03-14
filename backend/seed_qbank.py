import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Quiz, QuizQuestion, Course, Material

def seed_qbank():
    print("Seeding Question Bank with 15 questions...")
    
    # Clear existing dummy questions to avoid mess
    QuizQuestion.objects.filter(category='GENERAL').delete()
    
    # Get a course and quiz as fallback
    first_course = Course.objects.first()
    if not first_course:
        print("No course found. Please run existing seed scripts first.")
        return
    
    default_quiz, _ = Quiz.objects.get_or_create(course=first_course)
    
    # Get materials to link to specific courses
    materials = {m.course.week: m for m in Material.objects.all()}
    
    dummy_questions = [
        # 1. Week 1
        {
            "question": "Apa itu Computational Thinking (CT)?",
            "type": "multiple_choice",
            "category": "GENERAL",
            "level": 1,
            "weight_abstraction": 25.0, "weight_decomposition": 25.0, "weight_pattern": 25.0, "weight_algorithm": 25.0,
            "status": "APPROVED",
            "option": ["Cara berpikir seperti komputer", "Cara memecahkan masalah kompleks secara sistematis", "Belajar coding bahasa Python", "Membongkar pasang komponen komputer"],
            "correctAns": "Cara memecahkan masalah kompleks secara sistematis",
            "week_hint": 1
        },
        # 2. Week 1
        {
            "question": "Manakah yang merupakan 4 pilar utama dalam Computational Thinking?",
            "type": "multi_select",
            "category": "GENERAL",
            "level": 1,
            "weight_decomposition": 100.0,
            "status": "APPROVED",
            "option": ["Dekomposisi", "Abstraksi", "Koding", "Pengenalan Pola", "Algoritma", "Hardware"],
            "correctAns": "Dekomposisi|Abstraksi|Pengenalan Pola|Algoritma",
            "week_hint": 1
        },
        # 3. Week 2
        {
            "question": "Jika Anda ingin membuat aplikasi restoran raksasa, langkah pertama adalah membaginya menjadi modul: Pemesanan, Pembayaran, dan Dapur. Teknik ini disebut...",
            "type": "multiple_choice",
            "category": "GENERAL",
            "level": 2,
            "weight_decomposition": 100.0,
            "status": "APPROVED",
            "option": ["Abstraksi", "Dekomposisi", "Iterasi", "Debugging"],
            "correctAns": "Dekomposisi",
            "week_hint": 2
        },
        # 4. Week 3
        {
            "question": "Lanjutkan pola berikut: 1, 4, 9, 16, ...",
            "type": "short_answer",
            "category": "GENERAL",
            "level": 2,
            "weight_pattern": 100.0,
            "status": "APPROVED",
            "correctAns": "25",
            "week_hint": 3
        },
        # 5. Week 4
        {
            "question": "Menghilangkan detail yang tidak relevan dan fokus pada informasi penting disebut...",
            "type": "multiple_choice",
            "category": "GENERAL",
            "level": 2,
            "weight_abstraction": 100.0,
            "status": "APPROVED",
            "option": ["Pattern Recognition", "Abstraction", "Algorithm", "Decomposition"],
            "correctAns": "Abstraction",
            "week_hint": 4
        },
        # 6. Week 5
        {
            "question": "Langkah-langkah instruksi yang terurut untuk menyelesaikan masalah disebut...",
            "type": "multiple_choice",
            "category": "GENERAL",
            "level": 1,
            "weight_algorithm": 100.0,
            "status": "APPROVED",
            "option": ["Algoritma", "Logika", "Aritmatika", "Data"],
            "correctAns": "Algoritma",
            "week_hint": 5
        },
        # 7. Week 5
        {
            "question": "Simbol 'Belah Ketupat' dalam flowchart biasanya digunakan untuk...",
            "type": "multiple_choice",
            "category": "GENERAL",
            "level": 2,
            "weight_algorithm": 100.0,
            "status": "APPROVED",
            "option": ["Mulai/Selesai", "Proses", "Input/Output", "Keputusan (Decision)"],
            "correctAns": "Keputusan (Decision)",
            "week_hint": 5
        },
        # 8. Week 8
        {
            "question": "Salah satu bentuk perulangan dalam pemrograman adalah 'while loop'.",
            "type": "true_false",
            "category": "GENERAL",
            "level": 1,
            "weight_algorithm": 100.0,
            "status": "APPROVED",
            "correctAns": "True",
            "week_hint": 8
        },
        # 9. Week 10
        {
            "question": "Apa langkah pertama yang sebaiknya dilakukan saat menemukan 'bug' dalam program?",
            "type": "multiple_choice",
            "category": "GENERAL",
            "level": 3,
            "weight_decomposition": 50.0, "weight_algorithm": 50.0,
            "status": "APPROVED",
            "option": ["Menghapus semua kode", "Menyalahkan komputer", "Mereproduksi bug untuk memahami kapan terjadi", "Langsung menulis kode baru"],
            "correctAns": "Mereproduksi bug untuk memahami kapan terjadi",
            "week_hint": 10
        },
        # 10. Week 7
        {
            "question": "Struktur data yang menyimpan sekumpulan elemen dengan tipe data yang sama dan dapat diakses melalui indeks adalah...",
            "type": "multiple_choice",
            "category": "GENERAL",
            "level": 2,
            "weight_abstraction": 100.0,
            "status": "APPROVED",
            "option": ["Array/List", "Stack", "Queue", "Tree"],
            "correctAns": "Array/List",
            "week_hint": 7
        },
        # 11. Week 12
        {
            "question": "Fungsi yang memanggil dirinya sendiri disebut fungsi...",
            "type": "multiple_choice",
            "category": "GENERAL",
            "level": 4,
            "weight_algorithm": 100.0,
            "status": "APPROVED",
            "option": ["Iteratif", "Recursive", "Main", "Sub-routine"],
            "correctAns": "Recursive",
            "week_hint": 12
        },
        # 12. Week 3
        {
            "question": "Kemampuan melihat kesamaan atau perbedaan di antara beberapa masalah disebut...",
            "type": "multiple_choice",
            "category": "GENERAL",
            "level": 2,
            "weight_pattern": 100.0,
            "status": "APPROVED",
            "option": ["Dekomposisi", "Abstraksi", "Pengenalan Pola", "Algoritma"],
            "correctAns": "Pengenalan Pola",
            "week_hint": 3
        },
        # 13. Week 2
        {
            "question": "Memecah masalah membersihkan rumah menjadi: mencuci piring, menyapu lantai, dan membuang sampah adalah contoh penerapan...",
            "type": "multiple_choice",
            "category": "GENERAL",
            "level": 1,
            "weight_decomposition": 100.0,
            "status": "APPROVED",
            "option": ["Algoritma", "Abstraksi", "Dekomposisi", "Enkapsulasi"],
            "correctAns": "Dekomposisi",
            "week_hint": 2
        },
        # 14. Week 6
        {
            "question": "Pseudocode digunakan untuk memudahkan manusia memahami logika algoritma sebelum diubah ke kode program asli.",
            "type": "true_false",
            "category": "GENERAL",
            "level": 1,
            "weight_abstraction": 100.0,
            "status": "APPROVED",
            "correctAns": "True",
            "week_hint": 6
        },
        # 15. Week 11
        {
            "question": "Notasi Big-O digunakan untuk mengukur...",
            "type": "multiple_choice",
            "category": "GENERAL",
            "level": 5,
            "weight_algorithm": 100.0,
            "status": "APPROVED",
            "option": ["Warna UI", "Kerapihan kode", "Efisiensi/Kompleksitas algoritma", "Jumlah baris kode"],
            "correctAns": "Efisiensi/Kompleksitas algoritma",
            "week_hint": 11
        }
    ]
    
    for q_data in dummy_questions:
        week = q_data.pop('week_hint', 1)
        mat = materials.get(week)
        
        target_quiz = default_quiz
        if mat:
            target_quiz, _ = Quiz.objects.get_or_create(course=mat.course)
            
        QuizQuestion.objects.create(
            quiz=target_quiz,
            **q_data
        )
    
    print(f"Successfully seeded {len(dummy_questions)} questions into the bank.")

if __name__ == "__main__":
    seed_qbank()
