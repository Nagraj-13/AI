/**
 * Global Setup — runs once before the entire test suite.
 *
 * 1. Verify the dev server is reachable.
 * 2. Pre-create the shared test recruiter and candidate accounts
 *    so individual test files can sign in without repeating signup logic.
 * 3. Persist shared IDs to a JSON fixture file that tests can load.
 */

import { request } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import {
  BASE_URL,
  TEST_RECRUITER_EMAIL,
  TEST_CANDIDATE_EMAIL,
  TEST_PASSWORD,
} from "./helpers/api";

export const FIXTURE_PATH = path.resolve(__dirname, ".fixture.json");

async function globalSetup() {
  console.log("\n🔧 [Global Setup] Starting...");

  const ctx = await request.newContext();

  // ─── 1. Verify server is up ─────────────────────────────────────────────
  try {
    const ping = await ctx.get(`${BASE_URL}/api/settings`);
    if (!ping.ok()) {
      throw new Error(`Server returned ${ping.status()}`);
    }
    console.log("  ✅ Dev server is reachable at", BASE_URL);
  } catch (err) {
    throw new Error(
      `[Global Setup] Cannot reach dev server at ${BASE_URL}. ` +
        `Make sure 'npm run dev' is running.\nOriginal error: ${err}`
    );
  }

  // ─── 2. Create shared test recruiter ────────────────────────────────────
  const recruiterRes = await ctx.post(`${BASE_URL}/api/auth`, {
    data: {
      action: "signup",
      email: TEST_RECRUITER_EMAIL,
      password: TEST_PASSWORD,
      name: "E2E Test Recruiter",
      role: "RECRUITER",
    },
  });

  let recruiterId: string;
  if (recruiterRes.status() === 409) {
    // Already exists from a previous run — log in instead
    const loginRes = await ctx.post(`${BASE_URL}/api/auth`, {
      data: { action: "login", email: TEST_RECRUITER_EMAIL, password: TEST_PASSWORD },
    });
    const loginBody = await loginRes.json();
    recruiterId = loginBody.data.id;
    console.log("  ✅ Test recruiter already exists, logged in:", recruiterId);
  } else {
    const body = await recruiterRes.json();
    recruiterId = body.data.id;
    console.log("  ✅ Test recruiter created:", recruiterId);
  }

  // ─── 3. Create shared test candidate ────────────────────────────────────
  const candidateRes = await ctx.post(`${BASE_URL}/api/auth`, {
    data: {
      action: "signup",
      email: TEST_CANDIDATE_EMAIL,
      password: TEST_PASSWORD,
      name: "E2E Test Candidate",
      role: "CANDIDATE",
    },
  });

  let candidateId: string;
  if (candidateRes.status() === 409) {
    const loginRes = await ctx.post(`${BASE_URL}/api/auth`, {
      data: { action: "login", email: TEST_CANDIDATE_EMAIL, password: TEST_PASSWORD },
    });
    const loginBody = await loginRes.json();
    candidateId = loginBody.data.id;
    console.log("  ✅ Test candidate already exists, logged in:", candidateId);
  } else {
    const body = await candidateRes.json();
    candidateId = body.data.id;
    console.log("  ✅ Test candidate created:", candidateId);
  }

  // ─── 4. Persist fixture ─────────────────────────────────────────────────
  const fixture = { recruiterId, candidateId };
  fs.writeFileSync(FIXTURE_PATH, JSON.stringify(fixture, null, 2));
  console.log("  ✅ Fixture written to", FIXTURE_PATH);
  console.log("🔧 [Global Setup] Complete.\n");

  await ctx.dispose();
}

export default globalSetup;
