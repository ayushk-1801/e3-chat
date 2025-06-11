import { db } from '@/server/db';
import { chat } from '@/server/db/schema';

interface CreateChatRequest {
  title: string;
  userId?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as CreateChatRequest;
    const { title, userId } = body;

    // Validate request
    if (!title) {
      return new Response('Title is required', { status: 400 });
    }

    // Create new chat
    const [newChat] = await db.insert(chat).values({
      title,
      userId: userId || null,
    }).returning();

    return Response.json({ chatId: newChat.id });
  } catch (error) {
    console.error('Create chat error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 