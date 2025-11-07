import requests
from django.conf import settings
from datetime import datetime, timedelta
from .models import WeatherCache
import logging

logger = logging.getLogger(__name__)


class PirateWeatherService:
    """
    Service class for Pirate Weather API integration
    API Documentation: https://docs.pirateweather.net/en/latest/API/
    """
    
    BASE_URL = "https://api.pirateweather.net/forecast"
    
    def __init__(self):
        self.api_key = settings.PIRATE_WEATHER_API_KEY
        if not self.api_key:
            logger.warning("Pirate Weather API key not configured")
    
    def _make_request(self, endpoint, params=None):
        """Make HTTP request to Pirate Weather API with error handling"""
        try:
            response = requests.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            logger.error("Pirate Weather API request timed out")
            raise Exception("Weather service timeout. Please try again.")
        except requests.exceptions.RequestException as e:
            logger.error(f"Pirate Weather API error: {str(e)}")
            raise Exception(f"Weather service error: {str(e)}")
    
    def get_weather_by_coordinates(self, latitude, longitude, units='si'):
        """
        Get current weather and forecast by coordinates
        
        Args:
            latitude (float): Location latitude
            longitude (float): Location longitude
            units (str): Unit system - 'si' (metric), 'us', 'uk', 'ca'
        
        Returns:
            dict: Weather data including current conditions and forecast
        """
        cache_key = f"{latitude},{longitude}"
        
        # Check cache first (1 hour validity)
        cache = WeatherCache.objects.filter(
            city=cache_key,
            cached_at__gte=datetime.now() - timedelta(hours=1)
        ).first()
        
        if cache:
            logger.info(f"Using cached weather for {cache_key}")
            return cache.weather_data
        
        # Fetch from API
        try:
            # API format: https://api.pirateweather.net/forecast/[apikey]/[latitude],[longitude]
            url = f"{self.BASE_URL}/{self.api_key}/{latitude},{longitude}"
            
            params = {
                'units': units,  # si (metric), us, uk, ca
                'exclude': 'minutely,alerts',  # Exclude minute-by-minute and alerts if not needed
            }
            
            logger.info(f"Fetching weather from Pirate Weather API for {latitude},{longitude}")
            data = self._make_request(url, params)
            
            # Process and format the response
            weather_data = self._format_weather_data(data)
            
            # Cache the result
            WeatherCache.objects.update_or_create(
                city=cache_key,
                defaults={'weather_data': weather_data}
            )
            
            return weather_data
            
        except Exception as e:
            logger.error(f"Failed to fetch weather: {str(e)}")
            raise
    
    def get_weather_by_city(self, city_name, units='si'):
        """
        Get weather by city name (requires geocoding first)
        Note: Pirate Weather doesn't have built-in geocoding, 
        so you'll need to convert city to coordinates first
        
        Args:
            city_name (str): City name
            units (str): Unit system
        
        Returns:
            dict: Weather data
        """
        # Check cache first
        cache = WeatherCache.objects.filter(
            city=city_name,
            cached_at__gte=datetime.now() - timedelta(hours=1)
        ).first()
        
        if cache:
            logger.info(f"Using cached weather for {city_name}")
            return cache.weather_data
        
        # Get coordinates for city (you can use a geocoding service)
        coordinates = self._geocode_city(city_name)
        
        if not coordinates:
            raise Exception(f"Could not find coordinates for {city_name}")
        
        # Fetch weather using coordinates
        weather_data = self.get_weather_by_coordinates(
            coordinates['lat'],
            coordinates['lon'],
            units
        )
        
        # Update cache with city name
        WeatherCache.objects.update_or_create(
            city=city_name,
            defaults={'weather_data': weather_data}
        )
        
        return weather_data
    
    def _geocode_city(self, city_name):
        """
        Simple geocoding using OpenStreetMap Nominatim (free, no API key needed)
        Alternative: Use Google Geocoding API or other services
        
        Args:
            city_name (str): City name
        
        Returns:
            dict: {'lat': latitude, 'lon': longitude}
        """
        try:
            geocode_url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': city_name,
                'format': 'json',
                'limit': 1
            }
            headers = {
                'User-Agent': 'CropSense-AI/1.0'  # Required by Nominatim
            }
            
            response = requests.get(geocode_url, params=params, headers=headers, timeout=5)
            response.raise_for_status()
            results = response.json()
            
            if results:
                return {
                    'lat': float(results[0]['lat']),
                    'lon': float(results[0]['lon'])
                }
            return None
            
        except Exception as e:
            logger.error(f"Geocoding failed for {city_name}: {str(e)}")
            return None
    
    def _format_weather_data(self, data):
        """
        Format Pirate Weather API response to simplified structure
        
        Args:
            data (dict): Raw API response
        
        Returns:
            dict: Formatted weather data
        """
        current = data.get('currently', {})
        hourly = data.get('hourly', {}).get('data', [])[:24]  # Next 24 hours
        daily = data.get('daily', {}).get('data', [])[:7]  # Next 7 days
        
        formatted = {
            'location': {
                'latitude': data.get('latitude'),
                'longitude': data.get('longitude'),
                'timezone': data.get('timezone', 'Unknown')
            },
            'current': {
                'time': datetime.fromtimestamp(current.get('time', 0)).isoformat(),
                'summary': current.get('summary', 'N/A'),
                'icon': current.get('icon', 'unknown'),
                'temperature': current.get('temperature'),
                'feels_like': current.get('apparentTemperature'),
                'humidity': current.get('humidity', 0) * 100,  # Convert to percentage
                'pressure': current.get('pressure'),
                'wind_speed': current.get('windSpeed'),
                'wind_direction': current.get('windBearing'),
                'cloud_cover': current.get('cloudCover', 0) * 100,
                'uv_index': current.get('uvIndex'),
                'visibility': current.get('visibility'),
                'precipitation_probability': current.get('precipProbability', 0) * 100,
                'precipitation_intensity': current.get('precipIntensity'),
                'precipitation_type': current.get('precipType', 'none')
            },
            'hourly_forecast': [
                {
                    'time': datetime.fromtimestamp(hour.get('time', 0)).strftime('%Y-%m-%d %H:%M'),
                    'temperature': hour.get('temperature'),
                    'precipitation_probability': hour.get('precipProbability', 0) * 100,
                    'icon': hour.get('icon', 'unknown'),
                    'summary': hour.get('summary', 'N/A')
                }
                for hour in hourly
            ],
            'daily_forecast': [
                {
                    'date': datetime.fromtimestamp(day.get('time', 0)).strftime('%Y-%m-%d'),
                    'summary': day.get('summary', 'N/A'),
                    'icon': day.get('icon', 'unknown'),
                    'temperature_high': day.get('temperatureHigh'),
                    'temperature_low': day.get('temperatureLow'),
                    'precipitation_probability': day.get('precipProbability', 0) * 100,
                    'precipitation_type': day.get('precipType', 'none'),
                    'humidity': day.get('humidity', 0) * 100,
                    'wind_speed': day.get('windSpeed'),
                    'sunrise': datetime.fromtimestamp(day.get('sunriseTime', 0)).strftime('%H:%M'),
                    'sunset': datetime.fromtimestamp(day.get('sunsetTime', 0)).strftime('%H:%M')
                }
                for day in daily
            ],
            'cached_at': datetime.now().isoformat()
        }
        
        return formatted
    
    def get_farming_recommendation(self, weather_data):
        """
        Generate farming recommendations based on weather data
        
        Args:
            weather_data (dict): Formatted weather data
        
        Returns:
            dict: Farming recommendations
        """
        current = weather_data['current']
        daily = weather_data['daily_forecast']
        
        recommendations = {
            'irrigation': [],
            'precautions': [],
            'best_activities': []
        }
        
        # Temperature-based recommendations
        temp = current['temperature']
        if temp > 35:
            recommendations['precautions'].append("🌡️ High temperature alert! Ensure adequate irrigation.")
            recommendations['irrigation'].append("Increase watering frequency")
        elif temp < 5:
            recommendations['precautions'].append("❄️ Cold weather! Protect sensitive crops from frost.")
        
        # Precipitation recommendations
        precip_prob = current['precipitation_probability']
        if precip_prob > 70:
            recommendations['precautions'].append("🌧️ High chance of rain. Avoid irrigation and pesticide application.")
            recommendations['irrigation'].append("Skip irrigation today")
        elif precip_prob < 20:
            recommendations['irrigation'].append("Low rain probability - consider irrigation")
        
        # Humidity recommendations
        humidity = current['humidity']
        if humidity > 80:
            recommendations['precautions'].append("💧 High humidity! Monitor for fungal diseases.")
        
        # Wind recommendations
        wind_speed = current.get('wind_speed', 0)
        if wind_speed > 20:
            recommendations['precautions'].append("💨 High winds! Avoid spraying operations.")
        
        # Best activities
        if precip_prob < 30 and 15 < temp < 30 and wind_speed < 15:
            recommendations['best_activities'].append("✅ Good day for field work and spraying")
        
        if precip_prob < 20 and temp > 10:
            recommendations['best_activities'].append("✅ Suitable for planting and transplanting")
        
        return recommendations


# Create singleton instance
weather_service = PirateWeatherService()