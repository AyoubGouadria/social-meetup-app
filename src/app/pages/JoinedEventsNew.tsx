import { useState } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { StatusBadge } from "../components/StatusBadge";
import { BottomNav } from "../components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { mockEvents } from "../utils/mockData";
import { motion } from "motion/react";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  MessageCircle,
  ChevronRight,
  Bell,
  XCircle,
} from "lucide-react";

// Mock: Add request status to events
interface EventWithStatus {
  event: typeof mockEvents[0];
  requestStatus: "pending" | "accepted" | "declined";
}

export default function JoinedEvents() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Mock: Events current user has joined or requested to join
  const [joinedEvents] = useState<EventWithStatus[]>([
    {
      event: mockEvents[0], // Coffee at Alexanderplatz
      requestStatus: "accepted",
    },
    {
      event: mockEvents[1], // Morning Run
      requestStatus: "accepted",
    },
    {
      event: mockEvents[2], // Study Session
      requestStatus: "pending",
    },
    {
      event: mockEvents[4], // Kreuzberg
      requestStatus: "accepted",
    },
  ]);

  const upcomingEvents = joinedEvents.filter(
    (item) =>
      new Date(item.event.date) >= new Date() && item.requestStatus === "accepted"
  );

  const pendingEvents = joinedEvents.filter(
    (item) => item.requestStatus === "pending"
  );

  const pastEvents = joinedEvents.filter(
    (item) =>
      new Date(item.event.date) < new Date() && item.requestStatus === "accepted"
  );

  const renderEventCard = (
    { event, requestStatus }: EventWithStatus,
    index: number
  ) => {
    const isAccepted = requestStatus === "accepted";
    const isPending = requestStatus === "pending";

    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card
          className={`p-5 hover:shadow-lg transition-all cursor-pointer ${
            isPending ? "border-l-4 border-l-amber-500 bg-amber-50/50" : ""
          }`}
          onClick={() => navigate(`/event/${event.id}`)}
        >
          <div className="space-y-4">
            {/* Header with Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold mb-1 truncate">{event.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              </div>
              <StatusBadge status={requestStatus} size="sm" />
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{event.distance} km away</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span>
                  {event.currentParticipants}/{event.maxParticipants}
                </span>
              </div>
            </div>

            {/* Host Info */}
            <div className="flex items-center gap-3 pt-2 border-t">
              <Avatar
                className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${event.host.id}`);
                }}
              >
                <AvatarImage src={event.host.avatar} alt={event.host.name} />
                <AvatarFallback>{event.host.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Hosted by</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${event.host.id}`);
                  }}
                  className="text-sm font-medium hover:text-primary transition-colors truncate block w-full text-left"
                >
                  {event.host.name}
                </button>
              </div>

              {/* Action Button */}
              {isAccepted && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/event/${event.id}/chat`);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
              )}
              {isPending && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Joined Events</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/notifications")}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {pendingEvents.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingEvents.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upcoming" className="gap-2">
              Upcoming
              {upcomingEvents.length > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {upcomingEvents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {pendingEvents.length > 0 && (
                <Badge className="bg-amber-500 rounded-full">
                  {pendingEvents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Calendar className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
                <p className="text-muted-foreground mb-6">
                  Discover and join events to start meeting people!
                </p>
                <Button onClick={() => navigate("/home")} size="lg">
                  Discover Events
                </Button>
              </Card>
            ) : (
              upcomingEvents.map(renderEventCard)
            )}
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingEvents.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                  <Clock className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground">
                  All your join requests have been reviewed.
                </p>
              </Card>
            ) : (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Waiting for Host Approval
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      The event host will review your request soon. You'll be notified
                      once they respond.
                    </p>
                  </div>
                </div>
                {pendingEvents.map(renderEventCard)}
              </>
            )}
          </TabsContent>

          {/* Past Tab */}
          <TabsContent value="past" className="space-y-4">
            {pastEvents.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Past Events</h3>
                <p className="text-muted-foreground">
                  Events you've attended will appear here.
                </p>
              </Card>
            ) : (
              <div className="space-y-4 opacity-75">
                {pastEvents.map(renderEventCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
