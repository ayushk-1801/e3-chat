import { db } from '@/server/db';
import { chat, message } from '@/server/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface CreateChatRequest {
  title: string;
  initialMessage?: string;
}

export async function POST(req: Request) {
  try {
    // Get the authenticated user's session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json() as CreateChatRequest;
    const { title, initialMessage } = body;

    // Validate request
    if (!title) {
      return new Response('Title is required', { status: 400 });
    }

    // Create new chat for the authenticated user
    const [newChat] = await db.insert(chat).values({
      title,
      userId: session.user.id,
    }).returning();

    // If an initial message is provided, save it to the database
    if (initialMessage && newChat?.id) {
      await db.insert(message).values({
        chatId: newChat.id,
        role: 'user',
        content: initialMessage,
      });
    }

    return Response.json({ chatId: newChat?.id });
  } catch (error) {
    console.error('Create chat error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 