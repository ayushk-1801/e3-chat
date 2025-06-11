import { db } from '@/server/db';
import { chat } from '@/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  try {
    // Get the authenticated user's session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Fetch chats for the authenticated user, ordered by most recent first
    const userChats = await db
      .select({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })
      .from(chat)
      .where(eq(chat.userId, session.user.id))
      .orderBy(desc(chat.updatedAt));

    return Response.json({ chats: userChats });
  } catch (error) {
    console.error('Fetch chats error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 