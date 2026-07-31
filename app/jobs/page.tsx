"use client";

import { useEffect, useState } from "react";
import JobCard from "@/components/jobs/JobCard";
import CreateJobModal from "@/components/jobs/CreateJobModal";
import { MockJob } from "@/lib/db/mockData";
import { Plus, Search, Briefcase } from "lucide-react";

import { useRouter } from "next/navigation";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_session");
      if (stored) {
        const session = JSON.parse(stored);
        if (session.role === "RECRUITER") {
          router.replace("/recruiter/dashboard");
          return;
        } else if (session.role === "CANDIDATE") {
          router.replace("/candidate/dashboard");
          return;
        }
      }
    } catch {}

    fetchJobs();
  }, [router]);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) setJobs(data.data);
    } catch (err) {
      console.error("Jobs page fetch error:", err);
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            <span>Job Positions & Screening Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage active job descriptions and run two-stage AI vector candidate evaluations
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="glass-panel p-3 rounded-2xl border border-slate-800 flex items-center space-x-3">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search jobs by title, department, or required skill (e.g. Next.js, Python)..."
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 text-slate-400">
          <p className="text-sm">No job positions match your search query.</p>
        </div>
      )}

      {isModalOpen && (
        <CreateJobModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onJobCreated={fetchJobs}
        />
      )}
    </div>
  );
}
