import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  MessageSquare,
  Search,
  Calendar,
  Users,
  Loader2,
  Coffee,
  Utensils,
  BookOpen,
  Dumbbell,
  Music,
  Camera,
  Gamepad2,
  MapPin,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import chatService from "../../services/chatService";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  event: {
    _id: string;
    title: string;
    category: string;
    startTime: string;
    creator: {
      _id: string;
      name: string;
      avatar: string;
    };
    participantCount: number;
  };
  lastMessage: {
    text: string;
    createdAt: string;
    user: {
      _id: string;
      name: string;
      avatar: string;
    };
  } | null;
  unreadCount: number;
  totalMessages: number;
}

const categoryIcons: Record<string, any> = {
  coffee: Coffee,
  food: Utensils,
  study: BookOpen,
  sports: Dumbbell,
  nightlife: Music,
  culture: Camera,
  gaming: Gamepad2,
  outdoor: MapPin,
};

export default function Messages() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load conversations
  useEffect(() => {
    loadConversations();

    // Refresh when page becomes visible again (user comes back from chat)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadConversations();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Filter conversations based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = conversations.filter(
        (conv) =>
          conv.event.title.toLowerCase().includes(query) ||
          conv.event.creator.name.toLowerCase().includes(query) ||
          conv.lastMessage?.text.toLowerCase().includes(query)
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      console.log('Loading conversations...');
      const response = await chatService.getConversations();
      console.log('Conversations response:', response);
      console.log('Conversations data:', response.data);
      setConversations(response.data || []);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationClick = (eventId: string) => {
    navigate(`/chat/${eventId}`);
  };

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || MessageSquare;
    return Icon;
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Messenger</h1>
              <p className="text-sm text-muted-foreground">
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="container mx-auto px-4 py-6">
        {filteredConversations.length === 0 ? (
          <Card className="p-12 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {searchQuery ? "No conversations found" : "No messages yet"}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Join events to start chatting with other participants"}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={() => navigate("/home")} className="mt-4">
                  Explore Events
                </Button>
              )}
            </motion.div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conversation, index) => {
              const CategoryIcon = getCategoryIcon(conversation.event.category);
              const isUnread = conversation.unreadCount > 0;

              return (
                <motion.div
                  key={conversation.event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`p-4 hover:shadow-md transition-all cursor-pointer ${
                      isUnread ? "border-primary border-2" : ""
                    }`}
                    onClick={() => handleConversationClick(conversation.event._id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Event Icon */}
                      <div className="flex-shrink-0 relative">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <CategoryIcon className="h-7 w-7 text-primary" />
                        </div>
                        {isUnread && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                          >
                            {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold truncate ${isUnread ? "text-primary" : ""}`}>
                            {conversation.event.title}
                          </h3>
                          {conversation.lastMessage && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatMessageTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        {/* Event Info */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{conversation.event.participantCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(conversation.event.startTime).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Last Message */}
                        {conversation.lastMessage ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={conversation.lastMessage.user.avatar} />
                              <AvatarFallback>
                                {conversation.lastMessage.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <p className={`text-sm truncate ${isUnread ? "font-medium" : "text-muted-foreground"}`}>
                              <span className="font-medium">
                                {conversation.lastMessage.user.name}:
                              </span>{" "}
                              {truncateText(conversation.lastMessage.text, 50)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No messages yet
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
