import { callGemini } from "./gemini";
import { callGroq } from "./groq";

export async function executeLlmTask(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  // Try Primary Provider: Gemini 2.5 Flash
  try {
    const geminiResult = await callGemini(prompt, systemInstruction);
    if (geminiResult && geminiResult.trim().length > 0) {
      return geminiResult;
    }
  } catch (err: any) {
    const isQuota = err?.message?.includes("Quota exceeded") || err?.message?.includes("RESOURCE_EXHAUSTED") || err?.message?.includes("429");
    if (isQuota) {
      console.log("ℹ️ Gemini rate limit reached — seamlessly executing via Groq (llama-3.3-70b)...");
    } else {
      console.log("ℹ️ Gemini LLM unavailable — seamlessly executing via Groq fallback...");
    }
  }

  // Try Fallback Provider: Groq
  try {
    const groqResult = await callGroq(prompt, systemInstruction);
    if (groqResult && groqResult.trim().length > 0) {
      return groqResult;
    }
  } catch (err) {
    console.warn("Groq LLM call failed or key absent:", err);
  }

  throw new Error("All LLM providers (Gemini & Groq) are currently unavailable or API keys are missing.");
}

export function extractJsonFromText<T>(text: string): T {
  try {
    // Clean markdown code fence wrappers if present
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned) as T;
  } catch (err) {
    // Attempt regex extraction for { ... }
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch (innerErr) {
        throw new Error("Failed to parse extracted JSON object.");
      }
    }
    throw new Error(`Unable to parse JSON from LLM response: ${err}`);
  }
}
