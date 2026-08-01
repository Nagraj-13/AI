"use client";

import { useState } from "react";
import { MockCandidate } from "@/lib/db/mockData";
import { X, Award, CheckCircle2, AlertTriangle, Briefcase, GraduationCap, Code, FileText, Download, Sparkles } from "lucide-react";

interface CandidateDetailModalProps {
  candidate: MockCandidate | null;
  onClose: () => void;
}

export default function CandidateDetailModal({ candidate, onClose }: CandidateDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"analysis" | "structured" | "raw">("analysis");

  if (!candidate) return null;

  const exportReportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(candidate, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${candidate.name.replace(/\s+/g, "_")}_AI_Evaluation.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-extrabold text-white">{candidate.name}</h2>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {candidate.scores.recommendation}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {candidate.email} • {candidate.phone} • {candidate.parsedResume.totalExperienceYears} Years Total Experience
            </p>
            {candidate.jobTitle && (
              <p className="text-xs text-indigo-300 font-semibold mt-1 flex items-center">
                <span>Position Applied: {candidate.jobTitle}</span>
                {candidate.jobDepartment && <span className="text-slate-400 ml-1">({candidate.jobDepartment})</span>}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={exportReportJson}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/50 flex space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`py-3 flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === "analysis"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Evaluation Breakdown</span>
          </button>
          <button
            onClick={() => setActiveTab("structured")}
            className={`py-3 flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === "structured"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Structured Resume JSON</span>
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`py-3 flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === "raw"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Raw Text Document</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "analysis" && (
            <>
              {/* Overall Score Metrics Header */}
              <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 to-purple-950/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-3xl font-black text-white glow-primary">
                    {candidate.scores.overallScore}%
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Weighted Fit Score</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Combines Vector Embedding (40%), LLM Qualitative (40%), Experience (10%), and Skill Match (10%).
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Embedding Similarity</span>
                    <span className="font-bold text-indigo-400 text-sm">{candidate.scores.embeddingScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">LLM Qualitative</span>
                    <span className="font-bold text-cyan-400 text-sm">{candidate.scores.llmScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Experience Match</span>
                    <span className="font-bold text-purple-400 text-sm">{candidate.scores.experienceScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Skill Match</span>
                    <span className="font-bold text-emerald-400 text-sm">{candidate.scores.skillScore}%</span>
                  </div>
                </div>
              </div>

              {/* Qualitative Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  AI Hiring Recommendation Summary
                </h4>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans">
                  "{candidate.qualitativeSummary}"
                </div>
              </div>

              {/* Strengths & Missing Skills */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Key Strengths */}
                <div className="glass-card rounded-2xl p-5 border border-emerald-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Candidate Strengths ({candidate.strengths.length})</span>
                  </h4>
                  <ul className="space-y-2">
                    {candidate.strengths.map((str, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Skills */}
                <div className="glass-card rounded-2xl p-5 border border-rose-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Missing / Gap Skills ({candidate.missingSkills.length})</span>
                  </h4>
                  {candidate.missingSkills.length > 0 ? (
                    <ul className="space-y-2">
                      {candidate.missingSkills.map((sk, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                          <span>{sk}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No missing critical skills identified!</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "structured" && (
            <div className="space-y-6">
              {/* Work Experience Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-2 mb-3">
                  <Briefcase className="w-4 h-4" />
                  <span>Work Experience</span>
                </h4>
                <div className="space-y-3">
                  {candidate.parsedResume.experience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{exp.title}</span>
                        <span className="text-indigo-400 font-mono font-semibold">{exp.years} Years</span>
                      </div>
                      <span className="text-slate-400 font-medium">{exp.company}</span>
                      <p className="mt-2 text-slate-300 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2 mb-3">
                  <GraduationCap className="w-4 h-4" />
                  <span>Education</span>
                </h4>
                <div className="space-y-2">
                  {candidate.parsedResume.education.map((edu, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex justify-between">
                      <div>
                        <span className="font-bold text-white block">{edu.degree}</span>
                        <span className="text-slate-400">{edu.institution}</span>
                      </div>
                      <span className="text-slate-500 font-mono">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "raw" && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Extracted Raw Text Document
              </h4>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {candidate.rawText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
