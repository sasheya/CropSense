from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import weather_service
from .models import FarmLocation
from .serializers import FarmLocationSerializer


class CurrentWeatherView(APIView):
    """GET: Current weather by coordinates or city"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get parameters
        latitude = request.query_params.get('lat')
        longitude = request.query_params.get('lon')
        city = request.query_params.get('city')
        units = request.query_params.get('units', 'si')  # si=metric, us=imperial
        
        try:
            if latitude and longitude:
                # Get by coordinates
                weather_data = weather_service.get_weather_by_coordinates(
                    float(latitude), 
                    float(longitude),
                    units
                )
            elif city:
                # Get by city name
                weather_data = weather_service.get_weather_by_city(city, units)
            else:
                # Use user's default location
                default_location = FarmLocation.objects.filter(
                    user=request.user,
                    is_default=True
                ).first()
                
                if not default_location:
                    return Response(
                        {'error': 'No location provided and no default location set'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if default_location.latitude and default_location.longitude:
                    weather_data = weather_service.get_weather_by_coordinates(
                        float(default_location.latitude),
                        float(default_location.longitude),
                        units
                    )
                else:
                    weather_data = weather_service.get_weather_by_city(
                        default_location.city,
                        units
                    )
            
            # Get farming recommendations
            recommendations = weather_service.get_farming_recommendation(weather_data)
            
            return Response({
                'weather': weather_data,
                'farming_recommendations': recommendations
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WeatherForecastView(APIView):
    """GET: Weather forecast (hourly and daily)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        latitude = request.query_params.get('lat')
        longitude = request.query_params.get('lon')
        city = request.query_params.get('city')
        
        try:
            if latitude and longitude:
                weather_data = weather_service.get_weather_by_coordinates(
                    float(latitude),
                    float(longitude)
                )
            elif city:
                weather_data = weather_service.get_weather_by_city(city)
            else:
                return Response(
                    {'error': 'Please provide latitude/longitude or city name'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response({
                'hourly_forecast': weather_data['hourly_forecast'],
                'daily_forecast': weather_data['daily_forecast']
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FarmLocationListCreateView(generics.ListCreateAPIView):
    """GET/POST: List or create farm locations"""
    serializer_class = FarmLocationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FarmLocation.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # If this is marked as default, unset other defaults
        if serializer.validated_data.get('is_default', False):
            FarmLocation.objects.filter(
                user=self.request.user,
                is_default=True
            ).update(is_default=False)
        
        serializer.save(user=self.request.user)


class FarmLocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE: Retrieve, update or delete farm location"""
    serializer_class = FarmLocationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FarmLocation.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        # If setting as default, unset other defaults
        if serializer.validated_data.get('is_default', False):
            FarmLocation.objects.filter(
                user=self.request.user,
                is_default=True
            ).exclude(id=self.get_object().id).update(is_default=False)
        
        serializer.save()


class SetDefaultLocationView(APIView):
    """POST: Set a location as default"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            location = FarmLocation.objects.get(pk=pk, user=request.user)
            
            # Unset all other defaults
            FarmLocation.objects.filter(
                user=request.user,
                is_default=True
            ).update(is_default=False)
            
            # Set this as default
            location.is_default = True
            location.save()
            
            return Response({
                'message': f'{location.name} set as default location',
                'location': FarmLocationSerializer(location).data
            })
            
        except FarmLocation.DoesNotExist:
            return Response(
                {'error': 'Location not found'},
                status=status.HTTP_404_NOT_FOUND
            )