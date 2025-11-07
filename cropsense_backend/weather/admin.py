from django.contrib import admin
from .models import WeatherCache, FarmLocation
# Register your models here.

@admin.register(WeatherCache)
class WeatherCacheAdmin(admin.ModelAdmin):
    list_display = ['city', 'cached_at']
    search_fields = ['city']

@admin.register(FarmLocation)
class FarmLocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'city', 'is_default', 'created_at']
    search_fields = ['name', 'city']
    list_filter = ['is_default', 'created_at']