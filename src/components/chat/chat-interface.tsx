"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";
import { MessageLoading } from "@/components/ui/message-loading";
import {
  ArrowUp,
  Search,
  Paperclip,
  Globe,
  CornerRightUp,
  Sparkles,
  Zap,
  Brain,
  Bot,
  Cpu,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MarkdownMessage } from "./markdown-message";
import { MessageNavigation } from "./message-navigation";

interface ChatMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ChatInterfaceProps {
  chatId: string;
  initialMessages: ChatMessage[];
  preferredModel?: string;
}

export function ChatInterface({ chatId, initialMessages, preferredModel }: ChatInterfaceProps) {
  const { state, isMobile } = useSidebar();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get("initialMessage");
  const hasProcessedInitialMessage = useRef(false);
  const [selectedModel, setSelectedModel] = useState(
    preferredModel ?? "gemini-2.5-flash-preview-04-17",
  );
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);

  // Model display names for the trigger
  const modelDisplayNames: Record<string, string> = {
    "gemini-2.5-pro-preview-05-06": "Gemini 2.5 Pro Preview",
    "gemini-2.5-flash-preview-04-17": "Gemini 2.5 Flash Preview",
    "gemini-2.5-pro-exp-03-25": "Gemini 2.5 Pro Experimental",
    "gemini-2.0-flash": "Gemini 2.0 Flash",
    "meta-llama/llama-4-scout-17b-16e-instruct": "Llama 4 Scout 17B",
    "llama-3.3-70b-versatile": "Llama 3.3 70B",
    "llama-3.1-8b-instant": "Llama 3.1 8B Instant",

    "mixtral-8x7b-32768": "Mixtral 8x7B",
    "mistral-saba-24b": "Mistral Saba 24B",
    "gemma2-9b-it": "Gemma 2 9B",
    "qwen-qwq-32b": "Qwen QwQ 32B",

    "deepseek-r1-distill-llama-70b": "DeepSeek R1 Distill Llama 70B",

    // Ollama models
    "llama3.2": "Llama 3.2 (Latest)",
    "llama3.2:3b": "Llama 3.2 3B",
    "llama3.1": "Llama 3.1 (Latest)",
    "llama3.1:8b": "Llama 3.1 8B",
    "llama3.1:70b": "Llama 3.1 70B",
    "phi3": "Phi-3 (Latest)",
    "phi3:3.8b": "Phi-3 3.8B",
    "phi3:14b": "Phi-3 14B",
    "mistral": "Mistral (Latest)",
    "mistral:7b": "Mistral 7B",
    "codellama": "CodeLlama (Latest)",
    "codellama:7b": "CodeLlama 7B",
    "codellama:13b": "CodeLlama 13B",
    "gemma2": "Gemma 2 (Latest)",
    "gemma2:2b": "Gemma 2 2B",
    "gemma2:9b": "Gemma 2 9B",
    "qwen2.5": "Qwen 2.5 (Latest)",
    "qwen2.5:7b": "Qwen 2.5 7B",
    "qwen2.5:14b": "Qwen 2.5 14B",
    "qwen3:0.6b": "Qwen 3 0.6B",
    "deepseek-coder": "DeepSeek Coder (Latest)",
    "deepseek-coder:6.7b": "DeepSeek Coder 6.7B",
  };

  // For new chats with only one user message, don't use initialMessages
  // Instead, we'll append it through useChat to trigger the proper response flow
  const shouldUseInitialMessages = !(
    initialMessages.length === 1 && initialMessages[0]?.role === "user"
  );

  // Transform initial messages to the format expected by useChat
  const transformedMessages = shouldUseInitialMessages
    ? initialMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }))
    : [];

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  } = useChat({
    api: "/api/chat",
    initialMessages: transformedMessages,
    body: { 
      chatId, 
      selectedModel,
      useSearchGrounding: useSearchGrounding && selectedModel.startsWith("gemini")
    },
    onFinish: (message) => {
      // Save the assistant message to the database
      fetch("/api/chat/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          role: "assistant",
          content: message.content,
        }),
      }).catch((error) => {
        console.error("Failed to save message:", error);
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear URL parameter if present (no longer needed since we handle initial messages via database)
  useEffect(() => {
    if (initialMessage) {
      const url = new URL(window.location.href);
      url.searchParams.delete("initialMessage");
      window.history.replaceState({}, "", url.toString());
    }
  }, [initialMessage]);

  // Handle case where we have a single initial user message that needs to be processed
  useEffect(() => {
    if (
      !shouldUseInitialMessages &&
      initialMessages.length === 1 &&
      initialMessages[0]?.role === "user" &&
      messages.length === 0 &&
      !hasProcessedInitialMessage.current
    ) {
      // Mark as processed to prevent re-triggering
      hasProcessedInitialMessage.current = true;

      // Append the initial message through useChat to trigger the response flow
      void append({
        role: "user",
        content: initialMessages[0].content,
      });
    }
  }, [shouldUseInitialMessages, initialMessages, messages.length, append]);

  // Reset search grounding when switching to non-Gemini models
  useEffect(() => {
    if (!selectedModel.startsWith("gemini") && useSearchGrounding) {
      setUseSearchGrounding(false);
    }
  }, [selectedModel, useSearchGrounding]);

  // Function to scroll to a specific message
  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      // Add a highlight effect
      messageElement.classList.add("bg-accent/20");
      setTimeout(() => {
        messageElement.classList.remove("bg-accent/20");
      }, 2000);
    }
  };

  // Function to copy message content
  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success("Message copied to clipboard");

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
      toast.error("Failed to copy message");
    }
  };

  // Function to toggle search grounding
  const toggleSearchGrounding = () => {
    if (selectedModel.startsWith("gemini")) {
      setUseSearchGrounding(!useSearchGrounding);
      toast.success(
        `Search grounding ${!useSearchGrounding ? "enabled" : "disabled"}`
      );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Message Navigation */}
      <MessageNavigation messages={messages} onMessageClick={scrollToMessage} />



      {/* Messages Area */}
      <div
        className={`min-h-screen max-w-3xl space-y-8 p-4 pb-32 transition-all duration-200 ${
          state === "expanded" && !isMobile ? "mx-auto" : "mx-auto"
        }`}
      >
        {messages.map((message) => (
          <div key={message.id}>
            <div
              ref={(el) => {
                messageRefs.current.set(message.id, el);
              }}
              className={`flex transition-colors duration-500 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`group relative max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-muted text-muted-foreground"
                    : "max-w-full"
                }`}
              >
                {message.role === "user" ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <MarkdownMessage content={message.content} />
                )}

                {/* Copy Button - Bottom left for assistant, bottom right for user */}
                <Button
                  onClick={() => copyMessage(message.content, message.id)}
                  variant="ghost"
                  size="sm"
                  className={`bg-background/80 hover:bg-background border-border/50 absolute h-6 w-6 border p-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                    message.role === "user"
                      ? "right-0 -bottom-8"
                      : "bottom-0 left-2"
                  }`}
                >
                  {copiedMessageId === message.id ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>


          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3">
              <MessageLoading />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area */}
      <div className="sticky right-0 bottom-0 left-0 z-1">
        <div
          className={`max-w-3xl px-4 transition-all duration-200 ${
            state === "expanded" && !isMobile ? "mx-auto" : "mx-auto"
          }`}
        >
          {/* Search Grounding Indicator - Above Chat Box */}
          {useSearchGrounding && selectedModel.startsWith("gemini") && (
            <div className="mb-0 animate-in slide-in-from-bottom-2 duration-300 ease-out -z-10">
              <div className="mx-auto max-w-2xl">
                <div className="flex items-center gap-2 rounded-t-lg bg-sidebar px-3 py-2 text-sm text-sidebar-foreground border border-sidebar-border">
                  <Globe className="h-4 w-4" />
                  <span>Search grounding enabled - responses will include web search results</span>
                </div>
              </div>
            </div>
          )}

          <div
            className={`bg-background border-border flex w-full flex-col rounded-t-2xl border-t border-r border-l px-1.5 pt-1.5 transition-all duration-200 ease-linear`}
          >
            <div className="bg-secondary/50 space-y-4 rounded-t-lg border pb-2">
              {/* Message Input Area */}
              <form onSubmit={handleSubmit}>
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  disabled={isLoading}
                  className="min-h-[50px] w-full border-none bg-transparent text-base outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
                />
              </form>

              {/* Control Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Model Selector */}
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger className="ml-1 w-auto border-none bg-transparent dark:bg-transparent">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {modelDisplayNames[selectedModel] ?? selectedModel}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-96 w-80 overflow-y-auto">
                      <SelectGroup>
                        <SelectLabel className="text-muted-foreground flex items-center gap-2 px-2 py-1.5 text-xs font-medium">
                          <Sparkles className="h-3 w-3" />
                          Google Gemini
                        </SelectLabel>
                        <SelectItem
                          value="gemini-2.5-pro-preview-05-06"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/gemini.svg"
                                alt="Gemini"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Gemini 2.5 Pro Preview
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Most capable preview
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="gemini-2.5-flash-preview-04-17"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/gemini.svg"
                                alt="Gemini"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Gemini 2.5 Flash Preview
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Latest & fastest preview
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="gemini-2.5-pro-exp-03-25"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/gemini.svg"
                                alt="Gemini"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Gemini 2.5 Pro Experimental
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Experimental features
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="gemini-2.0-flash"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/gemini.svg"
                                alt="Gemini"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Gemini 2.0 Flash
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Reliable & proven
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel className="text-muted-foreground flex items-center gap-2 px-2 py-1.5 text-xs font-medium">
                          <Zap className="h-3 w-3" />
                          Groq
                        </SelectLabel>
                        <SelectItem
                          value="meta-llama/llama-4-scout-17b-16e-instruct"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/meta.svg"
                                alt="Meta"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Llama 4 Scout 17B
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Latest Llama 4 preview
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="llama-3.3-70b-versatile"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/meta.svg"
                                alt="Meta"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">Llama 3.3 70B</span>
                              <span className="text-muted-foreground text-xs">
                                Most capable Llama
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="llama-3.1-8b-instant"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/meta.svg"
                                alt="Meta"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Llama 3.1 8B Instant
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Lightning fast
                              </span>
                            </div>
                          </div>
                        </SelectItem>



                        <SelectItem
                          value="mixtral-8x7b-32768"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/mistral.svg"
                                alt="Mistral"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">Mixtral 8x7B</span>
                              <span className="text-muted-foreground text-xs">
                                Mixture of experts
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="mistral-saba-24b"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/mistral.svg"
                                alt="Mistral"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Mistral Saba 24B
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Advanced reasoning
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="gemma2-9b-it"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/gemini.svg"
                                alt="Google"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">Gemma 2 9B</span>
                              <span className="text-muted-foreground text-xs">
                                Google&apos;s open model
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="qwen-qwq-32b"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/qwen.svg"
                                alt="Qwen"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">Qwen QwQ 32B</span>
                              <span className="text-muted-foreground text-xs">
                                Reasoning specialist
                              </span>
                            </div>
                          </div>
                        </SelectItem>


                        <SelectItem
                          value="deepseek-r1-distill-llama-70b"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/deepseek.svg"
                                alt="DeepSeek"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                DeepSeek R1 Distill Llama 70B
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Large reasoning model
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel className="text-muted-foreground flex items-center gap-2 px-2 py-1.5 text-xs font-medium">
                          <img src="/icons/ollama.svg" alt="Ollama" className="h-3 w-3" />
                          Ollama (Local)
                        </SelectLabel>
                        <SelectItem
                          value="llama3.2"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/meta.svg"
                                alt="Meta"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Llama 3.2 (Latest)
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Local inference
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="llama3.2:3b"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/meta.svg"
                                alt="Meta"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">Llama 3.2 3B</span>
                              <span className="text-muted-foreground text-xs">
                                Small & fast
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="llama3.1:8b"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/meta.svg"
                                alt="Meta"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">Llama 3.1 8B</span>
                              <span className="text-muted-foreground text-xs">
                                Balanced performance
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="llama3.1:70b"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/meta.svg"
                                alt="Meta"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">Llama 3.1 70B</span>
                              <span className="text-muted-foreground text-xs">
                                High capability
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="phi3"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/microsoft.svg"
                                alt="Microsoft"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                                                             <span className="font-medium">Phi-3 (Latest)</span>
                               <span className="text-muted-foreground text-xs">
                                 Microsoft&apos;s SLM
                               </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="mistral:7b"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/mistral.svg"
                                alt="Mistral"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">Mistral 7B</span>
                              <span className="text-muted-foreground text-xs">
                                Efficient & capable
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="codellama"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/meta.svg"
                                alt="Meta"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">CodeLlama</span>
                              <span className="text-muted-foreground text-xs">
                                Code generation
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="qwen2.5:7b"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/qwen.svg"
                                alt="Qwen"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                               <span className="font-medium">Qwen 2.5 7B</span>
                               <span className="text-muted-foreground text-xs">
                                 Alibaba&apos;s model
                               </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="qwen3:0.6b"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/qwen.svg"
                                alt="Qwen"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">Qwen 3 0.6B</span>
                              <span className="text-muted-foreground text-xs">
                                Ultra lightweight
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="deepseek-coder"
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded">
                              <img
                                src="/icons/deepseek.svg"
                                alt="DeepSeek"
                                className="h-6 w-6 text-white"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                DeepSeek Coder
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Advanced code model
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {/* Search Button */}
                  <Button
                    variant={useSearchGrounding && selectedModel.startsWith("gemini") ? "default" : "outline"}
                    size="sm"
                    disabled={!selectedModel.startsWith("gemini")}
                    className={`rounded-full ${
                      useSearchGrounding && selectedModel.startsWith("gemini")
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-transparent dark:bg-transparent"
                    }`}
                    onClick={toggleSearchGrounding}
                  >
                    <Globe className="mr-1 h-4 w-4" />
                    {useSearchGrounding && selectedModel.startsWith("gemini") ? "Search" : "Search"}
                  </Button>

                  {/* Attachment Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-transparent dark:bg-transparent"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>

                {/* Send Button */}
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="mr-2 h-8 w-8 p-0"
                >
                  <CornerRightUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
