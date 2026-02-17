import { useState } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { BottomNav } from "../components/BottomNav";
import { mockJoinRequests, mockUsers } from "../utils/mockData";
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
} from "lucide-react";

interface Notification {
  id: string;
  type: "join_request" | "request_accepted" | "request_declined" | "new_message";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionable?: boolean;
  userId?: string;
  eventId?: string;
  requestMessage?: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "join_request",
      title: "New Join Request",
      message: "Ahmed Hassan wants to join Coffee at Alexanderplatz",
      time: "5 min ago",
      read: false,
      actionable: true,
      userId: "2",
      eventId: "1",
      requestMessage: "Hey! I'd love to join. I'm new to Berlin and looking to meet people!",
    },
    {
      id: "2",
      type: "join_request",
      title: "New Join Request",
      message: "Elena Schmidt wants to join Coffee at Alexanderplatz",
      time: "1 hour ago",
      read: false,
      actionable: true,
      userId: "3",
      eventId: "1",
      requestMessage: "Coffee sounds great! Can we make it 15 minutes later?",
    },
    {
      id: "3",
      type: "request_accepted",
      title: "Request Accepted! 🎉",
      message: "You've been accepted to Morning Run in Tiergarten",
      time: "2 hours ago",
      read: true,
      actionable: false,
      eventId: "2",
    },
    {
      id: "4",
      type: "new_message",
      title: "New Message",
      message: "Marco sent a message in Coffee at Alexanderplatz",
      time: "3 hours ago",
      read: true,
      actionable: false,
      eventId: "1",
    },
  ]);

  const handleAccept = (notificationId: string, userId: string, eventId: string) => {
    // In real app, API call here
    console.log("Accepting request:", { notificationId, userId, eventId });
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, actionable: false, read: true } : n
      )
    );
  };

  const handleDecline = (notificationId: string, userId: string, eventId: string) => {
    // In real app, API call here
    console.log("Declining request:", { notificationId, userId, eventId });
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotificationCard = (notification: Notification, index: number) => {
    const user = mockUsers.find((u) => u.id === notification.userId);

    // Join Request Notification
    if (notification.type === "join_request" && notification.actionable && user) {
      return (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            className={`p-5 ${
              !notification.read ? "border-l-4 border-l-primary bg-primary/5" : ""
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
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </div>

              {/* User Info */}
              <div className="flex items-start gap-4">
                <Avatar
                  className="h-14 w-14 cursor-pointer ring-2 ring-muted hover:ring-primary/40 transition-all"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {user.name}
                  </button>
                  <div className="flex items-center gap-1.5 mt-1 mb-2">
                    <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {user.languages.join(", ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                </div>
              </div>

              {/* Request Message */}
              {notification.requestMessage && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm italic text-muted-foreground">
                    "{notification.requestMessage}"
                  </p>
                </div>
              )}

              {/* Event Name */}
              <button
                onClick={() => navigate(`/event/${notification.eventId}`)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>For: Coffee at Alexanderplatz</span>
              </button>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() =>
                    handleDecline(notification.id, user.id, notification.eventId!)
                  }
                >
                  <X className="h-4 w-4" />
                  Decline
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() =>
                    handleAccept(notification.id, user.id, notification.eventId!)
                  }
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
        key={notification.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card
          className={`p-4 cursor-pointer hover:shadow-md transition-all ${
            !notification.read ? "border-l-4 border-l-primary bg-primary/5" : ""
          }`}
          onClick={() => {
            if (notification.eventId) {
              navigate(`/event/${notification.eventId}`);
            }
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                notification.type === "request_accepted"
                  ? "bg-green-100"
                  : notification.type === "request_declined"
                  ? "bg-red-100"
                  : "bg-blue-100"
              }`}
            >
              {notification.type === "request_accepted" && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              {notification.type === "request_declined" && (
                <X className="h-5 w-5 text-red-600" />
              )}
              {notification.type === "new_message" && (
                <MessageCircle className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{notification.title}</p>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {notification.time}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40">
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
