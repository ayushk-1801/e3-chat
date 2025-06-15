import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { chat, message, chatShare } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { shareToken } = await request.json();

    if (!shareToken) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      );
    }

    // Get the share data
    const [shareData] = await db
      .select()
      .from(chatShare)
      .where(eq(chatShare.shareToken, shareToken))
      .limit(1);

    if (!shareData) {
      return NextResponse.json(
        { error: 'Shared chat not found' },
        { status: 404 }
      );
    }

    // Get the original chat
    const [originalChat] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, shareData.chatId))
      .limit(1);

    if (!originalChat) {
      return NextResponse.json(
        { error: 'Original chat not found' },
        { status: 404 }
      );
    }

    // Get all messages from the original chat
    const originalMessages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, shareData.chatId))
      .orderBy(message.createdAt);

    // Create a new chat for the current user
    const [newChat] = await db
      .insert(chat)
      .values({
        title: `${shareData.title}`,
        userId: session.user.id,
      })
      .returning();

    // Copy all messages to the new chat
    if (originalMessages.length > 0) {
      const messageInserts = originalMessages.map(msg => ({
        chatId: newChat.id,
        role: msg.role,
        content: msg.content,
      }));

      await db.insert(message).values(messageInserts);
    }

    return NextResponse.json({
      chatId: newChat.id,
      title: newChat.title,
      messageCount: originalMessages.length,
    });
  } catch (error) {
    console.error('Error importing chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 