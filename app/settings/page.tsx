"use client";

import { useEffect, useState } from "react";
import { Cpu, HardDrive, Sliders, CheckCircle2, AlertCircle, Sparkles, Key } from "lucide-react";
import { DEFAULT_WEIGHTS } from "@/lib/ranking/scorer";

import { useRouter } from "next/navigation";

interface SettingsData {
  providers: {
    gemini: {
      name: string;
      status: string;
      model: string;
      embeddingModel: string;
    };
    groq: {
      name: string;
      status: string;
      model: string;
    };
  };
  storage: {
    provider: string;
    status: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [data, setData] = useState<SettingsData | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_session");
      if (stored) {
        const session = JSON.parse(stored);
        if (session.role === "CANDIDATE") {
          router.replace("/candidate/dashboard");
          return;
        }
      }
    } catch {}

    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      });
  }, [router]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-3">
          <Cpu className="w-6 h-6 text-indigo-400" />
          <span>AI Screening & Evaluation System Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect screening engine health, semantic embedding status, and resume storage configuration.
        </p>
      </div>

      {/* Primary & Fallback Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Engine */}
        <div className="glass-card rounded-2xl p-6 border border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Primary Candidate Evaluation Engine</h3>
                <p className="text-xs text-slate-400">Main Match Analysis & Parsing Engine</p>
              </div>
            </div>
            <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active</span>
            </span>
          </div>

          <div className="mt-5 space-y-2 text-xs font-mono text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between">
              <span className="text-slate-500">Evaluation Engine:</span>
              <span className="text-indigo-300">primary-evaluation-engine</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between">
              <span className="text-slate-500">Semantic Matching:</span>
              <span className="text-cyan-300">semantic-vector-matcher (Active)</span>
            </div>
          </div>
        </div>

        {/* High-Availability Backup Engine */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">High-Availability Failover Engine</h3>
                <p className="text-xs text-slate-400">Automatic Backup Evaluation System</p>
              </div>
            </div>
            <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Standby Ready</span>
            </span>
          </div>

          <div className="mt-5 space-y-2 text-xs font-mono text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between">
              <span className="text-slate-500">Failover Engine:</span>
              <span className="text-purple-300">backup-evaluation-engine</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between">
              <span className="text-slate-500">Processing Speed:</span>
              <span className="text-emerald-400">&lt; 300 ms response</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Store & Default Formula Weights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Storage */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Encrypted Resume Repository</h3>
              <p className="text-xs text-slate-400">Cloud & Local Disk Document Storage</p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            Provider: {data?.storage?.provider || "Cloudflare R2 / Local Disk Fallback"}
          </div>
        </div>

        {/* Algorithm Formula */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Scoring Formula Preset</h3>
              <p className="text-xs text-slate-400">40% Vector + 40% LLM + 10% Exp + 10% Skill</p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            Embedding: 40% | LLM Qual: 40% | Exp: 10% | Skill: 10%
          </div>
        </div>
      </div>

      {/* Environment Config Info */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2">
          <Key className="w-4 h-4 text-indigo-400" />
          <span>Environment Variable Keys (.env.local)</span>
        </h4>
        <p>Ensure the following environment variables are set in your deployment context for full production features:</p>
        <pre className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-indigo-300 font-mono text-[11px] leading-relaxed">
{`GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=postgresql://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=resumes`}
        </pre>
      </div>
    </div>
  );
}
