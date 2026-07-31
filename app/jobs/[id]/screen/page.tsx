"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import ResumeUploader from "@/components/screening/ResumeUploader";
import CandidateCard from "@/components/screening/CandidateCard";
import CandidateDetailModal from "@/components/screening/CandidateDetailModal";
import CandidateCompareModal from "@/components/screening/CandidateCompareModal";
import WeightsConfigModal from "@/components/settings/WeightsConfigModal";
import { MockJob, MockCandidate } from "@/lib/db/mockData";
import { DEFAULT_WEIGHTS, ScoreWeights } from "@/lib/ranking/scorer";
import { ArrowLeft, Sparkles, Filter, Sliders, Scale, Search, Award, RefreshCw } from "lucide-react";

import { useRouter } from "next/navigation";

export default function JobScreeningPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;

  const [job, setJob] = useState<MockJob | null>(null);
  const [candidates, setCandidates] = useState<MockCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<MockCandidate | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<MockCandidate[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);
  const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRec, setFilterRec] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_session");
      if (stored) {
        const session = JSON.parse(stored);
        if (session.role === "CANDIDATE") {
          router.replace("/candidate/dashboard");
        }
      }
    } catch {}
  }, [router]);

  const fetchJobData = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, candRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch(`/api/screen?jobId=${jobId}`),
      ]);

      const jobsData = await jobsRes.json();
      const candData = await candRes.json();

      if (jobsData.success) {
        const foundJob = jobsData.data.find((j: MockJob) => j.id === jobId) || jobsData.data[0];
        setJob(foundJob);
      }

      if (candData.success) {
        setCandidates(candData.data);
      }
    } catch (err) {
      console.error("Job screening data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
  }, [jobId]);

  const toggleCompare = (candidate: MockCandidate) => {
    if (selectedForCompare.some((c) => c.id === candidate.id)) {
      setSelectedForCompare((prev) => prev.filter((c) => c.id !== candidate.id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert("You can compare up to 3 candidates at a time.");
        return;
      }
      setSelectedForCompare((prev) => [...prev, candidate]);
    }
  };

  const filteredCandidates = candidates
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.parsedResume.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRec = filterRec === "ALL" || c.scores.recommendation === filterRec;

      return matchesSearch && matchesRec;
    })
    .sort((a, b) => b.scores.overallScore - a.scores.overallScore);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Breadcrumb & Job Header */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Job Positions</span>
        </Link>

        {job && (
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {job.department}
                </span>
                <span className="text-xs text-slate-400 font-mono">{job.experienceYears}+ Yrs Exp Required</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">{job.title}</h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {job.requiredSkills.map((sk, idx) => (
                  <span key={`reqskill-${sk}-${idx}`} className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsWeightsOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold hover:border-indigo-500/40 transition-colors"
              >
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Adjust Scoring Weights</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Resume Upload Dropzone */}
      <ResumeUploader jobId={jobId} onScreeningCompleted={fetchJobData} />

      {/* Candidate Evaluation Header Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left Filter & Search */}
        <div className="flex flex-1 items-center space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search evaluated candidates by name or skill..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {["ALL", "Strong Fit", "Good Fit", "Potential Fit"].map((rec) => (
              <button
                key={rec}
                onClick={() => setFilterRec(rec)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  filterRec === rec
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {rec}
              </button>
            ))}
          </div>
        </div>

        {/* Compare Trigger Button */}
        {selectedForCompare.length >= 2 && (
          <button
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 hover:opacity-90 animate-bounce"
          >
            <Scale className="w-4 h-4" />
            <span>Compare Selected ({selectedForCompare.length})</span>
          </button>
        )}
      </div>

      {/* Candidate Rankings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400 px-1">
          <span>Ranked Candidates ({filteredCandidates.length})</span>
          <button onClick={fetchJobData} className="flex items-center space-x-1 text-slate-400 hover:text-white">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {filteredCandidates.map((cand) => (
          <CandidateCard
            key={cand.id}
            candidate={cand}
            onSelectDetail={(c) => setSelectedCandidate(c)}
            isSelectedForCompare={selectedForCompare.some((c) => c.id === cand.id)}
            onToggleCompare={toggleCompare}
          />
        ))}

        {filteredCandidates.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 text-slate-400">
            <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium">No candidates meet the selected filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Upload resumes using the drag-and-drop area above.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {isCompareOpen && (
        <CandidateCompareModal
          candidates={selectedForCompare}
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      {isWeightsOpen && (
        <WeightsConfigModal
          isOpen={isWeightsOpen}
          onClose={() => setIsWeightsOpen(false)}
          weights={weights}
          onSaveWeights={(newW) => setWeights(newW)}
        />
      )}
    </div>
  );
}
