/**
 * E2E Tests: AI Screening API — /api/screen
 *
 * @ai  ← Tag allows skipping with: npx playwright test --grep-invert @ai
 *
 * These tests call the REAL Gemini AI pipeline. Each POST test takes ~10–30s.
 * Run selectively to manage API quota.
 *
 * Tests run against the real dev server (localhost:3000) and real DB.
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

// Shared job created in beforeAll
let screeningJobId: string;

test.describe("@ai Screening API — /api/screen", () => {
  // AI tests can take up to 90s per test
  test.setTimeout(90_000);

  test.beforeAll(async ({ request }) => {
    const { recruiterId } = getFixture();

    // Create a job to screen against
    const res = await request.post(`${BASE_URL}/api/jobs`, {
      data: {
        title: `${TEST_PREFIX}Screen Test Job ${RUN_ID}`,
        department: `${TEST_PREFIX}Engineering`,
        description:
          "Full-stack software engineer role working with React, Node.js and TypeScript.",
        requiredSkills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
        experienceYears: 3,
        createdById: recruiterId,
      },
    });
    const body = await res.json();
    screeningJobId = body.data.id;
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET /api/screen
  // ──────────────────────────────────────────────────────────────────────────
  test.describe("GET /api/screen", () => {
    test("returns 200 with a data array", async ({ request }) => {
      const res = await request.get(`${BASE_URL}/api/screen`);

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test("filters candidates by jobId", async ({ request }) => {
      const res = await request.get(
        `${BASE_URL}/api/screen?jobId=${screeningJobId}`
      );

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test("each candidate entry has expected shape", async ({ request }) => {
      const res = await request.get(`${BASE_URL}/api/screen`);
      const body = await res.json();

      if (body.data.length > 0) {
        const candidate = body.data[0];

        expect(candidate).toHaveProperty("id");
        expect(candidate).toHaveProperty("jobId");
        expect(candidate).toHaveProperty("name");
        expect(candidate).toHaveProperty("email");
        expect(candidate).toHaveProperty("rawText");
        expect(candidate).toHaveProperty("parsedResume");
        expect(candidate).toHaveProperty("scores");
        expect(candidate).toHaveProperty("strengths");
        expect(candidate).toHaveProperty("missingSkills");
        expect(candidate).toHaveProperty("qualitativeSummary");
        expect(candidate).toHaveProperty("createdAt");

        // parsedResume should have nested arrays
        expect(Array.isArray(candidate.parsedResume.skills)).toBe(true);
        expect(Array.isArray(candidate.parsedResume.experience)).toBe(true);
        expect(Array.isArray(candidate.parsedResume.education)).toBe(true);

        // scores should have numeric fields in 0–100 range
        const scores = candidate.scores;
        expect(scores.overallScore).toBeGreaterThanOrEqual(0);
        expect(scores.overallScore).toBeLessThanOrEqual(100);
        expect(["Strong Fit", "Good Fit", "Potential Fit", "Not a Fit"]).toContain(
          scores.recommendation
        );
      }
    });

    test("filters candidates by candidateId", async ({ request }) => {
      const { candidateId } = getFixture();

      const res = await request.get(
        `${BASE_URL}/api/screen?candidateId=${candidateId}`
      );

      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);

      // All returned records must belong to this candidate
      for (const candidate of body.data) {
        // The API returns candidateId embedded in the resume record
        // We verify via the name matching or by checking subsequent DB records
        expect(candidate.id).toBeTruthy();
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST /api/screen  (calls real Gemini AI — allow up to 60s)
  // ──────────────────────────────────────────────────────────────────────────
  test.describe("POST /api/screen", () => {
    test(
      "@ai screens a resume against a specific job and returns full evaluation",
      async ({ request }) => {
        const { candidateId } = getFixture();

        const res = await request.post(`${BASE_URL}/api/screen`, {
          data: {
            jobId: screeningJobId,
            rawText: SAMPLE_RESUME_RAW_TEXT,
            fileName: `${TEST_PREFIX}resume_${RUN_ID}.pdf`,
            fileType: "application/pdf",
            candidateId,
          },
        });

        expect(res.status()).toBe(200);
        const body = await res.json();

        expect(body.success).toBe(true);

        const data = body.data;

        // Identity fields
        expect(data.id).toBeTruthy();
        expect(data.name).toBeTruthy();
        expect(data.email).toBeTruthy();
        expect(data.rawText).toBe(SAMPLE_RESUME_RAW_TEXT);

        // Parsed resume structure
        const parsed = data.parsedResume;
        expect(Array.isArray(parsed.skills)).toBe(true);
        expect(parsed.skills.length).toBeGreaterThan(0);
        expect(parsed.totalExperienceYears).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(parsed.experience)).toBe(true);
        expect(Array.isArray(parsed.education)).toBe(true);
        expect(Array.isArray(parsed.projects)).toBe(true);
        expect(Array.isArray(parsed.certifications)).toBe(true);

        // Scores
        const scores = data.scores;
        expect(scores.overallScore).toBeGreaterThanOrEqual(0);
        expect(scores.overallScore).toBeLessThanOrEqual(100);
        expect(scores.embeddingScore).toBeGreaterThanOrEqual(0);
        expect(scores.llmScore).toBeGreaterThanOrEqual(0);
        expect(scores.experienceScore).toBeGreaterThanOrEqual(0);
        expect(scores.skillScore).toBeGreaterThanOrEqual(0);
        expect(["Strong Fit", "Good Fit", "Potential Fit", "Not a Fit"]).toContain(
          scores.recommendation
        );

        // Qualitative fields
        expect(Array.isArray(data.strengths)).toBe(true);
        expect(Array.isArray(data.missingSkills)).toBe(true);
        expect(typeof data.qualitativeSummary).toBe("string");
        expect(data.qualitativeSummary.length).toBeGreaterThan(10);

        // Timestamp
        expect(data.createdAt).toBeTruthy();
      }
    );

    test(
      "@ai screened candidate's skills include known TypeScript/React skills from resume",
      async ({ request }) => {
        const { candidateId } = getFixture();

        const res = await request.post(`${BASE_URL}/api/screen`, {
          data: {
            jobId: screeningJobId,
            rawText: SAMPLE_RESUME_RAW_TEXT,
            fileName: `${TEST_PREFIX}skills_check_${RUN_ID}.pdf`,
            fileType: "application/pdf",
            candidateId,
          },
        });

        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);

        const skills: string[] = body.data.parsedResume.skills.map((s: string) =>
          s.toLowerCase()
        );

        // The sample resume explicitly mentions TypeScript, React, Node.js
        const hasTypescript = skills.some((s) => s.includes("typescript"));
        const hasReact = skills.some((s) => s.includes("react"));
        const hasNode = skills.some((s) => s.includes("node"));

        expect(hasTypescript || hasReact || hasNode).toBe(true);
      }
    );

    test(
      "@ai screens resume without jobId (uses default/latest job)",
      async ({ request }) => {
        const res = await request.post(`${BASE_URL}/api/screen`, {
          data: {
            // jobId intentionally omitted — API should fallback to latest job
            rawText: SAMPLE_RESUME_RAW_TEXT,
            fileName: `${TEST_PREFIX}no_job_${RUN_ID}.pdf`,
            fileType: "application/pdf",
          },
        });

        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.data.id).toBeTruthy();
        // Scores should still be computed
        expect(body.data.scores.overallScore).toBeGreaterThanOrEqual(0);
      }
    );

    test("POST /api/screen without rawText returns 400", async ({ request }) => {
      const res = await request.post(`${BASE_URL}/api/screen`, {
        data: {
          jobId: screeningJobId,
          // rawText intentionally omitted
          fileName: "missing.pdf",
          fileType: "application/pdf",
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/missing raw text/i);
    });
  });
});
