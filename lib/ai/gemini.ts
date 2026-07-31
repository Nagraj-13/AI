import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

export function getGeminiClient() {
  if (!env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

export async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 0.0,
        systemInstruction,
      },
    });
    return response.text || "";
  } catch (err: any) {
    throw new Error(`Gemini generateContent failed: ${err?.message || err}`);
  }
}
