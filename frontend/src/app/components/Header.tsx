import { useNavigate, useLocation } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "./ui/button";
import { LanguageSelector } from "./LanguageSelector";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { 
  Users, Bell, LogOut, User, Settings, 
  Filter, Home, Calendar, CalendarCheck
} from "lucide-react";
import authService from "../../services/authService";
import notificationService from "../../services/notificationService";
import chatService from "../../services/chatService";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

interface HeaderProps {
  showFilters?: boolean;
  filters?: {
    category: string;
    distance: number;
    language: string;
  };
  onFiltersChange?: (filters: any) => void;
  viewMode?: "swipe" | "grid";
  onViewModeChange?: (mode: "swipe" | "grid") => void;
}

export function Header({ 
  showFilters = false, 
  filters, 
  onFiltersChange,
  viewMode,
  onViewModeChange 
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      
      // Connect to socket for real-time notifications
      const token = localStorage.getItem('token');
      if (token) {
        chatService.connect(token);
        
        // Listen for new notifications
        chatService.onNewNotification((notification) => {
          console.log('New notification received:', notification);
          setUnreadCount(prev => prev + 1);
        });

        // Listen for notifications being marked as read
        chatService.onNotificationsRead((data) => {
          console.log('Notifications marked as read:', data);
          setUnreadCount(data.unreadCount);
        });
      }
      
      // Refresh count every 30 seconds as backup
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => {
        clearInterval(interval);
        chatService.offNewNotification();
        chatService.offNotificationsRead();
      };
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Meetly</span>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              <Button
                variant={location.pathname === "/home" ? "default" : "ghost"}
                onClick={() => navigate("/home")}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Discover
              </Button>
              <Button
                variant={location.pathname === "/joined-events" ? "default" : "ghost"}
                onClick={() => navigate("/joined-events")}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Joined
              </Button>
              <Button
                variant={location.pathname === "/my-events" ? "default" : "ghost"}
                onClick={() => navigate("/my-events")}
                className="gap-2"
              >
                <CalendarCheck className="h-4 w-4" />
                My Events
              </Button>
              <Button
                variant={location.pathname === "/profile" ? "default" : "ghost"}
                onClick={() => navigate("/profile")}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
            </nav>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Filters (only on home page when logged in) */}
            {showFilters && filters && onFiltersChange && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Filter className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-input bg-input-background"
                        value={filters.category}
                        onChange={(e) =>
                          onFiltersChange({ ...filters, category: e.target.value })
                        }
                      >
                        <option value="all">All</option>
                        <option value="coffee">{t("coffee")}</option>
                        <option value="walk">{t("walk")}</option>
                        <option value="study">{t("study")}</option>
                        <option value="gym">{t("gym")}</option>
                        <option value="explore">{t("explore")}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {t("distance")} (max {filters.distance} km)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={filters.distance}
                        onChange={(e) =>
                          onFiltersChange({ ...filters, distance: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Language</label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-input bg-input-background"
                        value={filters.language}
                        onChange={(e) =>
                          onFiltersChange({ ...filters, language: e.target.value })
                        }
                      >
                        <option value="all">All</option>
                        <option value="English">English</option>
                        <option value="German">German</option>
                        <option value="Arabic">Arabic</option>
                      </select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            {/* Authenticated User Menu */}
            {isAuthenticated && currentUser ? (
              <>
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => navigate("/notifications")}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        <AvatarFallback>
                          {currentUser.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{currentUser.name}</p>
                        <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/my-events")}>
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      <span>My Events</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Guest User Buttons */
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  {t("login")}
                </Button>
                <Button onClick={() => navigate("/register")}>
                  {t("register")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
