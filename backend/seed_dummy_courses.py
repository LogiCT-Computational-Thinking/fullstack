import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Course, Material
from django.core.files.base import ContentFile

def seed_courses():
    print("Seeding dummy courses and materials...")
    
    courses_data = [
        {
            "title": "Dasar Pemrograman Python",
            "description": "Kursus pengenalan pemrograman menggunakan bahasa Python.",
            "materials": [
                {"title": "Pengenalan Sintaks Python", "week": 1},
                {"title": "Struktur Kontrol & Loop", "week": 2}
            ]
        },
        {
            "title": "Web Development Dasar",
            "description": "Mempelajari dasar-dasar pembuatan website dengan HTML, CSS, dan JS.",
            "materials": [
                {"title": "Struktur HTML & Styling CSS", "week": 1},
                {"title": "Interaktivitas dengan Javascript", "week": 2}
            ]
        },
        {
            "title": "Analisis Data dengan Python",
            "description": "Teknik analisis data menggunakan library Pandas dan Matplotlib.",
            "materials": [
                {"title": "Eksplorasi Data dengan Pandas", "week": 1},
                {"title": "Visualisasi Data Dasar", "week": 2}
            ]
        }
    ]

    for data in courses_data:
        course, created = Course.objects.get_or_create(
            title=data["title"],
            defaults={"description": data["description"]}
        )
        
        if created:
            print(f"Created Course: {course.title}")
        else:
            print(f"Course already exists: {course.title}")

        for m_data in data["materials"]:
            material, m_created = Material.objects.get_or_create(
                course=course,
                title=m_data["title"],
                week=m_data["week"],
                defaults={
                    "description": f"Materi untuk {m_data['title']}",
                    "file_type": "pdf"
                }
            )
            
            if m_created:
                # Add a dummy file
                dummy_content = b"This is a dummy PDF content."
                material.file.save(f"dummy_{course.id}_{m_data['week']}.pdf", ContentFile(dummy_content))
                print(f"  - Created Material: {material.title}")
            else:
                print(f"  - Material already exists: {material.title}")

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_courses()
