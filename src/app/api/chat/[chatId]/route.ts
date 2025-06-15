import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { chat } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

interface RouteContext {
  params: Promise<{ chatId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { chatId } = await context.params;

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Fetch chat data
    const [chatData] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, chatId))
      .limit(1);

    if (!chatData) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: chatData.id,
      title: chatData.title,
      userId: chatData.userId,
      preferredModel: chatData.preferredModel,
      createdAt: chatData.createdAt,
      updatedAt: chatData.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 