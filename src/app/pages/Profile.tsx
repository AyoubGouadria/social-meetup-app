import { motion } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Languages,
  Settings,
  Calendar,
  Users,
  Send,
  Heart,
  MessageCircle,
  CheckCircle2,
  Bell,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // If no ID, show current user's profile (mock)
  const user = id ? mockUsers.find((u) => u.id === id) : mockUsers[0];
  const isOwnProfile = !id || id === "1";

  const userEvents = mockEvents.filter((e) =>
    e.participants.some((p) => p.id === user?.id)
  );

  const upcomingEvents = userEvents.filter(
    (e) => new Date(e.date) >= new Date()
  );
  const pastEvents = userEvents.filter((e) => new Date(e.date) < new Date());

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <Button onClick={() => navigate("/home")}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Profile</h1>
          {isOwnProfile ? (
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="overflow-hidden shadow-lg">
              {/* Cover */}
              <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCA2MCAwIEwgNjAgNjAgTCAwIDYwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
              </div>

              <div className="px-6 pb-6">
                {/* Avatar */}
                <div className="-mt-20 mb-6">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-4 ring-primary/10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-3xl">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </div>

                {/* Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{user.city}</span>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      About
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {user.bio}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-primary/5 rounded-lg p-3 text-center border border-primary/10">
                      <Users className="h-5 w-5 mx-auto mb-1.5 text-primary" />
                      <p className="text-xl font-bold text-primary">
                        {userEvents.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Events</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center border">
                      <CheckCircle2 className="h-5 w-5 mx-auto mb-1.5 text-green-600" />
                      <p className="text-xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">Verified</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center border">
                      <Calendar className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                      <p className="text-xl font-bold">Feb '26</p>
                      <p className="text-xs text-muted-foreground">Joined</p>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Languages className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Languages</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.languages.map((lang) => (
                        <Badge
                          key={lang}
                          variant="secondary"
                          className="rounded-full px-3 py-1.5"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {!isOwnProfile && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => setIsInviteModalOpen(true)}
                      >
                        <Send className="h-4 w-4" />
                        Invite to Event
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => navigate("/chat")}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Button>
                    </div>
                  )}
                  {isOwnProfile && (
                    <Button className="w-full" variant="outline">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Events History */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events ({upcomingEvents.length})
                </h2>
                <div className="grid gap-4">
                  {upcomingEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card
                        className="p-4 hover:shadow-lg transition-all cursor-pointer group border-l-4 border-l-primary"
                        onClick={() => navigate(`/event/${event.id}`)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Calendar className="h-8 w-8 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1 truncate group-hover:text-primary transition-colors">
                              {event.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(event.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              at {event.time}
                            </p>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge variant="outline">{t(event.category as any)}</Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                <span>{event.participants.length} joined</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{event.distance} km</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  Past Events ({pastEvents.length})
                </h2>
                <div className="grid gap-3">
                  {pastEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer opacity-75 hover:opacity-100"
                      onClick={() => navigate(`/event/${event.id}`)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate text-sm">
                            {event.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {t(event.category as any)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {event.participants.length} participants
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* No Events State */}
            {userEvents.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className="p-12 text-center">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Calendar className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {isOwnProfile
                      ? "Start exploring and join events to meet new people!"
                      : "This user hasn't joined any events yet."}
                  </p>
                  {isOwnProfile && (
                    <Button onClick={() => navigate("/home")} size="lg">
                      {t("explore_events")}
                    </Button>
                  )}
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Invite to Event Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite {user.name.split(" ")[0]} to an Event</DialogTitle>
            <DialogDescription>
              Select one of your events to invite this user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {mockEvents.slice(0, 3).map((event) => (
              <button
                key={event.id}
                className="w-full p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-left"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  // In a real app, this would send an invitation
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at {event.time}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => navigate("/create-event")}>
              Create New Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}