import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Camera,
  Calendar,
  CloudSun,
  MessageSquare,
  User,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Detection", url: "/detection", icon: Camera },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Weather", url: "/weather", icon: CloudSun },
  { title: "Community", url: "/community", icon: MessageSquare },
  { title: "Profile", url: "/profile", icon: User },
  // { title: "Notifications", url: "/notifications", icon: Bell },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar transition-all duration-300">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">
                🌱
              </span>
            </div>
            <span className="text-xl font-semibold text-sidebar-foreground">
              CropSense
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeClassName="bg-sidebar-accent text-sidebar-primary"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
