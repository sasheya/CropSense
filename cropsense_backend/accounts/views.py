from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import FarmerProfile
from .serializers import (
    UserSerializer, 
    FarmerProfileSerializer, 
    UserRegistrationSerializer,
    LoginSerializer,
    PasswordChangeSerializer
)

class UserRegistrationView(APIView):
    """POST: Register new user"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            return Response({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """POST: User login"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                
                return Response({
                    'message': 'Login successful',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid username or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """POST: User logout"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    """GET: Get current logged-in user details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT: View or update user profile"""
    serializer_class = FarmerProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile


class PasswordChangeView(APIView):
    """POST: Change user password"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        
        if serializer.is_valid():
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            user = request.user
            
            # Check if old password is correct
            if not user.check_password(old_password):
                return Response({
                    'error': 'Old password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(new_password)
            user.save()
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserStatisticsView(APIView):
    """GET: Get user statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get counts from related models
        total_detections = user.detections.count()
        total_posts = user.posts.count()
        total_comments = user.comments.count()
        total_tasks = user.farming_tasks.count()
        completed_tasks = user.farming_tasks.filter(completed=True).count()
        total_locations = user.farm_locations.count()
        
        return Response({
            'user': {
                'username': user.username,
                'email': user.email,
                'date_joined': user.date_joined.isoformat()
            },
            'statistics': {
                'total_detections': total_detections,
                'total_posts': total_posts,
                'total_comments': total_comments,
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'pending_tasks': total_tasks - completed_tasks,
                'total_locations': total_locations
            }
        })


class DeleteAccountView(APIView):
    """DELETE: Delete user account"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        password = request.data.get('password')
        
        if not password:
            return Response({
                'error': 'Password is required to delete account'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        if not user.check_password(password):
            return Response({
                'error': 'Incorrect password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Delete user (this will cascade delete related data)
        username = user.username
        user.delete()
        
        return Response({
            'message': f'Account {username} has been deleted successfully'
        }, status=status.HTTP_200_OK)