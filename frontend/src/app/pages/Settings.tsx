import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import authService from "../../services/authService";
import uploadService from "../../services/uploadService";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
  Save,
  GripVertical,
  Plus,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const MAX_IMAGES = 6;

  const user = authService.getCurrentUser();
  
  const [profile, setProfile] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    city: user?.city || "",
    languages: user?.languages || [],
  });

  const [images, setImages] = useState<string[]>(user?.images || (user?.avatar ? [user.avatar] : []));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const availableLanguages = ["English", "German", "Arabic", "Spanish", "French", "Turkish", "Italian"];
  const germanCities = ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf"];

  const toggleLanguage = (lang: string) => {
    setProfile({
      ...profile,
      languages: profile.languages.includes(lang)
        ? profile.languages.filter((l) => l !== lang)
        : [...profile.languages, lang],
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the maximum
    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can only have up to ${MAX_IMAGES} images`);
      return;
    }

    const newFiles = Array.from(files);
    
    // Validate files
    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        return;
      }
    }

    setUploading(true);
    setError("");

    try {
      const uploadedUrls = await uploadService.uploadImages(newFiles);
      setImages([...images, ...uploadedUrls]);
      setSuccess("Images uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const openFullscreen = (index: number) => {
    setFullscreenImageIndex(index);
    setIsFullscreenOpen(true);
  };

  const nextFullscreenImage = () => {
    if (images.length > 1) {
      setFullscreenImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevFullscreenImage = () => {
    if (images.length > 1) {
      setFullscreenImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
  }, [isFullscreenOpen, images.length]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authService.updateProfile({
        name: profile.name,
        bio: profile.bio,
        city: profile.city,
        languages: profile.languages,
        avatar: images[0] || undefined,
        images: images.length > 0 ? images : undefined,
      } as any);

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <header className="border-b bg-white sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl pb-24">
        <div className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Profile Photos */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Photos</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add up to {MAX_IMAGES} photos. The first photo is your main profile picture. 
              Drag to reorder.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary group"
                >
                  <img
                    src={image}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => openFullscreen(index)}
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded z-10">
                      Main
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-move">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Maximize2 className="h-3 w-3" />
                  </div>
                </div>
              ))}

              {/* Add Photo Button */}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-accent/50 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="text-xs text-muted-foreground">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, GIF, WebP (Max 5MB each)
            </p>
          </Card>

          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <select
                  id="city"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-input-background"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                >
                  <option value="">Select a city</option>
                  {germanCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Languages */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Languages</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select all languages you speak
            </p>

            <div className="flex flex-wrap gap-2">
              {availableLanguages.map((lang) => (
                <Badge
                  key={lang}
                  variant={profile.languages.includes(lang) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => toggleLanguage(lang)}
                >
                  {lang}
                  {profile.languages.includes(lang) && (
                    <X className="ml-2 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Save Button */}
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={loading || uploading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </main>

      <BottomNav />

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {isFullscreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
            onClick={() => setIsFullscreenOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreenOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 text-white text-sm px-4 py-2 rounded-full font-medium backdrop-blur-sm">
              {fullscreenImageIndex + 1} / {images.length}
            </div>

            {/* Main Image Container */}
            <div
              className="absolute inset-0 flex items-center justify-center px-4 py-20"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={fullscreenImageIndex}
                  src={images[fullscreenImageIndex]}
                  alt={`Photo ${fullscreenImageIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="max-h-full max-w-full w-auto h-auto object-contain select-none"
                  onClick={(e) => e.stopPropagation()}
                  draggable={false}
                />
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevFullscreenImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-all hover:scale-110 backdrop-blur-sm"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextFullscreenImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-all hover:scale-110 backdrop-blur-sm"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullscreenImageIndex(index);
                      }}
                      className={`h-2.5 rounded-full transition-all ${
                        index === fullscreenImageIndex
                          ? 'w-10 bg-white shadow-lg'
                          : 'w-2.5 bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Keyboard Hint */}
            <div className="absolute bottom-4 left-4 text-white/60 text-xs backdrop-blur-sm bg-white/5 px-3 py-2 rounded-full">
              Use ← → arrow keys to navigate • ESC to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
