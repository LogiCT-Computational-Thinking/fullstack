from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import requests
import json
import logging

from .models import Quiz, QuizQuestion, Course
from .serializers import QuizQuestionSerializer
from .authentication import CustomJWTAuthentication

logger = logging.getLogger(__name__)

LLM_ENGINE_URL = "http://localhost:8001"

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAdminUser])
def generate_questions_view(request):
    """
    POST: Calls LLM Engine to generate 10 questions for a specific week.
    Body: { "week": <int> }
    """
    week = request.data.get('week')
    if not week:
        return Response({'error': 'Week is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Get or Create Quiz for this week
    course = Course.objects.filter(week=week).first()
    if not course:
        return Response({'error': f'Course for Week {week} not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    quiz, created = Quiz.objects.get_or_create(course=course)

    # 2. Call LLM Engine
    try:
        # LLM Engine expects /questions/generate
        response = requests.post(
            f"{LLM_ENGINE_URL}/questions/generate",
            json={"week": week},
            timeout=60 # Generating 10 questions might take time
        )
        response.raise_for_status()
        data = response.json()
        generated_questions = data.get('questions', [])

        # 3. Save to Database as PENDING
        saved_count = 0
        for q_data in generated_questions:
            # Map LLM output to Django Model
            # Assumed output format: { question, type, options, correctAns, solution }
            QuizQuestion.objects.create(
                quiz=quiz,
                question=q_data.get('question'),
                type=q_data.get('type', 'multiple_choice'),
                option=q_data.get('options', []),
                correctAns=q_data.get('correctAns', ''),
                solution=q_data.get('solution', ''),
                status='PENDING'
            )
            saved_count += 1

        return Response({
            'message': f'Successfully generated {saved_count} questions for Week {week}.',
            'count': saved_count
        }, status=status.HTTP_201_CREATED)

    except requests.RequestException as e:
        logger.error(f"Error calling LLM Engine: {str(e)}")
        return Response({'error': 'Failed to communicate with LLM Engine.'}, status=status.HTTP_502_BAD_GATEWAY)
    except Exception as e:
        logger.error(f"Error saving generated questions: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_live_questions(request):
    """
    GET: Get approved questions for current user matching their cognitive style and week.
    Query Params: ?week=<int>
    """
    week = request.query_params.get('week')
    if not week:
        return Response({'error': 'Week is required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    # Default to student's cognitive style from profile or preference
    cognitive_style = user.preferences if hasattr(user, 'preferences') else '3TGR'
    
    # 1. Fetch approved questions from DB
    course = Course.objects.filter(week=week).first()
    if not course:
        return Response({'error': f'Course for Week {week} not found.'}, status=status.HTTP_404_NOT_FOUND)

    approved_questions = QuizQuestion.objects.filter(
        quiz__course=course,
        status='APPROVED'
    )

    if not approved_questions.exists():
        return Response({'questions': []})

    # 2. Serialize and call LLM for adaptation
    questions_list = []
    for q in approved_questions:
        questions_list.append({
            'id': q.id,
            'question': q.question,
            'type': q.type,
            'options': q.option,
            'correctAns': q.correctAns,
            'solution': q.solution
        })

    try:
        # LLM Engine expects transformation based on cognitive style
        # We proxy the whole batch to LLM for styling
        response = requests.post(
            f"{LLM_ENGINE_URL}/questions/live",
            json={
                "cognitive_style": cognitive_style,
                "questions": questions_list
            },
            timeout=30
        )
        response.raise_for_status()
        adapted_data = response.json()
        
        return Response(adapted_data)

    except requests.RequestException as e:
        # Fallback to general questions if LLM adaptation fails
        logger.warning(f"Adaptation failed, returning general questions: {str(e)}")
        return Response({
            'questions': questions_list,
            'adapted': False,
            'warning': 'Using general version. Adaptation service unavailable.'
        })
