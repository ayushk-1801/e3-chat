"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
  ArrowUp,
  Search,
  Paperclip,
  ChevronDown,
  Globe,
  CornerRightUp,
  Sparkles,
  Zap,
  Brain,
  Bot,
  Cpu,
} from "lucide-react";
import GlowButton from "../ui/glow-button";

interface CreateChatResponse {
  chatId: string;
}

export function ChatBox() {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash-preview-04-17");
  const [isLoading, setIsLoading] = useState(false);
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
  const { state, isMobile } = useSidebar();
  const router = useRouter();

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      setIsLoading(true);
      try {
        // Create a new chat with the initial message
        const createResponse = await fetch("/api/chat/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: message.slice(0, 50) + (message.length > 50 ? "..." : ""), // Use first 50 chars as title
            initialMessage: message, // Send the message directly
            preferredModel: selectedModel, // Include the selected model
            useSearchGrounding: useSearchGrounding, // Include search grounding preference
          }),
        });

        if (createResponse.ok) {
          const data = (await createResponse.json()) as CreateChatResponse;

          // Dispatch custom event to refresh sidebar
          window.dispatchEvent(new CustomEvent('refreshChats'));

          // Navigate to the new chat page without URL parameters
          void router.push(`/chat/${data.chatId}`);
        } else {
          console.error("Failed to create chat");
        }
      } catch (error) {
        console.error("Error creating chat:", error);
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

  // Function to toggle search grounding
  const toggleSearchGrounding = () => {
    if (selectedModel.startsWith("gemini")) {
      setUseSearchGrounding(!useSearchGrounding);
      toast.success(
        `Search grounding ${!useSearchGrounding ? "enabled" : "disabled"}`
      );
    }
  };

  // Reset search grounding when switching to non-Gemini models
  useEffect(() => {
    if (!selectedModel.startsWith("gemini") && useSearchGrounding) {
      setUseSearchGrounding(false);
    }
  }, [selectedModel, useSearchGrounding]);

    return (
    <div className={`fixed bottom-0 z-10 w-full max-w-3xl transition-all duration-300 ease-in-out ${
      isMobile
        ? "left-1/2 -translate-x-1/2 transform"
        : state === "expanded"
          ? "left-[calc(50%+8rem)] -translate-x-1/2 transform"
          : "left-[calc(50%+1.5rem)] -translate-x-1/2 transform"
    }`}>
      {/* Search Grounding Indicator - Above Chat Box */}
      {useSearchGrounding && selectedModel.startsWith("gemini") && (
        <div className="mb-0 animate-in slide-in-from-bottom-2 duration-300 ease-out px-4">
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
        <div>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="min-h-[50px] w-full border-none bg-transparent text-base outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
          />
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Model Selector */}
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="ml-1 w-auto border-none bg-transparent dark:bg-transparent">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {modelDisplayNames[selectedModel] ?? selectedModel}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="w-80 max-h-96 overflow-y-auto">
                <SelectGroup>
                  <SelectLabel className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    Google Gemini
                  </SelectLabel>
                  <SelectItem value="gemini-2.5-pro-preview-05-06" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                        <img src="/icons/gemini.svg" alt="Gemini" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Gemini 2.5 Pro Preview</span>
                        <span className="text-xs text-muted-foreground">Most capable preview</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="gemini-2.5-flash-preview-04-17" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                       <img src="/icons/gemini.svg" alt="Gemini" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Gemini 2.5 Flash Preview</span>
                        <span className="text-xs text-muted-foreground">Latest & fastest preview</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="gemini-2.5-pro-exp-03-25" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                       <img src="/icons/gemini.svg" alt="Gemini" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Gemini 2.5 Pro Experimental</span>
                        <span className="text-xs text-muted-foreground">Experimental features</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="gemini-2.0-flash" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                       <img src="/icons/gemini.svg" alt="Gemini" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Gemini 2.0 Flash</span>
                        <span className="text-xs text-muted-foreground">Reliable & proven</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    Groq
                  </SelectLabel>
                  <SelectItem value="meta-llama/llama-4-scout-17b-16e-instruct" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                       <img src="/icons/meta.svg" alt="Meta" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Llama 4 Scout 17B</span>
                        <span className="text-xs text-muted-foreground">Latest Llama 4 preview</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="llama-3.3-70b-versatile" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                       <img src="/icons/meta.svg" alt="Meta" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Llama 3.3 70B</span>
                        <span className="text-xs text-muted-foreground">Most capable Llama</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="llama-3.1-8b-instant" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                       <img src="/icons/meta.svg" alt="Meta" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Llama 3.1 8B Instant</span>
                        <span className="text-xs text-muted-foreground">Lightning fast</span>
                      </div>
                    </div>
                  </SelectItem>



                  <SelectItem value="mixtral-8x7b-32768" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                       <img src="/icons/mistral.svg" alt="Mistral" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Mixtral 8x7B</span>
                        <span className="text-xs text-muted-foreground">Mixture of experts</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="mistral-saba-24b" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                       <img src="/icons/mistral.svg" alt="Mistral" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Mistral Saba 24B</span>
                        <span className="text-xs text-muted-foreground">Advanced reasoning</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="gemma2-9b-it" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                       <img src="/icons/gemini.svg" alt="Google" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Gemma 2 9B</span>
                        <span className="text-xs text-muted-foreground">Google&apos;s open model</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="qwen-qwq-32b" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                       <img src="/icons/qwen.svg" alt="Qwen" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Qwen QwQ 32B</span>
                        <span className="text-xs text-muted-foreground">Reasoning specialist</span>
                      </div>
                    </div>
                  </SelectItem>


                  <SelectItem value="deepseek-r1-distill-llama-70b" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                       <img src="/icons/deepseek.svg" alt="DeepSeek" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">DeepSeek R1 Distill Llama 70B</span>
                        <span className="text-xs text-muted-foreground">Large reasoning model</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    <img src="/icons/ollama.svg" alt="Ollama" className="h-3 w-3" />
                    Ollama (Local)
                  </SelectLabel>
                  <SelectItem value="llama3.2" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                        <img src="/icons/meta.svg" alt="Meta" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Llama 3.2 (Latest)</span>
                        <span className="text-xs text-muted-foreground">Local inference</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="llama3.2:3b" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                        <img src="/icons/meta.svg" alt="Meta" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Llama 3.2 3B</span>
                        <span className="text-xs text-muted-foreground">Small & fast</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="llama3.1:8b" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                        <img src="/icons/meta.svg" alt="Meta" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Llama 3.1 8B</span>
                        <span className="text-xs text-muted-foreground">Balanced performance</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="llama3.1:70b" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                        <img src="/icons/meta.svg" alt="Meta" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Llama 3.1 70B</span>
                        <span className="text-xs text-muted-foreground">High capability</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="phi3" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                        <img src="/icons/microsoft.svg" alt="Microsoft" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Phi-3 (Latest)</span>
                        <span className="text-xs text-muted-foreground">Microsoft&apos;s SLM</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="mistral:7b" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                        <img src="/icons/mistral.svg" alt="Mistral" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Mistral 7B</span>
                        <span className="text-xs text-muted-foreground">Efficient & capable</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="codellama" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                        <img src="/icons/meta.svg" alt="Meta" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">CodeLlama</span>
                        <span className="text-xs text-muted-foreground">Code generation</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="qwen3:0.6b" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                        <img src="/icons/qwen.svg" alt="Qwen" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Qwen 3 0.6B</span>
                        <span className="text-xs text-muted-foreground">Ultra lightweight</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="qwen2.5:7b" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                        <img src="/icons/qwen.svg" alt="Qwen" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Qwen 2.5 7B</span>
                        <span className="text-xs text-muted-foreground">Alibaba&apos;s model</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="deepseek-coder" className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-6 w-6 items-center justify-center rounded">
                        <img src="/icons/deepseek.svg" alt="DeepSeek" className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">DeepSeek Coder</span>
                        <span className="text-xs text-muted-foreground">Advanced code model</span>
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
              Search
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
            onClick={() => void handleSend()}
            disabled={!message.trim() || isLoading}
            size="icon"
            className="mr-2 h-8 w-8 p-0"
          >
            <CornerRightUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}
