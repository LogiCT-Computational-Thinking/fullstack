import os
import django

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Course

def seed_courses():
    courses_data = [
        {"week": 1, "title": "Pendahuluan", "description": "Pengenalan dasar Computational Thinking dan tujuan pembelajaran."},
        {"week": 2, "title": "Dasar Pemikiran Komputasional", "description": "Memahami fondasi logika dalam memecahkan masalah kompleks."},
        {"week": 3, "title": "Abstraksi", "description": "Belajar memfokuskan diri pada informasi penting dan mengabaikan detail yang tidak relevan."},
        {"week": 4, "title": "Dekomposisi", "description": "Memecah masalah besar menjadi bagian-bagian yang lebih kecil dan mudah dikelola."},
        {"week": 5, "title": "Pattern Recognition", "description": "Mengenali pola atau kesamaan dalam masalah untuk mempermudah penyelesaian."},
        {"week": 6, "title": "Algorithm - Block Programming", "description": "Implementasi algoritma menggunakan pemrograman visual berbasis blok (seperti Scratch)."},
        {"week": 7, "title": "Algorithm - Notasi Algoritma", "description": "Mempelajari cara menuliskan langkah-langkah penyelesaian masalah secara formal."},
        {"week": 8, "title": "Review & Evaluasi Tengah Semester", "description": "Mengulas materi dari minggu 1-7 dan melakukan evaluasi progres belajar."},
        {"week": 9, "title": "Elemen Pseudocode", "description": "Mempelajari sintaksis dasar pseudocode untuk merancang program."},
        {"week": 10, "title": "Struktur Percabangan", "description": "Mengontrol alur program menggunakan kondisi (If-Else)."},
        {"week": 11, "title": "Perulangan", "description": "Mengulangi instruksi secara efisien menggunakan Loop (For/While)."},
        {"week": 12, "title": "Fungsi", "description": "Mempelajari modularisasi kode dengan membuat blok fungsi yang dapat digunakan kembali."},
        {"week": 13, "title": "Pengenalan Struktur Data", "description": "Cara menyimpan dan mengatur data secara efisien di dalam memori komputer."},
        {"week": 14, "title": "Pengenalan Algoritma Pengurutan dan Pencarian", "description": "Mempelajari teknik Sorting dan Searching dasar dalam pengolahan data."},
    ]

    print("--- Memulai seeding data Course ---")
    
    for item in courses_data:
        course, created = Course.objects.update_or_create(
            week=item['week'],
            defaults={
                'title': item['title'],
                'description': item['description'],
                'is_active': True
            }
        )
        if created:
            print(f"✅ Created: Week {course.week} - {course.title}")
        else:
            print(f"🔄 Updated: Week {course.week} - {course.title}")

    print("--- Seeding selesai! ---")

if __name__ == "__main__":
    seed_courses()
