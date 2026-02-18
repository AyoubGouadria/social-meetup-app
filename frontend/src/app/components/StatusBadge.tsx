import { Badge } from "./ui/badge";
import { Clock, CheckCircle2, XCircle, MessageCircle } from "lucide-react";

type StatusType = "pending" | "accepted" | "declined" | "joined";

interface StatusBadgeProps {
  status: StatusType;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const configs = {
    pending: {
      icon: Clock,
      text: "Pending",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    accepted: {
      icon: CheckCircle2,
      text: "Accepted",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    declined: {
      icon: XCircle,
      text: "Declined",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    joined: {
      icon: MessageCircle,
      text: "Joined",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1 font-medium border`}
    >
      <Icon className={iconSizes[size]} />
      {config.text}
    </Badge>
  );
}
