import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { StatusBadge } from "../components/StatusBadge";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import eventService, { Event } from "../../services/eventService";
import joinRequestService, { JoinRequest } from "../../services/joinRequestService";
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
  Loader2,
} from "lucide-react";

export default function JoinedEvents() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJoinedEvents();
    fetchPendingRequests();
  }, []);

  const fetchJoinedEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getJoinedEvents();
      setJoinedEvents(response.data || []);
    } catch (error) {
      console.error("Error fetching joined events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await joinRequestService.getMyJoinRequests();
      const pending = (response.data || []).filter(
        (req: JoinRequest) => req.status === 'pending'
      );
      setPendingRequests(pending);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const upcomingEvents = joinedEvents.filter(
    (event) => new Date(event.date) >= new Date()
  );

  const pastEvents = joinedEvents.filter(
    (event) => new Date(event.date) < new Date()
  );

  const renderEventCard = (event: Event, index: number) => {
    return (
      <motion.div
        key={event._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card
          className="p-5 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate(`/event/${event._id}`)}
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold mb-1 truncate">{event.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              </div>
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
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span>
                  {event.participants?.length || 0}/{event.maxParticipants}
                </span>
              </div>
            </div>

            {/* Host Info */}
            <div className="flex items-center gap-3 pt-2 border-t">
              <Avatar
                className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${event.host._id}`);
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
                    navigate(`/profile/${event.host._id}`);
                  }}
                  className="text-sm font-medium hover:text-primary transition-colors truncate block w-full text-left"
                >
                  {event.host.name}
                </button>
              </div>

              {/* Action Buttons */}
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/event/${event._id}/chat`);
                }}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Joined Events</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
              {pendingRequests.length > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {pendingRequests.length}
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
            {pendingRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 mb-4">
                  <Clock className="h-10 w-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground mb-6">
                  Join requests awaiting host approval will appear here.
                </p>
                <Button onClick={() => navigate("/home")} size="lg">
                  Discover Events
                </Button>
              </Card>
            ) : (
              pendingRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="p-5 hover:shadow-lg transition-all cursor-pointer border-yellow-200 bg-yellow-50/30"
                    onClick={() => navigate(`/event/${request.event._id}`)}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold truncate">{request.event.title}</h3>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                          {request.message && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {request.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(request.event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{request.event.location}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await joinRequestService.cancelJoinRequest(request._id);
                              setPendingRequests(prev => prev.filter(r => r._id !== request._id));
                            } catch (error) {
                              console.error("Error canceling request:", error);
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Request
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/event/${request.event._id}`);
                          }}
                        >
                          View Event
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
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
        )}
      </main>

      <BottomNav />
    </div>
  );
}
