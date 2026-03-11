import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { MessageCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import chatService from "../../services/chatService";
import storage from "../../lib/storage";
import * as React from "react";

interface Position {
  x: number;
  y: number;
}

export function MessengerButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  // Default position at bottom-left (mobile: above bottom nav, desktop: bottom)
  const getDefaultPosition = () => {
    const isMobile = window.innerWidth < 768;
    return {
      x: 24, // 24px from left
      y: isMobile ? window.innerHeight - 120 : window.innerHeight - 96 // Above bottom nav on mobile
    };
  };
  
  const [position, setPosition] = useState<Position>(getDefaultPosition());
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });

  const currentUser = storage.getUser();
  const isAuthenticated = !!currentUser;

  // Hide messenger button on messenger page and chat pages
  const hiddenPaths = ["/messages", "/login", "/register", "/", "/profile-setup"];
  const isOnChatPage = location.pathname.startsWith("/chat/");
  const shouldHide = hiddenPaths.includes(location.pathname) || isOnChatPage;

  // Track if we were just on a chat page
  const wasOnChatPageRef = React.useRef(false);

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem("messengerButtonPosition");
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (e) {
        console.error("Error parsing saved position:", e);
      }
    }
  }, []);

  useEffect(() => {
    // If we just left a chat page, immediately refresh unread count
    if (wasOnChatPageRef.current && !isOnChatPage) {
      console.log('Just left chat page, refreshing unread count');
      loadUnreadCount();
    }
    wasOnChatPageRef.current = isOnChatPage;
  }, [isOnChatPage]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Load unread count immediately
    loadUnreadCount();

    // Refresh unread count every 10 seconds (more frequent for better UX)
    const interval = setInterval(loadUnreadCount, 10000);

    // Refresh when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUnreadCount();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, location.pathname]);

  // Handle window resize to keep button in viewport
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const newPosition = {
          x: Math.max(0, Math.min(window.innerWidth - 80, prev.x)),
          y: Math.max(0, Math.min(window.innerHeight - 80, prev.y))
        };
        
        // Only save if position changed
        if (newPosition.x !== prev.x || newPosition.y !== prev.y) {
          localStorage.setItem("messengerButtonPosition", JSON.stringify(newPosition));
        }
        
        return newPosition;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await chatService.getConversations();
      const conversations = response.data || [];
      const total = conversations.reduce(
        (sum: number, conv: any) => sum + (conv.unreadCount || 0),
        0
      );
      console.log('Unread count updated:', total, 'conversations:', conversations.length);
      setUnreadCount(total);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const handleDragEnd = (_event: any, info: any) => {
    const newPosition = {
      x: Math.max(0, Math.min(window.innerWidth - 80, position.x + info.offset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 80, position.y + info.offset.y))
    };
    setPosition(newPosition);
    localStorage.setItem("messengerButtonPosition", JSON.stringify(newPosition));
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!isDragging) {
      navigate("/messages");
    }
  };

  if (!isAuthenticated || shouldHide) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            x: position.x,
            y: position.y
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 60,
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none'
          }}
        >
          <Button
            size="lg"
            onClick={handleClick}
            className="h-16 w-16 rounded-full shadow-2xl hover:shadow-xl transition-all relative group pointer-events-auto"
            title="Drag to reposition"
          >
            <MessageCircle className="h-7 w-7" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -left-2 h-7 w-7 rounded-full p-0 flex items-center justify-center text-xs font-bold shadow-lg pointer-events-none"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <div className="absolute inset-0 rounded-full bg-primary opacity-0 group-hover:opacity-20 transition-opacity" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
