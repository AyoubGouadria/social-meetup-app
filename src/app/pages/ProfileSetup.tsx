import { useState } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Users, Upload, X } from "lucide-react";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    city: "",
    languages: [] as string[],
    photo: "",
  });

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

  const handleComplete = () => {
    // In a real app, would save profile data
    navigate("/home");
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
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

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

          {/* Step 3: Photo */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>{t("upload_photo")}</Label>
                <p className="text-sm text-muted-foreground">
                  Add a profile photo to help others recognize you
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    // Mock photo upload
                    setProfile({
                      ...profile,
                      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
                    });
                  }}
                >
                  Choose Photo
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="flex-1"
                disabled={
                  (step === 1 && (!profile.name || !profile.bio || !profile.city)) ||
                  (step === 2 && profile.languages.length === 0)
                }
              >
                {t("continue")}
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex-1">
                Complete Profile
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
