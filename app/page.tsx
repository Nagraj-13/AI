"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  UserCheck,
  Sparkles,
  Cpu,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Zap,
  Award,
  TrendingUp,
  FileText,
  BarChart3,
  Layers,
  UserPlus,
  Lock,
} from "lucide-react";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function LandingPage() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_session");
      if (stored) {
        setUserSession(JSON.parse(stored));
      }
    } catch {}
  }, []);

  return (
    <div className="space-y-16 animate-fadeIn pb-16">
      {/* Dynamic Session Welcome Banner if Logged In */}
      {userSession && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-5xl mx-auto shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              {userSession.role === "RECRUITER" ? <Briefcase className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Logged in as <span className="text-indigo-300">{userSession.name}</span> ({userSession.email})
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Role: {userSession.role === "RECRUITER" ? "Recruiter Account" : "Candidate Account"}
              </p>
            </div>
          </div>

          <Link href={userSession.role === "RECRUITER" ? "/recruiter/dashboard" : "/candidate/dashboard"}>
            <Button variant="primary" size="sm" className="w-full sm:w-auto text-xs font-bold">
              <span>Go to Your {userSession.role === "RECRUITER" ? "Recruiter Hub" : "Student Portal"}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 text-center border-b border-[#1f1f1f] vercel-grid-bg rounded-2xl p-8 max-w-5xl mx-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge variant="default" className="bg-[#111111] text-slate-300 border-[#222222]">
            <Sparkles className="w-3 h-3 mr-1 text-white" />
            AI-Powered Talent Acquisition & Career Intelligence Platform
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI-Driven Talent Intelligence & Resume Screening
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Automated resume document extraction, intelligent 2-stage candidate match ranking, and real-time job relevance insights tailored for recruiter hiring workflows and student applicants.
          </p>

          {/* Dual Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth?role=recruiter">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <Briefcase className="w-4 h-4 mr-2" />
                Recruiter Command Center
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/auth?role=candidate">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <UserCheck className="w-4 h-4 mr-2" />
                Candidate & Student Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Feature Showcase */}
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Badge variant="indigo" className="mb-2">Dual Perspective Workflows</Badge>
          <h2 className="text-2xl font-bold text-white tracking-tight">Tailored Intelligence for Hiring & Careers</h2>
          <p className="text-xs text-slate-400 mt-1">Select your account type to access specialized tools</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recruiter Experience */}
          <Card className="hover:border-slate-600 flex flex-col justify-between border-[#222222] bg-[#0a0a0a]">
            <div>
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Recruiter Hub & Screening Center</CardTitle>
                <CardDescription>
                  Publish job positions, upload resume batches, inspect AI candidate fit rankings, and compare applicants side-by-side.
                </CardDescription>
              </CardHeader>

              <div className="px-6 space-y-2.5 text-xs text-slate-300 font-mono">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Strict Account Isolation: Manage only positions & applicants owned by your recruiter account.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>4-Part Evaluation Matrix: Semantic Matching, Qualitative Assessment, Experience Ratio, and Skill Alignment.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Applicant Analytics: Track total applicants, position average fit scores, strengths, and missing skills.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Candidate Comparison Matrix & Customizable Score Formula Weights.</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-4">
              <Link href="/recruiter/dashboard">
                <Button variant="primary" className="w-full">
                  <span>Enter Recruiter Hub</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Student / Candidate Experience */}
          <Card className="hover:border-slate-600 flex flex-col justify-between border-[#222222] bg-[#0a0a0a]">
            <div>
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 text-purple-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Candidate & Student Portal</CardTitle>
                <CardDescription>
                  Store your resume content, view AI profile extractions, apply to jobs, and receive real-time match relevance scores.
                </CardDescription>
              </CardHeader>

              <div className="px-6 space-y-2.5 text-xs text-slate-300 font-mono">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Dual Resume Input: Upload document files (PDF / Word) OR paste resume text directly into your profile.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Instant Job Relevance Score: View real-time match percentage bars and recommendation badges.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Personalized Qualification Breakdown: Matching strengths and recommended growth skills to learn.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>One-Click Job Application with live spinning loader feedback.</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-4">
              <Link href="/candidate/dashboard">
                <Button variant="secondary" className="w-full">
                  <span>Enter Student Portal</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Core Platform Workflow Step-by-Step */}
      <section className="max-w-5xl mx-auto border-t border-[#1f1f1f] pt-12">
        <div className="text-center mb-10">
          <Badge variant="default" className="mb-2">How It Works</Badge>
          <h2 className="text-2xl font-bold text-white tracking-tight">End-to-End Candidate Application Lifecycle</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-2xl border border-[#222222] bg-[#0d0d0d] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-white">1. Document Parsing & Storage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resume files are parsed using automated document text extractors and structured profile generation. Raw text and semantic profile vectors are securely stored.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-[#222222] bg-[#0d0d0d] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-white">2. Dual-Engine Evaluation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Candidate screening runs through a dual-engine intelligent evaluation pipeline to guarantee high-availability match processing.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-[#222222] bg-[#0d0d0d] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-white">3. Tailored Scoring Insights</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recruiters receive candidate suitability ranks (<span className="font-mono text-slate-300">Strong Fit</span>, <span className="font-mono text-slate-300">Good Fit</span>), while candidates receive personalized job match relevance scores.
            </p>
          </div>
        </div>
      </section>

      {/* System Highlights Architecture */}
      <section className="max-w-5xl mx-auto border-t border-[#1f1f1f] pt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl border border-[#1f1f1f] bg-[#0a0a0a]">
            <Cpu className="w-5 h-5 mx-auto text-indigo-400 mb-2" />
            <h4 className="text-xs font-bold text-white">AI Talent Engine</h4>
            <p className="text-[11px] text-slate-500 font-mono">Automated Evaluation</p>
          </div>
          <div className="p-4 rounded-xl border border-[#1f1f1f] bg-[#0a0a0a]">
            <Zap className="w-5 h-5 mx-auto text-amber-400 mb-2" />
            <h4 className="text-xs font-bold text-white">High Availability</h4>
            <p className="text-[11px] text-slate-500 font-mono">Fail-Safe Processing</p>
          </div>
          <div className="p-4 rounded-xl border border-[#1f1f1f] bg-[#0a0a0a]">
            <Sparkles className="w-5 h-5 mx-auto text-purple-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Semantic Matching</h4>
            <p className="text-[11px] text-slate-500 font-mono">Qualification Alignment</p>
          </div>
          <div className="p-4 rounded-xl border border-[#1f1f1f] bg-[#0a0a0a]">
            <ShieldCheck className="w-5 h-5 mx-auto text-emerald-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Secure Data Hub</h4>
            <p className="text-[11px] text-slate-500 font-mono">Encrypted Cloud Storage</p>
          </div>
        </div>
      </section>
    </div>
  );
}
