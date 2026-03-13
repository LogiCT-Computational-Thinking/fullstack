import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Quiz, QuizQuestion, Course, Material

def seed_qbank():
    print("Seeding Question Bank with dummy data...")
    
    # Clear existing dummy questions to avoid mess
    QuizQuestion.objects.filter(category='GENERAL').delete()
    
    # Get a course and quiz to attach questions to
    course = Course.objects.first()
    if not course:
        print("No course found. Please run existing seed scripts first.")
        return
    
    quiz, created = Quiz.objects.get_or_create(course=course)
    
    # Get some materials to link to
    materials = {m.course.week: m for m in Material.objects.all()}
    
    dummy_questions = [
        {
            "question": "Beni has to fill 9 squares in a grid using 3 types of stickers. Each sticker contains one picture. The rule is: in every row and every column, no sticker may be repeated.",
            "type": "short_answer",
            "category": "GENERAL",
            "level": 1,
            "weight_abstraction": 100.0,
            "status": "PENDING",
            "correctAns": "3 types (e.g. Robot, Apple, Sun)",
            "material": materials.get(1)
        },
        {
            "question": "Explain the concept of Decomposition in Computational Thinking with an example from daily life.",
            "type": "short_answer",
            "category": "GENERAL",
            "level": 3,
            "weight_decomposition": 100.0,
            "status": "PENDING",
            "correctAns": "Breaking down a recipe into individual steps.",
            "material": materials.get(2)
        },
        {
            "question": "What is the result of the following pattern recognition task? [Triangle, Square, Pentagon, ...]",
            "type": "short_answer",
            "category": "GENERAL",
            "level": 2,
            "weight_pattern": 100.0,
            "status": "PENDING",
            "correctAns": "Hexagon (6 sides)",
            "material": materials.get(3)
        },
        {
            "question": "Design a simple algorithm to make a cup of tea. List at least 5 steps.",
            "type": "short_answer",
            "category": "GENERAL",
            "level": 1,
            "weight_algorithm": 100.0,
            "status": "PENDING",
            "correctAns": "1. Boil water, 2. Put tea bag in cup, 3. Pour water, 4. Wait, 5. Enjoy.",
            "material": materials.get(5)
        },
        {
            "question": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae risus justo. Sed nec ultricies ipsum. Praesent sit amet sapien at nibh dictum faucibus.",
            "type": "short_answer",
            "category": "GENERAL",
            "level": 4,
            "weight_abstraction": 50.0,
            "weight_decomposition": 50.0,
            "status": "PENDING",
            "correctAns": "Placeholder Answer",
            "material": materials.get(4)
        },
        {
            "question": "If an algorithm takes 2 minutes for 10 items, how long will it take for 50 items if the growth is linear?",
            "type": "short_answer",
            "category": "GENERAL",
            "level": 2,
            "weight_algorithm": 100.0,
            "status": "APPROVED",
            "correctAns": "10 minutes",
            "material": materials.get(5)
        },
        {
            "question": "Analyze the following set of data and find the recurring pattern: 2, 4, 8, 16, 32...",
            "type": "short_answer",
            "category": "GENERAL",
            "level": 3,
            "weight_pattern": 100.0,
            "status": "REJECTED",
            "admin_feedback": "Terlalu mudah untuk level ini.",
            "correctAns": "Next number is 64 (multiply by 2)",
            "material": materials.get(3)
        },
        {
            "question": "How does abstraction help in simplifying complex problems?",
            "type": "short_answer",
            "category": "GENERAL",
            "level": 5,
            "weight_abstraction": 100.0,
            "status": "PENDING",
            "correctAns": "By focusing on important details and ignoring irrelevant ones.",
            "material": materials.get(4)
        },
        {
            "question": "Identify the main problem in this scenario: A car won't start, the headlights are dim, and the battery is 5 years old.",
            "type": "short_answer",
            "category": "GENERAL",
            "level": 2,
            "weight_decomposition": 100.0,
            "status": "PENDING",
            "correctAns": "The battery is dead/faulty.",
            "material": materials.get(2)
        },
        {
            "question": "Create a pattern for the next sequence: 1, 1, 2, 3, 5, 8, ...",
            "type": "short_answer",
            "category": "GENERAL",
            "level": 3,
            "weight_pattern": 100.0,
            "status": "PENDING",
            "correctAns": "13 (Fibonacci sequence)",
            "material": materials.get(3)
        }
    ]
    
    for q_data in dummy_questions:
        mat = q_data.pop('material', None)
        target_quiz = quiz # Default to first course's quiz
        
        if mat:
            # Get or create quiz for the specific course attached to the material
            target_quiz, _ = Quiz.objects.get_or_create(course=mat.course)
            
        QuizQuestion.objects.create(
            quiz=target_quiz,
            **q_data
        )
    
    print(f"Successfully seeded {len(dummy_questions)} questions.")

if __name__ == "__main__":
    seed_qbank()
