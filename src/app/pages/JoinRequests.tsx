import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { mockJoinRequests, mockEvents } from "../utils/mockData";
import { ArrowLeft, Check, X } from "lucide-react";

export default function JoinRequests() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const [requests, setRequests] = useState(mockJoinRequests.filter((r) => r.eventId === id));

  const event = mockEvents.find((e) => e.id === id);

  const handleRequest = (requestId: string, status: "accepted" | "rejected") => {
    setRequests(requests.map((r) => (r.id === requestId ? { ...r, status } : r)));
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <Button onClick={() => navigate("/home")}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/event/${id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{t("applicants")}</h1>
            <p className="text-sm text-muted-foreground">{event.title}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {pendingRequests.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <X className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Pending Requests</h2>
            <p className="text-muted-foreground">All join requests have been reviewed.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={request.user.avatar}
                      alt={request.user.name}
                    />
                    <AvatarFallback>{request.user.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{request.user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.user.city}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {request.user.languages.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      {request.user.bio}
                    </p>

                    {request.message && (
                      <Card className="p-3 bg-muted/30 mb-4">
                        <p className="text-sm italic">"{request.message}"</p>
                      </Card>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleRequest(request.id, "accepted")}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {t("accept")}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleRequest(request.id, "rejected")}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t("reject")}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Accepted/Rejected Requests */}
        {requests.filter((r) => r.status !== "pending").length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Reviewed Requests</h2>
            <div className="space-y-3">
              {requests
                .filter((r) => r.status !== "pending")
                .map((request) => (
                  <Card key={request.id} className="p-4 opacity-60">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={request.user.avatar}
                          alt={request.user.name}
                        />
                        <AvatarFallback>{request.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{request.user.name}</p>
                      </div>
                      <Badge
                        variant={
                          request.status === "accepted" ? "default" : "secondary"
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
