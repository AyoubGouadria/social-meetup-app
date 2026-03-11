import { MapPin, Calendar, Clock, Users, Languages, Bell, Navigation } from "lucide-react";
import { Event } from "../../services/eventService";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import { useState } from "react";
import { LocationMapModal } from "./LocationMapModal";

interface EventCardProps {
  event: Event;
  onJoin?: () => void;
  onClick?: () => void;
  onHostClick?: () => void;
  onParticipantClick?: (participant: Event['participants'][0]) => void;
  onViewRequests?: () => void;
  showRequestsBadge?: boolean;
}

export function EventCard({ event, onJoin, onClick, onHostClick, onParticipantClick, onViewRequests, showRequestsBadge = false }: EventCardProps) {
  const { t } = useLanguage();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const categoryColors: Record<Event["category"], string> = {
    coffee: "bg-amber-100 text-amber-800",
    walk: "bg-green-100 text-green-800",
    study: "bg-purple-100 text-purple-800",
    gym: "bg-red-100 text-red-800",
    explore: "bg-blue-100 text-blue-800",
    other: "bg-gray-100 text-gray-800",
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
      onClick={onClick}
    >
      {/* Pending Requests Badge */}
      {showRequestsBadge && event.pendingRequestCount && event.pendingRequestCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 z-10"
        >
          <Badge 
            className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 px-2.5 py-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onViewRequests?.();
            }}
          >
            <Bell className="h-3.5 w-3.5" />
            {event.pendingRequestCount} {event.pendingRequestCount === 1 ? 'request' : 'requests'}
          </Badge>
        </motion.div>
      )}
      
      <div className="p-6 space-y-4">
        {/* Host Info */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onHostClick?.();
            }}
            className="flex-shrink-0"
          >
            <Avatar className="h-12 w-12 ring-2 ring-muted transition-all hover:ring-primary/40">
              <AvatarImage src={event.host.avatar} alt={event.host.name} />
              <AvatarFallback>{event.host.name[0]}</AvatarFallback>
            </Avatar>
          </motion.button>
          <div className="flex-1 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHostClick?.();
              }}
              className="font-medium truncate hover:text-primary transition-colors text-left w-full"
            >
              {event.host.name}
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{event.host.city || "Unknown City"}</span>
            </div>
          </div>
          <Badge className={categoryColors[event.category]}>
            {t(event.category as keyof typeof categoryColors)}
          </Badge>
        </div>

        {/* Event Title */}
        <h3 className="text-xl font-semibold">{event.title}</h3>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
          </div>
          <div className="flex items-start gap-2 group">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-foreground">{event.location}</span>
                {event.locationCoords && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMapModalOpen(true);
                    }}
                  >
                    <Navigation className="h-3 w-3" />
                    View on Map
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>
              {event.participants?.length || 0}/{event.maxParticipants} {t("participants").toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{event.languages.join(", ")}</span>
          </div>
        </div>

        {/* Participants Avatars */}
        {event.participants && event.participants.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {event.participants.slice(0, 3).map((participant) => (
                <motion.button
                  key={participant._id}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onParticipantClick?.(participant);
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
            {event.participants.length > 3 && (
              <span className="text-sm text-muted-foreground">
                +{event.participants.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Join Button */}
        {onJoin && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onJoin();
            }}
            className="w-full"
            disabled={(event.participants?.length || 0) >= event.maxParticipants}
          >
            {(event.participants?.length || 0) >= event.maxParticipants 
              ? "Full" 
              : t("join")}
          </Button>
        )}
      </div>
      
      {/* Location Map Modal */}
      <LocationMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        location={{
          address: event.location,
          coordinates: event.locationCoords,
        }}
        title={event.title}
      />
    </Card>
  );
}
