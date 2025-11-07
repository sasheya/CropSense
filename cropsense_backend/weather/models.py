from django.db import models
from django.contrib.auth.models import User

class WeatherCache(models.Model):
    city = models.CharField(max_length=100)
    weather_data = models.JSONField()
    cached_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.city} - {self.cached_at}"

class FarmLocation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farm_locations')
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.city}"