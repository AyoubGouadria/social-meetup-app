import { LanguageSelector } from "../components/LanguageSelector";
import { EventCard } from "../components/EventCard";
import { ProfilePreviewModal } from "../components/ProfilePreviewModal";
import { BottomNav } from "../components/BottomNav";
import { mockEvents, Event, User } from "../utils/mockData";
import { 
  Users, Plus, Filter, MapPin, Calendar, Clock, X, Heart, 
  MessageCircle, User as UserIcon, Coffee, Dumbbell, BookOpen, 
  Footprints, Compass
} from "lucide-react";
import TinderCard from "react-tinder-card";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { motion } from "motion/react";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([...mockEvents]);
  const [filters, setFilters] = useState({
    category: "all",
    distance: 10,
    language: "all",
  });
  const [viewMode, setViewMode] = useState<"swipe" | "grid">("swipe");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsPreviewOpen(true);
  };

  const handleViewFullProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters.category !== "all" && event.category !== filters.category) return false;
      if (event.distance > filters.distance) return false;
      if (filters.language !== "all" && !event.languages.includes(filters.language)) return false;
      return true;
    });
  }, [events, filters]);

  const handleSwipe = (direction: string, eventId: string) => {
    if (direction === "right") {
      // Liked - send join request
      console.log("Joining event:", eventId);
      setEvents(events.map(e => 
        e.id === eventId ? { ...e, isJoined: true } : e
      ));
    }
    // Remove from deck after swipe
    setTimeout(() => {
      setEvents(events.filter((e) => e.id !== eventId));
    }, 300);
  };

  const categoryIcons: Record<string, any> = {
    coffee: Coffee,
    walk: Footprints,
    study: BookOpen,
    gym: Dumbbell,
    explore: Compass,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-semibold">Meetly</span>
            </div>

            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Filter className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-input bg-input-background"
                        value={filters.category}
                        onChange={(e) =>
                          setFilters({ ...filters, category: e.target.value })
                        }
                      >
                        <option value="all">All</option>
                        <option value="coffee">{t("coffee")}</option>
                        <option value="walk">{t("walk")}</option>
                        <option value="study">{t("study")}</option>
                        <option value="gym">{t("gym")}</option>
                        <option value="explore">{t("explore")}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {t("distance")} (max {filters.distance} km)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={filters.distance}
                        onChange={(e) =>
                          setFilters({ ...filters, distance: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Language</label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-input bg-input-background"
                        value={filters.language}
                        onChange={(e) =>
                          setFilters({ ...filters, language: e.target.value })
                        }
                      >
                        <option value="all">All</option>
                        <option value="English">English</option>
                        <option value="German">German</option>
                        <option value="Arabic">Arabic</option>
                      </select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === "swipe" ? "grid" : "swipe")}
              >
                {viewMode === "swipe" ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                )}
              </Button>

              <LanguageSelector />
              <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                <UserIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {viewMode === "swipe" ? (
          <div className="max-w-md mx-auto">
            {/* Instructions for first-time users */}
            <div className="mb-6 p-4 bg-accent rounded-lg">
              <p className="text-sm text-center">
                <strong>Swipe right</strong> to join an event or <strong>left</strong> to pass
              </p>
            </div>

            <div className="relative h-[600px]">
              {filteredEvents.length === 0 ? (
                <Card className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">No more events</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or create your own event!
                    </p>
                    <Button onClick={() => navigate("/create-event")}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("create_event")}
                    </Button>
                  </div>
                </Card>
              ) : (
                <>
                  {filteredEvents.map((event, index) => {
                    const Icon = categoryIcons[event.category] || Users;
                    return (
                      <TinderCard
                        key={event.id}
                        onSwipe={(dir) => handleSwipe(dir, event.id)}
                        preventSwipe={["up", "down"]}
                        className="absolute inset-0"
                      >
                        <Card className="h-full overflow-hidden cursor-grab active:cursor-grabbing">
                          <div className="h-full flex flex-col">
                            {/* Event Image */}
                            <div className="relative h-64 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Icon className="h-24 w-24 text-primary/30" />
                              <Badge
                                className="absolute top-4 right-4"
                                variant="secondary"
                              >
                                {event.distance} km
                              </Badge>
                            </div>

                            {/* Event Info */}
                            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                              <div className="flex items-start gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUserClick(event.host);
                                  }}
                                  className="flex-shrink-0"
                                >
                                  <Avatar className="h-12 w-12 ring-2 ring-muted transition-all hover:ring-primary/40">
                                    <AvatarImage
                                      src={event.host.avatar}
                                      alt={event.host.name}
                                    />
                                    <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                                  </Avatar>
                                </motion.button>
                                <div className="flex-1 min-w-0">
                                  <h2 className="text-2xl font-bold">{event.title}</h2>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUserClick(event.host);
                                    }}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    Hosted by {event.host.name}
                                  </button>
                                </div>
                              </div>

                              <p className="text-muted-foreground">{event.description}</p>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {new Date(event.date).toLocaleDateString()} at {event.time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {event.currentParticipants}/{event.maxParticipants}{" "}
                                    {t("participants").toLowerCase()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {event.languages.map((lang) => (
                                  <Badge key={lang} variant="outline">
                                    {lang}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Swipe Instructions */}
                            <div className="p-6 border-t bg-muted/30">
                              <div className="flex items-center justify-center gap-12">
                                <div className="text-center">
                                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                    <X className="h-6 w-6 text-destructive" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Pass</p>
                                </div>
                                <div className="text-center">
                                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Heart className="h-6 w-6 text-primary" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Join</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </TinderCard>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => navigate(`/event/${event.id}`)}
                onHostClick={() => handleUserClick(event.host)}
                onJoin={() => {
                  setEvents(
                    events.map((e) =>
                      e.id === event.id ? { ...e, isJoined: true } : e
                    )
                  );
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => navigate("/create-event")}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        user={selectedUser}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onViewFullProfile={handleViewFullProfile}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}