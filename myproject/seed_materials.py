import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from core.models import Course, Material

from core.models import Course, Material
from django.core.files.base import ContentFile

def seed_materials():
    print("Seeding Materials for all courses...")
    
    courses = Course.objects.all()
    if not courses.exists():
        print("No courses found. Creating a default one first.")
        course, _ = Course.objects.get_or_create(
            title="Computational Thinking Fundamentals",
            defaults={"description": "Kursus dasar Computational Thinking."}
        )
        courses = Course.objects.filter(id=course.id)

    dummy_content = b"This is dummy material content."

    for course in courses:
        print(f"Checking materials for Course: {course.title}")
        
        # We'll ensure at least 2 materials exist for each course
        materials_data = [
            {"order": 1, "title": f"Materi Dasar {course.title} - Bagian 1"},
            {"order": 2, "title": f"Materi Dasar {course.title} - Bagian 2"},
        ]
        
        for m_data in materials_data:
            material, created = Material.objects.get_or_create(
                course=course,
                order=m_data["order"],
                title=m_data["title"],
                defaults={
                    "description": f"Penjelasan dasar mengenai materi bagian ke-{m_data['order']}.",
                    "file_type": "pdf"
                }
            )
            
            if created:
                # Save dummy file to satisfy FileField
                filename = f"course_{course.id}_material_{m_data['order']}.pdf"
                material.file.save(filename, ContentFile(dummy_content))
                print(f"  - Created Material: {m_data['title']}")
            else:
                print(f"  - Material '{m_data['title']}' already exists.")

    print("Success! Materials seeding completed for all courses.")

if __name__ == "__main__":
    # Ensure media directory exists
    os.makedirs('media/materials', exist_ok=True)
    seed_materials()
