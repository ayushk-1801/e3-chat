"use client";

import { useChat } from '@ai-sdk/react';
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
import { ArrowUp, Search, Paperclip, Globe } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ChatInterfaceProps {
  chatId: string;
  initialMessages: ChatMessage[];
}

export function ChatInterface({ chatId, initialMessages }: ChatInterfaceProps) {
  const { state, isMobile } = useSidebar();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('initialMessage');

  // Transform initial messages to the format expected by useChat
  const transformedMessages = initialMessages.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading,
    append 
  } = useChat({
    api: '/api/chat',
    initialMessages: transformedMessages,
    body: { chatId },
    onFinish: async (message) => {
      // Save the assistant message to the database
      try {
        await fetch('/api/chat/save-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId,
            role: 'assistant',
            content: message.content,
          }),
        });
      } catch (error) {
        console.error('Failed to save message:', error);
      }
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle initial message from URL parameter
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      void append({
        role: 'user',
        content: initialMessage,
      });
    }
  }, [initialMessage, append, messages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground max-w-[80%] rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="animate-bounce">●</div>
                <div className="animate-bounce delay-100">●</div>
                <div className="animate-bounce delay-200">●</div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className={`bg-background border-border w-full flex flex-col rounded-t-2xl border-t border-r border-l px-1.5 pt-1.5 transition-all duration-200 ease-linear`}
      >
        <div className="bg-secondary/50 space-y-4 rounded-t-lg border pb-2">
          {/* Message Input Area */}
          <form onSubmit={handleSubmit}>
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="min-h-[50px] w-full text-base bg-transparent dark:bg-transparent outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </form>

          {/* Control Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Model Selector */}
              <Select defaultValue="gemini-2.0-flash">
                <SelectTrigger className="w-auto bg-transparent dark:bg-transparent border-none ml-1">
                  <div className="flex items-center space-x-2">
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.0-flash">
                    Gemini 2.0 Flash
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
              type="submit"
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-8 w-8 p-0 mr-2"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 