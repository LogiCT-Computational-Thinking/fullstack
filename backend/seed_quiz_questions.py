import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Course, Quiz, QuizQuestion

def seed_questions():
    courses = Course.objects.all()
    if not courses.exists():
        print("No courses found. Please ensure courses are seeded first.")
        return

    # Questions template (will be adapted per course)
    question_templates = [
        {
            "question": "What is the core concept of {topic} in Computational Thinking?",
            "type": "multiple_choice",
            "option": ["Option A", "Option B", "Option C", "Option D"],
            "correctAns": "Option A",
            "solution": "Explanation for why Option A is correct for {topic}.",
            "score": 20.0
        },
        {
            "question": "Which of these is a direct benefit of applying {topic}?",
            "type": "multiple_choice",
            "option": ["Efficiency", "Complexity", "Confusion", "Delay"],
            "correctAns": "Efficiency",
            "solution": "Applying {topic} makes problem-solving more efficient.",
            "score": 20.0
        },
        {
            "question": "Is it true that {topic} can only be used in computer science?",
            "type": "true_false",
            "option": ["TRUE", "FALSE"],
            "correctAns": "FALSE",
            "solution": "Computational Thinking elements like {topic} are applicable in daily life.",
            "score": 20.0
        },
        {
            "question": "Which are examples of {topic} in practice? (Select all that apply)",
            "type": "multi_select",
            "option": ["Breaking down a recipe", "Solving a puzzle", "Watching TV", "Sleeping"],
            "correctAns": "Breaking down a recipe,Solving a puzzle",
            "solution": "Both breaking down a recipe and solving a puzzle require {topic}.",
            "score": 20.0
        },
        {
            "question": "Type the single word that describes the essence of {topic}:",
            "type": "short_answer",
            "option": [],
            "correctAns": "{topic}",
            "solution": "The essence of {topic} is {topic}.",
            "score": 20.0
        }
    ]

    from django.utils import timezone
    from datetime import timedelta

    for course in courses:
        topic = course.title
        print(f"Preparing quiz for Course: {topic}")
        
        # Ensure Quiz exists
        quiz, created = Quiz.objects.get_or_create(course=course)
        quiz.deadline = timezone.now() + timedelta(days=7)
        quiz.time_limit = 1800
        quiz.save()
        
        if created:
            print(f"Created new Quiz for {topic}")
        
        # Clear existing questions for a clean seed (optional, but requested for testing)
        quiz.questions.all().delete()
        
        for q_tpl in question_templates:
            QuizQuestion.objects.create(
                quiz=quiz,
                question=q_tpl["question"].format(topic=topic),
                type=q_tpl["type"],
                option=q_tpl["option"],
                correctAns=q_tpl["correctAns"].format(topic=topic),
                solution=q_tpl["solution"].format(topic=topic),
                score=q_tpl["score"],
                status='APPROVED'
            )
        print(f"Seeded 5 questions for {topic}")

if __name__ == '__main__':
    seed_questions()
