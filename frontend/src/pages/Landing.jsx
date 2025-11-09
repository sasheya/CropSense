import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sprout,
  Calendar,
  Cloud,
  Users,
  LineChart,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function Landing() {
  const { theme, setTheme } = useTheme();

  const features = [
    {
      icon: Sprout,
      title: "AI Disease Detection",
      description:
        "Upload crop images and get instant AI-powered disease analysis with treatment recommendations.",
    },
    {
      icon: Calendar,
      title: "Smart Calendar",
      description:
        "Plan and track farming activities, set reminders, and never miss important seasonal tasks.",
    },
    {
      icon: Cloud,
      title: "Weather Monitoring",
      description:
        "Real-time weather forecasts and alerts tailored to your farm location.",
    },
    {
      icon: Users,
      title: "Community Forum",
      description:
        "Connect with fellow farmers, share experiences, and learn from the community.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-lg">
            <span className="text-4xl">🌱</span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Welcome to CropSense
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Smart farming platform powered by AI. Detect crop diseases, manage
              your farm, and connect with the farming community.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/register">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 w-full max-w-2xl">
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">99%</div>
              <div className="text-sm text-muted-foreground">
                Detection Accuracy
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground">
                Active Farmers
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Sprout className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">50+</div>
              <div className="text-sm text-muted-foreground">Crop Diseases</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to help you make informed decisions and grow
            better crops.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 space-y-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-4 py-16">
        <Card className="p-8 md:p-12 text-center space-y-6 max-w-3xl mx-auto bg-primary/5 border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of farmers who are already using CropSense to improve
            their yields and reduce crop losses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/register">Create Free Account</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
