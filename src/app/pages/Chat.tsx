import { mockMessages, mockEvents } from "../utils/mockData";
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
} from "lucide-react";

export default function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();

  // Add system messages
  const systemMessages = [
    {
      id: "sys-1",
      type: "system",
      text: "Ahmed Hassan joined the event",
      timestamp: "2026-02-17T10:25:00",
    },
  ];

  const [messages, setMessages] = useState([...systemMessages, ...mockMessages]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const event = mockEvents.find((e) => e.id === id);
  const currentUserId = "1"; // Mock current user

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: String(messages.length + 1),
      userId: currentUserId,
      userName: "You",
      userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/event/${id}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">{event.title}</h1>
              <p className="text-sm text-muted-foreground">
                {event.participants.length} participants
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
                    Participants ({event.participants.length})
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-3">
                  {event.participants.map((participant) => (
                    <motion.button
                      key={participant.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        navigate(`/profile/${participant.id}`);
                      }}
                      className="w-full p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={participant.avatar}
                            alt={participant.name}
                          />
                          <AvatarFallback>{participant.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{participant.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Languages className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">
                              {participant.languages.join(", ")}
                            </span>
                          </div>
                        </div>
                        {participant.id === event.host.id && (
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
          {messages.map((message: any) => {
            // System message
            if (message.type === "system") {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="bg-muted/50 rounded-full px-4 py-1.5">
                    <p className="text-xs text-muted-foreground">{message.text}</p>
                  </div>
                </div>
              );
            }

            // Regular message
            const isCurrentUser = message.userId === currentUserId;
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
              >
                {!isCurrentUser && (
                  <Avatar
                    className="h-8 w-8 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                    onClick={() => navigate(`/profile/${message.userId}`)}
                  >
                    <AvatarImage src={message.userAvatar} alt={message.userName} />
                    <AvatarFallback>{message.userName[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`flex flex-col ${
                    isCurrentUser ? "items-end" : "items-start"
                  } max-w-[70%]`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {message.userName}
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
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}