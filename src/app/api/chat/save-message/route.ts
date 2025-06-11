import { db } from '@/server/db';
import { message } from '@/server/db/schema';

interface SaveMessageRequest {
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as SaveMessageRequest;
    const { chatId, role, content } = body;

    // Validate request
    if (!chatId || !role || !content) {
      return new Response('Missing required fields', { status: 400 });
    }

    if (role !== 'user' && role !== 'assistant') {
      return new Response('Invalid role', { status: 400 });
    }

    // Save message to database
    await db.insert(message).values({
      chatId,
      role,
      content,
    });

    return new Response('Message saved', { status: 200 });
  } catch (error) {
    console.error('Save message error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 