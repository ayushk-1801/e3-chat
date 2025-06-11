"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";
import { ArrowUp, Search, Paperclip, ChevronDown, Globe, CornerRightUp } from "lucide-react";

interface CreateChatResponse {
  chatId: string;
}

export function ChatBox() {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [isLoading, setIsLoading] = useState(false);
  const { state, isMobile } = useSidebar();
  const router = useRouter();

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      setIsLoading(true);
      try {
        // Create a new chat with the initial message
        const createResponse = await fetch('/api/chat/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: message.slice(0, 50) + (message.length > 50 ? '...' : ''), // Use first 50 chars as title
            initialMessage: message, // Send the message directly
          }),
        });

        if (createResponse.ok) {
          const data = await createResponse.json() as CreateChatResponse;
          
          // Navigate to the new chat page without URL parameters
          void router.push(`/chat/${data.chatId}`);
        } else {
          console.error('Failed to create chat');
        }
      } catch (error) {
        console.error('Error creating chat:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div
      className={`bg-background border-border fixed bottom-0 flex w-full max-w-3xl flex-col rounded-t-2xl border-t border-r border-l px-1.5 pt-1.5 transition-all duration-200 ease-linear ${
        isMobile
          ? "left-1/2 -translate-x-1/2 transform"
          : state === "expanded"
            ? "left-[calc(50%+8rem)] -translate-x-1/2 transform"
            : "left-[calc(50%+1.5rem)] -translate-x-1/2 transform"
      }`}
    >
      <div className="bg-secondary/50 space-y-4 rounded-t-lg border pb-2">
        {/* Message Input Area */}
        <div>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="min-h-[50px] w-full text-base bg-transparent dark:bg-transparent outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Model Selector */}
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-auto bg-transparent dark:bg-transparent border-none ml-1">
                <div className="flex items-center space-x-2">
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.5-flash">
                  Gemini 2.5 Flash
                </SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Button */}
            <Button variant="outline" size="sm" className="bg-transparent dark:bg-transparent rounded-full">
              <Globe className="mr-1 h-4 w-4" />
              Search
            </Button>

            {/* Attachment Button */}
            <Button variant="outline" size="sm" className="bg-transparent dark:bg-transparent rounded-full">
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>

          {/* Send Button */}
          <Button
            onClick={() => void handleSend()}
            disabled={!message.trim() || isLoading}
            size="icon"
            className="h-8 w-8 p-0 mr-2"
          >
            <CornerRightUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
