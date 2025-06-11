import { db } from '@/server/db';
import { message } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    if (!chatId) {
      return new Response('Chat ID is required', { status: 400 });
    }

    // Fetch messages for the chat
    const messages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(message.createdAt);

    return Response.json({ messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 