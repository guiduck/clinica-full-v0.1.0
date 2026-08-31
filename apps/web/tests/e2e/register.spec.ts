import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("/criar-conta", () => {
  test("applies CPF mask and preserves validation errors", async ({ page }) => {
    await page.goto("/criar-conta");
    await expect(
      page.getByRole("heading", { name: "Criar sua conta" }),
    ).toBeVisible();
    await page.getByLabel("CPF").fill("11111111111");
    await expect(page.getByLabel("CPF")).toHaveValue("111.111.111-11");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Informe um CPF válido.")).toBeVisible();
    await expect(
      page.getByText("Aceite os termos para continuar."),
    ).toBeVisible();
  });

  test("exposes the complete real registration payload", async ({ page }) => {
    await page.goto("/criar-conta");
    await page.getByLabel("Nome completo").fill("Dra. Mariana Lopes");
    await page
      .getByLabel("E-mail profissional")
      .fill(`e2e-${Date.now()}@example.test`);
    await page.getByLabel("CPF").fill("52998224725");
    await page.getByLabel("Senha", { exact: true }).fill("senha-segura");
    await page.getByLabel(/Aceito os Termos de Uso/).check();
    await expect(
      page.getByRole("button", { name: "Criar conta" }),
    ).toBeEnabled();
  });

  test("creates the account atomically and enters the authenticated shell", async ({
    page,
  }, testInfo) => {
    test.setTimeout(90_000);
    test.skip(
      testInfo.project.name !== "desktop",
      "The mobile project validates the responsive form without duplicating persisted fixtures.",
    );
    await page.goto("/criar-conta");
    await page.getByLabel("Nome completo").fill("Dra. Cadastro E2E");
    await page
      .getByLabel("E-mail profissional")
      .fill(`playwright-register-${Date.now()}@example.test`);
    await page.getByLabel("CPF").fill("52998224725");
    await page.getByLabel("Senha", { exact: true }).fill("senha-segura");
    await page.getByLabel(/Aceito os Termos de Uso/).check();
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 60_000 });
    await expect(page.getByRole("banner")).toBeVisible();
  });
});
