from rest_framework import serializers
from .models import FarmLocation

class FarmLocationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = FarmLocation
        fields = [
            'id', 'name', 'city', 'latitude', 'longitude',
            'is_default', 'username', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def validate(self, data):
        # Ensure either city or coordinates are provided
        city = data.get('city')
        lat = data.get('latitude')
        lon = data.get('longitude')
        
        if not city and not (lat and lon):
            raise serializers.ValidationError(
                "Either city name or both latitude and longitude must be provided"
            )
        
        return data