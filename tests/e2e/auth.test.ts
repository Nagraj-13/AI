/**
 * E2E Tests: Authentication API  — /api/auth
 *
 * Tests run against the real dev server (localhost:3000) and real DB.
 * No mocking. Uses unique timestamped emails to avoid collisions.
 */

import { test, expect } from "@playwright/test";
import { BASE_URL, TEST_PASSWORD } from "./helpers/api";

// Unique email prefix per test run to avoid collision if teardown missed something
const RUN_ID = Date.now();
const email = (label: string) => `e2e_test_auth_${RUN_ID}_${label}@example.com`;

test.describe("POST /api/auth — Signup", () => {
  test("signup as RECRUITER succeeds and returns sanitized user (no password)", async ({
    request,
  }) => {
    const res = await request.post(`${BASE_URL}/api/auth`, {
      data: {
        action: "signup",
        email: email("recruiter"),
        password: TEST_PASSWORD,
        name: "E2E Recruiter",
        role: "RECRUITER",
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.message).toContain("Account created");
    expect(body.data).toMatchObject({
      email: email("recruiter"),
      name: "E2E Recruiter",
      role: "RECRUITER",
    });
    // Password must never be returned
    expect(body.data).not.toHaveProperty("password");
    expect(body.data.id).toBeTruthy();
  });

  test("signup as CANDIDATE succeeds with correct role", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth`, {
      data: {
        action: "signup",
        email: email("candidate"),
        password: TEST_PASSWORD,
        name: "E2E Candidate",
        role: "CANDIDATE",
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.data.role).toBe("CANDIDATE");
    expect(body.data).not.toHaveProperty("password");
  });

  test("signup with duplicate email returns 409 Conflict", async ({ request }) => {
    const dupEmail = email("duplicate");

    // First signup
    await request.post(`${BASE_URL}/api/auth`, {
      data: { action: "signup", email: dupEmail, password: TEST_PASSWORD, name: "First" },
    });

    // Second signup with same email
    const res = await request.post(`${BASE_URL}/api/auth`, {
      data: { action: "signup", email: dupEmail, password: TEST_PASSWORD, name: "Second" },
    });

    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("already exists");
  });

  test("signup without email returns 400 Bad Request", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth`, {
      data: { action: "signup", password: TEST_PASSWORD },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Email is required");
  });

  test("signup with password shorter than 6 chars returns 400", async ({
    request,
  }) => {
    const res = await request.post(`${BASE_URL}/api/auth`, {
      data: {
        action: "signup",
        email: email("shortpwd"),
        password: "abc",
        name: "Short Pwd",
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/at least 6/i);
  });

  test("signup defaults role to RECRUITER when role is omitted", async ({
    request,
  }) => {
    const res = await request.post(`${BASE_URL}/api/auth`, {
      data: {
        action: "signup",
        email: email("norole"),
        password: TEST_PASSWORD,
        name: "No Role User",
        // role intentionally omitted
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.role).toBe("RECRUITER");
  });
});

test.describe("POST /api/auth — Login", () => {
  // Create a fresh user before login tests
  let loginEmail: string;

  test.beforeAll(async ({ request }) => {
    loginEmail = email("loginuser");
    await request.post(`${BASE_URL}/api/auth`, {
      data: {
        action: "signup",
        email: loginEmail,
        password: TEST_PASSWORD,
        name: "Login Test User",
        role: "RECRUITER",
      },
    });
  });

  test("login with correct credentials succeeds", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth`, {
      data: { action: "login", email: loginEmail, password: TEST_PASSWORD },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.message).toContain("Authenticated");
    expect(body.data.email).toBe(loginEmail);
    expect(body.data).not.toHaveProperty("password");
  });

  test("login with wrong password returns 401", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth`, {
      data: { action: "login", email: loginEmail, password: "wrongpassword999" },
    });

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/incorrect password/i);
  });

  test("login with unknown email returns 404", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth`, {
      data: {
        action: "login",
        email: "nobody_exists_e2e@example.com",
        password: TEST_PASSWORD,
      },
    });

    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/no account found/i);
  });

  test("login without providing password returns 400", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth`, {
      data: { action: "login", email: loginEmail },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/password is required/i);
  });

  test("email is normalized to lowercase during login", async ({ request }) => {
    // Mixed-case email should still find the account
    const res = await request.post(`${BASE_URL}/api/auth`, {
      data: {
        action: "login",
        email: loginEmail.toUpperCase(),
        password: TEST_PASSWORD,
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(loginEmail.toLowerCase());
  });
});
