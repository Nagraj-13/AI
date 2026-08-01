/**
 * E2E Tests: Applications API — /api/applications
 *
 * Tests run against the real dev server (localhost:3000) and real DB.
 * No mocking. Uses shared fixture for recruiter/candidate IDs.
 *
 * NOTE: POST /api/applications triggers AI scoring (Gemini). This adds ~5–15s
 * per test that submits an application. Timeout is set to 60s for those tests.
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { BASE_URL, TEST_PREFIX, SAMPLE_RESUME_RAW_TEXT } from "./helpers/api";

const FIXTURE_PATH = path.resolve(__dirname, ".fixture.json");
const RUN_ID = Date.now();

function getFixture(): { recruiterId: string; candidateId: string } {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf-8"));
}

// Shared state populated in beforeAll
let testJobId: string;
let testResumeId: string;

test.describe("Applications API — /api/applications", () => {
  // Set a longer timeout for this whole describe block because AI scoring runs
  test.setTimeout(90_000);

  // ──────────────────────────────────────────────────────────────────────────
  // Setup: create a job + screen a resume so we have a resumeId to use
  // ──────────────────────────────────────────────────────────────────────────
  test.beforeAll(async ({ request }) => {
    const { recruiterId, candidateId } = getFixture();

    // 1. Create a job position
    const jobRes = await request.post(`${BASE_URL}/api/jobs`, {
      data: {
        title: `${TEST_PREFIX}Application Test Job ${RUN_ID}`,
        department: `${TEST_PREFIX}Engineering`,
        description: "E2E test job for application submission tests.",
        requiredSkills: ["TypeScript", "React", "Node.js"],
        experienceYears: 2,
        createdById: recruiterId,
      },
    });
    expect(jobRes.status()).toBe(200);
    const jobBody = await jobRes.json();
    testJobId = jobBody.data.id;

    // 2. Screen the candidate's resume against the job (creates Resume + ParsedResume + Score)
    //    This calls real Gemini AI — may take up to 30s
    const screenRes = await request.post(`${BASE_URL}/api/screen`, {
      data: {
        jobId: testJobId,
        rawText: SAMPLE_RESUME_RAW_TEXT,
        fileName: "e2e_test_resume.pdf",
        fileType: "application/pdf",
        candidateId,
      },
    });
    expect(screenRes.status()).toBe(200);
    const screenBody = await screenRes.json();
    expect(screenBody.success).toBe(true);
    testResumeId = screenBody.data.id;
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET /api/applications
  // ──────────────────────────────────────────────────────────────────────────
  test.describe("GET /api/applications", () => {
    test("returns 200 with a data array", async ({ request }) => {
      const res = await request.get(`${BASE_URL}/api/applications`);

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test("filters applications by candidateId", async ({ request }) => {
      const { candidateId } = getFixture();

      // First submit an application so we have at least one
      await request.post(`${BASE_URL}/api/applications`, {
        data: { candidateId, jobId: testJobId, resumeId: testResumeId },
      });

      const res = await request.get(
        `${BASE_URL}/api/applications?candidateId=${candidateId}`
      );
      expect(res.status()).toBe(200);
      const body = await res.json();

      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      // Every returned application must belong to this candidate
      for (const app of body.data) {
        expect(app.candidateId).toBe(candidateId);
      }
    });

    test("each application has required fields", async ({ request }) => {
      const { candidateId } = getFixture();

      const res = await request.get(
        `${BASE_URL}/api/applications?candidateId=${candidateId}`
      );
      const body = await res.json();

      if (body.data.length > 0) {
        const app = body.data[0];
        expect(app).toHaveProperty("id");
        expect(app).toHaveProperty("jobId");
        expect(app).toHaveProperty("candidateId");
        expect(app).toHaveProperty("resumeId");
        expect(app).toHaveProperty("status");
        expect(app).toHaveProperty("createdAt");
        expect(app).toHaveProperty("job");
        // score may be null if AI hasn't run yet
        expect(app).toHaveProperty("score");
      }
    });

    test("returns empty array for unknown candidateId", async ({ request }) => {
      const res = await request.get(
        `${BASE_URL}/api/applications?candidateId=00000000-0000-0000-0000-000000000000`
      );
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST /api/applications
  // ──────────────────────────────────────────────────────────────────────────
  test.describe("POST /api/applications", () => {
    test(
      "submitting application succeeds and returns application + score",
      async ({ request }) => {
        const { candidateId } = getFixture();

        const res = await request.post(`${BASE_URL}/api/applications`, {
          data: {
            candidateId,
            jobId: testJobId,
            resumeId: testResumeId,
          },
        });

        expect(res.status()).toBe(200);
        const body = await res.json();

        expect(body.success).toBe(true);
        expect(body.message).toContain("submitted");

        const app = body.data;
        expect(app.id).toBeTruthy();
        expect(app.candidateId).toBe(candidateId);
        expect(app.jobId).toBe(testJobId);
        expect(app.status).toBe("SUBMITTED");

        // AI scoring should have run and returned scores
        if (app.score) {
          expect(app.score.overallScore).toBeGreaterThanOrEqual(0);
          expect(app.score.overallScore).toBeLessThanOrEqual(100);
          expect(["Strong Fit", "Good Fit", "Potential Fit", "Not a Fit"]).toContain(
            app.score.recommendation
          );
          expect(Array.isArray(app.score.strengths)).toBe(true);
          expect(Array.isArray(app.score.missingSkills)).toBe(true);
          expect(typeof app.score.qualitativeSummary).toBe("string");
        }
      }
    );

    test(
      "re-submitting same application is idempotent (returns existing application)",
      async ({ request }) => {
        const { candidateId } = getFixture();

        // Submit once
        const first = await request.post(`${BASE_URL}/api/applications`, {
          data: { candidateId, jobId: testJobId, resumeId: testResumeId },
        });
        const firstBody = await first.json();
        expect(firstBody.success).toBe(true);
        const firstId = firstBody.data.id;

        // Submit again — should return the same application
        const second = await request.post(`${BASE_URL}/api/applications`, {
          data: { candidateId, jobId: testJobId, resumeId: testResumeId },
        });
        const secondBody = await second.json();
        expect(secondBody.success).toBe(true);
        expect(secondBody.data.id).toBe(firstId); // same application
      }
    );

    test("missing candidateId returns 400", async ({ request }) => {
      const res = await request.post(`${BASE_URL}/api/applications`, {
        data: { jobId: testJobId },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/candidateId.*jobId/i);
    });

    test("missing jobId returns 400", async ({ request }) => {
      const { candidateId } = getFixture();

      const res = await request.post(`${BASE_URL}/api/applications`, {
        data: { candidateId },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/candidateId.*jobId/i);
    });

    test(
      "submitting without resumeId auto-resolves to candidate's latest resume",
      async ({ request }) => {
        const { candidateId } = getFixture();

        // candidateId already has a resume from beforeAll setup
        const res = await request.post(`${BASE_URL}/api/applications`, {
          data: { candidateId, jobId: testJobId },
          // resumeId intentionally omitted
        });

        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.data.resumeId).toBeTruthy(); // auto-resolved
      }
    );
  });
});
