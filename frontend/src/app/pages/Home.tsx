import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Header } from "../components/Header";
import { EventCard } from "../components/EventCard";
import { ProfilePreviewModal } from "../components/ProfilePreviewModal";
import { LocationMapModal } from "../components/LocationMapModal";
import { BottomNav } from "../components/BottomNav";
import { User } from "../utils/mockData";
import eventService, { Event } from "../../services/eventService";
import joinRequestService from "../../services/joinRequestService";
import { useToast } from "../components/ui/use-toast";
import { calculateDistance } from "../../lib/utils";
import { 
  Plus, MapPin, Calendar, Clock, X, Heart, 
  MessageCircle, Coffee, Dumbbell, BookOpen, 
  Footprints, Compass, Loader2, Users, Navigation, Languages
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
  const [selectedMapEvent, setSelectedMapEvent] = useState<Event | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchEvents();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access denied or unavailable:", error);
          // Continue without location - distance filter won't work
        }
      );
    }
  };

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
      // Category filter
      if (filters.category !== "all" && event.category !== filters.category) return false;
      
      // Distance filter - only apply if user location and event coordinates are available
      if (userLocation && event.locationCoords) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          event.locationCoords.lat,
          event.locationCoords.lng
        );
        if (distance > filters.distance) return false;
      }
      
      // Language filter
      if (filters.language !== "all" && !event.languages.includes(filters.language)) return false;
      
      return true;
    });
  }, [events, filters, userLocation]);

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
    
    // Remove from deck after swipe animation completes
    setTimeout(() => {
      setEvents(events.filter((e) => e._id !== eventId));
    }, 300);
  };

  const handlePass = (eventId: string) => {
    // Remove event from list after animation
    setTimeout(() => {
      setEvents(events.filter((e) => e._id !== eventId));
    }, 300);
  };

  const handleJoin = async (eventId: string) => {
    try {
      await joinRequestService.createJoinRequest(eventId);
      toast({
        title: "Request Sent!",
        description: "Your join request has been sent to the host.",
      });
      // Remove event from list after animation
      setTimeout(() => {
        setEvents(events.filter((e) => e._id !== eventId));
      }, 300);
    } catch (error: any) {
      console.error("Error sending join request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send join request. Please try again.",
        variant: "destructive",
      });
    }
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
                    const isTopCard = index === 0;
                    
                    return (
                      <div
                        key={event._id}
                        className="absolute inset-0"
                        style={{
                          zIndex: filteredEvents.length - index,
                          opacity: isTopCard ? 1 : 0,
                          transform: isTopCard ? 'scale(1)' : 'scale(0.95)',
                          transition: 'opacity 0.3s ease, transform 0.3s ease',
                          pointerEvents: isTopCard ? 'auto' : 'none'
                        }}
                      >
                        <TinderCard
                          onSwipe={(dir) => handleSwipe(dir, event._id)}
                          preventSwipe={["up", "down"]}
                          className="h-full w-full"
                        >
                          <Card className="h-full overflow-hidden shadow-xl cursor-grab active:cursor-grabbing">
                          <div className="h-full flex flex-col">
                            {/* Hero Section with Category */}
                            <div className="relative h-48 bg-gradient-to-br from-primary via-primary/80 to-primary/60 overflow-hidden">
                              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
                              <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                                <Badge className="bg-white/95 text-foreground hover:bg-white border-0 capitalize text-sm px-3 py-1.5 shadow-lg">
                                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                                  {t(event.category as any)}
                                </Badge>
                                {event.locationCoords && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white/95 hover:bg-white text-foreground shadow-lg h-8 px-3"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMapEvent(event);
                                      setIsMapModalOpen(true);
                                    }}
                                  >
                                    <Navigation className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="truncate max-w-[120px]">
                                      {(() => {
                                        const parts = event.location.split(',').map(p => p.trim());
                                        // Try to find the city (usually at index 3, or fallback to first non-numeric part)
                                        return parts[3] || parts.find(p => p && isNaN(Number(p))) || parts[0];
                                      })()}
                                    </span>
                                  </Button>
                                )}
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                <h2 className="text-2xl font-bold text-white mb-1 line-clamp-2">{event.title}</h2>
                                <div className="flex items-center gap-2 text-white/90 text-sm">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span className="font-medium">
                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {event.time}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 overflow-y-auto">
                              {/* Host Info */}
                              <div className="px-6 py-4 border-b bg-muted/30">
                                <div className="flex items-center gap-3">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUserClick(event.host);
                                    }}
                                    className="flex-shrink-0"
                                  >
                                    <Avatar className="h-11 w-11 ring-2 ring-background shadow-md">
                                      <AvatarImage src={event.host.avatar} alt={event.host.name} />
                                      <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                                    </Avatar>
                                  </motion.button>
                                  <div className="flex-1 min-w-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUserClick(event.host);
                                      }}
                                      className="font-semibold text-sm hover:text-primary transition-colors text-left w-full truncate"
                                    >
                                      {event.host.name}
                                    </button>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      <span className="truncate">{event.host.city}</span>
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    Host
                                  </Badge>
                                </div>
                              </div>

                              {/* Description */}
                              <div className="px-6 py-4">
                                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                  {event.description}
                                </p>
                              </div>

                              {/* Key Info Cards */}
                              <div className="px-6 pb-4 space-y-3">
                                {/* Location Card */}
                                <button
                                  className="w-full bg-primary/5 border border-primary/20 rounded-lg p-3 hover:bg-primary/10 transition-colors text-left"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (event.locationCoords) {
                                      window.open(
                                        `https://www.google.com/maps/search/?api=1&query=${event.locationCoords.lat},${event.locationCoords.lng}`,
                                        '_blank'
                                      );
                                    } else {
                                      window.open(
                                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`,
                                        '_blank'
                                      );
                                    }
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <MapPin className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Location</p>
                                      <p className="text-sm font-semibold text-foreground truncate">
                                        {event.location}
                                      </p>
                                      <p className="text-xs text-primary font-medium mt-1">Tap to open in Maps</p>
                                    </div>
                                  </div>
                                </button>

                                {/* Participants Card */}
                                <div className="bg-muted/50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                      <Users className="h-4 w-4" />
                                      <span>Participants</span>
                                    </div>
                                    <span className="text-sm font-bold">
                                      {event.participants?.length || 0}/{event.maxParticipants}
                                    </span>
                                  </div>
                                  {event.participants && event.participants.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <div className="flex -space-x-2">
                                        {event.participants.slice(0, 4).map((participant) => (
                                          <motion.button
                                            key={participant._id}
                                            whileHover={{ scale: 1.15, zIndex: 10 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleUserClick(participant);
                                            }}
                                            className="relative"
                                          >
                                            <Avatar className="h-7 w-7 border-2 border-background hover:border-primary/40 transition-all shadow-sm">
                                              <AvatarImage src={participant.avatar} alt={participant.name} />
                                              <AvatarFallback className="text-xs">{participant.name[0]}</AvatarFallback>
                                            </Avatar>
                                          </motion.button>
                                        ))}
                                      </div>
                                      {event.participants.length > 4 && (
                                        <span className="text-xs text-muted-foreground font-medium">
                                          +{event.participants.length - 4} more joined
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Languages */}
                                {event.languages && event.languages.length > 0 && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Languages className="h-4 w-4 text-muted-foreground" />
                                    {event.languages.slice(0, 3).map((lang) => (
                                      <Badge key={lang} variant="outline" className="text-xs">
                                        {lang}
                                      </Badge>
                                    ))}
                                    {event.languages.length > 3 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{event.languages.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Footer */}
                            <div className="p-4 border-t bg-background">
                              <div className="flex items-center justify-center gap-8">
                                <motion.button
                                  className="text-center cursor-pointer"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePass(event._id);
                                  }}
                                >
                                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 shadow-md">
                                    <X className="h-6 w-6 text-destructive" />
                                  </div>
                                  <p className="text-xs font-medium text-muted-foreground mt-1">Pass</p>
                                </motion.button>
                                <motion.button
                                  className="text-center cursor-pointer"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleJoin(event._id);
                                  }}
                                >
                                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shadow-md">
                                    <Heart className="h-6 w-6 text-primary" />
                                  </div>
                                  <p className="text-xs font-medium text-muted-foreground mt-1">Join</p>
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </TinderCard>
                      </div>
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

      {/* Location Map Modal */}
      {selectedMapEvent && (
        <LocationMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          location={{
            address: selectedMapEvent.location,
            coordinates: selectedMapEvent.locationCoords,
          }}
          title={selectedMapEvent.title}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}