import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { DEFAULT_WEIGHTS } from "@/lib/ranking/scorer";

export async function GET() {
  const geminiActive = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 5);
  const groqActive = Boolean(env.GROQ_API_KEY && env.GROQ_API_KEY.length > 5);
  const r2Active = Boolean(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID);

  return NextResponse.json({
    success: true,
    data: {
      providers: {
        gemini: {
          name: "Gemini 2.5 Flash",
          status: geminiActive ? "connected" : "fallback_mode",
          model: "gemini-2.5-flash",
          embeddingModel: "text-embedding-004",
        },
        groq: {
          name: "Groq (Llama 3.3 70B)",
          status: groqActive ? "connected" : "standby",
          model: "llama-3.3-70b-versatile",
        },
      },
      storage: {
        provider: r2Active ? "Cloudflare R2" : "Local Disk Storage",
        status: "active",
      },
      weights: DEFAULT_WEIGHTS,
    },
  });
}
