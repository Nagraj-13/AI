import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentAI | AI-Based Resume Screening Platform",
  description:
    "LLM-powered recruitment platform using Gemini 2.5 Flash, Groq fallback, pgvector embeddings, Cloudflare R2 storage, and explainable candidate ranking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="glass-panel border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-mono">
          TalentAI Modern LLM Platform • Gemini 2.5 Flash + Groq Fallback • Next.js 16 App Router
        </footer>
      </body>
    </html>
  );
}
