from django.contrib import admin
from .models import FarmerProfile
# Register your models here.

@admin.register(FarmerProfile)
class FarmerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'farm_size', 'created_at']
    search_fields = ['user__username', 'location']