import { test, expect } from "./fixtures/clinica-fixture";

test("guided onboarding spotlights real controls and resumes through Settings", async ({
  authenticatedPage: page,
}, testInfo) => {
  test.setTimeout(60_000);
  const tour = page.locator('[aria-labelledby="onboarding-title"]');
  if (await tour.isVisible())
    await page.getByRole("button", { name: "Pular" }).click();

  const accountTrigger = page.locator("#tour-user-menu");
  await accountTrigger.click();
  await page.getByRole("menuitem", { name: "Reiniciar tutorial" }).click();
  await expect(page).toHaveURL(/tourStep=1/);
  await expect(tour).toContainText("Passo 1 de 16");

  await page.getByRole("button", { name: "Próximo" }).click();
  await expect(tour).toContainText("Passo 2 de 16");
  const dimLayer = page.getByTestId("onboarding-dim-layer");
  await expect(dimLayer).toHaveCSS(
    "clip-path",
    /polygon/,
  );
  await expect(dimLayer).toHaveCSS("transition-property", /clip-path/);
  await expect(tour).toHaveCSS("transition-property", /left/);
  await page.getByRole("button", { name: "Próximo" }).click();
  await expect(tour).toContainText("Passo 3 de 16");
  await expect
    .poll(async () => {
      const arrow = await page.getByTestId("onboarding-arrow").boundingBox();
      const target = await page.locator("#tour-notifications").boundingBox();
      if (!arrow || !target) return Number.POSITIVE_INFINITY;
      const arrowCenter = arrow.x + arrow.width / 2;
      const targetCenter = target.x + target.width / 2;
      return Math.abs(arrowCenter - targetCenter);
    })
    .toBeLessThan(2);
  await page.getByRole("button", { name: "Próximo" }).click();
  await expect(tour).toContainText("Passo 4 de 16");

  const menuTrigger =
    testInfo.project.name === "mobile"
      ? page.locator("#tour-sidebar-toggle-mobile")
      : page.locator("#tour-sidebar-toggle");
  await menuTrigger.click();
  await expect(tour).toContainText("Passo 5 de 16");
  await expect(page.locator("#tour-nav-pacientes")).toBeVisible();
  await page.getByRole("button", { name: "Próximo" }).click();
  await expect(tour).toContainText("Passo 6 de 16");
  await page.getByRole("button", { name: "Próximo" }).click();
  await expect(tour).toContainText("Passo 7 de 16");
  await page.getByRole("button", { name: "Próximo" }).click();
  await expect(tour).toContainText("Passo 8 de 16");

  await accountTrigger.click();
  await expect(tour).toContainText("Passo 9 de 16");
  await expect(tour).toHaveAttribute(
    "data-placement",
    testInfo.project.name === "mobile" ? "center" : "left",
  );
  await page.getByRole("menuitem", { name: "Configurações" }).click();
  await expect(page).toHaveURL(/\/configuracoes\?tourStep=10/);
  await expect(tour).toContainText("Passo 10 de 16");

  const next = page.getByRole("button", { name: "Próximo" });
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await page.getByLabel("CPF *").fill("52998224725");
  await expect(next).toHaveAttribute("aria-disabled", "false");
  await next.click();
  await expect(tour).toContainText("Passo 11 de 16");
  await page.locator("#tour-settings-account-save").click();
  await expect(tour).toContainText("Passo 12 de 16");
  await expect(page.getByText("Nada foi salvo.")).toBeVisible();
  await next.click();
  await expect(tour).toContainText("Passo 13 de 16");
  await page.locator("#tour-settings-tab-contato").click();
  await expect(tour).toContainText("Passo 14 de 16");

  await page.getByLabel("Telefone / WhatsApp *").fill("11987654321");
  await page.getByLabel("Logradouro *").fill("Rua das Flores, 100");
  await page.getByLabel("Cidade *").fill("São Paulo");
  await page.getByLabel("UF *").fill("SP");
  await page.getByLabel("CEP *").fill("01310100");
  await next.click();
  await expect(tour).toContainText("Passo 15 de 16");
  await page.locator("#tour-settings-save").click();
  await expect(tour).toContainText("Passo 16 de 16");
  await page.getByRole("button", { name: "Concluir" }).click();
  await expect(tour).not.toBeVisible();
  await expect(page).not.toHaveURL(/tourStep=/);
});
