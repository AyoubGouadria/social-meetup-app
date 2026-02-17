import { useState } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, X } from "lucide-react";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    category: "coffee" as const,
    date: "",
    time: "",
    location: "",
    maxParticipants: 4,
    languages: [] as string[],
  });

  const availableLanguages = ["English", "German", "Arabic", "Spanish", "French", "Turkish"];
  const categories = ["coffee", "walk", "study", "gym", "explore", "other"];

  const toggleLanguage = (lang: string) => {
    setEventData({
      ...eventData,
      languages: eventData.languages.includes(lang)
        ? eventData.languages.filter((l) => l !== lang)
        : [...eventData.languages, lang],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, would create event
    console.log("Creating event:", eventData);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t("create_event")}</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Coffee at Alexanderplatz"
                value={eventData.title}
                onChange={(e) =>
                  setEventData({ ...eventData, title: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")} *</Label>
              <Textarea
                id="description"
                placeholder="Tell people what to expect..."
                value={eventData.description}
                onChange={(e) =>
                  setEventData({ ...eventData, description: e.target.value })
                }
                rows={4}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>{t("category")} *</Label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={eventData.category === cat ? "default" : "outline"}
                    onClick={() =>
                      setEventData({
                        ...eventData,
                        category: cat as any,
                      })
                    }
                    className="capitalize"
                  >
                    {t(cat as any)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventData.date}
                  onChange={(e) =>
                    setEventData({ ...eventData, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={eventData.time}
                  onChange={(e) =>
                    setEventData({ ...eventData, time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">{t("location")} *</Label>
              <Input
                id="location"
                placeholder="e.g., Alexanderplatz, Berlin"
                value={eventData.location}
                onChange={(e) =>
                  setEventData({ ...eventData, location: e.target.value })
                }
                required
              />
            </div>

            {/* Max Participants */}
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">
                Max Participants: {eventData.maxParticipants}
              </Label>
              <input
                type="range"
                id="maxParticipants"
                min="2"
                max="20"
                value={eventData.maxParticipants}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    maxParticipants: Number(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <Label>{t("languages")} *</Label>
              <p className="text-sm text-muted-foreground">
                Select languages that will be spoken
              </p>
              <div className="flex flex-wrap gap-2">
                {availableLanguages.map((lang) => (
                  <Badge
                    key={lang}
                    variant={eventData.languages.includes(lang) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 text-sm"
                    onClick={() => toggleLanguage(lang)}
                  >
                    {lang}
                    {eventData.languages.includes(lang) && (
                      <X className="ml-2 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={
                !eventData.title ||
                !eventData.description ||
                !eventData.date ||
                !eventData.time ||
                !eventData.location ||
                eventData.languages.length === 0
              }
            >
              {t("create_event")}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
