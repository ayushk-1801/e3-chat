"use client";

import { useState } from "react";
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
import { ArrowUp, Search, Paperclip, ChevronDown, Globe } from "lucide-react";

export function ChatBox() {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const { state, isMobile } = useSidebar();

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message
      console.log("Sending:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="h-8 w-8 p-0 mr-2"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
