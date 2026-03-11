import { useNavigate, useLocation } from "react-router";
import { Home, Calendar, CalendarCheck, User } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "./ui/badge";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "discover", label: "Discover", icon: Home, path: "/home" },
    { id: "joined", label: "Joined", icon: Calendar, path: "/joined-events" },
    { id: "my-events", label: "My Events", icon: CalendarCheck, path: "/my-events" },
    { id: "profile", label: "Overview", icon: User, path: "/profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-3 safe-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1 px-4 py-1 relative"
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <div className="relative z-10">
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium transition-colors relative z-10 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
