import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Header } from "../components/Header";
import { Coffee, Users, Calendar, MapPin, Shield, Heart } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const howItWorksSteps = [
    {
      icon: Users,
      title: "Create Your Profile",
      description: "Tell us about yourself, your interests, and languages you speak",
    },
    {
      icon: Calendar,
      title: "Browse or Create Events",
      description: "Find activities near you or host your own gathering",
    },
    {
      icon: Coffee,
      title: "Meet & Connect",
      description: "Join events and meet amazing people in your city",
    },
  ];

  const features = [
    {
      icon: MapPin,
      title: "Location-Based",
      description: "Find events and people near you in real-time",
    },
    {
      icon: Shield,
      title: "Safe & Trusted",
      description: "Verified profiles and secure messaging",
    },
    {
      icon: Heart,
      title: "Community First",
      description: "Built for genuine connections and friendships",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      text: "I moved to Berlin 3 months ago and this app helped me find my friend group!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    },
    {
      name: "Ahmed H.",
      text: "Great way to practice German and meet locals. Highly recommend!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    {
      name: "Elena K.",
      text: "Found study partners and coffee buddies. The community is so welcoming!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t("hero_title")}
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect with people in Germany through spontaneous activities like coffee,
                walks, studying, or city exploration.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate("/create-event")}>
                  {t("create_event")}
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/home")}>
                  {t("explore_events")}
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758274252296-a63b1d7d4bb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwZnJpZW5kcyUyMGNvZmZlZSUyMG91dGRvb3J8ZW58MXx8fHwxNzcxMzM1MDkxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="People meeting"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t("how_it_works")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, idx) => (
              <Card key={idx} className="p-8 text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t("features")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t("testimonials")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-6 space-y-4">
                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <ImageWithFallback
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-medium">{testimonial.name}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold">Meetly</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer_tagline")}</p>
            <p className="text-sm text-muted-foreground">© 2026 Meetly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
