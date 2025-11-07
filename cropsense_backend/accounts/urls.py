# backend/accounts/urls.py

from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    CurrentUserView,
    UserProfileView,
    PasswordChangeView,
    UserStatisticsView,
    DeleteAccountView
)

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
    
    # User management
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', PasswordChangeView.as_view(), name='change-password'),
    path('statistics/', UserStatisticsView.as_view(), name='user-statistics'),
    path('delete/', DeleteAccountView.as_view(), name='delete-account'),
]