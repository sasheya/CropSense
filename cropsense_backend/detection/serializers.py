from rest_framework import serializers
from .models import Disease, DetectionRecord

class DiseaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disease
        fields = ['id', 'name', 'crop_type', 'description', 'symptoms', 'treatment', 'prevention', 'created_at']
        read_only_fields = ['id', 'created_at']

class DetectionRecordSerializer(serializers.ModelSerializer):
    disease_details = DiseaseSerializer(source='detected_disease', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = DetectionRecord
        fields = ['id', 'image', 'detected_disease', 'disease_details', 'username', 'confidence', 'detected_at']
        read_only_fields = ['id', 'user', 'detected_disease', 'confidence', 'detected_at']

class DetectionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetectionRecord
        fields = ['image']
