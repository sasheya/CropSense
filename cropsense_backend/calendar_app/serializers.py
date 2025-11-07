from datetime import date
from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']


    def validate_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Event date cannot be in the past.")
        return value