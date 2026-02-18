import { useNavigate, useLocation } from "react-router";
import { Home, Plus, MessageCircle, User } from "lucide-react";
import { Button } from "./ui/button";

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex items-center justify-around p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/home")}
          className={isActive("/home") ? "text-primary" : ""}
        >
          <Home className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/create-event")}
          className={isActive("/create-event") ? "text-primary" : ""}
        >
          <Plus className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/messages")}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
          className={isActive("/profile") ? "text-primary" : ""}
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
