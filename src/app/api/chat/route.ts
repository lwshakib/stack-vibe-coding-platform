import { getGeminiModel } from "@/llm/model";
import { CODE_GENERATION_SYSTEM_INSTRUCTION } from "@/llm/prompts";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import { NextResponse } from "next/server";
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, projectFiles } = await req.json();

    const result = await streamText({
      model: getGeminiModel(),
      messages: convertToModelMessages(messages),
      system: CODE_GENERATION_SYSTEM_INSTRUCTION.replace(
        "{{PROJECT_FILES}}",
        JSON.stringify(projectFiles)
      ),
      tools: {
        google_search: google.tools.googleSearch({}),
        url_context: google.tools.urlContext({}),
      },
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 8192,
          },
        },
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      sendSources: true,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
