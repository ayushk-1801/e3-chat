"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  LogInIcon, 
  UserIcon, 
  User2, 
  ChevronUp, 
  Search, 
  Settings
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useChats } from "@/hooks/use-chats";

// Chat threads interface for type safety
interface ChatThread {
  id: string;
  title: string;
  url?: string;
  createdAt?: Date | string;
}

// Loading skeleton for chat threads
function ChatThreadsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <SidebarMenu>
      {Array.from({ length: count }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// Chat threads component
function ChatThreads({ 
  threads, 
  onChatSelect,
  isLoading,
  error
}: { 
  threads: ChatThread[];
  onChatSelect: (chatId: string) => void;
  isLoading: boolean;
  error: string | null;
}) {
  if (isLoading) {
    return <ChatThreadsSkeleton count={5} />;
  }

  if (error) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            Failed to load chats
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (threads.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            No chats yet. Start a new conversation!
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      {threads.map((chat) => (
        <SidebarMenuItem key={chat.id}>
          <SidebarMenuButton 
            className="justify-start h-8 px-2 overflow-hidden"
            onClick={() => onChatSelect(chat.id)}
          >
            <span className="truncate text-sm overflow-hidden">{chat.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// Search component for filtering chats
function ChatSearch({ 
  searchQuery, 
  onSearchChange 
}: { 
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  return (
    <div className="px-4 pb-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search your threads..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { chats, isLoading, error, refetch } = useChats();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    router.push("/");
    // Refetch chats when returning from a new chat
    setTimeout(() => {
      void refetch();
    }, 1000);
  };
  
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-semibold">E3.chat</h1>
          </div>
        </div>
        
        {/* New Chat Button */}
        <div className="px-4 pb-4">
          <Button 
            className="w-full justify-center gap-2"
            onClick={handleNewChat}
            size="sm"
          >
            New Chat
          </Button>
        </div>
        
        {/* Search Bar */}
        <ChatSearch 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </SidebarHeader>
      
      <SidebarContent className="gap-0 overflow-hidden">
        {/* All Chats Section */}
        <SidebarGroup>
          <SidebarGroupContent className="px-2 overflow-hidden">
            <ChatThreads 
              threads={filteredChats}
              onChatSelect={handleChatSelect}
              isLoading={isLoading}
              error={error}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        {session ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={session.user?.image ?? ""}
                        alt={session.user?.name ?? ""}
                      />
                      <AvatarFallback className="rounded-lg">
                        <User2 className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session.user?.name ?? session.user?.email ?? "User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        Free
                      </span>
                    </div>
                    <ChevronUp className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogInIcon className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                size="lg"
                onClick={() => router.push("/login")}
              >
                <LogInIcon className="h-4 w-4" />
                <span>Sign In</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
