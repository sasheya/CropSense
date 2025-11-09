import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  MessageSquare,
  Calendar,
  CloudSun,
  CheckCheck,
} from "lucide-react";

export default function Notifications() {
  const notifications = [
    {
      type: "detection",
      icon: Camera,
      title: "Disease Detection Complete",
      message:
        "Your tomato analysis detected Early Blight with 94% confidence.",
      time: "2 hours ago",
      unread: true,
    },
    {
      type: "community",
      icon: MessageSquare,
      title: "New Reply on Your Post",
      message: "Sarah Johnson replied to your post about organic fertilizers.",
      time: "5 hours ago",
      unread: true,
    },
    {
      type: "calendar",
      icon: Calendar,
      title: "Upcoming Event Reminder",
      message: "Fertilizer application scheduled for tomorrow at 8:00 AM.",
      time: "8 hours ago",
      unread: false,
    },
    {
      type: "weather",
      icon: CloudSun,
      title: "Weather Alert",
      message: "Heavy rain expected tomorrow afternoon in your area.",
      time: "1 day ago",
      unread: false,
    },
    {
      type: "community",
      icon: MessageSquare,
      title: "New Post in Your Category",
      message: "Mike Chen posted about wheat rust treatment.",
      time: "1 day ago",
      unread: false,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with your farming activities
            </p>
          </div>
          <Button variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/60 ${
                    notification.unread ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <notification.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      {notification.unread && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
