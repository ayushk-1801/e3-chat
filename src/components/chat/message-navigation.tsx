"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "data";
  content: string;
}

interface MessageNavigationProps {
  messages: Message[];
  onMessageClick: (messageId: string) => void;
}

export function MessageNavigation({ messages, onMessageClick }: MessageNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter only user messages for navigation
  const userMessages = messages.filter(message => message.role === "user");

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
      setHoveredMessageId(null);
    }, 200);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (userMessages.length === 0) return null;

  return (
    <div 
      className="fixed right-0 top-1/2 -translate-y-1/2 z-10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          "bg-background/80 backdrop-blur-sm border-l border-t border-b border-border rounded-l-lg transition-all duration-300 ease-out",
          isExpanded ? "w-64 pr-4" : "w-6"
        )}
      >
        {/* Collapsed view - dots */}
        {!isExpanded && (
          <div className="flex flex-col items-center py-4 space-y-3">
            {userMessages.map((message, index) => (
              <button
                key={message.id}
                onClick={() => onMessageClick(message.id)}
                className="w-2 h-2 rounded-full bg-muted-foreground/40 hover:bg-primary transition-colors duration-200"
                title={truncateText(message.content, 50)}
              />
            ))}
          </div>
        )}

        {/* Expanded view - message previews */}
        {isExpanded && (
          <div className="py-4 pl-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {userMessages.map((message, index) => (
              <button
                key={message.id}
                onClick={() => onMessageClick(message.id)}
                onMouseEnter={() => setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                className={cn(
                  "w-full text-left p-2 rounded-md transition-all duration-200 text-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  "border border-transparent hover:border-border",
                  hoveredMessageId === message.id && "bg-accent/50"
                )}
              >
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">

                    <div className="text-sm leading-relaxed line-clamp-2">
                      {truncateText(message.content, 80)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 