import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { evaluateCandidateAgainstJob } from "@/lib/ai/evaluator";
import { ScoreWeights } from "@/lib/ranking/scorer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const candidateId = searchParams.get("candidateId");
    const createdById = searchParams.get("createdById");

    const whereClause: any = {};
    if (jobId) {
      whereClause.OR = [
        { jobId: jobId },
        { applications: { some: { jobId: jobId } } },
      ];
    } else if (createdById) {
      whereClause.OR = [
        { job: { createdById: createdById } },
        { applications: { some: { job: { createdById: createdById } } } },
      ];
    }
    if (candidateId) whereClause.candidateId = candidateId;

    const resumes = await prisma.resume.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        parsedResume: true,
        candidateScore: true,
        job: true,
        applications: {
          include: {
            job: true,
          },
        },
      },
    });

    const formattedCandidates = resumes.map((r: any) => {
      const parsed = r.parsedResume;
      const score = r.candidateScore;
      const targetJob = r.job || (r.applications && r.applications[0]?.job);

      return {
        id: r.id,
        jobId: r.jobId || targetJob?.id || "",
        jobTitle: targetJob?.title || "",
        jobDepartment: targetJob?.department || "",
        name: r.candidateName,
        email: r.email || "",
        phone: r.phone || "",
        fileKey: r.fileKey,
        fileType: r.fileType,
        rawText: r.rawText,
        parsedResume: {
          totalExperienceYears: parsed?.totalExperienceYears || 0,
          skills: parsed?.skills ? parsed.skills.split(",").map((s: string) => s.trim()) : [],
          experience: parsed?.experienceJson ? JSON.parse(parsed.experienceJson) : [],
          education: parsed?.educationJson ? JSON.parse(parsed.educationJson) : [],
          projects: parsed?.projectsJson ? JSON.parse(parsed.projectsJson) : [],
          certifications: parsed?.certifications ? parsed.certifications.split(",").map((s: string) => s.trim()) : [],
        },
        scores: {
          overallScore: score?.overallScore || 0,
          embeddingScore: score?.embeddingScore || 0,
          llmScore: score?.llmScore || 0,
          experienceScore: score?.experienceScore || 0,
          skillScore: score?.skillScore || 0,
          recommendation: (score?.recommendation as any) || "Not a Fit",
        },
        strengths: score?.strengthsJson ? JSON.parse(score.strengthsJson) : [],
        missingSkills: score?.missingSkillsJson ? JSON.parse(score.missingSkillsJson) : [],
        qualitativeSummary: score?.qualitativeSummary || "",
        createdAt: r.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, data: formattedCandidates });
  } catch (error: any) {
    console.error("Fetch candidates error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch candidates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, rawText, fileName, fileType, candidateId, customWeights } = body;

    let targetJobId = jobId;
    let jobTitle = "Software Engineering Position";
    let jobDescription = "General software engineering role responsibilities.";
    let requiredSkills: string[] = ["JavaScript", "Python", "React", "Node.js"];
    let experienceYears = 3;

    if (targetJobId) {
      const job = await prisma.job.findUnique({ where: { id: targetJobId } });
      if (job) {
        jobTitle = job.title;
        jobDescription = job.description;
        requiredSkills = job.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
        experienceYears = job.experienceYears;
      } else {
        targetJobId = null;
      }
    }

    // If no valid jobId was provided, resolve or create a default Job record in DB
    if (!targetJobId) {
      let existingJob = await prisma.job.findFirst({ orderBy: { createdAt: "desc" } });
      if (!existingJob) {
        existingJob = await prisma.job.create({
          data: {
            title: jobTitle,
            department: "Engineering",
            location: "Remote",
            type: "Full-Time",
            experienceYears,
            requiredSkills: requiredSkills.join(", "),
            description: jobDescription,
            status: "active",
          },
        });
      }
      targetJobId = existingJob.id;
      jobTitle = existingJob.title;
      jobDescription = existingJob.description;
      requiredSkills = existingJob.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
      experienceYears = existingJob.experienceYears;
    }

    if (!rawText) {
      return NextResponse.json({ success: false, error: "Missing raw text for candidate resume evaluation." }, { status: 400 });
    }

    // Run Full AI Evaluation Pipeline
    const evaluation = await evaluateCandidateAgainstJob(
      rawText,
      jobTitle,
      jobDescription,
      requiredSkills,
      experienceYears,
      customWeights as ScoreWeights
    );

    const candidateName = evaluation.parsedResume.name || fileName?.replace(/\.[^/.]+$/, "") || "Candidate";
    const email = evaluation.parsedResume.email || "candidate@example.com";
    const phone = evaluation.parsedResume.phone || "";

    // Save Resume to Prisma DB
    const resumeRecord = await prisma.resume.create({
      data: {
        jobId: targetJobId,
        candidateId: candidateId || null,
        candidateName,
        email,
        phone,
        fileKey: fileName || "resume.pdf",
        fileType: fileType || "application/pdf",
        rawText,
      },
    });

    // Save Parsed Resume Breakdown
    await prisma.parsedResume.create({
      data: {
        resumeId: resumeRecord.id,
        skills: evaluation.parsedResume.skills.join(", "),
        totalExperienceYears: evaluation.parsedResume.totalExperienceYears,
        experienceJson: JSON.stringify(evaluation.parsedResume.experience),
        educationJson: JSON.stringify(evaluation.parsedResume.education),
        projectsJson: JSON.stringify(evaluation.parsedResume.projects),
        certifications: evaluation.parsedResume.certifications.join(", "),
        embeddingJson: JSON.stringify(evaluation.embedding),
      },
    });

    // Save Candidate Score (targetJobId is guaranteed valid FK referencing Job)
    const candidateScoreRecord = await prisma.candidateScore.create({
      data: {
        jobId: targetJobId,
        resumeId: resumeRecord.id,
        overallScore: evaluation.scores.overallScore,
        embeddingScore: evaluation.scores.embeddingScore,
        llmScore: evaluation.scores.llmScore,
        experienceScore: evaluation.scores.experienceScore,
        skillScore: evaluation.scores.skillScore,
        recommendation: evaluation.scores.recommendation,
        strengthsJson: JSON.stringify(evaluation.strengths),
        missingSkillsJson: JSON.stringify(evaluation.missingSkills),
        qualitativeSummary: evaluation.qualitativeSummary,
      },
    });

    const responseCandidate = {
      id: resumeRecord.id,
      jobId: jobId || "",
      name: candidateName,
      email,
      phone,
      fileKey: fileName || "resume.pdf",
      fileType: fileType || "application/pdf",
      rawText,
      parsedResume: evaluation.parsedResume,
      scores: evaluation.scores,
      strengths: evaluation.strengths,
      missingSkills: evaluation.missingSkills,
      qualitativeSummary: evaluation.qualitativeSummary,
      createdAt: resumeRecord.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: responseCandidate,
    });
  } catch (error: any) {
    console.error("Screening error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed candidate screening evaluation" }, { status: 500 });
  }
}
