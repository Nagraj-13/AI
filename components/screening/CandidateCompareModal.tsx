"use client";

import { MockCandidate } from "@/lib/db/mockData";
import { X, CheckCircle2, AlertTriangle, Scale } from "lucide-react";

interface CandidateCompareModalProps {
  candidates: MockCandidate[];
  onClose: () => void;
}

export default function CandidateCompareModal({ candidates, onClose }: CandidateCompareModalProps) {
  if (candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Side-by-Side Candidate Comparison</h2>
              <p className="text-xs text-slate-400">Comparing {candidates.length} selected candidate profiles</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((cand) => (
              <div key={cand.id} className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">{cand.name}</h3>
                    <span className="text-2xl font-black text-indigo-400">{cand.scores.overallScore}%</span>
                  </div>

                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {cand.scores.recommendation}
                  </span>

                  <p className="text-xs text-slate-400 mt-2 font-mono">{cand.parsedResume.totalExperienceYears} Years Exp</p>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <h4 className="text-[11px] font-bold uppercase text-slate-400 mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {cand.parsedResume.skills.map((skill, idx) => (
                        <span key={`skill-${skill}-${idx}`} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-[11px] font-bold uppercase text-emerald-400 mb-1 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Key Strengths</span>
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {cand.strengths.map((str, i) => (
                        <li key={i}>• {str}</li>
                      ))}
                    </ul>
                  </div>

                  {cand.missingSkills.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-[11px] font-bold uppercase text-rose-400 mb-1 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Missing Skills</span>
                      </h4>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {cand.missingSkills.map((sk, i) => (
                          <li key={i}>• {sk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
