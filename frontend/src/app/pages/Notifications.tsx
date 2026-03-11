import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/ui/button";
import notificationService, { Notification } from "../../services/notificationService";
import chatService from "../../services/chatService";
import { useToast } from "../components/ui/use-toast";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Bell,
  Calendar,
  MessageCircle,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  X,
  Trash2,
} from "lucide-react";

export default function Notifications() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchNotifications();
    
    // Listen for real-time notifications
    const token = localStorage.getItem('token');
    if (token) {
      chatService.connect(token);
      
      chatService.onNewNotification((notification) => {
        console.log('New notification received in Notifications page:', notification);
        // Add the new notification to the list
        setNotifications(prev => [notification, ...prev]);
      });
    }
    
    return () => {
      chatService.offNewNotification();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications(1, ITEMS_PER_PAGE);
      const fetchedNotifications = response.data || [];
      setNotifications(fetchedNotifications);
      setHasMore(fetchedNotifications.length === ITEMS_PER_PAGE);
      setCurrentPage(1);
      
      // Mark all notifications as read when viewing the page
      const hasUnread = fetchedNotifications.some((n: Notification) => !n.isRead);
      if (hasUnread) {
        await notificationService.markAllAsRead();
        // Update local state to reflect read status
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
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

  const loadMoreNotifications = async () => {
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await notificationService.getNotifications(nextPage, ITEMS_PER_PAGE);
      const fetchedNotifications = response.data || [];
      
      setNotifications(prev => [...prev, ...fetchedNotifications]);
      setCurrentPage(nextPage);
      setHasMore(fetchedNotifications.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error loading more notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load more notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setDeletingId(id);
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast({
        title: "Deleted",
        description: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
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
            className={`p-5 cursor-pointer hover:shadow-md transition-all relative ${
              !notification.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""
            }`}
            onClick={() => navigate("/my-events")}
          >
            {/* Delete Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
              onClick={(e) => handleDeleteNotification(notification._id, e)}
              disabled={deletingId === notification._id}
            >
              {deletingId === notification._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>

            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pr-8">
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
                <Avatar className="h-14 w-14 ring-2 ring-muted">
                  <AvatarImage src={notification.sender.avatar} alt={notification.sender.name} />
                  <AvatarFallback>{notification.sender.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{notification.sender.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  
                  {/* Event Name */}
                  {notification.event && (
                    <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>For: {notification.event.title}</span>
                    </div>
                  )}
                </div>
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
          className={`p-4 cursor-pointer hover:shadow-md transition-all relative ${
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
              // Navigate to chat if it's a message notification, otherwise to event page
              if (notification.type === 'new_message') {
                navigate(`/event/${notification.event._id}/chat`);
              } else {
                navigate(`/event/${notification.event._id}`);
              }
            }
          }}
        >
          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
            onClick={(e) => handleDeleteNotification(notification._id, e)}
            disabled={deletingId === notification._id}
          >
            {deletingId === notification._id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>

          <div className="flex items-start gap-3 pr-8">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                notification.type === "request_accepted" || notification.type === "participant_joined"
                  ? "bg-green-100"
                  : notification.type === "request_rejected" || notification.type === "participant_left" || notification.type === "event_cancelled"
                  ? "bg-red-100"
                  : notification.type === "new_message"
                  ? "bg-blue-100"
                  : notification.type === "event_reminder"
                  ? "bg-amber-100"
                  : "bg-blue-100"
              }`}
            >
              {(notification.type === "request_accepted" || notification.type === "participant_joined") && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              {(notification.type === "request_rejected" || notification.type === "participant_left") && (
                <X className="h-5 w-5 text-red-600" />
              )}
              {notification.type === "event_cancelled" && (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              {notification.type === "new_message" && (
                <MessageCircle className="h-5 w-5 text-blue-600" />
              )}
              {notification.type === "event_reminder" && (
                <Clock className="h-5 w-5 text-amber-600" />
              )}
              {!["request_accepted", "participant_joined", "request_rejected", "participant_left", "event_cancelled", "new_message", "event_reminder"].includes(notification.type) && (
                <Bell className="h-5 w-5 text-blue-600" />
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
          <>
            <div className="space-y-4">{notifications.map(renderNotificationCard)}</div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={loadMoreNotifications}
                  disabled={isLoadingMore}
                  className="gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* End of notifications indicator */}
            {!hasMore && notifications.length > ITEMS_PER_PAGE && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                You've reached the end of your notifications
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
