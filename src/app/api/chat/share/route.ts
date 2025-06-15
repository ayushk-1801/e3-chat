import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { chat, chatShare } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { chatId, title, description, isPublic } = await request.json() as { chatId: string, title: string, description: string, isPublic: boolean };

    if (!chatId || !title) {
      return NextResponse.json(
        { error: 'Chat ID and title are required' },
        { status: 400 }
      );
    }

    // Verify that the chat exists
    const [existingChat] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, chatId))
      .limit(1);

    if (!existingChat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Generate a unique share token
    const shareToken = randomBytes(8).toString('hex');

    // Create the share record
    const [newShare] = await db
      .insert(chatShare)
      .values({
        chatId,
        shareToken,
        title,
        description: description ?? '',
        isPublic: isPublic ?? true,
      })
      .returning();

    return NextResponse.json({
      id: newShare?.id,
      shareToken: newShare?.shareToken,
      title: newShare?.title,
      description: newShare?.description,
      isPublic: newShare?.isPublic,
      createdAt: newShare?.createdAt,
    });
  } catch (error) {
    console.error('Error creating chat share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get('token');

    if (!shareToken) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      );
    }

    // Get the share with chat and messages
    const [shareData] = await db
      .select()
      .from(chatShare)
      .where(eq(chatShare.shareToken, shareToken))
      .limit(1);

    if (!shareData) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shareData);
  } catch (error) {
    console.error('Error fetching chat share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 