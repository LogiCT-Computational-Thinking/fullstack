from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import json

from .models import ExerciseSession, ChatMessage
from .serializers import ExerciseSessionSerializer, ChatMessageSerializer
from .authentication import CustomJWTAuthentication

@api_view(['GET', 'POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def session_list_create(request):
    """
    GET: Get all exercise sessions for the current user.
    POST: Create a new exercise session.
    """
    if request.method == 'GET':
        sessions = ExerciseSession.objects.filter(user=request.user).order_by('-started_at')
        serializer = ExerciseSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Default behavior is just creating a blank new session for this user.
        # Course could be passed optionally in future, but nullable for AI chat
        session = ExerciseSession.objects.create(user=request.user)
        serializer = ExerciseSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST', 'DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def session_detail(request, pk):
    """
    GET: Fetch a specific session and its messages.
    POST: Append a message to a session. 
    DELETE: Delete a session.
    """
    session = get_object_or_404(ExerciseSession, pk=pk, user=request.user)

    if request.method == 'GET':
        serializer = ExerciseSessionSerializer(session)
        return Response(serializer.data)

    elif request.method == 'POST':
        # the frontend will send role, content, and an optional json field for metadata (like status, followup inside the content string logic)
        role = request.data.get('role')
        content = request.data.get('content')
        
        if not role or not content:
            return Response({'error': 'Role and content are required.'}, status=status.HTTP_400_BAD_REQUEST)

        message = ChatMessage.objects.create(
            session=session,
            role=role,
            content=content
        )
        serializer = ChatMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    elif request.method == 'DELETE':
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

