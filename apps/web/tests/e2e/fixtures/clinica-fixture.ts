import { expect, test as base, type Page } from "@playwright/test";

type ClinicaFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<ClinicaFixtures>({
  authenticatedPage: async ({ page }, provide) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await provide(page);
  }
});

export { expect };
