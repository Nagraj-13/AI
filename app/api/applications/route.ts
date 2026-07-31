import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { evaluateCandidateAgainstJob } from "@/lib/ai/evaluator";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get("candidateId");

    const whereClause: any = {};
    if (candidateId) whereClause.candidateId = candidateId;

    const applications = await prisma.application.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        job: true,
        resume: {
          include: {
            parsedResume: true,
            candidateScore: true,
          },
        },
      },
    });

    // Format application list with exact matching CandidateScore for job & resume
    const formattedApps = await Promise.all(
      applications.map(async (app) => {
        let score = app.resume?.candidateScore;
        if (!score || score.jobId !== app.jobId) {
          score = (await prisma.candidateScore.findFirst({
            where: { jobId: app.jobId, resumeId: app.resumeId },
          })) || score;
        }

        return {
          id: app.id,
          jobId: app.jobId,
          candidateId: app.candidateId,
          resumeId: app.resumeId,
          status: app.status,
          createdAt: app.createdAt,
          job: app.job,
          score: score
            ? {
                overallScore: Math.round(score.overallScore),
                embeddingScore: Math.round(score.embeddingScore),
                llmScore: Math.round(score.llmScore),
                experienceScore: Math.round(score.experienceScore),
                skillScore: Math.round(score.skillScore),
                recommendation: score.recommendation,
                strengths: score.strengthsJson ? JSON.parse(score.strengthsJson) : [],
                missingSkills: score.missingSkillsJson ? JSON.parse(score.missingSkillsJson) : [],
                qualitativeSummary: score.qualitativeSummary,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ success: true, data: formattedApps });
  } catch (error: any) {
    console.error("Fetch applications error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidateId, jobId, resumeId } = body;

    if (!candidateId || !jobId) {
      return NextResponse.json(
        { success: false, error: "candidateId and jobId are required to submit an application." },
        { status: 400 }
      );
    }

    // Resolve Candidate's Resume if resumeId is omitted
    let targetResumeId = resumeId;
    if (!targetResumeId) {
      const latestResume = await prisma.resume.findFirst({
        where: { candidateId },
        orderBy: { createdAt: "desc" },
      });
      if (!latestResume) {
        return NextResponse.json(
          { success: false, error: "No stored resume found for candidate. Please upload or add resume content first." },
          { status: 400 }
        );
      }
      targetResumeId = latestResume.id;
    }

    // Check if application already exists
    let application = await prisma.application.findFirst({
      where: { candidateId, jobId },
    });

    if (!application) {
      application = await prisma.application.create({
        data: {
          candidateId,
          jobId,
          resumeId: targetResumeId,
          status: "SUBMITTED",
        },
      });
    }

    // Run AI candidate scoring for this job position
    let candidateScoreRecord = null;
    try {
      const existingScore = await prisma.candidateScore.findUnique({
        where: { resumeId: targetResumeId },
      });

      const resume = await prisma.resume.findUnique({ where: { id: targetResumeId } });
      const job = await prisma.job.findUnique({ where: { id: jobId } });

      if (resume && job) {
        const reqSkills = job.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
        const evaluation = await evaluateCandidateAgainstJob(
          resume.rawText,
          job.title,
          job.description,
          reqSkills,
          job.experienceYears
        );

        if (!existingScore) {
          candidateScoreRecord = await prisma.candidateScore.create({
            data: {
              jobId: job.id,
              resumeId: resume.id,
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
        } else {
          candidateScoreRecord = await prisma.candidateScore.update({
            where: { id: existingScore.id },
            data: {
              jobId: job.id,
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
        }
      }
    } catch (evalErr) {
      console.warn("AI candidate scoring error on job application:", evalErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...application,
        score: candidateScoreRecord
          ? {
              overallScore: Math.round(candidateScoreRecord.overallScore),
              embeddingScore: Math.round(candidateScoreRecord.embeddingScore),
              llmScore: Math.round(candidateScoreRecord.llmScore),
              experienceScore: Math.round(candidateScoreRecord.experienceScore),
              skillScore: Math.round(candidateScoreRecord.skillScore),
              recommendation: candidateScoreRecord.recommendation,
              strengths: candidateScoreRecord.strengthsJson ? JSON.parse(candidateScoreRecord.strengthsJson) : [],
              missingSkills: candidateScoreRecord.missingSkillsJson ? JSON.parse(candidateScoreRecord.missingSkillsJson) : [],
              qualitativeSummary: candidateScoreRecord.qualitativeSummary,
            }
          : null,
      },
      message: "Job application submitted and relevance scored successfully!",
    });
  } catch (error: any) {
    console.error("Create application error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit job application" },
      { status: 500 }
    );
  }
}
