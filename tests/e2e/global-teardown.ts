/**
 * Global Teardown — runs once after the entire test suite.
 *
 * Deletes all records created during the test run that match the TEST_PREFIX
 * pattern. Uses Prisma directly (not via HTTP) so teardown is atomic and fast.
 *
 * Deletion order respects FK constraints:
 *   CandidateScore → ParsedResume → Application → Resume → Job → User
 */

import * as path from "path";
import * as fs from "fs";
import { PrismaClient } from "@prisma/client";

// Load .env so DATABASE_URL is available when running outside Next.js
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const TEST_PREFIX = "e2e_test_";
const FIXTURE_PATH = path.resolve(__dirname, ".fixture.json");

async function globalTeardown() {
  console.log("\n🧹 [Global Teardown] Cleaning up test data...");

  const prisma = new PrismaClient();

  try {
    // ── Find test users ──────────────────────────────────────────────────
    const testUsers = await prisma.user.findMany({
      where: { email: { contains: TEST_PREFIX } },
      select: { id: true, email: true },
    });
    const testUserIds = testUsers.map((u) => u.id);
    console.log(`  Found ${testUsers.length} test user(s):`, testUsers.map((u) => u.email));

    // ── Find test resumes (owned by test users or linked to test jobs) ──
    const testResumes = await prisma.resume.findMany({
      where: {
        OR: [
          { candidateId: { in: testUserIds } },
          { job: { createdById: { in: testUserIds } } },
          { job: { title: { contains: TEST_PREFIX } } },
        ],
      },
      select: { id: true },
    });
    const testResumeIds = testResumes.map((r) => r.id);

    // ── Find test jobs ───────────────────────────────────────────────────
    const testJobs = await prisma.job.findMany({
      where: {
        OR: [
          { createdById: { in: testUserIds } },
          { title: { contains: TEST_PREFIX } },
        ],
      },
      select: { id: true },
    });
    const testJobIds = testJobs.map((j) => j.id);

    // ── Delete in FK-safe order ──────────────────────────────────────────

    // 1. CandidateScores linked to test resumes
    const { count: scoreCount } = await prisma.candidateScore.deleteMany({
      where: { resumeId: { in: testResumeIds } },
    });
    console.log(`  🗑  Deleted ${scoreCount} CandidateScore(s)`);

    // 2. ParsedResumes linked to test resumes
    const { count: parsedCount } = await prisma.parsedResume.deleteMany({
      where: { resumeId: { in: testResumeIds } },
    });
    console.log(`  🗑  Deleted ${parsedCount} ParsedResume(s)`);

    // 3. Applications linked to test users or test jobs
    const { count: appCount } = await prisma.application.deleteMany({
      where: {
        OR: [
          { candidateId: { in: testUserIds } },
          { jobId: { in: testJobIds } },
        ],
      },
    });
    console.log(`  🗑  Deleted ${appCount} Application(s)`);

    // 4. Resumes linked to test users or test jobs
    const { count: resumeCount } = await prisma.resume.deleteMany({
      where: { id: { in: testResumeIds } },
    });
    console.log(`  🗑  Deleted ${resumeCount} Resume(s)`);

    // 5. Jobs linked to test users
    const { count: jobCount } = await prisma.job.deleteMany({
      where: { id: { in: testJobIds } },
    });
    console.log(`  🗑  Deleted ${jobCount} Job(s)`);

    // 6. Test users
    const { count: userCount } = await prisma.user.deleteMany({
      where: { id: { in: testUserIds } },
    });
    console.log(`  🗑  Deleted ${userCount} User(s)`);

    console.log("🧹 [Global Teardown] Complete — DB is clean.\n");
  } catch (err) {
    console.error("[Global Teardown] Error during cleanup:", err);
  } finally {
    await prisma.$disconnect();

    // Remove fixture file
    if (fs.existsSync(FIXTURE_PATH)) {
      fs.unlinkSync(FIXTURE_PATH);
    }
  }
}

export default globalTeardown;
