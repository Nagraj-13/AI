/**
 * E2E Tests: Jobs API — /api/jobs
 *
 * Tests run against the real dev server (localhost:3000) and real DB.
 * No mocking. Uses shared fixture for recruiter ID.
 */

import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { BASE_URL, TEST_PREFIX, TEST_PASSWORD, sampleJobPayload } from "./helpers/api";

const FIXTURE_PATH = path.resolve(__dirname, ".fixture.json");
const RUN_ID = Date.now();

function getFixture(): { recruiterId: string; candidateId: string } {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf-8"));
}

test.describe("GET /api/jobs", () => {
  test("returns 200 with a data array", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/jobs`);

    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("each job has required fields", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/jobs`);
    const body = await res.json();

    if (body.data.length > 0) {
      const job = body.data[0];
      expect(job).toHaveProperty("id");
      expect(job).toHaveProperty("title");
      expect(job).toHaveProperty("department");
      expect(job).toHaveProperty("location");
      expect(job).toHaveProperty("status");
      expect(job).toHaveProperty("candidateCount");
      expect(job).toHaveProperty("avgScore");
      expect(job).toHaveProperty("createdAt");
      // requiredSkills should be an array (split from comma-string)
      expect(Array.isArray(job.requiredSkills)).toBe(true);
    }
  });

  test("GET /api/jobs?createdById filters to only that recruiter's jobs", async ({
    request,
  }) => {
    const { recruiterId } = getFixture();

    // Create a job for this recruiter
    const createRes = await request.post(`${BASE_URL}/api/jobs`, {
      data: {
        title: `${TEST_PREFIX}Filtered Job ${RUN_ID}`,
        department: `${TEST_PREFIX}Dept`,
        description: "Filtered test job description",
        createdById: recruiterId,
      },
    });
    expect(createRes.status()).toBe(200);

    // Fetch only this recruiter's jobs
    const res = await request.get(`${BASE_URL}/api/jobs?createdById=${recruiterId}`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // All returned jobs must have been created by this recruiter
    // (The API doesn't expose createdById directly, but we can verify count > 0
    //  and that our newly created job's title appears)
    const titles = body.data.map((j: any) => j.title);
    expect(titles).toContain(`${TEST_PREFIX}Filtered Job ${RUN_ID}`);
  });

  test("GET /api/jobs?createdById with unknown ID returns empty array", async ({
    request,
  }) => {
    const res = await request.get(
      `${BASE_URL}/api/jobs?createdById=00000000-0000-0000-0000-000000000000`
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });
});

test.describe("POST /api/jobs", () => {
  test("creates a job with all valid fields and returns structured data", async ({
    request,
  }) => {
    const { recruiterId } = getFixture();
    const payload = sampleJobPayload(recruiterId);
    // Make title unique per run
    payload.title = `${TEST_PREFIX}Engineer ${RUN_ID}`;

    const res = await request.post(`${BASE_URL}/api/jobs`, { data: payload });

    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      title: payload.title,
      department: payload.department,
      location: payload.location,
      type: payload.type,
      experienceYears: payload.experienceYears,
      status: "active",
      candidateCount: 0,
      avgScore: 0,
    });

    // requiredSkills must be returned as an array
    expect(Array.isArray(body.data.requiredSkills)).toBe(true);
    expect(body.data.requiredSkills).toContain("TypeScript");
    expect(body.data.requiredSkills).toContain("React");

    expect(body.data.id).toBeTruthy();
    expect(body.data.createdAt).toBeTruthy();
  });

  test("creates a job with default location and type when omitted", async ({
    request,
  }) => {
    const { recruiterId } = getFixture();

    const res = await request.post(`${BASE_URL}/api/jobs`, {
      data: {
        title: `${TEST_PREFIX}Minimal Job ${RUN_ID}`,
        department: `${TEST_PREFIX}Dept`,
        description: "Minimal job description for e2e test",
        createdById: recruiterId,
        // location and type intentionally omitted
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.location).toBe("Remote");
    expect(body.data.type).toBe("Full-Time");
  });

  test("POST /api/jobs without title returns 400", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/jobs`, {
      data: {
        department: "Engineering",
        description: "Missing title",
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/title.*department.*description/i);
  });

  test("POST /api/jobs without department returns 400", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/jobs`, {
      data: {
        title: "Valid Title",
        description: "Missing department",
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/title.*department.*description/i);
  });

  test("POST /api/jobs without description returns 400", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/jobs`, {
      data: {
        title: "Valid Title",
        department: "Engineering",
        // description missing
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/title.*department.*description/i);
  });

  test("requiredSkills passed as array is stored and returned correctly", async ({
    request,
  }) => {
    const { recruiterId } = getFixture();

    const res = await request.post(`${BASE_URL}/api/jobs`, {
      data: {
        title: `${TEST_PREFIX}Skills Job ${RUN_ID}`,
        department: `${TEST_PREFIX}Dept`,
        description: "Skills array test",
        requiredSkills: ["Python", "Django", "PostgreSQL"],
        createdById: recruiterId,
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.requiredSkills).toEqual(
      expect.arrayContaining(["Python", "Django", "PostgreSQL"])
    );
  });
});
