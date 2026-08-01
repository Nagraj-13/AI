import { MockCandidate } from "@/lib/db/mockData";
import { Award, Briefcase, ChevronRight, CheckCircle2, AlertTriangle, Eye, CheckSquare, Square } from "lucide-react";

interface CandidateCardProps {
  candidate: MockCandidate;
  onSelectDetail: (candidate: MockCandidate) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (candidate: MockCandidate) => void;
}

export default function CandidateCard({
  candidate,
  onSelectDetail,
  isSelectedForCompare,
  onToggleCompare,
}: CandidateCardProps) {
  const getBadgeStyle = (rec: string) => {
    switch (rec) {
      case "Strong Fit":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 glow-emerald";
      case "Good Fit":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "Potential Fit":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border relative transition-all duration-200 group">
      <div className="flex items-start justify-between">
        {/* Left Candidate Info */}
        <div className="flex items-start space-x-3.5">
          <button
            onClick={() => onToggleCompare(candidate)}
            className="mt-1 text-slate-500 hover:text-indigo-400 transition-colors"
            title="Select for comparison"
          >
            {isSelectedForCompare ? (
              <CheckSquare className="w-5 h-5 text-indigo-400" />
            ) : (
              <Square className="w-5 h-5 text-slate-600" />
            )}
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                {candidate.name}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {candidate.parsedResume.totalExperienceYears} Yrs Exp
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{candidate.email} • {candidate.phone}</p>
            
            {candidate.jobTitle && (
              <div className="mt-1.5 flex items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                  <Briefcase className="w-3 h-3 text-indigo-400" />
                  <span>Applied Position: {candidate.jobTitle}</span>
                  {candidate.jobDepartment && <span className="text-slate-400">({candidate.jobDepartment})</span>}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Score Badge */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-2xl font-black text-white tracking-tight">
              {candidate.scores.overallScore}%
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Candidate Fit Score</span>
          </div>

          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold border ${getBadgeStyle(
              candidate.scores.recommendation
            )}`}
          >
            {candidate.scores.recommendation}
          </span>
        </div>
      </div>

      {/* 4-Part Mini Breakdown Bar */}
      <div className="mt-4 grid grid-cols-4 gap-2 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-900 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block font-mono">Embedding (40%)</span>
          <span className="font-bold text-indigo-300">{candidate.scores.embeddingScore}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block font-mono">LLM Qual (40%)</span>
          <span className="font-bold text-cyan-300">{candidate.scores.llmScore}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block font-mono">Exp Match (10%)</span>
          <span className="font-bold text-purple-300">{candidate.scores.experienceScore}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block font-mono">Skill Match (10%)</span>
          <span className="font-bold text-emerald-300">{candidate.scores.skillScore}%</span>
        </div>
      </div>

      {/* Qualitative Summary Snippet */}
      <p className="mt-3 text-xs text-slate-300 leading-relaxed italic line-clamp-2">
        "{candidate.qualitativeSummary}"
      </p>

      {/* Skill Pills & Missing Skills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {candidate.parsedResume.skills.slice(0, 6).map((skill, idx) => (
          <span
            key={`skill-${skill}-${idx}`}
            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center space-x-1"
          >
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>{skill}</span>
          </span>
        ))}

        {candidate.missingSkills.map((missing, idx) => (
          <span
            key={`missing-${missing}-${idx}`}
            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center space-x-1"
          >
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>{missing}</span>
          </span>
        ))}
      </div>

      {/* Footer Action */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-mono">
          File: {candidate.fileKey}
        </span>

        <button
          onClick={() => onSelectDetail(candidate)}
          className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Full Analysis & Resume</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
