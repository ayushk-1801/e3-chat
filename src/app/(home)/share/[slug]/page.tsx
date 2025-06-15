import { db } from '@/server/db';
import { chat, message, chatShare } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { MarkdownMessage } from '@/components/chat/markdown-message';
import { ContinueChatButton } from '@/components/chat/continue-chat-button';

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug: shareToken } = await params;

  // Fetch share data with chat and messages
  const [shareData] = await db
    .select()
    .from(chatShare)
    .where(eq(chatShare.shareToken, shareToken))
    .limit(1);

  if (!shareData) {
    notFound();
  }

  // Fetch the chat data
  const [chatData] = await db
    .select()
    .from(chat)
    .where(eq(chat.id, shareData.chatId))
    .limit(1);

  if (!chatData) {
    notFound();
  }

  // Fetch messages
  const messages = await db
    .select()
    .from(message)
    .where(eq(message.chatId, shareData.chatId))
    .orderBy(message.createdAt);

  const typedMessages = messages.map(msg => ({
    ...msg,
    role: msg.role as "user" | "assistant"
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{shareData.title}</h1>
              {shareData.description && (
                <p className="text-muted-foreground mt-1 text-sm">{shareData.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>Shared on {shareData.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <ContinueChatButton shareToken={shareToken} chatTitle={shareData.title} />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {typedMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages in this chat.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {typedMessages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
