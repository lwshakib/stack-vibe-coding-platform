import { streamText as _streamText, convertToModelMessages } from "ai";
import { MAX_TOKENS } from "./constants";
import { getGeminiModel } from "./model";
import { CODE_GENERATION_SYSTEM_INSTRUCTION } from "./prompts";

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], "model">;

export function streamText(
  messages: Messages,
  files: any,
  projectPrompt: string,
  options?: StreamingOptions
) {
  return _streamText({
    model: getGeminiModel(),
    system: CODE_GENERATION_SYSTEM_INSTRUCTION.replace(
      "{{PROJECT_FILES}}",
      JSON.stringify(files)
    ).replace("{{PROJECT_PROMPT}}", projectPrompt),
    maxOutputTokens: MAX_TOKENS,
    messages: convertToModelMessages(messages as any)
  });
}
