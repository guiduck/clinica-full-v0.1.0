import { expect, test as setup } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const authState = path.resolve(process.cwd(), "../../output/playwright/.auth/user.json");

setup("authenticate with the real e-mail/password boundary", async ({ request }) => {
  await fs.mkdir(path.dirname(authState), { recursive: true });

  const email = process.env.E2E_EMAIL ?? `playwright-shell-${Date.now()}@example.test`;
  const password = process.env.E2E_PASSWORD ?? "senha-segura";

  if (!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD) {
    const registration = await request.post("/api/auth/register", { data: { name: "Profissional Playwright", email, cpf: "52998224725", password, acceptedTerms: true } });
    expect(registration.ok(), "The fallback E2E account must register through the real boundary").toBe(true);
  }

  const response = await request.post("/api/auth/login", {
    data: { email, password }
  });

  expect(response.ok(), "E2E credentials must authenticate through /api/auth/login").toBe(true);
  await request.storageState({ path: authState });
});
