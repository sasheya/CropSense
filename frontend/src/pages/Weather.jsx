import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CloudSun,
  Droplets,
  Wind,
  Eye,
  AlertTriangle,
  Plus,
  Loader2,
  MapPin,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import weatherService from "@/services/weatherService";
import { Badge } from "@/components/ui/badge";

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    city: "",
    latitude: "",
    longitude: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchWeather();
    fetchLocations();
  }, []);

  const fetchWeather = async () => {
    setIsLoading(true);
    try {
      const data = await weatherService.getCurrentWeather();
      setWeather(data.weather);

      // Also fetch forecast
      const forecastData = await weatherService.getWeatherForecast();
      setForecast(forecastData);
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      toast({
        title: "Failed to load weather",
        description: error.error || "Could not load weather data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await weatherService.getLocations();
      setLocations(data.results || data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.city) {
      toast({
        title: "Missing fields",
        description: "Please fill in location name and city",
        variant: "destructive",
      });
      return;
    }

    try {
      await weatherService.createLocation(newLocation);
      toast({
        title: "Location added",
        description: "Farm location has been added successfully",
      });
      setAddLocationOpen(false);
      setNewLocation({ name: "", city: "", latitude: "", longitude: "" });
      fetchLocations();
    } catch (error) {
      toast({
        title: "Failed to add location",
        description: error.error || "Could not add location",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (locationId) => {
    try {
      await weatherService.setDefaultLocation(locationId);
      toast({
        title: "Default location set",
        description: "Weather will now show for this location by default",
      });
      fetchLocations();
      fetchWeather(); // Refresh weather for new default location
    } catch (error) {
      toast({
        title: "Failed to set default",
        description: error.error || "Could not set default location",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      await weatherService.deleteLocation(locationId);
      toast({
        title: "Location deleted",
        description: "Farm location has been removed",
      });
      fetchLocations();
    } catch (error) {
      toast({
        title: "Failed to delete location",
        description: error.error || "Could not delete location",
        variant: "destructive",
      });
    }
  };

  const getWeatherIcon = (icon) => {
    const iconMap = {
      "clear-day": "☀️",
      "clear-night": "🌙",
      "partly-cloudy-day": "⛅",
      "partly-cloudy-night": "☁️",
      cloudy: "☁️",
      rain: "🌧️",
      snow: "❄️",
      wind: "💨",
      fog: "🌫️",
    };
    return iconMap[icon] || "🌤️";
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  if (isLoading && !weather) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Weather Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Current conditions and forecast for your farm
            </p>
          </div>
          <Button variant="outline" onClick={fetchWeather} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>

        {weather ? (
          <>
            {/* Current Weather + Location */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Current Weather */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Current Weather</CardTitle>
                  <CardDescription>
                    {weather.location?.timezone || "Live conditions"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="text-6xl">
                          {getWeatherIcon(weather.current?.icon)}
                        </span>
                        <div>
                          <p className="text-5xl font-bold text-foreground">
                            {Math.round(weather.current?.temperature)}°C
                          </p>
                          <p className="text-lg text-muted-foreground">
                            {weather.current?.summary}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Feels like {Math.round(weather.current?.feels_like)}°C
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          Humidity: {Math.round(weather.current?.humidity)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          Wind: {Math.round(weather.current?.wind_speed)} km/h
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          Visibility: {Math.round(weather.current?.visibility)}{" "}
                          km
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CloudSun className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          UV Index: {weather.current?.uv_index || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Farming Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Farming advice</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weather.current?.precipitation_probability > 70 && (
                      <div className="flex items-start gap-3 rounded-lg bg-blue-500/10 p-3">
                        <Droplets className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-600">
                            High Rain Probability
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(
                              weather.current.precipitation_probability
                            )}
                            % chance of rain. Skip irrigation today.
                          </p>
                        </div>
                      </div>
                    )}

                    {weather.current?.uv_index > 7 && (
                      <div className="flex items-start gap-3 rounded-lg bg-orange-500/10 p-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-600">
                            High UV Warning
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            UV index above 7. Protect sensitive crops.
                          </p>
                        </div>
                      </div>
                    )}

                    {weather.current?.temperature > 35 && (
                      <div className="flex items-start gap-3 rounded-lg bg-red-500/10 p-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-600">
                            Heat Alert
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            High temperature. Ensure adequate irrigation.
                          </p>
                        </div>
                      </div>
                    )}

                    {(!weather.current?.precipitation_probability ||
                      weather.current.precipitation_probability < 30) && (
                      <div className="flex items-start gap-3 rounded-lg bg-green-500/10 p-3">
                        <CloudSun className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-600">
                            Good Farming Day
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Suitable for field work and spraying.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 7-Day Forecast */}
            {weather.daily_forecast && weather.daily_forecast.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>7-Day Forecast</CardTitle>
                  <CardDescription>
                    Weather outlook for the week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-4">
                    {weather.daily_forecast.slice(0, 7).map((day, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center rounded-lg bg-muted/30 p-4 text-center transition-colors hover:bg-muted/50"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {getDayName(day.date)}
                        </p>
                        <span className="text-3xl my-3">
                          {getWeatherIcon(day.icon)}
                        </span>
                        <p className="text-lg font-bold text-foreground">
                          {Math.round(day.temperature_high)}°
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(day.temperature_low)}°
                        </p>
                        {day.precipitation_probability > 30 && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {Math.round(day.precipitation_probability)}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CloudSun className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No weather data available
              </p>
              <Button onClick={fetchWeather} className="mt-4">
                Load Weather
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Farm Locations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Farm Locations</CardTitle>
                <CardDescription>
                  Manage weather monitoring locations
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddLocationOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No locations added yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{loc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {loc.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {loc.is_default ? (
                        <Badge>Default</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(loc.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLocation(loc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Location Dialog */}
      <Dialog open={addLocationOpen} onOpenChange={setAddLocationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Farm Location</DialogTitle>
            <DialogDescription>
              Add a new location for weather monitoring
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                placeholder="e.g., Main Farm"
                value={newLocation.name}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., London"
                value={newLocation.city}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, city: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (optional)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  placeholder="51.5074"
                  value={newLocation.latitude}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, latitude: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (optional)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  placeholder="-0.1278"
                  value={newLocation.longitude}
                  onChange={(e) =>
                    setNewLocation({
                      ...newLocation,
                      longitude: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLocationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLocation}>Add Location</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
