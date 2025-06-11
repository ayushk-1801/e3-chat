import { db } from '@/server/db';
import { chat, message } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ChatInterface } from '@/components/chat/chat-interface';

interface ChatPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { slug } = await params;

  // Fetch chat and messages
  const [chatData] = await db
    .select()
    .from(chat)
    .where(eq(chat.id, slug))
    .limit(1);

  if (!chatData) {
    notFound();
  }

  const messages = await db
    .select()
    .from(message)
    .where(eq(message.chatId, slug))
    .orderBy(message.createdAt);

  return (
    <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
      <div className="w-full max-w-4xl h-full flex flex-col">
        <ChatInterface chatId={slug} initialMessages={messages} />
      </div>
    </div>
  );
} 