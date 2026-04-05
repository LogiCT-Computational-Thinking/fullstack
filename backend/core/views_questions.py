from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from .permissions import IsTeacherOrAdmin
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import requests
import json
import logging

from .models import Quiz, QuizQuestion, Course
from .serializers import QuizQuestionSerializer
from .authentication import CustomJWTAuthentication

logger = logging.getLogger(__name__)

LLM_ENGINE_URL = "http://127.0.0.1:8001"

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsTeacherOrAdmin])
def generate_questions_view(request):
    """
    POST: Calls LLM Engine to generate 10 questions for a specific topic/week.
    Body: { 
        "week": <int>, 
        "topic_name": <str, optional>,
        "topic_text": <str, optional>,
        "week_id": <str, optional>
    }
    """
    week = request.data.get('week')
    topic_name = request.data.get('topic_name')
    topic_text = request.data.get('topic_text')
    week_id = request.data.get('week_id')

    if not week and not week_id:
        return Response({'error': 'Week or week_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Fetch Course details if topic info is missing
    target_week = week or week_id
    course = Course.objects.filter(week=target_week).first()
    
    if not course:
        return Response({'error': f'Course for Week {target_week} not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Use provided values or fallback to course data
    final_topic_name = topic_name or course.title
    final_topic_text = topic_text or course.description
    final_week_id = str(week_id or course.week)

    if not final_topic_name or not final_topic_text:
        return Response({'error': 'Topic name and description (topic_text) are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Get or Create Quiz for this week
    quiz, created = Quiz.objects.get_or_create(course=course)

    # 2. Call LLM Engine
    try:
        # LLM Engine expects: topic_name, topic_text, week_id
        payload = {
            "topic_name": final_topic_name,
            "topic_text": final_topic_text,
            "week_id": final_week_id
        }
        
        logger.info(f"Calling LLM Engine with payload: {payload}")
        print(f"DEBUG: Payload to LLM Engine: {payload}") # Terminal visible print
        
        response = requests.post(
            f"{LLM_ENGINE_URL}/questions/generate",
            json=payload,
            timeout=600 # Extended timeout for 10 questions batch
        )
        response.raise_for_status()
        data = response.json()
        
        # LLM Engine structure: { message, generated, topic, week_id, ... }
        # The questions are saved by the LLM Engine to internal data files for Feature 1 UI,
        # but for LogiCT, we want them in our Django DB.
        # Check if the LLM engine returned generated questions list
        generated_questions = data.get('questions', [])
        
        # If the LLM engine didn't return them directly, we might need to fetch them
        # from the LLM engine's /questions/all or similar if it saves them locally.
        # BUT looking at llm_engine/app/ai/question_generator.py (indirectly), 
        # it usually returns the list in the same response if designed for LogiCT.
        
        if not generated_questions:
            # Fallback: Maybe they are under 'generated_questions' key?
            generated_questions = data.get('generated_questions', [])

        # 3. Save to Database as PENDING
        saved_count = 0
        type_mapping = {
            'mcq': 'multiple_choice',
            'multi': 'multi_select',
            'truefalse': 'true_false',
            'open': 'short_answer'
        }

        for q_data in generated_questions:
            # Map LLM output to Django Model
            raw_type = q_data.get('type', 'mcq')
            mapped_type = type_mapping.get(raw_type, 'multiple_choice') # Default to mcq if unknown
            
            # Transform options from dict to list if necessary
            raw_options = q_data.get('options', []) or q_data.get('choices', [])
            if isinstance(raw_options, dict):
                # Sort by keys to maintain A, B, C, D order
                sorted_keys = sorted(raw_options.keys())
                final_options = [raw_options[k] for k in sorted_keys]
            else:
                final_options = raw_options if raw_options else []

            # Transform correctAns if it refers to dictionary keys (e.g., 'A', ['A', 'C'])
            raw_correct = q_data.get('correctAns') or q_data.get('correct_answer', '')
            
            if isinstance(raw_correct, list):
                # Handle multi-select list
                if isinstance(raw_options, dict):
                    resolved_list = [str(raw_options.get(item, item)) for item in raw_correct]
                    final_correct = ",".join(resolved_list)
                else:
                    final_correct = ",".join([str(i) for i in raw_correct])
            elif isinstance(raw_options, dict) and isinstance(raw_correct, str) and raw_correct in raw_options:
                # Handle single choice character map
                final_correct = raw_options[raw_correct]
            else:
                final_correct = raw_correct if raw_correct is not None else ""

            QuizQuestion.objects.create(
                quiz=quiz,
                question=q_data.get('question'),
                type=mapped_type,
                option=final_options,
                correctAns=final_correct,
                solution=q_data.get('solution') or q_data.get('explanation', ''),
                status='PENDING',
                weight_abstraction=q_data.get('weight_abstraction', 0.25),
                weight_pattern=q_data.get('weight_pattern', 0.25),
                weight_algorithm=q_data.get('weight_algorithm', 0.25),
                weight_decomposition=q_data.get('weight_decomposition', 0.25)
            )
            saved_count += 1

        return Response({
            'message': f'Successfully generated {saved_count} questions for Week {final_week_id}.',
            'count': saved_count,
            'topic': final_topic_name
        }, status=status.HTTP_201_CREATED)

    except requests.RequestException as e:
        error_msg = str(e)
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_msg = f"{e.response.status_code} - {e.response.json().get('detail', e.response.text)}"
            except:
                error_msg = f"{e.response.status_code} - {e.response.text}"
        
        logger.error(f"Error calling LLM Engine: {error_msg}")
        return Response({'error': f'Failed to communicate with LLM Engine: {error_msg}'}, status=status.HTTP_502_BAD_GATEWAY)
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


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsTeacherOrAdmin])
def sync_questions_view(request):
    """
    POST: Syncs all questions from LLM Engine to Django Database.
    This is useful if generate was called but data wasn't saved,
    or if questions were generated directly in LLM Engine.
    """
    try:
        response = requests.get(f"{LLM_ENGINE_URL}/questions/all", timeout=30)
        response.raise_for_status()
        data = response.json()
        questions_list = data.get('questions', [])
        
        type_mapping = {
            'mcq': 'multiple_choice',
            'multi': 'multi_select',
            'truefalse': 'true_false',
            'open': 'short_answer'
        }
        
        synced_count = 0
        updated_count = 0
        
        for q_data in questions_list:
            raw_type = q_data.get('type', 'mcq')
            mapped_type = type_mapping.get(raw_type, 'multiple_choice')
            
            # Find the course/quiz for this week
            week_id = q_data.get('week_id')
            # Extract number if it's like "2026-W14" -> 14 or "1" -> 1
            week_num = 1
            if isinstance(week_id, (int, float)):
                week_num = int(week_id)
            elif isinstance(week_id, str):
                if '-W' in week_id:
                    try:
                        week_num = int(week_id.split('-W')[1])
                    except:
                        week_num = 1
                else:
                    try:
                        week_num = int(week_id)
                    except:
                        week_num = 1
            
            course = Course.objects.filter(week=week_num).first()
            if not course:
                # Fallback: if topic is "abstraksi", we know it might be week 14 (example)
                topic = q_data.get('topic', '').lower()
                if 'abstraksi' in topic:
                    course = Course.objects.filter(week=14).first()
                if not course:
                    continue # Skip if still no course found
            
            quiz, _ = Quiz.objects.get_or_create(course=course)
            
            # Transform options from dict to list if necessary
            raw_options = q_data.get('options', []) or q_data.get('choices', [])
            if isinstance(raw_options, dict):
                sorted_keys = sorted(raw_options.keys())
                final_options = [raw_options[k] for k in sorted_keys]
            else:
                final_options = raw_options if raw_options else []

            # Transform correctAns if it refers to dictionary keys (e.g., 'A', ['A', 'C'])
            raw_correct = q_data.get('correctAns') or q_data.get('correct_answer', '')
            if isinstance(raw_correct, list):
                # Handle multi-select list
                if isinstance(raw_options, dict):
                    resolved_list = [str(raw_options.get(item, item)) for item in raw_correct]
                    final_correct = ",".join(resolved_list)
                else:
                    final_correct = ",".join([str(i) for i in raw_correct])
            elif isinstance(raw_options, dict) and isinstance(raw_correct, str) and raw_correct in raw_options:
                # Handle single choice character map
                final_correct = raw_options[raw_correct]
            else:
                final_correct = raw_correct if raw_correct is not None else ""

            # Check if exists (by question text and quiz)
            existing = QuizQuestion.objects.filter(quiz=quiz, question=q_data.get('question')).first()
            
            if existing:
                # Update if needed
                existing.type = mapped_type
                existing.option = final_options
                existing.correctAns = final_correct
                existing.solution = q_data.get('solution') or q_data.get('explanation', '')
                existing.weight_abstraction = q_data.get('weight_abstraction', 0.25)
                existing.weight_pattern = q_data.get('weight_pattern', 0.25)
                existing.weight_algorithm = q_data.get('weight_algorithm', 0.25)
                existing.weight_decomposition = q_data.get('weight_decomposition', 0.25)
                existing.save()
                updated_count += 1
            else:
                # Create new
                QuizQuestion.objects.create(
                    quiz=quiz,
                    question=q_data.get('question'),
                    type=mapped_type,
                    option=final_options,
                    correctAns=final_correct,
                    solution=q_data.get('solution') or q_data.get('explanation', ''),
                    status='PENDING',
                    weight_abstraction=q_data.get('weight_abstraction', 0.25),
                    weight_pattern=q_data.get('weight_pattern', 0.25),
                    weight_algorithm=q_data.get('weight_algorithm', 0.25),
                    weight_decomposition=q_data.get('weight_decomposition', 0.25)
                )
                synced_count += 1
                
        return Response({
            'message': f'Sync complete. Synced {synced_count} new and updated {updated_count} existing questions.',
            'new': synced_count,
            'updated': updated_count
        })
    except Exception as e:
        logger.error(f"Sync error: {str(e)}")
        return Response({'error': f'Failed to sync: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
