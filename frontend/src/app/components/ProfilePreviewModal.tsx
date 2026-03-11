import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { User } from "../utils/mockData";
import { MapPin, Languages, Calendar, Users } from "lucide-react";
import { motion } from "motion/react";

interface ProfilePreviewModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullProfile: (userId: string) => void;
}

export function ProfilePreviewModal({
  user,
  isOpen,
  onClose,
  onViewFullProfile,
}: ProfilePreviewModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Profile Preview</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary/10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                </Avatar>
              </motion.div>
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{user.city}</span>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-center text-muted-foreground">
                {user.bio}
              </p>
            </div>

            {/* Languages */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Languages className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Languages</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="rounded-full">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <Calendar className="h-5 w-5 mx-auto mb-1.5 text-primary" />
                <p className="text-xs text-muted-foreground mb-0.5">Member since</p>
                <p className="text-sm font-semibold">Feb 2026</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <Users className="h-5 w-5 mx-auto mb-1.5 text-primary" />
                <p className="text-xs text-muted-foreground mb-0.5">Events joined</p>
                <p className="text-sm font-semibold">12</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  onViewFullProfile(user.id);
                  onClose();
                }}
              >
                View Full Overview
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
