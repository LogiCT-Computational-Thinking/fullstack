from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import User
from .serializers import UserSerializer
from .authentication import CustomJWTAuthentication

@api_view(['GET', 'POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_user_management(request):
    """
    GET: Get all users (Admin only)
    POST: Create a new user (Admin only)
    """
    if request.user.role != 'admin':
        return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        users = User.objects.all().order_by('-created_at')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        
        # Validate unique student_id if provided
        student_id = data.get('student_id')
        if student_id and User.objects.filter(student_id=student_id).exists():
            return Response(
                {"student_id": ["A user with this Student ID / NIM already exists."]}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, pk):
    """
    PUT: Update a user (Admin only)
    DELETE: Delete a user (Admin only)
    """
    if request.user.role != 'admin':
        return Response({'detail': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    user = get_object_or_404(User, pk=pk)

    if request.method == 'PUT':
        data = request.data.copy()
        
        # Validate unique student_id if provided
        student_id = data.get('student_id')
        if student_id and User.objects.exclude(pk=user.pk).filter(student_id=student_id).exists():
            return Response(
                {"student_id": ["A user with this Student ID / NIM already exists."]}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if 'password' in data and not data['password']:
            # Drop password from data so we don't overwrite with empty hash if blank
            data.pop('password', None)
            
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
