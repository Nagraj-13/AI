/**
 * Screenshot Script for AI Resume Screening Platform
 * Captures all key pages/flows for the README documentation.
 *
 * Run with: node --experimental-vm-modules scripts/take-screenshots.mjs
 * Or:       npx playwright --version && node scripts/take-screenshots.mjs
 */

import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "http://localhost:3000";
const OUT_DIR = path.resolve(__dirname, "../docs/screenshots");

// Ensure output directory exists
fs.mkdirSync(OUT_DIR, { recursive: true });

async function shot(page, name, description) {
  const filePath = path.join(OUT_DIR, `${name}.png`);
  await page.waitForTimeout(1200); // let animations settle
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  📸 ${name}.png  — ${description}`);
  return filePath;
}

async function main() {
  console.log("\n🎬 Starting screenshot capture...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // ── 1. Landing Page ──────────────────────────────────────────────────────
  console.log("📄 Step 1: Landing Page");
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await shot(page, "01_landing_page", "Home / Landing Page");

  // ── 2. Auth Page (default — Sign In) ─────────────────────────────────────
  console.log("📄 Step 2: Auth — Sign In");
  await page.goto(`${BASE_URL}/auth`, { waitUntil: "networkidle" });
  await shot(page, "02_signin_page", "Sign In Page");

  // ── 3. Auth Page — Sign Up tab ────────────────────────────────────────────
  console.log("📄 Step 3: Auth — Sign Up");
  // Try clicking a "Sign Up" / "Create Account" / "Register" tab or link
  const signupSelectors = [
    "text=Sign Up",
    "text=Create Account",
    "text=Register",
    "text=signup",
    "[data-tab='signup']",
    "button:has-text('Sign Up')",
  ];
  for (const sel of signupSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1000 })) {
        await el.click();
        await page.waitForTimeout(500);
        break;
      }
    } catch {}
  }
  await shot(page, "03_signup_page", "Sign Up / Create Account Page");

  // ── 4. Recruiter Dashboard ────────────────────────────────────────────────
  console.log("📄 Step 4: Recruiter Dashboard");
  // Inject a recruiter session into localStorage so we can see the dashboard
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.setItem(
      "user_session",
      JSON.stringify({
        id: "demo-recruiter-id",
        name: "Demo Recruiter",
        email: "demo.recruiter@company.com",
        role: "RECRUITER",
      })
    );
  });
  await page.goto(`${BASE_URL}/recruiter/dashboard`, { waitUntil: "networkidle" });
  await shot(page, "04_recruiter_dashboard", "Recruiter Dashboard — Job Postings");

  // ── 5. Post a New Job (modal or page) ─────────────────────────────────────
  console.log("📄 Step 5: Create Job Position");
  // Click "Post Job" / "Create Job" / "Add Position" button
  const postJobSelectors = [
    "text=Post a Job",
    "text=Post Job",
    "text=Create Job",
    "text=Add Position",
    "text=New Job",
    "button:has-text('Post')",
  ];
  for (const sel of postJobSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1500 })) {
        await el.click();
        await page.waitForTimeout(800);
        break;
      }
    } catch {}
  }
  await shot(page, "05_create_job_form", "Create New Job Position Form");

  // ── 6. Close modal / navigate back to recruiter dashboard ─────────────────
  // Press Escape to close any open modal
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // ── 7. Candidate Screening / Resume Upload ────────────────────────────────
  console.log("📄 Step 6: Candidate Screening");
  await page.goto(`${BASE_URL}/recruiter/dashboard`, { waitUntil: "networkidle" });
  // Look for a "Screen Candidates" / "View Candidates" / "Upload" link
  const screenSelectors = [
    "text=Screen Candidates",
    "text=Candidates",
    "text=View Candidates",
    "text=Upload Resume",
    "text=Screening",
    "a[href*='screen']",
    "a[href*='candidate']",
  ];
  for (const sel of screenSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1500 })) {
        await el.click();
        await page.waitForTimeout(1000);
        await page.waitForLoadState("networkidle");
        break;
      }
    } catch {}
  }
  await shot(page, "06_screening_hub", "Candidate Screening Hub");

  // ── 8. Candidate Dashboard ────────────────────────────────────────────────
  console.log("📄 Step 7: Candidate Dashboard");
  await page.evaluate(() => {
    localStorage.setItem(
      "user_session",
      JSON.stringify({
        id: "demo-candidate-id",
        name: "Jane Doe",
        email: "jane.doe@university.edu",
        role: "CANDIDATE",
      })
    );
  });
  await page.goto(`${BASE_URL}/candidate/dashboard`, { waitUntil: "networkidle" });
  await shot(page, "07_candidate_dashboard", "Candidate Dashboard — My Applications");

  // ── 9. Jobs Browse Page ───────────────────────────────────────────────────
  console.log("📄 Step 8: Browse Jobs");
  await page.goto(`${BASE_URL}/jobs`, { waitUntil: "networkidle" });
  await shot(page, "08_jobs_browse", "Browse Open Job Positions");

  // ── 10. Settings Page ─────────────────────────────────────────────────────
  console.log("📄 Step 9: Settings");
  await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
  await shot(page, "09_settings_page", "Settings — AI Providers & Scoring Weights");

  // ─────────────────────────────────────────────────────────────────────────
  await browser.close();

  console.log(`\n✅ All screenshots saved to: ${OUT_DIR}\n`);
  console.log("Screenshots captured:");
  fs.readdirSync(OUT_DIR)
    .filter((f) => f.endsWith(".png"))
    .forEach((f) => console.log(`  → docs/screenshots/${f}`));
}

main().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
