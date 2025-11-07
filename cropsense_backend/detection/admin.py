from django.contrib import admin
from .models import Disease, DetectionRecord
# Register your models here.

@admin.register(Disease)
class DiseaseAdmin(admin.ModelAdmin):
    list_display = ['name', 'crop_type', 'created_at']
    search_fields = ['name', 'crop_type']
    list_filter = ['crop_type']

@admin.register(DetectionRecord)
class DetectionRecordAdmin(admin.ModelAdmin):
    lost_display = ['detected_disease', 'confidence', 'detected_at']
    list_filter = ['detected_at', 'detected_disease']
    search_fields = ['user__username', 'disease__name']
