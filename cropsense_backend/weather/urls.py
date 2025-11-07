from django.urls import path
from .views import (
    CurrentWeatherView,
    WeatherForecastView,
    FarmLocationListCreateView,
    FarmLocationDetailView,
    SetDefaultLocationView
)

urlpatterns = [
    # Weather endpoints
    path('current/', CurrentWeatherView.as_view(), name='current-weather'),
    path('forecast/', WeatherForecastView.as_view(), name='weather-forecast'),
    
    # Farm location endpoints
    path('locations/', FarmLocationListCreateView.as_view(), name='location-list'),
    path('locations/<int:pk>/', FarmLocationDetailView.as_view(), name='location-detail'),
    path('locations/<int:pk>/set-default/', SetDefaultLocationView.as_view(), name='set-default-location'),
]