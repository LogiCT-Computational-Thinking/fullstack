import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from core.models import Course, Material

def seed_materials():
    print("Seeding Course and Materials...")
    
    # 1. Create or get the default course
    course, created = Course.objects.get_or_create(
        title="Computational Thinking Fundamentals",
        defaults={
            "description": "Kursus dasar untuk memahami konsep Computational Thinking seperti dekomposisi, pengenalan pola, abstraksi, dan algoritma.",
            "thumbnail": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop"
        }
    )
    
    if created:
        print(f"Created course: {course.title}")
    else:
        print(f"Using existing course: {course.title}")

    # 2. Define Material titles for 14 weeks
    week_titles = [
        "Pengenalan Computational Thinking",
        "Dekomposisi Dasar",
        "Pengenalan Pola dalam Masalah",
        "Abstraksi dan Generalisasi",
        "Pemikiran Algoritmik",
        "Evaluasi dan Debugging",
        "Logika Matematika dalam CT",
        "Review Tengah Semester", # Week 8
        "Penerapan Animasi & Simulasi",
        "Pemecahan Masalah Kompleks Part 1",
        "Pemecahan Masalah Kompleks Part 2",
        "Kecerdasan Buatan dan CT",
        "Proyek Kolaborasi CT",
        "Final Assessment & Review"
    ]

    # 3. Create Materials for 14 weeks
    for i in range(1, 15):
        title = week_titles[i-1]
        # We don't need real files here, just the path in the database.
        # The user will upload the actual files to media/materials/weekX.pdf
        filename = f"week{i}.pdf"
        
        material, m_created = Material.objects.get_or_create(
            course=course,
            week=i,
            defaults={
                "title": title,
                "description": f"Materi pembelajaran mandiri untuk {title} pada Minggu ke-{i}.",
                "file_type": "pdf",
                "file": f"materials/{filename}",
                "order": 1
            }
        )
        
        if m_created:
            print(f"Created Material: Week {i} - {title}")
        else:
            # Update title and file path if already exists
            material.title = title
            material.file = f"materials/{filename}"
            material.save()
            print(f"Updated Material: Week {i} - {title}")

    print("Success! Dummy materials created. Please ensure files are placed in myproject/media/materials/")

if __name__ == "__main__":
    # Ensure media directory exists
    os.makedirs('media/materials', exist_ok=True)
    seed_materials()
