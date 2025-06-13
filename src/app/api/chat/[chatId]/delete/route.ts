import { db } from '@/server/db';
import { chat, message } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    
    // Get the authenticated user's session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!chatId) {
      return new Response('Chat ID is required', { status: 400 });
    }

    // First, verify the chat belongs to the user
    const [chatData] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, chatId))
      .limit(1);

    if (!chatData) {
      return new Response('Chat not found', { status: 404 });
    }

    if (chatData.userId !== session.user.id) {
      return new Response('Forbidden', { status: 403 });
    }

    // Delete all messages associated with the chat first
    await db.delete(message).where(eq(message.chatId, chatId));

    // Then delete the chat
    await db.delete(chat).where(eq(chat.id, chatId));

    return new Response('Chat deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Delete chat error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 