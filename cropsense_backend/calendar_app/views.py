from rest_framework import viewsets, permissions
from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing user-specific farming calendar events.
    Supports: list, create, retrieve, update, delete
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return only events belonging to the logged-in user.
        """
        return Event.objects.filter(user=self.request.user).order_by('date')

    def perform_create(self, serializer):
        """
        Automatically assign the logged-in user as the event owner.
        """
        serializer.save(user=self.request.user)
