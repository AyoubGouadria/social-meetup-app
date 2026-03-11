import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { StatusBadge } from "../components/StatusBadge";
import { ProfilePreviewModal } from "../components/ProfilePreviewModal";
import { User } from "../utils/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import eventService, { Event } from "../../services/eventService";
import joinRequestService, { JoinRequest } from "../../services/joinRequestService";
import { useToast } from "../components/ui/use-toast";
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
  UserCheck,
} from "lucide-react";

export default function MyEvents() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const pendingRequestsRef = useRef<HTMLDivElement>(null);

  const [myCreatedEvents, setMyCreatedEvents] = useState<Event[]>([]);
  const [allJoinRequests, setAllJoinRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventRequests, setSelectedEventRequests] = useState<JoinRequest[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("events");
  const [previewUser, setPreviewUser] = useState<User | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getMyEvents();
      const events = response.data || [];
      setMyCreatedEvents(events);
      
      // Fetch join requests for all events
      if (events.length > 0) {
        fetchAllJoinRequests(events);
      }
    } catch (error) {
      console.error("Error fetching my events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllJoinRequests = async (events: Event[] = myCreatedEvents) => {
    try {
      const requests = await Promise.all(
        events.map(async (event) => {
          try {
            const response = await joinRequestService.getEventJoinRequests(event._id);
            return response.data || [];
          } catch (error) {
            return [];
          }
        })
      );
      setAllJoinRequests(requests.flat());
    } catch (error) {
      console.error("Error fetching join requests:", error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await joinRequestService.acceptJoinRequest(requestId);
      toast({
        title: "Request Accepted",
        description: "The user has been added to your event.",
      });
      // Refresh data
      fetchMyEvents();
      fetchAllJoinRequests();
    } catch (error: any) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await joinRequestService.rejectJoinRequest(requestId);
      toast({
        title: "Request Declined",
        description: "The join request has been rejected.",
      });
      // Refresh data
      fetchAllJoinRequests();
    } catch (error: any) {
      console.error("Error declining request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to decline request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get pending requests count
  const totalPendingRequests = allJoinRequests.length;

  const scrollToPendingRequests = () => {
    setActiveTab("requests");
  };

  const openRequestModal = (event: Event) => {
    const eventRequests = allJoinRequests.filter(
      (r) => r.event._id === event._id
    );
    setSelectedEvent(event);
    setSelectedEventRequests(eventRequests);
    setIsRequestModalOpen(true);
  };

  const handleViewProfile = (userId: string) => {
    setIsPreviewOpen(false);
    navigate(`/profile/${userId}`);
  };

  const openProfilePreview = (requestUser: JoinRequest['user']) => {
    const user: User = {
      id: requestUser._id,
      name: requestUser.name,
      avatar: requestUser.avatar,
      bio: requestUser.bio,
      city: requestUser.city,
      languages: requestUser.languages,
    };
    setPreviewUser(user);
    setIsPreviewOpen(true);
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
              {totalPendingRequests > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 bg-amber-500 hover:bg-amber-600"
                  onClick={() => setActiveTab("requests")}
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">{totalPendingRequests} Request{totalPendingRequests !== 1 && 's'}</span>
                  <span className="sm:hidden">{totalPendingRequests}</span>
                </Button>
              )}
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

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="h-4 w-4" />
                My Events
                {myCreatedEvents.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {myCreatedEvents.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2">
                <Bell className="h-4 w-4" />
                Pending Requests
                {totalPendingRequests > 0 && (
                  <Badge className="ml-1 bg-amber-500">
                    {totalPendingRequests}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* My Events Tab */}
            <TabsContent value="events" className="space-y-6">
              <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Created Events</h2>
              </div>

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
                  {myCreatedEvents.map((event, index) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-l-4 border-l-primary/20 hover:border-l-primary relative"
                        onClick={() => navigate(`/event/${event._id}`)}
                      >
                        {/* Pending Request Badge */}
                        {event.pendingRequestCount > 0 && (
                          <Badge className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-600 text-white gap-1 cursor-pointer z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              openRequestModal(event);
                            }}
                          >
                            <Bell className="h-3 w-3" />
                            {event.pendingRequestCount}
                          </Badge>
                        )}
                        
                        {/* Header Section */}
                        <div className="p-5 pb-4 bg-gradient-to-br from-muted/30 to-background">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold mb-2 truncate group-hover:text-primary transition-colors">
                                {event.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {event.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Event Details Section */}
                        <div className="px-5 py-4 bg-background">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2.5 text-sm">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground font-medium">Date</p>
                                <p className="text-sm font-semibold truncate">
                                  {new Date(event.date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 text-sm">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Clock className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground font-medium">Time</p>
                                <p className="text-sm font-semibold">{event.time}</p>
                              </div>
                            </div>
                            
                            <button
                              className="flex items-center gap-2.5 text-sm w-full hover:bg-primary/5 -mx-2 px-2 py-1 rounded-lg transition-colors text-left"
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
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground font-medium">Location</p>
                                <p className="text-sm font-semibold truncate">{event.location}</p>
                                <p className="text-xs text-primary font-medium">Tap to open in Maps</p>
                              </div>
                            </button>
                            
                            <div className="flex items-center gap-2.5 text-sm">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground font-medium">Attendees</p>
                                <p className="text-sm font-semibold">
                                  {event.participants?.length || 0}/{event.maxParticipants}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer - Participants Section */}
                        <div className="px-5 py-4 bg-background border-t">
                          {/* Participants */}
                          {event.participants && event.participants.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs text-muted-foreground font-medium mb-2">
                                Participants ({event.participants.length})
                              </p>
                              <div className="flex -space-x-2">
                                {event.participants.slice(0, 8).map((participant) => (
                                  <Avatar
                                    key={participant._id}
                                    className="h-9 w-9 border-2 border-background cursor-pointer hover:z-10 hover:scale-110 transition-all ring-2 ring-muted/50 hover:ring-primary/50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/profile/${participant._id}`);
                                    }}
                                  >
                                    <AvatarImage
                                      src={participant.avatar}
                                      alt={participant.name}
                                    />
                                    <AvatarFallback className="text-xs">{participant.name[0]}</AvatarFallback>
                                  </Avatar>
                                ))}
                                {event.participants.length > 8 && (
                                  <div className="h-9 w-9 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold ring-2 ring-muted/50">
                                    +{event.participants.length - 8}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            {event.pendingRequestCount > 0 && (
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600 shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRequestModal(event);
                                }}
                              >
                                <UserCheck className="h-4 w-4" />
                                {event.pendingRequestCount} Request{event.pendingRequestCount !== 1 && 's'}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="flex-1 gap-2 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/event/${event._id}/chat`);
                              }}
                            >
                              <MessageCircle className="h-4 w-4" />
                              Chat
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/event/${event._id}`);
                              }}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              </section>
            </TabsContent>

            {/* Pending Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Bell className="h-6 w-6 text-amber-600" />
                  Pending Join Requests
                </h2>
              </div>

              {totalPendingRequests === 0 ? (
                <Card className="p-12 text-center">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 mb-4">
                    <UserCheck className="h-10 w-10 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
                  <p className="text-muted-foreground mb-6">
                    When someone wants to join your events, they'll appear here.
                  </p>
                  <Button onClick={() => setActiveTab("events")} variant="outline">
                    View My Events
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {allJoinRequests.map((request, index) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-5 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent hover:shadow-md transition-shadow">
                        <div className="space-y-4">
                          {/* User Info */}
                          <div className="flex items-start gap-4">
                            <Avatar
                              className="h-14 w-14 cursor-pointer ring-2 ring-amber-200 hover:ring-amber-400 transition-all"
                              onClick={() => navigate(`/profile/${request.user._id}`)}
                            >
                              <AvatarImage
                                src={request.user.avatar}
                                alt={request.user.name}
                              />
                              <AvatarFallback className="bg-amber-100 text-amber-700">{request.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => navigate(`/profile/${request.user._id}`)}
                                className="font-semibold text-lg hover:text-primary transition-colors"
                              >
                                {request.user.name}
                              </button>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {request.user.languages.join(", ")}
                                </span>
                              </div>
                              {request.user.bio && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {request.user.bio}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Request Message */}
                          {request.message && (
                            <div className="bg-white rounded-lg p-3 border border-amber-200">
                              <p className="text-sm italic text-muted-foreground">
                                "{request.message}"
                              </p>
                            </div>
                          )}

                          {/* Event Info */}
                          <div className="flex items-center justify-between gap-4 bg-white/50 rounded-lg p-3 border">
                            <button
                              onClick={() => navigate(`/event/${request.event._id}`)}
                              className="flex items-center gap-2 text-sm hover:text-primary transition-colors flex-1"
                            >
                              <Calendar className="h-4 w-4 text-amber-600" />
                              <span className="font-medium">For event: {request.event.title}</span>
                            </button>
                            <span className="text-xs text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDeclineRequest(request._id)}
                            >
                              <X className="h-4 w-4" />
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                              onClick={() => handleAcceptRequest(request._id)}
                            >
                              <Check className="h-4 w-4" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Request Modal for Specific Event */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              Join Requests
            </DialogTitle>
            {selectedEvent && (
              <DialogDescription>
                Requests for "{selectedEvent.title}"
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedEventRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending requests for this event</p>
              </div>
            ) : (
              selectedEventRequests.map((request) => (
                <div key={request._id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  {/* User Avatar */}
                  <Avatar
                    className="h-12 w-12 cursor-pointer ring-2 ring-primary/20 hover:ring-primary transition-all"
                    onClick={() => openProfilePreview(request.user)}
                  >
                    <AvatarImage
                      src={request.user.avatar}
                      alt={request.user.name}
                    />
                    <AvatarFallback>{request.user.name[0]}</AvatarFallback>
                  </Avatar>

                  {/* User Name */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => openProfilePreview(request.user)}
                      className="font-medium hover:text-primary transition-colors truncate block"
                    >
                      {request.user.name}
                    </button>
                  </div>

                  {/* Action Icons */}
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        handleDeclineRequest(request._id);
                        setSelectedEventRequests(prev => prev.filter(r => r._id !== request._id));
                        if (selectedEventRequests.length === 1) {
                          setIsRequestModalOpen(false);
                        }
                      }}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => {
                        handleAcceptRequest(request._id);
                        setSelectedEventRequests(prev => prev.filter(r => r._id !== request._id));
                        if (selectedEventRequests.length === 1) {
                          setIsRequestModalOpen(false);
                        }
                      }}
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        user={previewUser}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onViewFullProfile={handleViewProfile}
      />

      <BottomNav />
    </div>
  );
}
