import { convertToModelMessages, generateObject } from "ai";
import { z } from "zod";
import { getGeminiModel } from "./model";
import { TEMPLATE_GUESS_PROMPT } from "./prompts";

export const guessTheTemplate = async (text: string) => {
  const response = await generateObject({
    model: getGeminiModel(),
    system: TEMPLATE_GUESS_PROMPT,
    messages: convertToModelMessages([
      { role: "user", parts: [{ type: "text", text }] },
    ]),
    schema: z.object({
      statusCode: z.number().describe("200 for success, 400 for error, 300 for clarification needed"),
      template: z.string().describe("Recommended template name or empty string for errors"),
      reason: z.string().describe("Detailed explanation of the recommendation or error message"),
    }),
  });

  return response.object;

}