"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, UserCheck, Sparkles, Cpu, ShieldCheck, ArrowRight, CheckCircle2, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-16 animate-fadeIn pb-12">
      {/* Vercel Style Hero Section */}
      <section className="relative pt-12 pb-16 text-center border-b border-[#1f1f1f] vercel-grid-bg rounded-2xl p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge variant="default" className="bg-[#111111] text-slate-300 border-[#222222]">
            <Sparkles className="w-3 h-3 mr-1 text-white" />
            Next.js 16 • Gemini 2.5 Flash • Groq Failover Engine
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI-Powered Resume Screening & Candidate Intelligence
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Automated document understanding (PDF/DOCX), 768-dim vector embedding retrieval, and qualitative LLM candidate ranking for modern recruiter workflows and student applicants.
          </p>

          {/* Dual Role CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth?role=recruiter">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <Briefcase className="w-4 h-4 mr-2" />
                Sign In as Recruiter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/auth?role=candidate">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <UserCheck className="w-4 h-4 mr-2" />
                Candidate / Student Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Selection Feature Grid */}
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">Designed for Recruiters & Students</h2>
          <p className="text-xs text-slate-400 mt-1">Select your workflow to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recruiter Card */}
          <Card className="hover:border-slate-600 flex flex-col justify-between">
            <div>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#333333] flex items-center justify-center mb-3">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <CardTitle>Recruiter Portal</CardTitle>
                <CardDescription>
                  Post positions, upload bulk PDF/DOCX resumes, run two-stage AI vector retrieval, and inspect ranked candidate evaluations.
                </CardDescription>
              </CardHeader>

              <ul className="space-y-2 text-xs text-slate-300 my-4 font-mono">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Two-Stage Vector Retrieval & LLM Qualitative Eval</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customizable 4-Part Scoring Formula Weights</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Side-by-Side Candidate Comparison Modal</span>
                </li>
              </ul>
            </div>

            <Link href="/recruiter/dashboard" className="pt-4">
              <Button variant="primary" className="w-full">
                Enter Recruiter Portal
              </Button>
            </Link>
          </Card>

          {/* Student / Candidate Card */}
          <Card className="hover:border-slate-600 flex flex-col justify-between">
            <div>
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#333333] flex items-center justify-center mb-3">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <CardTitle>Candidate / Student Portal</CardTitle>
                <CardDescription>
                  Upload your resume, parse it into structured JSON, receive instant AI fit analysis, missing skill feedback, and apply directly to open positions.
                </CardDescription>
              </CardHeader>

              <ul className="space-y-2 text-xs text-slate-300 my-4 font-mono">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Instant Personal Resume AI Parsing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Missing Skills & Strength Identification</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>One-Click Application to Open Roles</span>
                </li>
              </ul>
            </div>

            <Link href="/candidate/dashboard" className="pt-4">
              <Button variant="secondary" className="w-full">
                Enter Candidate Portal
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Tech Stack Highlights */}
      <section className="max-w-5xl mx-auto border-t border-[#1f1f1f] pt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl border border-[#1f1f1f] bg-[#0a0a0a]">
            <Cpu className="w-5 h-5 mx-auto text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-white">Gemini 2.5 Flash</h4>
            <p className="text-[11px] text-slate-500 font-mono">Primary LLM Engine</p>
          </div>
          <div className="p-4 rounded-xl border border-[#1f1f1f] bg-[#0a0a0a]">
            <Zap className="w-5 h-5 mx-auto text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-white">Groq Fallback</h4>
            <p className="text-[11px] text-slate-500 font-mono">Llama-3.3 Failover</p>
          </div>
          <div className="p-4 rounded-xl border border-[#1f1f1f] bg-[#0a0a0a]">
            <Sparkles className="w-5 h-5 mx-auto text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-white">768-Dim Embeddings</h4>
            <p className="text-[11px] text-slate-500 font-mono">Cosine Vector Match</p>
          </div>
          <div className="p-4 rounded-xl border border-[#1f1f1f] bg-[#0a0a0a]">
            <ShieldCheck className="w-5 h-5 mx-auto text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-white">Prisma DB</h4>
            <p className="text-[11px] text-slate-500 font-mono">Dynamic Persistence</p>
          </div>
        </div>
      </section>
    </div>
  );
}
