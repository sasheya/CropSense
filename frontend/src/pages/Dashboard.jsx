import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { useState, useEffect } from "react";
import {
  Camera,
  MessageSquare,
  CloudSun,
  TrendingUp,
  Leaf,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import authService from "@/services/authService";
import detectionService from "@/services/detectionService";
import communityService from "@/services/communityService";
import weatherService from "@/services/weatherService";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [detectionStats, setDetectionStats] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch user info (required)
      try {
        const userData = await authService.getMe();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        toast({
          title: "Failed to load user data",
          description: "Please try logging in again",
          variant: "destructive",
        });
      }

      // Fetch user statistics (optional)
      try {
        const stats = await authService.getStatistics();
        setStatistics(stats.statistics);
      } catch (error) {
        console.log("User statistics not available");
        // Set default statistics
        setStatistics({
          total_detections: 0,
          total_posts: 0,
          total_comments: 0,
          total_tasks: 0,
          completed_tasks: 0,
          pending_tasks: 0,
          total_locations: 0,
        });
      }

      // Fetch detection statistics (optional)
      try {
        const detStats = await detectionService.getStatistics();
        setDetectionStats(detStats);
      } catch (error) {
        console.log("Detection statistics not available");
        setDetectionStats({
          total_detections: 0,
          most_common_diseases: [],
          average_confidence: 0,
          average_confidence_percentage: "0%",
        });
      }

      // Fetch recent detections (optional)
      try {
        const detections = await detectionService.getHistory();
        setRecentDetections((detections.results || detections).slice(0, 3));
      } catch (error) {
        console.log("No detection history available");
        setRecentDetections([]);
      }

      // Fetch weather (optional)
      try {
        const weatherData = await weatherService.getCurrentWeather();
        setWeather(weatherData.weather);
      } catch (error) {
        console.log("Weather data not available:", error);
        setWeather(null);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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

  if (isLoading) {
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
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.first_name || user?.username || "Farmer"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your farm today.
          </p>
        </div>

        {/* Stats Grid */}
        {statistics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Detections"
              value={statistics.total_detections || 0}
              icon={Camera}
              description="Disease scans"
            />
            <StatCard
              title="Community Posts"
              value={statistics.total_posts || 0}
              icon={MessageSquare}
              description="Posts created"
            />
            <StatCard
              title="Comments"
              value={statistics.total_comments || 0}
              icon={MessageSquare}
              description="Community engagement"
            />
            <StatCard
              title="Average Confidence"
              value={detectionStats?.average_confidence_percentage || "0%"}
              icon={TrendingUp}
              description="Detection accuracy"
            />
          </div>
        )}

        {/* Recent Activity Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Detections */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recent Disease Detections</CardTitle>
              <CardDescription>
                Your latest crop health analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentDetections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No detections yet. Start by scanning your crops!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDetections.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Leaf className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {item.disease_details?.crop_type || "Crop"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.disease_details?.name?.replace(/_/g, " ") ||
                              "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {(item.confidence * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.detected_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weather Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Weather Summary</CardTitle>
              <CardDescription>Current conditions</CardDescription>
            </CardHeader>
            <CardContent>
              {weather && weather.current ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">
                      {getWeatherIcon(weather.current.icon)}
                    </span>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-foreground">
                        {Math.round(weather.current.temperature)}°C
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {weather.current.summary || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Humidity</span>
                      <span className="font-medium text-foreground">
                        {Math.round(weather.current.humidity)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Wind</span>
                      <span className="font-medium text-foreground">
                        {Math.round(weather.current.wind_speed)} km/h
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Precipitation
                      </span>
                      <span className="font-medium text-foreground">
                        {Math.round(weather.current.precipitation_probability)}%
                      </span>
                    </div>
                  </div>

                  {/* Alert */}
                  {weather.current.precipitation_probability > 70 && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-500/10 p-3">
                      <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-600">
                          Rain Alert
                        </p>
                        <p className="text-xs text-muted-foreground">
                          High chance of rain today
                        </p>
                      </div>
                    </div>
                  )}

                  {weather.current.temperature > 35 && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 p-3">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-red-600">
                          Heat Alert
                        </p>
                        <p className="text-xs text-muted-foreground">
                          High temperature today
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CloudSun className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Weather data unavailable
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add a farm location in Weather page
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Most Common Diseases */}
        {detectionStats?.most_common_diseases &&
          detectionStats.most_common_diseases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Most Common Diseases</CardTitle>
                <CardDescription>
                  Your frequently detected crop diseases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detectionStats.most_common_diseases.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <p className="font-medium text-foreground">
                          {item.disease.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {item.count} time{item.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </Layout>
  );
}
