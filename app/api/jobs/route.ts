import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const createdById = searchParams.get("createdById");

    const whereClause: any = {};
    if (createdById) {
      whereClause.createdById = createdById;
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { resumes: true, candidateScores: true, applications: true },
        },
        candidateScores: {
          select: { overallScore: true },
        },
      },
    });

    const formattedJobs = jobs.map((job) => {
      const scores = job.candidateScores.map((s) => s.overallScore);
      const avgScore =
        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const count = Math.max(job._count.applications, job._count.resumes);

      return {
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        experienceYears: job.experienceYears,
        requiredSkills: job.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        description: job.description,
        status: job.status,
        candidateCount: count,
        avgScore,
        createdAt: job.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, data: formattedJobs });
  } catch (error: any) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, department, location, type, experienceYears, requiredSkills, description, createdById } = body;

    if (!title || !department || !description) {
      return NextResponse.json({ success: false, error: "Title, department, and description are required." }, { status: 400 });
    }

    const skillsString = Array.isArray(requiredSkills)
      ? requiredSkills.join(", ")
      : String(requiredSkills || "");

    const newJob = await prisma.job.create({
      data: {
        title,
        department,
        location: location || "Remote",
        type: type || "Full-Time",
        experienceYears: Number(experienceYears) || 0,
        requiredSkills: skillsString,
        description,
        status: "active",
        createdById: createdById || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newJob,
        requiredSkills: newJob.requiredSkills.split(",").map((s) => s.trim()),
        candidateCount: 0,
        avgScore: 0,
      },
    });
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create job position" }, { status: 500 });
  }
}
