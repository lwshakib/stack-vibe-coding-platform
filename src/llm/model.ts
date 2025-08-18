import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const getGeminiModel = () => {
  const gemini = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY
  });
  return gemini('gemini-2.5-flash')
};
