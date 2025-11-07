from django.urls import path
from .views import (
    DiseaseDetectionView,
    DetectionHistoryView,
    DetectionDetailView,
    DiseaseListView,
    DiseaseDetailView,
    DetectionStatisticsView
)

urlpatterns = [
    # Disease Detection
    path('detect/', DiseaseDetectionView.as_view(), name='disease-detect'),
    
    # Detection History
    path('history/', DetectionHistoryView.as_view(), name='detection-history'),
    path('history/<int:pk>/', DetectionDetailView.as_view(), name='detection-detail'),
    
    # Statistics
    path('statistics/', DetectionStatisticsView.as_view(), name='detection-statistics'),
    
    # Disease Database
    path('diseases/', DiseaseListView.as_view(), name='disease-list'),
    path('diseases/<int:pk>/', DiseaseDetailView.as_view(), name='disease-detail'),
]