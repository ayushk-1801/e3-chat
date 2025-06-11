import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { db } from '@/server/db';
import { chat, message } from '@/server/db/schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  chatId?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as RequestBody;
    const { messages, chatId } = body;

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid messages format', { status: 400 });
    }

    // If chatId is provided, save user message to database
    if (chatId && typeof chatId === 'string') {
      const userMessage = messages[messages.length - 1];
      if (userMessage && userMessage.role === 'user' && typeof userMessage.content === 'string') {
        await db.insert(message).values({
          chatId,
          role: 'user',
          content: userMessage.content,
        });
      }
    }

    const result = streamText({
      model: google('gemini-2.0-flash-exp'),
      system: 'You are a helpful assistant. Provide clear, concise, and accurate responses.',
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
