import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { ProfilePreviewModal } from "../components/ProfilePreviewModal";
import { JoinRequestModal } from "../components/JoinRequestModal";
import { StatusBadge } from "../components/StatusBadge";
import { mockEvents, User } from "../utils/mockData";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Languages,
  MessageCircle,
  Share2,
  ChevronRight,
  Send,
} from "lucide-react";

export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isJoinRequestOpen, setIsJoinRequestOpen] = useState(false);
  const [joinRequestStatus, setJoinRequestStatus] = useState<"idle" | "pending">("idle");

  const event = mockEvents.find((e) => e.id === id);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsPreviewOpen(true);
  };

  const handleViewFullProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleJoinRequest = (message: string) => {
    // In real app, send API request here
    console.log("Join request sent:", { eventId: id, message });
    setJoinRequestStatus("pending");
    // Navigate to joined events after requesting
    setTimeout(() => {
      navigate("/joined-events");
    }, 1000);
  };

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t("event_details")}</h1>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Event Card */}
          <Card className="overflow-hidden">
            {/* Hero Image */}
            <div className="h-64 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center">
                <Badge className={categoryColors[event.category]}>
                  {t(event.category as any)}
                </Badge>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.distance} km away</span>
                </div>
              </div>

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
                    onClick={() => navigate(`/profile/${event.host.id}`)}
                  >
                    View Profile
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">{t("description")}</h3>
                <p className="text-muted-foreground">{event.description}</p>
              </div>

              {/* Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("participants")}</p>
                      <p className="font-medium">
                        {event.currentParticipants}/{event.maxParticipants} joined
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Languages className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Languages</p>
                      <p className="font-medium">{event.languages.join(", ")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("location")}
                </h3>
                <Card className="p-4 bg-muted/30">
                  <p className="font-medium mb-2">{event.location}</p>
                  {/* Mock Map */}
                  <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Map Preview</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Participants */}
              {event.participants.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      {t("participants")} ({event.participants.length})
                    </h3>
                    {event.participants.length > 4 && (
                      <span className="text-sm text-muted-foreground">
                        Swipe to see all →
                      </span>
                    )}
                  </div>
                  
                  {/* Horizontal scrollable participant avatars */}
                  <div className="relative">
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                      {event.participants.map((participant) => (
                        <motion.button
                          key={participant.id}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUserClick(participant)}
                          className="flex-shrink-0 w-24 snap-start group"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative">
                              <Avatar className="h-16 w-16 ring-2 ring-muted transition-all group-hover:ring-4 group-hover:ring-primary/40">
                                <AvatarImage
                                  src={participant.avatar}
                                  alt={participant.name}
                                />
                                <AvatarFallback>{participant.name[0]}</AvatarFallback>
                              </Avatar>
                              {participant.id === event.host.id && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                  ★
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium truncate w-full group-hover:text-primary transition-colors">
                                {participant.name.split(" ")[0]}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-0.5">
                                <Languages className="h-3 w-3" />
                                {participant.languages[0]}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Desktop grid view for larger screens */}
                  <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                    {event.participants.map((participant) => (
                      <motion.button
                        key={`desktop-${participant.id}`}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUserClick(participant)}
                        className="p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 ring-2 ring-muted transition-all group-hover:ring-primary/40">
                            <AvatarImage
                              src={participant.avatar}
                              alt={participant.name}
                            />
                            <AvatarFallback>{participant.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {participant.name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Languages className="h-3 w-3" />
                              {participant.languages[0]}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              className="flex-1"
              disabled={event.currentParticipants >= event.maxParticipants}
              onClick={() => setIsJoinRequestOpen(true)}
            >
              {event.currentParticipants >= event.maxParticipants
                ? "Event Full"
                : t("send_join_request")}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/event/${event._id || event.id}/chat`)}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        user={selectedUser}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onViewFullProfile={handleViewFullProfile}
      />

      {/* Join Request Modal */}
      <JoinRequestModal
        event={event}
        isOpen={isJoinRequestOpen}
        onClose={() => setIsJoinRequestOpen(false)}
        onSubmit={handleJoinRequest}
      />
    </div>
  );
}