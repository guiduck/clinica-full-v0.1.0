import { defineConfig } from "@playwright/test";
import path from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const playwrightOutput = path.resolve(__dirname, "../../output/playwright");
const authState = path.join(playwrightOutput, ".auth/user.json");

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: path.join(playwrightOutput, "test-results"),
  fullyParallel: false,
  // The authenticated projects intentionally share one real user and persisted
  // onboarding/preferences. Serial execution prevents one flow from skipping or
  // completing another flow's tour while still exercising the production state.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { outputFolder: path.join(playwrightOutput, "report"), open: "never" }]],
  use: {
    baseURL,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "auth-setup",
      testMatch: /auth\.setup\.ts/
    },
    {
      name: "desktop",
      dependencies: ["auth-setup"],
      testIgnore: /auth\.setup\.ts/,
      use: { storageState: authState, viewport: { width: 1440, height: 900 } }
    },
    {
      name: "mobile",
      // Shell/onboarding state is persisted per user. Run the two viewport gates
      // sequentially so they never race on the same preference or session row.
      dependencies: ["desktop"],
      testIgnore: /auth\.setup\.ts/,
      use: { storageState: authState, viewport: { width: 390, height: 844 } }
    }
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe"
  }
});
