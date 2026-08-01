/**
 * Shared constants and helper functions for E2E API tests.
 * All helpers hit the real API routes — no mocking.
 */

import { APIRequestContext } from "@playwright/test";

export const BASE_URL = "http://localhost:3000";

/** Unique prefix so all test-generated records can be bulk-deleted in teardown */
export const TEST_PREFIX = "e2e_test_";

export const TEST_RECRUITER_EMAIL = `${TEST_PREFIX}recruiter@example.com`;
export const TEST_CANDIDATE_EMAIL = `${TEST_PREFIX}candidate@example.com`;
export const TEST_PASSWORD = "testpassword123";

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export async function signupUser(
  request: APIRequestContext,
  email: string,
  password: string,
  name: string,
  role: "RECRUITER" | "CANDIDATE"
) {
  return request.post(`${BASE_URL}/api/auth`, {
    data: { action: "signup", email, password, name, role },
  });
}

export async function loginUser(
  request: APIRequestContext,
  email: string,
  password: string
) {
  return request.post(`${BASE_URL}/api/auth`, {
    data: { action: "login", email, password },
  });
}

// ---------------------------------------------------------------------------
// Jobs helpers
// ---------------------------------------------------------------------------

export async function createJob(
  request: APIRequestContext,
  payload: {
    title: string;
    department: string;
    location?: string;
    type?: string;
    experienceYears?: number;
    requiredSkills?: string[];
    description: string;
    createdById?: string;
  }
) {
  return request.post(`${BASE_URL}/api/jobs`, { data: payload });
}

// ---------------------------------------------------------------------------
// Reusable sample job data
// ---------------------------------------------------------------------------

export function sampleJobPayload(recruiterId: string) {
  return {
    title: `${TEST_PREFIX}Software Engineer`,
    department: `${TEST_PREFIX}Engineering`,
    location: "Remote",
    type: "Full-Time",
    experienceYears: 3,
    requiredSkills: ["TypeScript", "React", "Node.js"],
    description: `${TEST_PREFIX}Build and maintain scalable web applications.`,
    createdById: recruiterId,
  };
}

// ---------------------------------------------------------------------------
// Sample resume raw text (realistic — used for /api/screen POST)
// ---------------------------------------------------------------------------

export const SAMPLE_RESUME_RAW_TEXT = `
John Doe
john.doe@example.com | +1-555-123-4567

SUMMARY
Experienced full-stack software engineer with 5 years building TypeScript/React applications.

SKILLS
TypeScript, React, Node.js, PostgreSQL, Docker, AWS, REST APIs, GraphQL, Git

EXPERIENCE
Senior Software Engineer | Acme Corp | 2022 – Present (2 years)
- Led development of React + Node.js SaaS platform serving 50k users
- Improved API response time by 40% through caching and query optimization

Software Engineer | Beta Solutions | 2021 – 2022 (1 year)
- Built RESTful APIs using Node.js and PostgreSQL
- Implemented CI/CD pipelines with GitHub Actions

Junior Developer | Startup XYZ | 2019 – 2021 (2 years)
- Developed React components and integrated third-party APIs

EDUCATION
B.S. Computer Science | State University | 2019

PROJECTS
Resume Screener: Built an AI-powered resume screening tool using Next.js and Gemini API
Open Source CLI: Published a Node.js CLI tool with 500+ GitHub stars

CERTIFICATIONS
AWS Certified Developer, Google Cloud Professional
`.trim();
