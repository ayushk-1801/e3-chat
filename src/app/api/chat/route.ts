import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
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
  selectedModel?: string;
  useSearchGrounding?: boolean;
}

// Model mapping for different providers
const getModelProvider = (modelId: string, useSearchGrounding = false) => {
  const searchOptions = useSearchGrounding ? { useSearchGrounding: true } : {};
  
  switch (modelId) {
    // Latest Gemini models with search grounding support
    case 'gemini-2.5-pro-preview-05-06':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return google('gemini-2.5-pro-preview-05-06', searchOptions);
    case 'gemini-2.5-flash-preview-04-17':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return google('gemini-2.5-flash-preview-04-17', searchOptions);
    case 'gemini-2.5-pro-exp-03-25':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return google('gemini-2.5-pro-exp-03-25', searchOptions);
    case 'gemini-2.0-flash':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return google('gemini-2.0-flash', searchOptions);
    
    // Groq models (no search grounding support)
    case 'meta-llama/llama-4-scout-17b-16e-instruct':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return groq('meta-llama/llama-4-scout-17b-16e-instruct');
    case 'llama-3.3-70b-versatile':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return groq('llama-3.3-70b-versatile');
    case 'llama-3.1-8b-instant':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return groq('llama-3.1-8b-instant');

    case 'mixtral-8x7b-32768':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return groq('mixtral-8x7b-32768');
    case 'mistral-saba-24b':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return groq('mistral-saba-24b');
    case 'gemma2-9b-it':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return groq('gemma2-9b-it');
    case 'qwen-qwq-32b':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return groq('qwen-qwq-32b');

    case 'deepseek-r1-distill-llama-70b':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return groq('deepseek-r1-distill-llama-70b');
    
    // Default to latest Gemini with search options
    default:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return google('gemini-2.5-flash-preview-04-17', searchOptions);
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json() as RequestBody;
    const { messages, chatId, selectedModel = 'gemini-2.5-flash-preview-04-17', useSearchGrounding = false } = body;

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

    const model = getModelProvider(selectedModel, useSearchGrounding);

    const result = streamText({
      model,
      system: 'You are a helpful assistant. Provide clear, concise, and accurate responses. When using search grounding, cite your sources appropriately.',
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
