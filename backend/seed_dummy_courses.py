import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Course, Material
from django.core.files.base import ContentFile

def seed_courses():
    print("Seeding 16 courses with 2 materials each...")
    
    ct_topics = [
        "Pengantar Computational Thinking",
        "Dekomposisi Masalah",
        "Pengenalan Pola",
        "Abstraksi",
        "Algoritma & Flowchart",
        "Pseudocode & Coding Dasar",
        "Struktur Data Dasar",
        "Perulangan & Kondisi",
        "Fungsi & Modularisasi",
        "Debugging & Problem Solving",
        "Kompleksitas Algoritma",
        "Rekursi",
        "CT dalam Kehidupan Nyata",
        "Proyek Akhir Bagian 1",
        "Proyek Akhir Bagian 2",
        "Presentasi & Evaluasi"
    ]

    for i, topic in enumerate(ct_topics, start=1):
        course, created = Course.objects.update_or_create(
            week=i,
            defaults={
                "title": topic,
                "description": f"Materi pembelajaran mandiri untuk {topic} pada Minggu ke-{i}.",
                "is_active": True
            }
        )
        
        status = "Created" if created else "Updated"
        print(f"{status} Course: Week {course.week} - {course.title}")

        # Create 2 materials for each course
        material_types = [
            {"title": f"Slide {topic}", "file_type": "ppt", "order": 1},
            {"title": f"Modul {topic}", "file_type": "pdf", "order": 2}
        ]

        for m_data in material_types:
            material, m_created = Material.objects.update_or_create(
                course=course,
                title=m_data["title"],
                defaults={
                    "description": f"Dapatkan pemahaman mendalam tentang {m_data['title']}.",
                    "file_type": m_data["file_type"],
                    "order": m_data["order"]
                }
            )
            
            if m_created or not material.file:
                # Add a dummy file if it doesn't exist
                ext = "pptx" if m_data["file_type"] == "ppt" else "pdf"
                dummy_content = f"This is a dummy {ext} content for {material.title}.".encode('utf-8')
                material.file.save(f"dummy_w{course.week}_{m_data['order']}.{ext}", ContentFile(dummy_content))
                print(f"  - Created Material: {material.title}")
            else:
                print(f"  - Updated Material: {material.title}")

    print("\nSeeding completed successfully! Total 16 courses and 32 materials.")

if __name__ == "__main__":
    seed_courses()
