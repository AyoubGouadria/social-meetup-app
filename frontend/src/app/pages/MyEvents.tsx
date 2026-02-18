import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { StatusBadge } from "../components/StatusBadge";
import eventService, { Event } from "../../services/eventService";
import { mockUsers } from "../utils/mockData";
import { motion } from "motion/react";
import {
  Calendar,
  Plus,
  Users,
  MapPin,
  Clock,
  Edit,
  Trash2,
  MessageCircle,
  ChevronRight,
  Bell,
  Languages,
  Check,
  X,
  Loader2,
} from "lucide-react";

export default function MyEvents() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [myCreatedEvents, setMyCreatedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getMyEvents();
      setMyCreatedEvents(response.data || []);
    } catch (error) {
      console.error("Error fetching my events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Fetch join requests from API
  const [pendingRequests, setPendingRequests] = useState([]);

  const handleAcceptRequest = (requestId: string) => {
    console.log("Accepting request:", requestId);
    setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
  };

  const handleDeclineRequest = (requestId: string) => {
    console.log("Declining request:", requestId);
    setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Main Header */}
      <Header />
      
      {/* Page Header */}
      <header className="border-b bg-white sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">My Events</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/notifications")}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => navigate("/create-event")}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Event</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-8">
        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Pending Requests ({pendingRequests.length})
              </h2>
            </div>

            <div className="grid gap-4">
              {pendingRequests.map((request, index) => {
                const event = mockEvents.find((e) => e.id === request.eventId);
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-5 border-l-4 border-l-amber-500 bg-amber-50/50">
                      <div className="space-y-4">
                        {/* User Info */}
                        <div className="flex items-start gap-4">
                          <Avatar
                            className="h-14 w-14 cursor-pointer ring-2 ring-amber-200 hover:ring-primary/40 transition-all"
                            onClick={() => navigate(`/profile/${request.user.id}`)}
                          >
                            <AvatarImage
                              src={request.user.avatar}
                              alt={request.user.name}
                            />
                            <AvatarFallback>{request.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => navigate(`/profile/${request.user.id}`)}
                              className="font-semibold text-lg hover:text-primary transition-colors"
                            >
                              {request.user.name}
                            </button>
                            <div className="flex items-center gap-1.5 mt-1 mb-2">
                              <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {request.user.languages.join(", ")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.user.bio}
                            </p>
                          </div>
                        </div>

                        {/* Request Message */}
                        {request.message && (
                          <div className="bg-white rounded-lg p-3 border">
                            <p className="text-sm italic text-muted-foreground">
                              "{request.message}"
                            </p>
                          </div>
                        )}

                        {/* Event Info */}
                        <button
                          onClick={() => navigate(`/event/${event?.id}`)}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="font-medium">For: {event?.title}</span>
                        </button>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => handleDeclineRequest(request.id)}
                          >
                            <X className="h-4 w-4" />
                            Decline
                          </Button>
                          <Button
                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            <Check className="h-4 w-4" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* My Events Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Your Events</h2>

          {myCreatedEvents.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first event to start meeting people!
              </p>
              <Button onClick={() => navigate("/create-event")} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Event
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myCreatedEvents.map((event, index) => {
                const requestsCount = pendingRequests.filter(
                  (r) => r.eventId === event._id
                ).length;

                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-5 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        {/* Event Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold truncate">
                                {event.title}
                              </h3>
                              {requestsCount > 0 && (
                                <Badge className="bg-amber-100 text-amber-800">
                                  {requestsCount} pending
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(event.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>
                              {event.participants?.length || 0}/{event.maxParticipants} joined
                            </span>
                          </div>
                        </div>

                        {/* Participants */}
                        {event.participants && event.participants.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Participants ({event.participants.length})
                            </p>
                            <div className="flex -space-x-2">
                              {event.participants.slice(0, 8).map((participant) => (
                                <Avatar
                                  key={participant._id}
                                  className="h-8 w-8 border-2 border-white cursor-pointer hover:z-10 hover:scale-110 transition-transform"
                                  onClick={() => navigate(`/profile/${participant._id}`)}
                                >
                                  <AvatarImage
                                    src={participant.avatar}
                                    alt={participant.name}
                                  />
                                  <AvatarFallback>{participant.name[0]}</AvatarFallback>
                                </Avatar>
                              ))}
                              {event.participants.length > 8 && (
                                <div className="h-8 w-8 rounded-full bg-muted border-2 border-white flex items-center justify-center text-xs font-medium">
                                  +{event.participants.length - 8}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => navigate(`/event/${event._id}/chat`)}
                          >
                            <MessageCircle className="h-4 w-4" />
                            Group Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/event/${event._id}`)}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
