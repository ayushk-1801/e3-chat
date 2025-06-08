import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-1.5-flash'),
    messages,
    system: 'You are a helpful assistant. Respond in a friendly and helpful manner.',
  });

  return result.toDataStreamResponse();
} 