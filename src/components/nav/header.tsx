'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggle } from "../theme-toggle";
import { ShareButton } from "../chat/share-button";
import { useEffect, useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [chatData, setChatData] = useState<{ chatId: string; chatTitle: string } | null>(null);
  
  // Check if we're on a chat page
  const isChatPage = pathname.startsWith('/chat/');
  
  useEffect(() => {
    if (isChatPage) {
      // Extract chat ID from path
      const chatId = pathname.split('/chat/')[1];
      if (chatId) {
        // Fetch chat data
        void fetchChatData(chatId);
      }
    } else {
      setChatData(null);
    }
  }, [pathname, isChatPage]);

  const fetchChatData = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (response.ok) {
        const data = await response.json() as { title: string; preferredModel?: string };
        setChatData({ chatId, chatTitle: data.title });
      }
    } catch (error) {
      console.error('Failed to fetch chat data:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 justify-between fixed top-0 left-0 right-0 z-[60] w-full">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
       
      </div>
      
      <div className="flex items-center gap-2">
        {chatData && (
          <ShareButton chatId={chatData.chatId} chatTitle={chatData.chatTitle} />
        )}
        <ThemeToggle />
      </div>
    </div>
  );
}