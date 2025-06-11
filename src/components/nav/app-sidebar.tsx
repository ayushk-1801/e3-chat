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
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
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
  Plus, 
  MessageSquare,
  Calendar,
  Home,
  Inbox,
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
import { Suspense } from "react";

// Chat threads interface for type safety
interface ChatThread {
  id: string | number;
  title: string;
  url?: string;
  createdAt?: Date;
}

// Mock data for chat threads - replace with actual data
const allChats: ChatThread[] = [
];

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
  onChatSelect 
}: { 
  threads: ChatThread[];
  onChatSelect: (chatId: string | number) => void;
}) {
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

export function AppSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const handleChatSelect = (chatId: string | number) => {
    router.push(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    router.push("/");
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
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your threads..."
              className="pl-8"
            />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="gap-0 overflow-hidden">
        {/* All Chats Section */}
        <SidebarGroup>
          <SidebarGroupContent className="px-2 overflow-hidden">
            <Suspense fallback={<ChatThreadsSkeleton count={2} />}>
              <ChatThreads 
                threads={allChats}
                onChatSelect={handleChatSelect}
              />
            </Suspense>
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
