import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import notificationService, { Notification } from "../../services/notificationService";
import joinRequestService from "../../services/joinRequestService";
import { useToast } from "../components/ui/use-toast";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Bell,
  Check,
  X,
  Languages,
  Calendar,
  MessageCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";

export default function Notifications() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (notificationId: string, joinRequestId: string) => {
    try {
      await joinRequestService.acceptJoinRequest(joinRequestId);
      
      // Refresh notifications to show the updated one
      await fetchNotifications();

      toast({
        title: "Request Accepted",
        description: "The participant has been added to your event",
      });
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (notificationId: string, joinRequestId: string) => {
    try {
      await joinRequestService.rejectJoinRequest(joinRequestId);
      
      // Refresh notifications to show the updated one
      await fetchNotifications();

      toast({
        title: "Request Declined",
        description: "The join request has been declined",
      });
    } catch (error) {
      console.error("Error declining request:", error);
      toast({
        title: "Error",
        description: "Failed to decline request",
        variant: "destructive",
      });
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        <Header />
        <div className="flex items-center justify-center h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </div>
    );
  }

  const renderNotificationCard = (notification: Notification, index: number) => {
    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
      
      if (diff < 1) return "Just now";
      if (diff < 60) return `${diff} min ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
      return date.toLocaleDateString();
    };

    // Join Request Notification
    if (notification.type === "join_request" && notification.actionable && notification.sender) {
      return (
        <motion.div
          key={notification._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            className={`p-5 ${
              !notification.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""
            }`}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</p>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </div>

              {/* User Info */}
              <div className="flex items-start gap-4">
                <Avatar
                  className="h-14 w-14 cursor-pointer ring-2 ring-muted hover:ring-primary/40 transition-all"
                  onClick={() => navigate(`/profile/${notification.sender._id}`)}
                >
                  <AvatarImage src={notification.sender.avatar} alt={notification.sender.name} />
                  <AvatarFallback>{notification.sender.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/profile/${notification.sender._id}`)}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {notification.sender.name}
                  </button>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                </div>
              </div>

              {/* Event Name */}
              {notification.event && (
                <button
                  onClick={() => navigate(`/event/${notification.event!._id}`)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>For: {notification.event.title}</span>
                </button>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => handleDecline(notification._id, notification.joinRequest!)}
                >
                  <X className="h-4 w-4" />
                  Decline
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => handleAccept(notification._id, notification.joinRequest!)}
                >
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    }

    // Other notification types
    return (
      <motion.div
        key={notification._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card
          className={`p-4 cursor-pointer hover:shadow-md transition-all ${
            !notification.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""
          }`}
          onClick={async () => {
            if (!notification.isRead) {
              await notificationService.markAsRead(notification._id);
              setNotifications(notifications.map((n) =>
                n._id === notification._id ? { ...n, isRead: true } : n
              ));
            }
            if (notification.event) {
              navigate(`/event/${notification.event._id}`);
            }
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                notification.type === "request_accepted" || notification.type === "participant_joined"
                  ? "bg-green-100"
                  : notification.type === "request_rejected" || notification.type === "participant_left"
                  ? "bg-red-100"
                  : "bg-blue-100"
              }`}
            >
              {(notification.type === "request_accepted" || notification.type === "participant_joined") && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              {(notification.type === "request_rejected" || notification.type === "participant_left") && (
                <X className="h-5 w-5 text-red-600" />
              )}
              {notification.type === "new_message" && (
                <MessageCircle className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{notification.title}</p>
                {!notification.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatTime(notification.createdAt)}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Main Header */}
      <Header />
      
      {/* Page Header */}
      <header className="border-b bg-white sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-white">{unreadCount}</Badge>
            )}
          </div>
          <div className="w-10 md:hidden" />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <Bell className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">
              You're all caught up! Check back later.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">{notifications.map(renderNotificationCard)}</div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
