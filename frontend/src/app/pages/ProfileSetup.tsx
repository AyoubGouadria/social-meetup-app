import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Users, Upload, X, AlertCircle } from "lucide-react";
import authService from "../../services/authService";
import uploadService from "../../services/uploadService";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    city: "",
    languages: [] as string[],
    photo: "",
    age: "",
    gender: "Prefer not to say",
    interests: [] as string[],
    lookingFor: [] as string[]
  });
  // Legal consent tracking (GDPR compliance)
  const [consent, setConsent] = useState({
    ageVerified: false,
    acceptedTerms: false,
    acceptedPrivacy: false,
    gdprNecessary: false,
    gdprAnalytics: false,
    gdprMarketing: false
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const MAX_IMAGES = 6;

  useEffect(() => {
    // Get temporary registration data
    const tempData = localStorage.getItem('tempRegisterData');
    if (!tempData) {
      // If no temp data, redirect to register
      navigate('/register');
      return;
    }
    const registerData = JSON.parse(tempData);
    setProfile({ ...profile, name: registerData.name });
  }, [navigate]);

  const availableLanguages = ["English", "German", "Arabic", "Spanish", "French", "Turkish", "Italian"];
  const germanCities = ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf"];
  const availableInterests = ["Music", "Sports", "Reading", "Travel", "Cooking", "Photography", "Art", "Technology", "Gaming", "Fitness", "Movies", "Dancing", "Hiking", "Yoga"];
  const lookingForOptions = ["Friends", "Study Partners", "Events", "Networking", "Language Exchange", "Sports Partners"];
  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say", "Other"];

  const toggleLanguage = (lang: string) => {
    setProfile({
      ...profile,
      languages: profile.languages.includes(lang)
        ? profile.languages.filter((l) => l !== lang)
        : [...profile.languages, lang],
    });
  };

  const toggleInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests.includes(interest)
        ? profile.interests.filter((i) => i !== interest)
        : [...profile.interests, interest],
    });
  };

  const toggleLookingFor = (option: string) => {
    setProfile({
      ...profile,
      lookingFor: profile.lookingFor.includes(option)
        ? profile.lookingFor.filter((o) => o !== option)
        : [...profile.lookingFor, option],
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the maximum
    if (selectedFiles.length + files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        return;
      }

      newFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setPhotoPreviews([...photoPreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles([...selectedFiles, ...newFiles]);
    setError("");
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    const newUploadedUrls = uploadedImageUrls.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPhotoPreviews(newPreviews);
    setUploadedImageUrls(newUploadedUrls);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError("");

    try {
      // Get temporary registration data
      const tempData = localStorage.getItem('tempRegisterData');
      if (!tempData) {
        throw new Error("Registration data not found");
      }

      const registerData = JSON.parse(tempData);
      
      let imageUrls = [...uploadedImageUrls];

      // Upload images if files are selected and not yet uploaded
      if (selectedFiles.length > 0 && uploadedImageUrls.length === 0) {
        setUploading(true);
        try {
          imageUrls = await uploadService.uploadImages(selectedFiles);
          setUploadedImageUrls(imageUrls);
        } catch (uploadError: any) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        } finally {
          setUploading(false);
        }
      }

      // Validate legal consent (CRITICAL - German law requirement)
      if (!consent.ageVerified) {
        throw new Error("You must confirm that you are 18 or older");
      }
      if (!consent.acceptedTerms) {
        throw new Error("You must accept the Terms of Service");
      }
      if (!consent.acceptedPrivacy) {
        throw new Error("You must accept the Privacy Policy");
      }
      if (!consent.gdprNecessary) {
        throw new Error("You must consent to necessary data processing");
      }

      // Complete registration with backend
      await authService.register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        city: profile.city,
        languages: profile.languages,
        bio: profile.bio || undefined,
        avatar: imageUrls[0] || undefined,  // First image as avatar
        images: imageUrls.length > 0 ? imageUrls : undefined,
        age: profile.age ? parseInt(profile.age) : undefined,
        gender: profile.gender,
        interests: profile.interests.length > 0 ? profile.interests : undefined,
        lookingFor: profile.lookingFor.length > 0 ? profile.lookingFor : undefined,
        // Legal consent tracking (GDPR compliance)
        ageVerified: consent.ageVerified,
        acceptedTermsVersion: "1.0",
        acceptedPrivacyVersion: "1.0",
        gdprConsent: {
          necessary: consent.gdprNecessary,
          analytics: consent.gdprAnalytics,
          marketing: consent.gdprMarketing
        }
      });

      // Clear temp data
      localStorage.removeItem('tempRegisterData');

      // Navigate to home
      navigate("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Tell us about yourself to connect with the right people
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t("bio")}</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t("city")}</Label>
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
          )}

          {/* Step 2: Languages */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>{t("languages")}</Label>
                <p className="text-sm text-muted-foreground">
                  Select all languages you speak (at least one)
                </p>
              </div>

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

              {profile.languages.length > 0 && (
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-sm">
                    <strong>Selected:</strong> {profile.languages.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>{t("upload_photo")}</Label>
                <p className="text-sm text-muted-foreground">
                  Add up to {MAX_IMAGES} photos (like Tinder). The first photo will be your main profile picture.
                </p>
              </div>

              <div className="space-y-4">
                {/* Photo Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary group">
                      <img
                        src={preview}
                        alt={`Photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        disabled={loading || uploading}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add Photo Button */}
                  {photoPreviews.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={handleChoosePhoto}
                      disabled={loading || uploading}
                      className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-accent/50 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
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

                {selectedFiles.length > 0 && (
                  <div className="text-sm text-muted-foreground text-center">
                    {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''} selected
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Supported formats: JPG, PNG, GIF, WebP (Max 5MB each, up to {MAX_IMAGES} photos)
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Interests, Preferences & Legal Consent */}
          {step === 4 && (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (Optional)</Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="100"
                      placeholder="25"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender (Optional)</Label>
                    <select
                      id="gender"
                      className="w-full h-10 px-3 rounded-lg border border-input bg-input-background"
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    >
                      {genderOptions.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Interests (Optional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your interests to find like-minded people
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableInterests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={profile.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2 text-sm"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                      {profile.interests.includes(interest) && (
                        <X className="ml-2 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Looking For */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What are you looking for? (Optional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Select all that apply
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {lookingForOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={profile.lookingFor.includes(option) ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2 text-sm"
                      onClick={() => toggleLookingFor(option)}
                    >
                      {option}
                      {profile.lookingFor.includes(option) && (
                        <X className="ml-2 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* LEGAL CONSENT (CRITICAL - GDPR & JuSchG Compliance) */}
              <div className="space-y-4 border-2 border-primary/20 rounded-lg p-6 bg-primary/5">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Legal Consent (Required)</h3>
                  <p className="text-sm text-muted-foreground">
                    We are required by German law (GDPR, JuSchG) to obtain your explicit consent
                  </p>
                </div>

                {/* Age Verification (JuSchG) */}
                <div className="flex items-start space-x-3 p-3 bg-background rounded-lg">
                  <input
                    type="checkbox"
                    id="ageVerified"
                    checked={consent.ageVerified}
                    onChange={(e) => setConsent({ ...consent, ageVerified: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="ageVerified" className="text-sm cursor-pointer">
                    <span className="font-semibold text-destructive">*</span> I confirm that I am <strong>18 years or older</strong>. This is required by German Youth Protection Act (JuSchG).
                  </label>
                </div>

                {/* Terms of Service */}
                <div className="flex items-start space-x-3 p-3 bg-background rounded-lg">
                  <input
                    type="checkbox"
                    id="acceptedTerms"
                    checked={consent.acceptedTerms}
                    onChange={(e) => setConsent({ ...consent, acceptedTerms: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="acceptedTerms" className="text-sm cursor-pointer">
                    <span className="font-semibold text-destructive">*</span> I accept the{" "}
                    <a href="/terms" target="_blank" className="text-primary underline hover:text-primary/80">
                      Terms of Service
                    </a>{" "}
                    (v1.0)
                  </label>
                </div>

                {/* Privacy Policy */}
                <div className="flex items-start space-x-3 p-3 bg-background rounded-lg">
                  <input
                    type="checkbox"
                    id="acceptedPrivacy"
                    checked={consent.acceptedPrivacy}
                    onChange={(e) => setConsent({ ...consent, acceptedPrivacy: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="acceptedPrivacy" className="text-sm cursor-pointer">
                    <span className="font-semibold text-destructive">*</span> I accept the{" "}
                    <a href="/privacy" target="_blank" className="text-primary underline hover:text-primary/80">
                      Privacy Policy
                    </a>{" "}
                    (v1.0)
                  </label>
                </div>

                {/* GDPR Necessary Consent */}
                <div className="flex items-start space-x-3 p-3 bg-background rounded-lg">
                  <input
                    type="checkbox"
                    id="gdprNecessary"
                    checked={consent.gdprNecessary}
                    onChange={(e) => setConsent({ ...consent, gdprNecessary: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="gdprNecessary" className="text-sm cursor-pointer">
                    <span className="font-semibold text-destructive">*</span> I consent to the processing of my personal data for essential app functionality (GDPR Article 6).
                  </label>
                </div>

                {/* GDPR Analytics (Optional) */}
                <div className="flex items-start space-x-3 p-3 bg-background rounded-lg">
                  <input
                    type="checkbox"
                    id="gdprAnalytics"
                    checked={consent.gdprAnalytics}
                    onChange={(e) => setConsent({ ...consent, gdprAnalytics: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="gdprAnalytics" className="text-sm cursor-pointer">
                    I consent to analytics cookies to help improve the app (optional).
                  </label>
                </div>

                {/* GDPR Marketing (Optional) */}
                <div className="flex items-start space-x-3 p-3 bg-background rounded-lg">
                  <input
                    type="checkbox"
                    id="gdprMarketing"
                    checked={consent.gdprMarketing}
                    onChange={(e) => setConsent({ ...consent, gdprMarketing: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="gdprMarketing" className="text-sm cursor-pointer">
                    I consent to receiving marketing communications (optional).
                  </label>
                </div>

                <p className="text-xs text-muted-foreground pt-2">
                  <span className="font-semibold text-destructive">*</span> Required fields. You can change your consent preferences later in settings.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)} 
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="flex-1"
                disabled={
                  loading ||
                  (step === 1 && (!profile.name || !profile.bio || !profile.city)) ||
                  (step === 2 && profile.languages.length === 0)
                }
              >
                {t("continue")}
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                className="flex-1"
                disabled={
                  loading || 
                  uploading || 
                  !consent.ageVerified || 
                  !consent.acceptedTerms || 
                  !consent.acceptedPrivacy || 
                  !consent.gdprNecessary
                }
              >
                {uploading 
                  ? "Uploading images..." 
                  : loading 
                  ? "Creating account..." 
                  : "Complete Profile"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
