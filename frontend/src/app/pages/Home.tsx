import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Header } from "../components/Header";
import { EventCard } from "../components/EventCard";
import { ProfilePreviewModal } from "../components/ProfilePreviewModal";
import { BottomNav } from "../components/BottomNav";
import { User } from "../utils/mockData";
import eventService, { Event } from "../../services/eventService";
import joinRequestService from "../../services/joinRequestService";
import { useToast } from "../components/ui/use-toast";
import { 
  Plus, MapPin, Calendar, Clock, X, Heart, 
  MessageCircle, Coffee, Dumbbell, BookOpen, 
  Footprints, Compass, Loader2, Users
} from "lucide-react";
import TinderCard from "react-tinder-card";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { motion } from "motion/react";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "all",
    distance: 10,
    language: "all",
  });
  const [viewMode, setViewMode] = useState<"swipe" | "grid">("swipe");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getEvents();
      console.log("Events API response:", response);
      setEvents(response.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      // Show empty state instead of error to user
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsPreviewOpen(true);
  };

  const handleViewFullProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters.category !== "all" && event.category !== filters.category) return false;
      // TODO: Add distance calculation based on locationCoords
      if (filters.language !== "all" && !event.languages.includes(filters.language)) return false;
      return true;
    });
  }, [events, filters]);

  const handleSwipe = async (direction: string, eventId: string) => {
    if (direction === "right") {
      // Liked - send join request
      try {
        await joinRequestService.createJoinRequest(eventId);
        toast({
          title: "Request Sent!",
          description: "Your join request has been sent to the host.",
        });
      } catch (error: any) {
        console.error("Error sending join request:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to send join request. Please try again.",
          variant: "destructive",
        });
      }
    }
    // Remove from deck after swipe
    setTimeout(() => {
      setEvents(events.filter((e) => e._id !== eventId));
    }, 300);
  };

  const categoryIcons: Record<string, any> = {
    coffee: Coffee,
    walk: Footprints,
    study: BookOpen,
    gym: Dumbbell,
    explore: Compass,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header 
        showFilters={true}
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : viewMode === "swipe" ? (
          <div className="max-w-md mx-auto">
            {/* Instructions for first-time users */}
            <div className="mb-6 p-4 bg-accent rounded-lg">
              <p className="text-sm text-center">
                <strong>Swipe right</strong> to join an event or <strong>left</strong> to pass
              </p>
            </div>

            <div className="relative h-[600px]">
              {filteredEvents.length === 0 ? (
                <Card className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">No more events</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or create your own event!
                    </p>
                    <Button onClick={() => navigate("/create-event")}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("create_event")}
                    </Button>
                  </div>
                </Card>
              ) : (
                <>
                  {filteredEvents.map((event, index) => {
                    const Icon = categoryIcons[event.category] || Users;
                    return (
                      <TinderCard
                        key={event._id}
                        onSwipe={(dir) => handleSwipe(dir, event._id)}
                        preventSwipe={["up", "down"]}
                        className="absolute inset-0"
                      >
                        <Card className="h-full overflow-hidden cursor-grab active:cursor-grabbing">
                          <div className="h-full flex flex-col">
                            {/* Event Image */}
                            <div className="relative h-64 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Icon className="h-24 w-24 text-primary/30" />
                            </div>

                            {/* Event Info */}
                            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                              <div className="flex items-start gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUserClick(event.host);
                                  }}
                                  className="flex-shrink-0"
                                >
                                  <Avatar className="h-12 w-12 ring-2 ring-muted transition-all hover:ring-primary/40">
                                    <AvatarImage
                                      src={event.host.avatar}
                                      alt={event.host.name}
                                    />
                                    <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                                  </Avatar>
                                </motion.button>
                                <div className="flex-1 min-w-0">
                                  <h2 className="text-2xl font-bold">{event.title}</h2>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUserClick(event.host);
                                    }}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    Hosted by {event.host.name}
                                  </button>
                                </div>
                              </div>

                              <p className="text-muted-foreground">{event.description}</p>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {new Date(event.date).toLocaleDateString()} at {event.time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {event.participants?.length || 0}/{event.maxParticipants}{" "}
                                    {t("participants").toLowerCase()}
                                  </span>
                                </div>
                              </div>

                              {/* Participants Avatars */}
                              {event.participants && event.participants.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-2">
                                    {event.participants.slice(0, 5).map((participant) => (
                                      <motion.button
                                        key={participant._id}
                                        whileHover={{ scale: 1.1, zIndex: 10 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUserClick(participant);
                                        }}
                                        className="relative"
                                      >
                                        <Avatar className="h-8 w-8 border-2 border-white hover:border-primary/40 transition-all cursor-pointer">
                                          <AvatarImage src={participant.avatar} alt={participant.name} />
                                          <AvatarFallback>{participant.name[0]}</AvatarFallback>
                                        </Avatar>
                                      </motion.button>
                                    ))}
                                  </div>
                                  {event.participants.length > 5 && (
                                    <span className="text-xs text-muted-foreground">
                                      +{event.participants.length - 5} more
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {event.languages.map((lang) => (
                                  <Badge key={lang} variant="outline">
                                    {lang}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Swipe Instructions */}
                            <div className="p-6 border-t bg-muted/30">
                              <div className="flex items-center justify-center gap-12">
                                <div className="text-center">
                                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                    <X className="h-6 w-6 text-destructive" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Pass</p>
                                </div>
                                <div className="text-center">
                                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Heart className="h-6 w-6 text-primary" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Join</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </TinderCard>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onClick={() => navigate(`/event/${event._id}`)}
                onHostClick={() => handleUserClick(event.host)}
                onParticipantClick={(participant) => handleUserClick(participant)}
                onJoin={async () => {
                  try {
                    await joinRequestService.createJoinRequest(event._id);
                    toast({
                      title: "Request Sent!",
                      description: "Your join request has been sent to the host.",
                    });
                    // Remove event from list
                    setEvents(events.filter((e) => e._id !== event._id));
                  } catch (error: any) {
                    toast({
                      title: "Error",
                      description: error.message || "Failed to send join request.",
                      variant: "destructive",
                    });
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => navigate("/create-event")}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        user={selectedUser}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onViewFullProfile={handleViewFullProfile}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}