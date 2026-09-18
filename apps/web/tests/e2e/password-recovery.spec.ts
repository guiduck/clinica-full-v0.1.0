import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("/recuperar-senha", () => {
  test("validates input and never reports a fake delivery", async ({ page }) => {
    await page.goto("/recuperar-senha");
    await page.getByRole("button", { name: "Enviar código" }).click();
    await expect(page.getByText("Informe seu e-mail.")).toBeVisible();
    const email = page.getByLabel("E-mail");
    await email.fill("terapeuta@example.com");
    await page.getByRole("button", { name: "Enviar código" }).click();
    await expect(page.getByRole("dialog")).toContainText("Nenhum código foi enviado");
    await expect(page.getByText("Código enviado")).toHaveCount(0);
    await page.getByRole("button", { name: "Entendi" }).click();
    await expect(page.getByRole("button", { name: "Enviar código" })).toBeFocused();
  });
});
