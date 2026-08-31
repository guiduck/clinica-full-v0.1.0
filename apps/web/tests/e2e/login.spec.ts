import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("/login", () => {
  test("validates fields and keeps Google explicitly unavailable", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Entrar na sua conta" })).toBeVisible();
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page.getByText("Informe seu e-mail.")).toBeVisible();
    const google = page.getByRole("button", { name: "Continuar com Google" });
    await google.click();
    await expect(page.getByRole("dialog")).toContainText("ainda não está disponível");
    await page.getByRole("button", { name: "Entendi" }).click();
    await expect(google).toBeFocused();
  });

  test("supports keyboard flow and password visibility", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("E-mail").fill("terapeuta@example.com");
    await page.getByLabel("Senha", { exact: true }).fill("senha-segura");
    await page.getByRole("button", { name: "Mostrar senha" }).click();
    await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute("type", "text");
    await page.getByLabel("Lembrar de mim neste dispositivo").check();
  });

  test("authenticates through the real e-mail/password boundary", async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    test.skip(testInfo.project.name !== "desktop", "The mobile project covers the same form without creating duplicate database fixtures.");
    const email = `playwright-login-${Date.now()}@example.test`;
    const password = "senha-segura";
    const registration = await page.request.post("/api/auth/register", { data: { name: "Profissional E2E", email, cpf: "52998224725", password, acceptedTerms: true } });
    expect(registration.ok()).toBe(true);
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });
  });
});
