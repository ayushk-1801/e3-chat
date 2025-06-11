import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { env } from "@/env";

// Initialize the Google provider with the API key
const google = createGoogleGenerativeAI({
  apiKey:
    env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "",
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();

    if (!body || typeof body !== "object") {
      return new Response("Invalid request body", {
        status: 400,
      });
    }

    const { messages, model } = body as { messages?: unknown; model?: string };

    // Validate that messages exist
    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required and must be an array", {
        status: 400,
      });
    }

    // Default to gemini-2.0-flash if no model is specified
    const selectedModel = model ?? "gemini-2.0-flash";

    // Validate model selection - updated with newer Gemini models
    const allowedModels = [
      "gemini-2.5-pro-preview-05-06",
      "gemini-2.5-flash-preview-04-17",
      "gemini-2.5-pro-exp-03-25",
      "gemini-2.0-flash",
    ] as const;

    type AllowedModel = (typeof allowedModels)[number];

    if (!allowedModels.includes(selectedModel as AllowedModel)) {
      return new Response("Invalid model selection", {
        status: 400,
      });
    }

    console.log("Using model:", selectedModel);
    console.log("Messages count:", messages.length);

    const result = streamText({
      model: google(selectedModel as AllowedModel),
      messages,
      maxTokens: 4096,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";

    console.error("Error message:", errorMessage);
    console.error("Error stack:", errorStack);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
