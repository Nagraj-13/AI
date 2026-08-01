import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 0,
  workers: 1, // Run sequentially to avoid DB race conditions

  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",

  use: {
    baseURL: "http://localhost:3000",
    extraHTTPHeaders: {
      "Content-Type": "application/json",
    },
  },

  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],

  projects: [
    {
      name: "api",
    },
  ],
});
