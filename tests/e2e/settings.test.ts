/**
 * E2E Tests: Settings API — /api/settings
 *
 * Tests run against the real dev server (localhost:3000).
 * Verifies API key connectivity status, storage config, and default weights.
 */

import { test, expect } from "@playwright/test";
import { BASE_URL } from "./helpers/api";

test.describe("GET /api/settings", () => {
  test("returns 200 with success:true", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/settings`);

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test("response has providers, storage, and weights fields", async ({
    request,
  }) => {
    const res = await request.get(`${BASE_URL}/api/settings`);
    const body = await res.json();

    expect(body.data).toHaveProperty("providers");
    expect(body.data).toHaveProperty("storage");
    expect(body.data).toHaveProperty("weights");
  });

  test("Gemini provider has required fields and is connected (GEMINI_API_KEY is set)", async ({
    request,
  }) => {
    const res = await request.get(`${BASE_URL}/api/settings`);
    const body = await res.json();

    const gemini = body.data.providers.gemini;
    expect(gemini).toHaveProperty("name");
    expect(gemini).toHaveProperty("status");
    expect(gemini).toHaveProperty("model");
    expect(gemini).toHaveProperty("embeddingModel");

    // GEMINI_API_KEY is set in .env, so status should be "connected"
    expect(gemini.status).toBe("connected");
    expect(gemini.model).toBe("gemini-2.5-flash");
    expect(gemini.embeddingModel).toBe("text-embedding-004");
  });

  test("Groq provider has required fields and is connected (GROQ_API_KEY is set)", async ({
    request,
  }) => {
    const res = await request.get(`${BASE_URL}/api/settings`);
    const body = await res.json();

    const groq = body.data.providers.groq;
    expect(groq).toHaveProperty("name");
    expect(groq).toHaveProperty("status");
    expect(groq).toHaveProperty("model");

    // GROQ_API_KEY is set in .env, so status should be "connected"
    expect(groq.status).toBe("connected");
    expect(groq.model).toBe("llama-3.3-70b-versatile");
  });

  test("storage provider is reported as active", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/settings`);
    const body = await res.json();

    const storage = body.data.storage;
    expect(storage).toHaveProperty("provider");
    expect(storage).toHaveProperty("status");
    expect(storage.status).toBe("active");
    // R2 is not configured, so it falls back to local disk
    expect(storage.provider).toBe("Local Disk Storage");
  });

  test("default scoring weights match expected values", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/settings`);
    const body = await res.json();

    const weights = body.data.weights;
    expect(weights).toMatchObject({
      embeddingWeight: 0.4,
      llmWeight: 0.4,
      experienceWeight: 0.1,
      skillWeight: 0.1,
    });

    // Weights should sum to 1.0
    const total =
      weights.embeddingWeight +
      weights.llmWeight +
      weights.experienceWeight +
      weights.skillWeight;
    expect(total).toBeCloseTo(1.0, 5);
  });

  test("settings endpoint is publicly accessible (no auth required)", async ({
    request,
  }) => {
    // Hit settings without any auth headers
    const res = await request.get(`${BASE_URL}/api/settings`, {
      headers: {},
    });
    expect(res.status()).toBe(200);
  });
});
