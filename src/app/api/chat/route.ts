

import { streamText, ModelMessage, convertToModelMessages, UIMessage, smoothStream, generateObject, streamObject, generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { CODE_GENERATION_SYSTEM_INSTRUCTION } from '@/llm/prompts';
import { getGeminiModel } from '@/llm/model';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {messages,projectFiles} = await req.json();

  const result = await streamText({
    model: getGeminiModel(),
    messages: convertToModelMessages(messages),
    system:CODE_GENERATION_SYSTEM_INSTRUCTION.replace("{{PROJECT_FILES}}", JSON.stringify(projectFiles)),
  });

  return result.toUIMessageStreamResponse()  
}