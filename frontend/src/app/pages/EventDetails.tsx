import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { ProfilePreviewModal } from "../components/ProfilePreviewModal";
import { LocationMapModal } from "../components/LocationMapModal";
import { StatusBadge } from "../components/StatusBadge";
import { BottomNav } from "../components/BottomNav";
import { Header } from "../components/Header";
import eventService, { Event } from "../../services/eventService";
import joinRequestService, { JoinRequest } from "../../services/joinRequestService";
import { useToast } from "../components/ui/use-toast";
import { motion } from "motion/react";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Languages,
  MessageCircle,
  ChevronRight,
  Bell,
  Check,
  X,
  Loader2,
  Navigation,
  Edit2,
  Trash2,
  ArrowLeft,
} from "lucide-react";

export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEvent();
      // Get current user ID from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id);
      }
    }
  }, [id]);

  useEffect(() => {
    if (event && currentUserId && event.host._id === currentUserId) {
      fetchJoinRequests();
    }
  }, [event, currentUserId]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await eventService.getEvent(id!);
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const response = await joinRequestService.getEventJoinRequests(id!);
      setJoinRequests(response.data || []);
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
      fetchEvent();
      fetchJoinRequests();
    } catch (error: any) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept request.",
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
      fetchJoinRequests();
    } catch (error: any) {
      console.error("Error declining request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to decline request.",
        variant: "destructive",
      });
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setIsPreviewOpen(true);
  };

  const handleViewFullProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleEditEvent = () => {
    navigate(`/edit-event/${event?._id}`);
  };

  const handleDeleteEvent = async () => {
    if (!event?._id) return;
    
    try {
      setIsDeleting(true);
      await eventService.deleteEvent(event._id);
      toast({
        title: "Success",
        description: "Event deleted successfully.",
      });
      navigate("/my-events");
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Extract short location name (city name) from full address
  const getShortLocation = (fullAddress: string): string => {
    if (!fullAddress) return "";
    
    // Split by comma
    const parts = fullAddress.split(',').map(p => p.trim());
    
    // If there are multiple parts, try to find the city name
    if (parts.length > 3) {
      // Usually the city is the 4th part (after POI, number, street)
      // or we can look for the part before "Landkreis" or postal code
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        // Skip if it's a number, starts with Landkreis, or is a postal code
        if (/^\d+$/.test(part) || part.toLowerCase().startsWith('landkreis')) {
          continue;
        }
        // If next part contains "Landkreis" or postal code, this is likely the city
        if (i < parts.length - 1) {
          const nextPart = parts[i + 1];
          if (nextPart.toLowerCase().includes('landkreis') || /\d{5}/.test(nextPart)) {
            return part;
          }
        }
      }
      // Fallback: return the 4th element if it exists and isn't a number
      if (parts.length >= 4 && !/^\d+$/.test(parts[3])) {
        return parts[3];
      }
    }
    
    // Fallback: return first part if it's reasonable length
    return parts[0].length > 50 ? parts[0].substring(0, 47) + '...' : parts[0];
  };

  const isHost = currentUserId && event && event.host._id === currentUserId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <Button onClick={() => navigate("/home")}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const categoryColors: Record<typeof event.category, string> = {
    coffee: "bg-amber-100 text-amber-800",
    walk: "bg-green-100 text-green-800",
    study: "bg-purple-100 text-purple-800",
    gym: "bg-red-100 text-red-800",
    explore: "bg-blue-100 text-blue-800",
    other: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Header */}
      <Header />

      {/* Page Title Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-14 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8 absolute left-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Event Details</h1>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Event Card */}
          <Card className="overflow-hidden shadow-lg">
            {/* Hero Section with gradient */}
            <div className="relative h-56 bg-gradient-to-br from-primary via-primary/90 to-primary/70 overflow-hidden">
              {/* Pattern overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
              
              {/* Category and Location Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                <Badge className="bg-white/95 text-foreground hover:bg-white border-0 capitalize text-sm px-4 py-1.5 shadow-lg flex items-center gap-2">
                  {t(event.category as any)}
                </Badge>
                <button
                  onClick={() => {
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
                  className="bg-white/95 hover:bg-white border-0 capitalize text-sm px-4 py-1.5 shadow-lg rounded-full flex items-center gap-2 transition-all"
                >
                  <Navigation className="h-4 w-4" />
                  <span>{getShortLocation(event.location)}</span>
                </button>
              </div>

              {/* Title and Date/Time */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/50 to-transparent">
                <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">{event.title}</h1>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {event.time}</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Host Info */}
              <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer"
                    onClick={() => handleUserClick(event.host)}
                  >
                    <Avatar className="h-16 w-16 ring-2 ring-primary/20 transition-all hover:ring-4 hover:ring-primary/30">
                      <AvatarImage src={event.host.avatar} alt={event.host.name} />
                      <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-xs text-primary font-medium mb-1 uppercase tracking-wide">
                      {t("host")}
                    </p>
                    <button
                      onClick={() => handleUserClick(event.host)}
                      className="text-lg font-bold hover:text-primary transition-colors text-left"
                    >
                      {event.host.name}
                    </button>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {event.host.languages.slice(0, 2).join(", ")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => navigate(`/profile/${event.host._id}`)}
                  >
                    View Profile
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* Description */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">{t("description")}</h3>
                <p className="text-foreground leading-relaxed">{event.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                {/* Date Card */}
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-0.5">Date</p>
                      <p className="font-semibold text-blue-900 text-sm">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Time Card */}
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-medium uppercase tracking-wide mb-0.5">Time</p>
                      <p className="font-semibold text-purple-900 text-sm">{event.time}</p>
                    </div>
                  </div>
                </Card>

                {/* Participants Card */}
                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-0.5">{t("participants")}</p>
                      <p className="font-semibold text-green-900 text-sm">
                        {event.participants?.length || 0}/{event.maxParticipants}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Languages Card */}
                <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                      <Languages className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-amber-600 font-medium uppercase tracking-wide mb-0.5">Languages</p>
                      <p className="font-semibold text-amber-900 text-sm truncate">{event.languages.join(", ")}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("location")}
                </h3>
                <Card className="p-4 bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-medium flex-1 break-words text-rose-900">{event.location}</p>
                  </div>
                  <Button
                    onClick={() => {
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
                    className="w-full gap-2 bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    <Navigation className="h-4 w-4" />
                    Open in Google Maps
                  </Button>
                </Card>
              </div>

              {/* Participants */}
              {event.participants && event.participants.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      {t("participants")} ({event.participants.length})
                    </h3>
                  </div>
                  
                  {/* Unified grid layout */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {event.participants.map((participant) => (
                      <motion.button
                        key={participant._id}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUserClick(participant)}
                        className="relative p-4 rounded-xl border-2 border-muted hover:border-primary/50 bg-gradient-to-br from-white to-muted/30 hover:shadow-lg transition-all group"
                      >
                        {/* Host Star Badge */}
                        {participant._id === event.host._id && (
                          <div className="absolute -top-2 -right-2 h-7 w-7 bg-primary rounded-full flex items-center justify-center shadow-lg z-10 border-2 border-white">
                            <span className="text-xs font-bold text-white">★</span>
                          </div>
                        )}
                        
                        <div className="flex flex-col items-center gap-3">
                          <Avatar className="h-20 w-20 ring-4 ring-muted transition-all group-hover:ring-primary/40 shadow-md">
                            <AvatarImage
                              src={participant.avatar}
                              alt={participant.name}
                            />
                            <AvatarFallback className="text-lg">{participant.name[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="text-center w-full">
                            <p className="font-semibold text-sm truncate w-full group-hover:text-primary transition-colors mb-1">
                              {participant.name}
                            </p>
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                              <Languages className="h-3 w-3" />
                              <span className="truncate">{participant.languages?.[0] || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Join Requests Section (Only for Host) */}
          {isHost && joinRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="p-6 border-amber-500 border-2 bg-amber-50/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-amber-600" />
                    Pending Join Requests ({joinRequests.length})
                  </h3>
                </div>

                <div className="space-y-4">
                  {joinRequests.map((request) => (
                    <Card key={request._id} className="p-4 bg-white">
                      <div className="flex items-start gap-4">
                        <Avatar
                          className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                          onClick={() => navigate(`/profile/${request.user._id}`)}
                        >
                          <AvatarImage src={request.user.avatar} alt={request.user.name} />
                          <AvatarFallback>{request.user.name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => navigate(`/profile/${request.user._id}`)}
                            className="font-semibold hover:text-primary transition-colors"
                          >
                            {request.user.name}
                          </button>
                          <div className="flex items-center gap-1.5 mt-1 mb-2">
                            <Languages className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {request.user.languages.join(", ")}
                            </span>
                          </div>
                          
                          {request.message && (
                            <div className="bg-muted/50 rounded p-2 mb-2">
                              <p className="text-sm italic text-muted-foreground">
                                "{request.message}"
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => handleDeclineRequest(request._id)}
                            >
                              <X className="h-3.5 w-3.5" />
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              className="gap-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleAcceptRequest(request._id)}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <Card className="sticky bottom-20 md:static p-4 bg-white border-2 shadow-lg">
            {!isHost && (
              <Button
                className="w-full h-12"
                onClick={() => navigate(`/event/${event._id}/chat`)}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Group Chat
              </Button>
            )}

            {isHost && (
              <div className="space-y-3">
                <Button
                  className="w-full h-12"
                  onClick={() => navigate(`/event/${event._id}/chat`)}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Group Chat
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-12 gap-2"
                    onClick={handleEditEvent}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Event
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        user={selectedUser}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onViewFullProfile={handleViewFullProfile}
      />

      {/* Location Map Modal */}
      {event && (
        <LocationMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          location={{
            address: event.location,
            coordinates: event.locationCoords,
          }}
          title={event.title}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Delete Event?</h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete "{event?.title}"? This action cannot be undone and all participants will be notified.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteEvent}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}