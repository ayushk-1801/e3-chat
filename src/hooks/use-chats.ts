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

      const data = await response.json();
      setChats(data.chats || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [session?.user?.id]);

  return {
    chats,
    isLoading,
    error,
    refetch: fetchChats,
  };
} 