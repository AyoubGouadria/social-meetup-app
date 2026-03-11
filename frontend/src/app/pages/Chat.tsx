import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft,
  Send,
  Users,
  MapPin,
  Calendar,
  Info,
  Languages,
  Smile,
  Loader2,
} from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import chatService, { Message } from "../../services/chatService";
import eventService from "../../services/eventService";
import storage from "../../lib/storage";

interface DisplayMessage {
  _id: string;
  text: string;
  type: 'user' | 'system';
  timestamp: string;
  user?: {
    _id: string;
    name: string;
    avatar: string;
  };
}

export default function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = storage.getUser<any>();
  const currentUserId = currentUser?._id;

  // Load event and messages
  useEffect(() => {
    if (!id) return;

    const loadEventAndMessages = async () => {
      try {
        setIsLoading(true);
        
        // Load event details
        console.log('Loading event with ID:', id);
        const eventData = await eventService.getEvent(id);
        console.log('Event loaded:', eventData);
        setEvent(eventData.data);

        // Load messages
        console.log('Loading messages for event:', id);
        const messagesResponse = await chatService.getMessages(id);
        console.log('Messages response:', messagesResponse);
        const loadedMessages: DisplayMessage[] = (messagesResponse.data || []).map((msg: Message) => ({
          _id: msg._id,
          text: msg.text,
          type: msg.type,
          timestamp: msg.createdAt,
          user: msg.user,
        }));
        setMessages(loadedMessages);
        console.log('Chat loaded successfully');

        // Mark messages as read
        try {
          console.log('Marking messages as read for event:', id);
          await chatService.markAsRead(id);
          console.log('Messages marked as read successfully');
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      } catch (error: any) {
        console.error('Error loading chat:', error);
        toast({
          title: "Error",
          description: error.message || error.response?.data?.message || "Failed to load chat",
          variant: "destructive",
        });
        // Don't navigate away immediately, let user see the error
        setTimeout(() => navigate("/home"), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    loadEventAndMessages();
  }, [id, navigate, toast]);

  // Setup socket connection
  useEffect(() => {
    if (!id || !event) return;

    const token = storage.getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    // Connect to chat
    chatService.connect(token);
    chatService.joinEventRoom(id);

    // Listen for new messages
    chatService.onNewMessage((message: Message) => {
      const displayMessage: DisplayMessage = {
        _id: message._id,
        text: message.text,
        type: message.type,
        timestamp: message.createdAt,
        user: message.user,
      };
      setMessages((prev) => [...prev, displayMessage]);
    });

    // Listen for user joined
    chatService.onUserJoined((data) => {
      const systemMessage: DisplayMessage = {
        _id: `sys-${Date.now()}`,
        text: `${data.userName} joined the event`,
        type: 'system',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // Listen for user left
    chatService.onUserLeft((data) => {
      const systemMessage: DisplayMessage = {
        _id: `sys-${Date.now()}`,
        text: `${data.userName} left the event`,
        type: 'system',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // Cleanup on unmount
    return () => {
      chatService.leaveEventRoom(id);
      chatService.removeAllListeners();
    };
  }, [id, event, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || isSending) return;

    try {
      setIsSending(true);
      chatService.sendMessage(id, newMessage);
      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">{event.title}</h1>
              <p className="text-sm text-muted-foreground">
                {event.participants?.length || 0} participants
              </p>
            </div>

            {/* Participants Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Users className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    Participants ({event.participants?.length || 0})
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-3">
                  {event.participants?.map((participant: any) => (
                    <motion.button
                      key={participant._id || participant.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        navigate(`/profile/${participant._id || participant.id}`);
                      }}
                      className="w-full p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={participant.avatar}
                            alt={participant.name}
                          />
                          <AvatarFallback>{participant.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{participant.name}</p>
                          {participant.languages && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Languages className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate">
                                {participant.languages.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                        {(participant._id || participant.id) === (event.host?._id || event.host) && (
                          <Badge variant="secondary" className="text-xs">
                            Host
                          </Badge>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Event Info Banner */}
        <Card className="mx-4 mb-4 p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                {new Date(event.date).toLocaleDateString()} at {event.time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="truncate">{event.location}</span>
            </div>
            <button
              onClick={() => navigate(`/event/${id}`)}
              className="flex items-center gap-1.5 text-primary hover:underline ml-auto"
            >
              <Info className="h-4 w-4" />
              <span>Event Details</span>
            </button>
          </div>
        </Card>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl space-y-4">
          {messages.map((message) => {
            // System message
            if (message.type === "system") {
              return (
                <div key={message._id} className="flex justify-center">
                  <div className="bg-muted/50 rounded-full px-4 py-1.5">
                    <p className="text-xs text-muted-foreground">{message.text}</p>
                  </div>
                </div>
              );
            }

            // Regular message
            const isCurrentUser = message.user?._id === currentUserId;
            return (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
              >
                {!isCurrentUser && message.user && (
                  <Avatar
                    className="h-8 w-8 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                    onClick={() => navigate(`/profile/${message.user._id}`)}
                  >
                    <AvatarImage src={message.user.avatar} alt={message.user.name} />
                    <AvatarFallback>{message.user.name?.[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`flex flex-col ${
                    isCurrentUser ? "items-end" : "items-start"
                  } max-w-[70%]`}
                >
                  {!isCurrentUser && message.user && (
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {message.user.name}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      isCurrentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button type="button" variant="ghost" size="icon">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Input
              placeholder={t("type_message")}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              disabled={isSending}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}