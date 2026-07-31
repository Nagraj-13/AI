import Link from "next/link";
import { Briefcase, Users, MapPin, Clock, ArrowRight, Award } from "lucide-react";
import { MockJob } from "@/lib/db/mockData";

interface JobCardProps {
  job: MockJob;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="glass-card rounded-2xl p-6 border flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {job.department}
            </span>
            <h3 className="text-lg font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors">
              {job.title}
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active</span>
          </span>
        </div>

        {/* Location & Experience Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{job.location}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{job.experienceYears}+ years exp</span>
          </span>
          <span className="flex items-center space-x-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>{job.type}</span>
          </span>
        </div>

        {/* Job Description Snippet */}
        <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skill Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.requiredSkills.slice(0, 5).map((skill, idx) => (
            <span
              key={`jobskill-${skill}-${idx}`}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-800"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 5 && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-900/50 text-slate-500">
              +{job.requiredSkills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Meta & Screening Button */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{job.candidateCount} Screened</span>
          </div>
          {job.avgScore > 0 && (
            <div className="flex items-center space-x-1 text-cyan-400 font-medium">
              <Award className="w-3.5 h-3.5" />
              <span>Avg {job.avgScore}%</span>
            </div>
          )}
        </div>

        <Link
          href={`/jobs/${job.id}/screen`}
          className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all duration-200"
        >
          <span>Screen Resumes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
