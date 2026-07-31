"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Send,
  FileCode,
  AlertCircle,
  Award,
  TrendingUp,
  Check,
  XCircle,
  Brain,
  Loader2,
} from "lucide-react";

interface JobItem {
  id: string;
  title: string;
  department: string;
  location: string;
  experienceYears: number;
  requiredSkills: string[];
  description: string;
}

interface PersonalAnalysis {
  resumeId: string;
  name: string;
  email: string;
  totalExperienceYears: number;
  skills: string[];
  experience: Array<{ company: string; title: string; years: number; description: string }>;
  education: Array<{ degree: string; institution: string; year: string }>;
  rawText: string;
}

interface ApplicationScore {
  overallScore: number;
  embeddingScore: number;
  llmScore: number;
  experienceScore: number;
  skillScore: number;
  recommendation: string;
  strengths: string[];
  missingSkills: string[];
  qualitativeSummary: string;
}

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [candidateSession, setCandidateSession] = useState<UserSession | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [analysis, setAnalysis] = useState<PersonalAnalysis | null>(null);

  const [uploadMode, setUploadMode] = useState<"file" | "text">("file");
  const [manualText, setManualText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [applicationScores, setApplicationScores] = useState<Record<string, ApplicationScore>>({});
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");

  // Route protection & session initialization
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_session");
      if (stored) {
        const session: UserSession = JSON.parse(stored);
        if (session.role === "RECRUITER") {
          router.replace("/recruiter/dashboard");
          return;
        }
        setCandidateSession(session);
      }
    } catch {}
  }, [router]);

  // Fetch Jobs, Candidate DB Resume, and Submitted Applications with Scores
  const fetchInitialData = async (candId?: string) => {
    try {
      const activeCandId = candId || candidateSession?.id;

      const [jobsRes, appsRes] = await Promise.all([
        fetch("/api/jobs"),
        activeCandId ? fetch(`/api/applications?candidateId=${activeCandId}`) : Promise.resolve(null),
      ]);

      const jobsData = await jobsRes.json();
      if (jobsData.success) setJobs(jobsData.data);

      if (appsRes) {
        const appsData = await appsRes.json();
        if (appsData.success && Array.isArray(appsData.data)) {
          const appliedIds: string[] = [];
          const scoresMap: Record<string, ApplicationScore> = {};

          appsData.data.forEach((app: any) => {
            appliedIds.push(app.jobId);
            if (app.score) {
              scoresMap[app.jobId] = app.score;
            }
          });

          setAppliedJobIds(appliedIds);
          setApplicationScores(scoresMap);

          // Populate analysis from existing application resume if present
          if (appsData.data.length > 0 && appsData.data[0].resume) {
            const r = appsData.data[0].resume;
            const parsed = r.parsedResume;
            setAnalysis({
              resumeId: r.id,
              name: r.candidateName || candidateSession?.name || "Candidate",
              email: r.email || candidateSession?.email || "",
              totalExperienceYears: parsed?.totalExperienceYears || 0,
              skills: parsed?.skills ? parsed.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
              experience: parsed?.experienceJson ? JSON.parse(parsed.experienceJson) : [],
              education: parsed?.educationJson ? JSON.parse(parsed.educationJson) : [],
              rawText: r.rawText,
            });
          }
        }
      }

      // Check candidate's uploaded resumes directly via candidateId screening API
      if (activeCandId) {
        const candidateResumesRes = await fetch(`/api/screen?candidateId=${activeCandId}`);
        const candidateResumesData = await candidateResumesRes.json();
        if (candidateResumesData.success && candidateResumesData.data.length > 0) {
          const latest = candidateResumesData.data[0];
          setAnalysis({
            resumeId: latest.id,
            name: latest.name,
            email: latest.email,
            totalExperienceYears: latest.parsedResume.totalExperienceYears,
            skills: latest.parsedResume.skills,
            experience: latest.parsedResume.experience,
            education: latest.parsedResume.education,
            rawText: latest.rawText,
          });
        }
      }
    } catch (err) {
      console.error("Candidate fetch error:", err);
    }
  };

  useEffect(() => {
    if (candidateSession?.id) {
      fetchInitialData(candidateSession.id);
    } else {
      fetchInitialData();
    }
  }, [candidateSession?.id]);

  // Handle Document File Upload (PDF / DOCX)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusType("info");
    setStatusMsg("Extracting document text using primary LLM / code parser...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) throw new Error(uploadData.error || "Document upload failed.");

      setStatusMsg("Running AI resume parsing & profile extraction...");

      const screenRes = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: uploadData.data.rawText,
          fileName: uploadData.data.fileName,
          fileType: uploadData.data.fileType,
          candidateId: candidateSession?.id,
        }),
      });

      const screenData = await screenRes.json();
      if (screenData.success) {
        setAnalysis({
          resumeId: screenData.data.id,
          name: screenData.data.name,
          email: screenData.data.email,
          totalExperienceYears: screenData.data.parsedResume.totalExperienceYears,
          skills: screenData.data.parsedResume.skills,
          experience: screenData.data.parsedResume.experience,
          education: screenData.data.parsedResume.education,
          rawText: screenData.data.rawText,
        });
        setStatusType("success");
        setStatusMsg("Resume content extracted and stored in database! You can now apply for jobs.");
      }
    } catch (err: any) {
      setStatusType("error");
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Manual Resume Text Input
  const handleManualTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) {
      setStatusType("error");
      setStatusMsg("Please enter or paste your resume text content.");
      return;
    }

    setIsUploading(true);
    setStatusType("info");
    setStatusMsg("Storing resume text content & extracting profile...");

    try {
      const screenRes = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: manualText.trim(),
          fileName: "manual_resume.txt",
          fileType: "text/plain",
          candidateId: candidateSession?.id,
        }),
      });

      const screenData = await screenRes.json();
      if (screenData.success) {
        setAnalysis({
          resumeId: screenData.data.id,
          name: screenData.data.name,
          email: screenData.data.email,
          totalExperienceYears: screenData.data.parsedResume.totalExperienceYears,
          skills: screenData.data.parsedResume.skills,
          experience: screenData.data.parsedResume.experience,
          education: screenData.data.parsedResume.education,
          rawText: screenData.data.rawText,
        });
        setStatusType("success");
        setStatusMsg("Resume text content stored in database! You can now apply for jobs.");
        setManualText("");
      }
    } catch (err: any) {
      setStatusType("error");
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Job Application Submission & Store Relevance Analysis
  const handleApply = async (jobId: string) => {
    if (!analysis) {
      alert("Please upload or add your resume content first before applying!");
      return;
    }

    setApplyingJobId(jobId);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidateSession?.id || "guest_candidate",
          jobId,
          resumeId: analysis.resumeId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedJobIds((prev) => [...prev, jobId]);
        if (data.data?.score) {
          setApplicationScores((prev) => ({
            ...prev,
            [jobId]: data.data.score,
          }));
        }
      } else {
        alert(data.error || "Failed to submit application.");
      }
    } catch (err) {
      console.error("Apply job error:", err);
    } finally {
      setApplyingJobId(null);
    }
  };

  const getRecommendationBadgeVariant = (rec?: string) => {
    switch (rec) {
      case "Strong Fit":
        return "emerald";
      case "Good Fit":
        return "indigo";
      case "Potential Fit":
        return "amber";
      default:
        return "rose";
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Student Portal Header */}
      <div className="border-b border-[#1f1f1f] pb-6">
        <Badge variant="indigo" className="mb-2">Candidate & Student Portal</Badge>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {candidateSession?.name ? `Welcome, ${candidateSession.name}` : "Student Profile & Resume Hub"}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {candidateSession?.email ? `Logged in as ${candidateSession.email} • ` : ""}
          Add your resume content to build your AI profile, apply to jobs, and receive instant AI candidate match relevance scores.
        </p>
      </div>

      {/* Section 1: Resume Upload / Content Input */}
      <Card className="border-[#222222] bg-[#0a0a0a]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>{analysis ? "Update Resume Content" : "Add Resume Content to Enable Applications"}</span>
              </CardTitle>
              <CardDescription>
                {analysis
                  ? "Your resume content is stored in the database. You can re-upload or update it below."
                  : "Upload a PDF/DOCX resume file OR paste your resume text content below."}
              </CardDescription>
            </div>
            {analysis && (
              <Badge variant="emerald" className="flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Resume Stored in DB</span>
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Upload Mode Selector (File vs Manual Text) */}
        <div className="px-6">
          <div className="flex border-b border-[#1f1f1f] mb-4 text-xs font-semibold">
            <button
              onClick={() => setUploadMode("file")}
              className={`py-2 px-4 border-b-2 transition-colors flex items-center space-x-1.5 ${
                uploadMode === "file"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF / DOCX File</span>
            </button>
            <button
              onClick={() => setUploadMode("text")}
              className={`py-2 px-4 border-b-2 transition-colors flex items-center space-x-1.5 ${
                uploadMode === "text"
                  ? "border-indigo-500 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Paste Resume Text Manually</span>
            </button>
          </div>

          {uploadMode === "file" ? (
            <div className="p-6 border border-dashed border-[#222222] rounded-xl text-center hover:border-slate-600 transition-colors bg-[#080808] mb-6">
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="student-resume-input"
              />
              <label htmlFor="student-resume-input" className="cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#222222] text-white mx-auto flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-xs font-semibold text-white">
                  {isUploading ? "Extracting & Processing Content..." : "Click to select or drag and drop resume file"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Supported formats: PDF, DOCX, Word, Text</p>
              </label>
            </div>
          ) : (
            <form onSubmit={handleManualTextSubmit} className="space-y-3 mb-6">
              <textarea
                rows={5}
                required
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste your full resume text content here (work history, technical skills, education, projects)..."
                className="w-full p-3 rounded-xl bg-[#111111] border border-[#222222] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
              />
              <div className="flex justify-end">
                <Button variant="primary" type="submit" disabled={isUploading} size="sm" className="text-xs">
                  {isUploading ? "Saving..." : "Save Resume Content to Profile"}
                </Button>
              </div>
            </form>
          )}

          {statusMsg && (
            <div
              className={`mb-6 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                statusType === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : statusType === "error"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
              }`}
            >
              {statusType === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : statusType === "error" ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 flex-shrink-0 animate-spin" />
              )}
              <span>{statusMsg}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Section 2: Stored Profile & Parsed Skills Breakdown */}
      {analysis && (
        <Card className="border-[#222222] bg-[#0d0d0d] space-y-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{analysis.name}</CardTitle>
                <CardDescription>{analysis.email} • {analysis.totalExperienceYears} Years Total Experience</CardDescription>
              </div>
              <Badge variant="emerald">Stored in DB</Badge>
            </div>
          </CardHeader>

          {/* Parsed Technical Skills */}
          <div className="px-6">
            <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Parsed Technical Skills ({analysis.skills.length})</h4>
            <div className="flex flex-wrap gap-1.5">
              {analysis.skills.map((skill, idx) => (
                <Badge key={`${skill}-${idx}`} variant="default">{skill}</Badge>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          {analysis.experience.length > 0 && (
            <div className="px-6 pb-6">
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Extracted Work Experience</span>
              </h4>
              <div className="space-y-2">
                {analysis.experience.map((exp, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#141414] border border-[#222222] text-xs">
                    <div className="flex justify-between font-semibold text-white">
                      <span>{exp.title}</span>
                      <span className="font-mono text-slate-400">{exp.years} Yrs</span>
                    </div>
                    <span className="text-slate-400">{exp.company}</span>
                    <p className="mt-1 text-slate-300">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Section 3: Open Job Positions & Application Relevance Insights */}
      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Available Job Openings & Relevance Insights ({jobs.length})</h2>
            <p className="text-xs text-slate-400">
              Apply to positions below to view your real-time AI Candidate Match & Qualification Score.
            </p>
          </div>
        </div>

        {!analysis && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Notice: You must upload or add your resume content above before you can apply for jobs.</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const hasApplied = appliedJobIds.includes(job.id);
            const score = applicationScores[job.id];
            const isApplying = applyingJobId === job.id;

            return (
              <Card key={job.id} className="flex flex-col justify-between border-[#222222]">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="indigo">{job.department}</Badge>
                      <h3 className="text-sm font-bold text-white mt-1">{job.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{job.experienceYears}+ Yrs Exp</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400 line-clamp-2">{job.description}</p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 5).map((sk, idx) => (
                      <span key={`${sk}-${idx}`} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1f1f1f] text-slate-300">
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Candidate Match Relevance Card (Appears after applying) */}
                  {hasApplied && score && (
                    <div className="mt-4 p-3.5 rounded-xl bg-[#111111] border border-[#262626] space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                          <Award className="w-4 h-4 text-indigo-400" />
                          <span>Job Relevance to Your Profile</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black font-mono text-white">{score.overallScore}% Relevant</span>
                          <Badge variant={getRecommendationBadgeVariant(score.recommendation)}>
                            {score.recommendation}
                          </Badge>
                        </div>
                      </div>

                      {/* Score Progress Bar */}
                      <div className="w-full bg-[#222222] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            score.overallScore >= 80
                              ? "bg-emerald-500"
                              : score.overallScore >= 65
                              ? "bg-indigo-500"
                              : score.overallScore >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, score.overallScore))}%` }}
                        />
                      </div>

                      {/* Sub-scores (Skill Alignment vs Experience Ratio) */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-[#161616] border border-[#222222]">
                          <span className="text-slate-400 block">Your Skill Match</span>
                          <span className="font-bold text-white font-mono">{score.skillScore}%</span>
                        </div>
                        <div className="p-2 rounded bg-[#161616] border border-[#222222]">
                          <span className="text-slate-400 block">Your Experience Match</span>
                          <span className="font-bold text-white font-mono">{score.experienceScore}%</span>
                        </div>
                      </div>

                      {/* Matching Qualifications */}
                      {score.strengths.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1 mb-1">
                            <Check className="w-3 h-3" />
                            <span>Your Matching Qualifications</span>
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {score.strengths.slice(0, 3).map((st, idx) => (
                              <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                {st}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Skills to Learn */}
                      {score.missingSkills.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-amber-400 flex items-center space-x-1 mb-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Recommended Skills to Learn for this Role</span>
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {score.missingSkills.slice(0, 3).map((ms, idx) => (
                              <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                {ms}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Qualitative Career Feedback */}
                      {score.qualitativeSummary && (
                        <p className="text-[11px] text-slate-300 leading-relaxed italic border-t border-[#222222] pt-2">
                          "{score.qualitativeSummary}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#1f1f1f] flex justify-end">
                  <Button
                    variant={hasApplied ? "outline" : analysis ? "primary" : "ghost"}
                    size="sm"
                    disabled={hasApplied || !analysis || isApplying}
                    onClick={() => handleApply(job.id)}
                  >
                    {hasApplied ? (
                      <span className="flex items-center text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Application Submitted
                      </span>
                    ) : isApplying ? (
                      <span className="flex items-center text-indigo-200 font-medium">
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-indigo-400" />
                        Applying & Scoring Match...
                      </span>
                    ) : analysis ? (
                      <span className="flex items-center">
                        <Send className="w-3.5 h-3.5 mr-1" />
                        One-Click Apply & Score Match
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Resume Required</span>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
