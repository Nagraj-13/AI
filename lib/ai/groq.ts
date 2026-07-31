import Groq from "groq-sdk";
import { env } from "@/lib/env";

export function getGroqClient() {
  if (!env.GROQ_API_KEY) {
    return null;
  }
  return new Groq({ apiKey: env.GROQ_API_KEY });
}

export async function callGroq(prompt: string, systemInstruction?: string): Promise<string> {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error("GROQ_API_KEY is not set.");
  }

  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.0,
  });

  return completion.choices[0]?.message?.content || "";
}
