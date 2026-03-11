import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Header } from "../components/Header";
import { Coffee, Users, Calendar, MapPin, Shield, Heart, Plus } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import testimonialService, { Testimonial } from "../../services/testimonialService";
import authService from "../../services/authService";
import { useToast } from "../components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testimonialText, setTestimonialText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [myTestimonial, setMyTestimonial] = useState<Testimonial | null>(null);
  
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    fetchTestimonials();
    if (isAuthenticated) {
      fetchMyTestimonial();
    }
  }, [isAuthenticated]);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await testimonialService.getTestimonials(6);
      console.log('Testimonials response:', response);
      const testimonialsData = response.data || [];
      console.log('Setting testimonials:', testimonialsData);
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setTestimonials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyTestimonial = async () => {
    try {
      const response = await testimonialService.getMyTestimonial();
      if (response && response.data) {
        setMyTestimonial(response.data);
        setTestimonialText(response.data.text);
      }
    } catch (error) {
      console.error("Error fetching my testimonial:", error);
    }
  };

  const handleSubmitTestimonial = async () => {
    if (!testimonialText.trim() || testimonialText.length < 10) {
      toast({
        title: "Error",
        description: "Please write at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (myTestimonial) {
        await testimonialService.updateMyTestimonial(testimonialText);
        toast({
          title: "Success",
          description: "Your testimonial has been updated!",
        });
      } else {
        await testimonialService.createTestimonial(testimonialText);
        toast({
          title: "Success",
          description: "Thank you for sharing your experience! Your testimonial will be reviewed.",
        });
      }
      setIsDialogOpen(false);
      setTestimonialText("");
      fetchTestimonials();
      fetchMyTestimonial();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit testimonial.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
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
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent mx-auto">
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
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("testimonials")}
            </h2>
            {isAuthenticated && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Share Your Story
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {myTestimonial ? "Update Your Testimonial" : "Share Your Experience"}
                    </DialogTitle>
                    <DialogDescription>
                      Tell us about your experience with Meetly! Your testimonial will be reviewed before being published.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Textarea
                      placeholder="Write your testimonial here... (minimum 10 characters)"
                      value={testimonialText}
                      onChange={(e) => setTestimonialText(e.target.value)}
                      rows={5}
                      maxLength={500}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {testimonialText.length}/500 characters
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setTestimonialText(myTestimonial?.text || "");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitTestimonial}
                        disabled={isSubmitting || testimonialText.length < 10}
                      >
                        {isSubmitting ? "Submitting..." : myTestimonial ? "Update" : "Submit"}
                      </Button>
                    </div>
                    {myTestimonial && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-md">
                        Your testimonial status: {myTestimonial.isApproved ? "✓ Approved" : "⏳ Pending Review"}
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading testimonials...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No testimonials yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial._id} className="p-6 space-y-4">
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <ImageWithFallback
                        src={testimonial.user.avatar}
                        alt={testimonial.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-medium">{testimonial.user.name}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold">Meetly</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <button
                onClick={() => navigate("/impressum")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Impressum
              </button>
              <button
                onClick={() => navigate("/privacy-policy")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Datenschutz
              </button>
              <button
                onClick={() => navigate("/terms")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                AGB
              </button>
            </div>

            <p className="text-sm text-muted-foreground">{t("footer_tagline")}</p>
            <p className="text-sm text-muted-foreground">© 2026 Meetly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
