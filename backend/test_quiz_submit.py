import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Course, Quiz, QuizQuestion, QuizResult, QuizResponse
from django.test import RequestFactory
from core.views import submit_quiz_answers
from rest_framework_simplejwt.tokens import RefreshToken

def test_submission():
    user = User.objects.first()
    course = Course.objects.filter(is_active=True).first()
    if not user or not course:
        print("No user or course found")
        return

    quiz = Quiz.objects.get(course=course)
    questions = QuizQuestion.objects.filter(quiz=quiz)[:5]
    
    payload = {
        'time_taken': 120,
        'responses': [
            {'question_id': q.id, 'answer': 'some_ans', 'time_taken': 20}
            for q in questions
        ]
    }
    
    factory = RequestFactory()
    request = factory.post(f'/api/courses/{course.id}/quiz-submit/', data=json.dumps(payload), content_type='application/json')
    request.user = user
    
    # Extract logic from view to test directly
    try:
        # Prevent multiple submissions
        QuizResult.objects.filter(user=user, quiz=quiz).delete()
        
        # Calculate score
        total_questions = len(payload['responses'])
        correct_count = 0
        responses_to_save = []
        all_quiz_questions = QuizQuestion.objects.filter(quiz=quiz)
        
        for resp in payload['responses']:
            q_id = resp['question_id']
            user_ans = resp['answer']
            q = all_quiz_questions.get(id=q_id)
            is_correct = str(user_ans).strip().lower() == str(q.correctAns).strip().lower()
            if is_correct: correct_count += 1
            responses_to_save.append(QuizResponse(
                quiz=quiz, question=q, user=user, userAns=user_ans, is_correct=is_correct, time_taken=resp['time_taken']
            ))
            
        QuizResponse.objects.filter(user=user, quiz=quiz).delete()
        QuizResponse.objects.bulk_create(responses_to_save)
        
        percentage = (correct_count / total_questions) * 100
        passed = percentage >= 60
        
        qresult, created = QuizResult.objects.update_or_create(
            user=user, quiz=quiz,
            defaults={
                'score': correct_count, 'total_score': total_questions,
                'percentage': percentage, 'passed': passed, 'time_taken': payload['time_taken']
            }
        )
        print("Calculating points...")
        qresult.calculate_points()
        print("Saving result...")
        qresult.save()
        print("SUCCESS")
    except Exception as e:
        import traceback
        print(f"ERROR: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test_submission()
