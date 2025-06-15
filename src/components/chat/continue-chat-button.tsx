'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContinueChatButtonProps {
  shareToken: string;
  chatTitle: string;
}

export function ContinueChatButton({ shareToken, chatTitle }: ContinueChatButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  const handleContinueChat = async () => {
    setIsImporting(true);
    try {
      const response = await fetch('/api/chat/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to import chat');
      }

      const result = await response.json() as { chatId: string };
      toast.success('Chat imported successfully!');
      
      // Dispatch custom event to refresh sidebar
      window.dispatchEvent(new CustomEvent('refreshChats'));
      
      // Redirect to the new chat
      router.push(`/chat/${result.chatId}`);
    } catch (error) {
      console.error('Error importing chat:', error);
      toast.error('Failed to import chat. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button 
      onClick={handleContinueChat} 
      disabled={isImporting}
      size="sm"
      className="gap-2"
    >
      {isImporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      {isImporting ? 'Importing...' : 'Continue Chatting'}
    </Button>
  );
} 