import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface UseChatsReturn {
  chats: Chat[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
}

export function useChats(): UseChatsReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchChats = async () => {
    if (!session?.user?.id) {
      setChats([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/chat/list');
      
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json() as { chats: Chat[] };
      setChats(data.chats ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      // Remove the chat from local state immediately
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat');
      // Optionally refetch to ensure state consistency
      void fetchChats();
    }
  };

  useEffect(() => {
    void fetchChats();
  }, [session?.user?.id]);

  // Listen for custom refresh events
  useEffect(() => {
    const handleRefreshChats = () => {
      void fetchChats();
    };

    window.addEventListener('refreshChats', handleRefreshChats);
    
    return () => {
      window.removeEventListener('refreshChats', handleRefreshChats);
    };
  }, []);

  return {
    chats,
    isLoading,
    error,
    refetch: fetchChats,
    deleteChat,
  };
} 