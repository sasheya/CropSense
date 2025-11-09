from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Disease(models.Model):
    name = models.CharField(max_length=255, unique=True)
    crop_type = models.CharField(max_length=255)
    description = models.TextField()
    symptoms = models.TextField()
    treatment = models.TextField()
    prevention = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.crop_type} - {self.name}"
    
class DetectionRecord(models.Model):
    # Model for string user detection history
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='detections')
    image = models.ImageField(upload_to='detections/%Y/%m/%d/')
    detected_disease = models.ForeignKey(Disease, on_delete=models.SET_NULL, null=True, blank=True)
    confidence = models.FloatField(default=0.0)
    detected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-detected_at']

    def __str__(self):
        return f"{self.user.username} - {self.detected_disease.name if self.detected_disease else 'Unknown'} ({self.detected_at.strftime('%Y-%m-%d %H:%M')})"
