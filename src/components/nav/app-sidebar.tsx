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
  SidebarGroupLabel,
  SidebarMenuAction,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  LogInIcon,
  UserIcon,
  User2,
  ChevronUp,
  Search,
  Settings,
  Trash2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  onChatDelete,
  isLoading,
  error,
  sidebarOpen,
}: {
  threads: ChatThread[];
  onChatSelect: (chatId: string) => void;
  onChatDelete: (chatId: string) => void;
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
}) {
  if (isLoading) {
    return <ChatThreadsSkeleton count={5} />;
  }

  if (error) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled>
            <span className="text-muted-foreground text-sm">
              Failed to load chats
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (threads.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled>
            <span className="text-muted-foreground text-sm">
              No chats yet. Start a new conversation!
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      {threads.map((chat) => (
        <SidebarMenuItem key={chat.id} className="group/menu-item">
          <SidebarMenuButton
            className="justify-start"
            onClick={() => onChatSelect(chat.id)}
          >
            <span className="truncate text-sm">{chat.title}</span>
          </SidebarMenuButton>

          {/* Delete button with confirmation dialog - shows on hover only when sidebar is open */}
          {sidebarOpen && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <SidebarMenuAction className="opacity-0 transition-opacity duration-200 group-hover/menu-item:opacity-100 hover:bg-destructive/10">
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">Delete chat</span>
                </SidebarMenuAction>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &ldquo;{chat.title}&rdquo;?
                    This action cannot be undone and will permanently delete the
                    chat and all its messages.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className=""
                    onClick={() => onChatDelete(chat.id)}
                  >
                    Delete Chat
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// Search component for filtering chats
function ChatSearch({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="relative">
        <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4 z-10" />
        <Input
          placeholder="Search your threads..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { chats, isLoading, error, refetch, deleteChat } = useChats();
  const [searchQuery, setSearchQuery] = useState("");
  const { state } = useSidebar();

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleChatDelete = async (chatId: string) => {
    try {
      await deleteChat(chatId);

      // If the user is currently viewing the deleted chat, redirect to home
      const currentPath = window.location.pathname;
      if (currentPath === `/chat/${chatId}`) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="justify-center font-semibold text-lg"
              disabled
            >
              E3.chat
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>


        {/* New Chat Button */}
        <SidebarGroup>
          <SidebarGroupContent>
            <Button
              className="w-full justify-center gap-2"
              onClick={handleNewChat}
              size="sm"
            >
              New Chat
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Search Bar */}
        <ChatSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </SidebarHeader>

      <SidebarContent className="gap-0 overflow-hidden">
        {/* All Chats Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent className="overflow-hidden">
            <ChatThreads
              threads={filteredChats}
              onChatSelect={handleChatSelect}
              onChatDelete={handleChatDelete}
              isLoading={isLoading}
              error={error}
              sidebarOpen={state === "expanded"}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
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
                    <SidebarGroupContent className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session.user?.name ?? session.user?.email ?? "User"}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        Free
                      </span>
                    </SidebarGroupContent>
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
