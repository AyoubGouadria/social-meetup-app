import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { ArrowLeft, Coffee, Users, MapPin, Calendar } from "lucide-react";

export default function DesignSystem() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Design System</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-12">
          {/* Colors */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="h-20 bg-primary rounded-lg mb-3"></div>
                <p className="font-medium">Primary</p>
                <p className="text-sm text-muted-foreground">#0ea5e9</p>
              </Card>
              <Card className="p-4">
                <div className="h-20 bg-accent rounded-lg mb-3"></div>
                <p className="font-medium">Accent</p>
                <p className="text-sm text-muted-foreground">#e0f2fe</p>
              </Card>
              <Card className="p-4">
                <div className="h-20 bg-muted rounded-lg mb-3"></div>
                <p className="font-medium">Muted</p>
                <p className="text-sm text-muted-foreground">#ececf0</p>
              </Card>
              <Card className="p-4">
                <div className="h-20 bg-destructive rounded-lg mb-3"></div>
                <p className="font-medium">Destructive</p>
                <p className="text-sm text-muted-foreground">#d4183d</p>
              </Card>
            </div>
          </section>

          {/* Typography */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Typography</h2>
            <Card className="p-6 space-y-4">
              <div>
                <h1>Heading 1 - The quick brown fox</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Default styling via theme.css
                </p>
              </div>
              <div>
                <h2>Heading 2 - The quick brown fox</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Default styling via theme.css
                </p>
              </div>
              <div>
                <h3>Heading 3 - The quick brown fox</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Default styling via theme.css
                </p>
              </div>
              <div>
                <p>Body text - The quick brown fox jumps over the lazy dog</p>
                <p className="text-sm text-muted-foreground mt-1">Regular paragraph</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Small muted text - The quick brown fox jumps over the lazy dog
                </p>
              </div>
            </Card>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Buttons</h2>
            <Card className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold mb-3">Variants</h3>
                  <Button>Default Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="destructive">Destructive Button</Button>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold mb-3">Sizes</h3>
                  <Button size="sm">Small Button</Button>
                  <Button>Default Button</Button>
                  <Button size="lg">Large Button</Button>
                  <Button size="icon">
                    <Coffee className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Form Elements */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Form Elements</h2>
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Field</label>
                <Input placeholder="Enter text..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Textarea</label>
                <Textarea placeholder="Enter description..." rows={3} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select</label>
                <select className="w-full h-10 px-3 rounded-lg border border-input bg-input-background">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
            </Card>
          </section>

          {/* Badges */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Badges</h2>
            <Card className="p-6">
              <div className="flex flex-wrap gap-2">
                <Badge>Default Badge</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-amber-100 text-amber-800">Coffee</Badge>
                <Badge className="bg-green-100 text-green-800">Walk</Badge>
                <Badge className="bg-purple-100 text-purple-800">Study</Badge>
                <Badge className="bg-red-100 text-red-800">Gym</Badge>
                <Badge className="bg-blue-100 text-blue-800">Explore</Badge>
              </div>
            </Card>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Cards</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Basic Card</h3>
                <p className="text-sm text-muted-foreground">
                  This is a basic card component with padding and rounded corners.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold mb-2">Interactive Card</h3>
                <p className="text-sm text-muted-foreground">
                  This card has hover effects and can be interactive.
                </p>
              </Card>
            </div>
          </section>

          {/* Avatars */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Avatars</h2>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
                    alt="User"
                  />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
                    alt="User"
                  />
                  <AvatarFallback>AH</AvatarFallback>
                </Avatar>
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
                    alt="User"
                  />
                  <AvatarFallback>EK</AvatarFallback>
                </Avatar>
              </div>
            </Card>
          </section>

          {/* Icons */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Icons (Lucide)</h2>
            <Card className="p-6">
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Coffee className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm">Coffee</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm">Users</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm">MapPin</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm">Calendar</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Spacing & Radius */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Spacing & Border Radius</h2>
            <Card className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Border Radius: 0.75rem (12px) - Defined in CSS variables
              </p>
              <div className="flex gap-4">
                <div className="h-16 w-16 bg-primary rounded-sm"></div>
                <div className="h-16 w-16 bg-primary rounded-md"></div>
                <div className="h-16 w-16 bg-primary rounded-lg"></div>
                <div className="h-16 w-16 bg-primary rounded-xl"></div>
                <div className="h-16 w-16 bg-primary rounded-full"></div>
              </div>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
