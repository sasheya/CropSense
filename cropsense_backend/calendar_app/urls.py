from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet

# Create a router and register our viewset
router = DefaultRouter()
router.register(r'', EventViewSet, basename='event')

urlpatterns = [
    path('', include(router.urls)),
]
