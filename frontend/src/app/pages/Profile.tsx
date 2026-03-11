import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { EventCard } from "../components/EventCard";
import { mockUsers, mockEvents } from "../utils/mockData";
import authService from "../../services/authService";
import userService from "../../services/userService";
import { motion, AnimatePresence } from "motion/react";
import { ReportDialog } from "../components/ReportDialog";
import { BlockUserButton } from "../components/BlockUserButton";
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
  ChevronLeft,
  ChevronRight,
  X as CloseIcon,
  Maximize2,
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Target,
  HeartHandshake,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Fetch user data when component mounts or id changes
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Get logged-in user inside effect to avoid dependency issues
        const loggedInUser = authService.getCurrentUser();
        
        if (!id) {
          // No ID in URL - fetch logged-in user's profile from backend for latest data
          if (loggedInUser?._id) {
            const fetchedUser = await userService.getUserProfile(loggedInUser._id);
            setUser(fetchedUser);
            setIsOwnProfile(true);
            setLikesCount(fetchedUser.likesCount || fetchedUser.likedBy?.length || 0);
          } else {
            setUser(loggedInUser);
            setIsOwnProfile(true);
          }
        } else if (loggedInUser && id === loggedInUser._id) {
          // ID matches logged-in user - fetch from backend for latest data
          const fetchedUser = await userService.getUserProfile(id);
          setUser(fetchedUser);
          setIsOwnProfile(true);
          setLikesCount(fetchedUser.likesCount || fetchedUser.likedBy?.length || 0);
        } else {
          // Different user - fetch from backend API
          const fetchedUser = await userService.getUserProfile(id);
          setUser(fetchedUser);
          setIsOwnProfile(false);
          
          // Check if current user has liked this profile
          const likedByArray = fetchedUser.likedBy || [];
          setIsLiked(likedByArray.includes(loggedInUser?._id));
          setLikesCount(fetchedUser.likesCount || likedByArray.length || 0);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Fallback to mock data if API fails
        const mockUser = mockUsers.find((u) => u.id === id);
        if (mockUser) {
          setUser(mockUser);
          setIsOwnProfile(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  // Handle like/unlike
  const handleLike = async () => {
    if (isOwnProfile || !user) return;
    
    try {
      if (isLiked) {
        await userService.unlikeUser(user._id || user.id);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await userService.likeUser(user._id || user.id);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error liking/unliking user:', error);
    }
  };

  // Events where user is a participant
  const joinedEvents = mockEvents.filter((e) =>
    e.participants.some((p) => p.id === user?.id || p.id === user?._id)
  );

  // Events created by the user (as host)
  const createdEvents = mockEvents.filter((e) => {
    const hostId = (e.host as any)?._id || e.host?.id;
    const userId = (user as any)?._id || user?.id;
    return hostId === userId;
  });

  // All events (joined + created)
  const userEvents = [...joinedEvents, ...createdEvents];

  const upcomingEvents = userEvents.filter(
    (e) => new Date(e.date) >= new Date()
  );
  const pastEvents = userEvents.filter((e) => new Date(e.date) < new Date());

  // Get user images (from images array or fallback to avatar)
  const userImages = user?.images && user.images.length > 0 
    ? user.images 
    : user?.avatar 
    ? [user.avatar] 
    : [];

  const nextImage = () => {
    if (userImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % userImages.length);
    }
  };

  const prevImage = () => {
    if (userImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + userImages.length) % userImages.length);
    }
  };

  const openFullscreen = (index: number) => {
    setFullscreenImageIndex(index);
    setIsFullscreenOpen(true);
  };

  const nextFullscreenImage = () => {
    if (userImages.length > 1) {
      setFullscreenImageIndex((prev) => (prev + 1) % userImages.length);
    }
  };

  const prevFullscreenImage = () => {
    if (userImages.length > 1) {
      setFullscreenImageIndex((prev) => (prev - 1 + userImages.length) % userImages.length);
    }
  };

  // Keyboard navigation for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreenOpen) return;
      
      if (e.key === 'ArrowLeft') {
        prevFullscreenImage();
      } else if (e.key === 'ArrowRight') {
        nextFullscreenImage();
      } else if (e.key === 'Escape') {
        setIsFullscreenOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, userImages.length]);

  // Redirect to login if trying to access own profile without being logged in
  if (!id && !authService.getCurrentUser()) {
    navigate("/login");
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </Card>
      </div>
    );
  }

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
      {/* Main Header */}
      <Header />
      
      {/* Page Header */}
      <header className="border-b bg-white sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{isOwnProfile ? "About Me" : user?.name || "Profile"}</h1>
          {isOwnProfile ? (
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLike}
              className={isLiked ? "text-pink-600" : ""}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
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
              {/* Cover Background */}
              <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCA2MCAwIEwgNjAgNjAgTCAwIDYwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
              </div>

              <div className="px-6 pb-6">
                {/* Story-style main circular image */}
                <div className="-mt-16 mb-6">
                  {userImages.length > 0 ? (
                    <div className="flex justify-center">
                      <motion.button
                        onClick={() => openFullscreen(0)}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="relative group"
                      >
                        {/* Gradient border (like Instagram stories) */}
                        <div className="rounded-full p-[4px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-xl">
                          <div className="rounded-full p-[4px] bg-white">
                            <div className="relative h-32 w-32 rounded-full overflow-hidden ring-4 ring-white shadow-2xl">
                              <img
                                src={userImages[0]}
                                alt={`${user.name}`}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              {/* Gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                              
                              {/* Hover hint */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                  View {userImages.length > 1 ? 'photos' : 'photo'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Photo count badge */}
                        {userImages.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg ring-2 ring-white">
                            +{userImages.length - 1}
                          </div>
                        )}
                        
                        {/* Main photo indicator */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full shadow-lg font-medium whitespace-nowrap">
                          {userImages.length > 1 ? `${userImages.length} photos` : 'Main photo'}
                        </div>
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="rounded-full p-[4px] bg-gradient-to-tr from-primary/50 via-primary/30 to-primary/20">
                        <div className="rounded-full p-[4px] bg-white">
                          <Avatar className="h-32 w-32 ring-4 ring-white shadow-2xl">
                            <AvatarFallback className="text-4xl">
                              {user.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    </div>
                  )}
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
                  <div className="grid grid-cols-2 gap-3">
                    {/* Created Events */}
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 mb-2">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-2xl font-bold text-primary mb-1">
                        {user.hostedEventsCount || 0}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">Created Events</p>
                    </div>

                    {/* Joined Events */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 text-center border border-blue-500/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 mb-2">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600 mb-1">
                        {user.joinedEventsCount || 0}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">Joined Events</p>
                    </div>

                    {/* Verified Status */}
                    <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 text-center border border-green-500/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600 mb-1">
                        {user.isVerified ? "Yes" : "No"}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">Verified</p>
                    </div>

                    {/* Likes */}
                    <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-xl p-4 text-center border border-pink-500/20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/15 mb-2">
                        <Heart className="h-5 w-5 text-pink-600" />
                      </div>
                      <p className="text-2xl font-bold text-pink-600 mb-1">
                        {likesCount}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">Likes</p>
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

                  {/* Personal Information */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                      Personal Information
                    </h3>
                    {(user.age || user.gender || user.occupation || user.education || user.relationshipStatus || user.phoneNumber) ? (
                      <div className="grid grid-cols-2 gap-4">
                        {user.age && (
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Age</p>
                              <p className="font-medium">{user.age} years old</p>
                            </div>
                          </div>
                        )}
                        {user.gender && user.gender !== 'Prefer not to say' && (
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Gender</p>
                              <p className="font-medium">{user.gender}</p>
                            </div>
                          </div>
                        )}
                        {user.occupation && (
                          <div className="flex items-start gap-2">
                            <Briefcase className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Occupation</p>
                              <p className="font-medium">{user.occupation}</p>
                            </div>
                          </div>
                        )}
                        {user.education && (
                          <div className="flex items-start gap-2">
                            <GraduationCap className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Education</p>
                              <p className="font-medium">{user.education}</p>
                            </div>
                          </div>
                        )}
                        {user.relationshipStatus && user.relationshipStatus !== 'Prefer not to say' && (
                          <div className="flex items-start gap-2">
                            <HeartHandshake className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Relationship</p>
                              <p className="font-medium">{user.relationshipStatus}</p>
                            </div>
                          </div>
                        )}
                        {user.phoneNumber && (
                          <div className="flex items-start gap-2">
                            <Phone className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Phone</p>
                              <p className="font-medium">{user.phoneNumber}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          {isOwnProfile ? "Add personal information to help others get to know you" : "No personal information added yet"}
                        </p>
                        {isOwnProfile && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => navigate("/settings")}
                            className="mt-2"
                          >
                            Add Information
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Interests */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Interests</span>
                    </div>
                    {user.interests && user.interests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.interests.map((interest) => (
                          <Badge
                            key={interest}
                            variant="outline"
                            className="rounded-full px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {isOwnProfile ? "Add your interests to connect with like-minded people" : "No interests added yet"}
                        </p>
                        {isOwnProfile && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => navigate("/settings")}
                            className="mt-1"
                          >
                            Add Interests
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Looking For */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Looking For</span>
                    </div>
                    {user.lookingFor && user.lookingFor.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.lookingFor.map((item) => (
                          <Badge
                            key={item}
                            variant="default"
                            className="rounded-full px-3 py-1.5"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {isOwnProfile ? "Let others know what you're looking for" : "Not specified"}
                        </p>
                        {isOwnProfile && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => navigate("/settings")}
                            className="mt-1"
                          >
                            Add Preferences
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Social Media */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Social Media</span>
                    </div>
                    {user.socialMedia && (user.socialMedia.instagram || user.socialMedia.facebook || user.socialMedia.twitter || user.socialMedia.linkedin) ? (
                      <div className="flex flex-wrap gap-3">
                        {user.socialMedia.instagram && (
                          <a 
                            href={user.socialMedia.instagram.startsWith('http') ? user.socialMedia.instagram : `https://instagram.com/${user.socialMedia.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-shadow"
                          >
                            <Instagram className="h-4 w-4" />
                            <span className="text-sm font-medium">Instagram</span>
                          </a>
                        )}
                        {user.socialMedia.facebook && (
                          <a 
                            href={user.socialMedia.facebook.startsWith('http') ? user.socialMedia.facebook : `https://facebook.com/${user.socialMedia.facebook}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:shadow-lg transition-shadow"
                          >
                            <Facebook className="h-4 w-4" />
                            <span className="text-sm font-medium">Facebook</span>
                          </a>
                        )}
                        {user.socialMedia.twitter && (
                          <a 
                            href={user.socialMedia.twitter.startsWith('http') ? user.socialMedia.twitter : `https://twitter.com/${user.socialMedia.twitter.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white hover:shadow-lg transition-shadow"
                          >
                            <Twitter className="h-4 w-4" />
                            <span className="text-sm font-medium">Twitter</span>
                          </a>
                        )}
                        {user.socialMedia.linkedin && (
                          <a 
                            href={user.socialMedia.linkedin.startsWith('http') ? user.socialMedia.linkedin : `https://linkedin.com/in/${user.socialMedia.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-700 text-white hover:shadow-lg transition-shadow"
                          >
                            <Linkedin className="h-4 w-4" />
                            <span className="text-sm font-medium">LinkedIn</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {isOwnProfile ? "Connect your social media accounts" : "No social media links added"}
                        </p>
                        {isOwnProfile && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => navigate("/settings")}
                            className="mt-1"
                          >
                            Add Social Media
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!isOwnProfile && (
                    <div className="space-y-3 pt-2">
                      {/* Primary Action */}
                      <Button
                        className="w-full gap-2"
                        onClick={() => setIsInviteModalOpen(true)}
                        disabled={isBlocked}
                      >
                        <Send className="h-4 w-4" />
                        {isBlocked ? 'User Blocked' : 'Invite to Event'}
                      </Button>

                      {/* Moderation Actions */}
                      {!isBlocked && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsReportDialogOpen(true)}
                            className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <Bell className="h-4 w-4" />
                            Report
                          </Button>
                          <BlockUserButton
                            userId={user._id}
                            userName={user.name}
                            variant="outline"
                            size="sm"
                            onBlockSuccess={() => {
                              setIsBlocked(true);
                              // Optionally navigate away
                              // navigate('/home');
                            }}
                          />
                        </div>
                      )}

                      {isBlocked && (
                        <div className="text-center py-2">
                          <p className="text-sm text-destructive font-medium">
                            You have blocked this user. Go to Settings to unblock.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {isOwnProfile && (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate("/settings")}
                    >
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

      {/* Fullscreen Image Viewer - Story Style */}
      <AnimatePresence>
        {isFullscreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            {/* Story Progress Bars */}
            {userImages.length > 1 && (
              <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
                {userImages.map((_, index) => (
                  <div
                    key={index}
                    className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: index < fullscreenImageIndex ? "100%" : "0%" }}
                      animate={{ 
                        width: index === fullscreenImageIndex 
                          ? "100%" 
                          : index < fullscreenImageIndex 
                          ? "100%" 
                          : "0%" 
                      }}
                      transition={{ 
                        duration: index === fullscreenImageIndex ? 3 : 0,
                        ease: "linear" 
                      }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setIsFullscreenOpen(false)}
              className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-all backdrop-blur-sm"
            >
              <CloseIcon className="h-6 w-6" />
            </button>

            {/* User Info */}
            <div className="absolute top-12 left-4 z-20 text-white flex items-center gap-3 mt-4">
              <Avatar className="h-10 w-10 border-2 border-white/80 shadow-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm drop-shadow-lg">{user.name}</p>
                <p className="text-xs text-white/80 drop-shadow-lg">
                  {fullscreenImageIndex + 1} of {userImages.length}
                </p>
              </div>
            </div>

            {/* Main Content Area with Tap Zones */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Center Image Display - Always centered */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 py-20">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={fullscreenImageIndex}
                    src={userImages[fullscreenImageIndex]}
                    alt={`${user.name} - Photo ${fullscreenImageIndex + 1}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="max-h-full max-w-full w-auto h-auto object-contain select-none"
                    draggable={false}
                  />
                </AnimatePresence>
              </div>

              {/* Left Tap Zone - Previous */}
              {userImages.length > 1 && fullscreenImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevFullscreenImage();
                  }}
                  className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-start p-6 group cursor-w-resize z-10"
                  aria-label="Previous image"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 rounded-full p-3 backdrop-blur-sm">
                    <ChevronLeft className="h-8 w-8 text-white" />
                  </div>
                </button>
              )}

              {/* Right Tap Zone - Next */}
              {userImages.length > 1 && fullscreenImageIndex < userImages.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextFullscreenImage();
                  }}
                  className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end p-6 group cursor-e-resize z-10"
                  aria-label="Next image"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 rounded-full p-3 backdrop-blur-sm">
                    <ChevronRight className="h-8 w-8 text-white" />
                  </div>
                </button>
              )}

              {/* Center tap zone to close when at boundaries or single image */}
              {(userImages.length === 1 || fullscreenImageIndex === 0 || fullscreenImageIndex === userImages.length - 1) && (
                <button
                  onClick={() => setIsFullscreenOpen(false)}
                  className="absolute inset-0 cursor-pointer"
                  aria-label="Close fullscreen"
                />
              )}
            </div>

            {/* Bottom Navigation Hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/70 text-xs backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full flex items-center gap-2">
              <span>Tap sides to navigate</span>
              <span className="text-white/50">•</span>
              <span>Use ← → keys</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Dialog */}
      {!isOwnProfile && user && (
        <ReportDialog
          open={isReportDialogOpen}
          onOpenChange={setIsReportDialogOpen}
          type="user"
          targetId={user._id}
          targetName={user.name}
        />
      )}
    </div>
  );
}