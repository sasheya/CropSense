from datetime import date
from rest_framework import serializers
from .models import Event

# class EventSerializer(serializers.ModelSerializer):
#     user = serializers.StringRelatedField(read_only=True)

#     class Meta:
#         model = Event
#         fields = ['id', 'title', 'description', 'date', 'created_at']
#         read_only_fields = ['id', 'created_at', 'user']


#     def validate_date(self, value):
#         if value < date.today():
#             raise serializers.ValidationError("Event date cannot be in the past.")
#         return value
    
from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'username', 'created_at']
        read_only_fields = ['created_at']
    
    def validate_title(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long")
        return value.strip()
    
    def validate_date(self, value):
        if not value:
            raise serializers.ValidationError("Date is required")
        return value