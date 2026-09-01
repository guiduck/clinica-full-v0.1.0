import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = resolve(process.cwd(), "src");

describe("frontend architecture contract", () => {
  it("uses component-scoped folders with explicit public entry points", () => {
    expect(existsSync(resolve(sourceRoot, "components/appShell/index.tsx"))).toBe(true);
    expect(existsSync(resolve(sourceRoot, "components/onboardingTour/index.tsx"))).toBe(true);
    expect(existsSync(resolve(sourceRoot, "components/tooltip/index.tsx"))).toBe(true);
    const legacyAppShell = resolve(sourceRoot, "components/app-shell");
    const legacyFiles = existsSync(legacyAppShell) ? readdirSync(legacyAppShell) : [];
    expect(legacyFiles).toHaveLength(0);
    expect(existsSync(resolve(sourceRoot, "components/ui/tooltip.tsx"))).toBe(false);
  });

  it("does not use a global CustomEvent bus in the migrated components", () => {
    const files = [
      "components/appShell/index.tsx",
      "components/appShell/app-header.tsx",
      "components/appShell/user-menu.tsx",
      "components/onboardingTour/index.tsx",
      "components/settings/settings-page.tsx",
    ];

    for (const file of files) {
      const source = readFileSync(resolve(sourceRoot, file), "utf8");
      expect(source).not.toContain("CustomEvent");
      expect(source).not.toContain("dispatchEvent");
    }
  });
});
