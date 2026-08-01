"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateJobModal from "@/components/jobs/CreateJobModal";
import CandidateDetailModal from "@/components/screening/CandidateDetailModal";
import CandidateCard from "@/components/screening/CandidateCard";
import { MockCandidate } from "@/lib/db/mockData";
import { Briefcase, Users, Award, Plus, ArrowRight, RefreshCw, Cpu } from "lucide-react";

interface JobItem {
  id: string;
  title: string;
  department: string;
  location: string;
  experienceYears: number;
  requiredSkills: string[];
  description: string;
  candidateCount: number;
  avgScore: number;
}

import { useRouter } from "next/navigation";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const [recruiterSession, setRecruiterSession] = useState<UserSession | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [candidates, setCandidates] = useState<MockCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<MockCandidate | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_session");
      if (stored) {
        const session: UserSession = JSON.parse(stored);
        if (session.role === "CANDIDATE") {
          router.replace("/candidate/dashboard");
          return;
        }
        setRecruiterSession(session);
      }
    } catch {}
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let recruiterId = "";
      try {
        const stored = localStorage.getItem("user_session");
        if (stored) {
          const sess = JSON.parse(stored);
          recruiterId = sess.id || "";
        }
      } catch {}

      const jobsUrl = recruiterId ? `/api/jobs?createdById=${recruiterId}` : "/api/jobs";
      const candUrl = recruiterId ? `/api/screen?createdById=${recruiterId}` : "/api/screen";

      const [jobsRes, candRes] = await Promise.all([
        fetch(jobsUrl),
        fetch(candUrl),
      ]);

      const jobsData = await jobsRes.json();
      const candData = await candRes.json();

      if (jobsData.success) {
        setJobs(jobsData.data);
      }
      if (candData.success) {
        setCandidates(candData.data);
      }
    } catch (err) {
      console.error("Recruiter dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCandidates = candidates.length;
  const avgFitScore =
    totalCandidates > 0
      ? Math.round(candidates.reduce((sum, c) => sum + c.scores.overallScore, 0) / totalCandidates)
      : 0;

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Recruiter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1f1f1f] pb-6 gap-4">
        <div>
          <Badge variant="indigo" className="mb-2">Recruiter Portal</Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {recruiterSession?.name ? `${recruiterSession.name}'s Command Center` : "Recruiter Command Center & Screening Hub"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {recruiterSession?.email ? `Logged in as ${recruiterSession.email} • ` : ""}
            Manage positions, upload resume batches, and inspect AI fit rankings
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsJobModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Post New Position
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Open Jobs</span>
          <p className="text-2xl font-black text-white mt-2">{jobs.length}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Screened Resumes</span>
          <p className="text-2xl font-black text-white mt-2">{totalCandidates}</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Candidate Score</span>
          <p className="text-2xl font-black text-white mt-2">{avgFitScore}%</p>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Engine</span>
          <p className="text-sm font-bold text-emerald-400 mt-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            Intelligent AI Engine
          </p>
        </Card>
      </div>

      {/* Active Positions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-white">Active Job Positions</h2>
          <Button variant="ghost" size="sm" onClick={fetchData}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {jobs.length === 0 ? (
          <Card className="p-8 border-[#222222] bg-[#0a0a0a] text-center">
            <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#222222] text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white">No Positions Posted Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              You haven't posted any job positions under this recruiter account yet. Click 'Post New Position' to publish your first role.
            </p>
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setIsJobModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Post Your First Position
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <Badge variant="default">{job.department}</Badge>
                    <span className="text-[10px] font-mono text-slate-400">{job.experienceYears}+ Yrs</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-2">{job.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{job.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 4).map((sk, idx) => (
                      <span key={`job-${job.id}-sk-${idx}`} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1a1a1a] text-slate-300">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1f1f1f] flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {job.candidateCount} {job.candidateCount === 1 ? "Applicant" : "Applicants"}
                    {job.avgScore > 0 ? ` • Avg ${job.avgScore}% Fit` : ""}
                  </span>
                  <Link href={`/jobs/${job.id}/screen`}>
                    <Button variant="outline" size="sm">
                      View Applicants & Screen
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Candidates */}
      {candidates.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-bold text-white">Recent Candidate AI Rankings</h2>
          <div className="space-y-3">
            {candidates.slice(0, 5).map((cand) => (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                onSelectDetail={(c) => setSelectedCandidate(c)}
                isSelectedForCompare={false}
                onToggleCompare={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {isJobModalOpen && (
        <CreateJobModal
          isOpen={isJobModalOpen}
          onClose={() => setIsJobModalOpen(false)}
          onJobCreated={fetchData}
        />
      )}
    </div>
  );
}
