import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Event } from "../utils/mockData";
import { Send, Languages, Calendar, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface JoinRequestModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

export function JoinRequestModal({
  event,
  isOpen,
  onClose,
  onSubmit,
}: JoinRequestModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(message);
      setMessage("");
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle>Request to Join</DialogTitle>
            <DialogDescription>
              Send a join request to the event host
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Event Info */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">{event.title}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{event.distance} km</span>
                </div>
              </div>
            </div>

            {/* Host Info */}
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Avatar className="h-12 w-12">
                <AvatarImage src={event.host.avatar} alt={event.host.name} />
                <AvatarFallback>{event.host.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Host</p>
                <p className="font-semibold">{event.host.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Languages className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {event.host.languages.slice(0, 2).join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Introduce yourself <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                placeholder="Say hi or share why you'd like to join..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={200}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/200
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
