from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import FarmerProfile
from .serializers import (
    UserSerializer, 
    FarmerProfileSerializer, 
    UserRegistrationSerializer,
    LoginSerializer,
    PasswordChangeSerializer
)
import logging

logger = logging.getLogger(__name__)


class UserRegistrationView(APIView):
    """POST: Register new user"""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens for auto-login after registration
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
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
    """POST: User login with JWT"""
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            username = serializer.validated_data.get('username')
            email = serializer.validated_data.get('email')
            password = serializer.validated_data['password']
            
            # Authenticate by username or email
            if username:
                user = authenticate(request, username=username, password=password)
            elif email:
                try:
                    user_obj = User.objects.get(email=email)
                    user = authenticate(request, username=user_obj.username, password=password)
                except User.DoesNotExist:
                    logger.warning(f"Login attempt with non-existent email: {email}")
                    user = None
            else:
                user = None
            
            if user is None:
                logger.error(f"Authentication failed for username: {username}, email: {email}")
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)

            if user is not None:
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'message': 'Login successful',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    }
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """POST: User logout - Blacklist refresh token"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            
            if not refresh_token:
                return Response({
                    'error': 'Refresh token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            logger.info(f"User {request.user.username} logged out successfully")
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        
        except TokenError as e:
            logger.error(f"Token error during logout: {str(e)}")
            return Response({
                'error': 'Invalid refresh token or token already blacklisted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"Unexpected error during logout: {str(e)}")
            return Response({
                'error': 'An error occurred during logout'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurrentUserView(APIView):
    """GET: Get current logged-in user details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            serializer = UserSerializer(request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching current user: {str(e)}")
            return Response({
                'error': 'Failed to fetch user data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT: View or update user profile"""
    serializer_class = FarmerProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        # Ensure profile exists
        profile, created = FarmerProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving profile: {str(e)}")
            return Response({
                'error': 'Failed to fetch profile'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error updating profile: {str(e)}")
            return Response({
                'error': 'Failed to update profile'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            
            # Generate new tokens after password change
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"Password changed for user: {user.username}")
            
            return Response({
                'message': 'Password changed successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserStatisticsView(APIView):
    """GET: Get user statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            
            # Get counts from related models
            total_detections = user.detections.count()
            total_posts = user.posts.count()
            total_comments = user.comments.count()
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
                    'total_locations': total_locations
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching statistics: {str(e)}")
            return Response({
                'error': 'Failed to fetch statistics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        logger.info(f"Deleting account for user: {username}")
        user.delete()
        
        return Response({
            'message': f'Account {username} has been deleted successfully'
        }, status=status.HTTP_200_OK)