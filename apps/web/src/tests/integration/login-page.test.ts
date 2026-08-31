import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loginSchema } from "../../utils/validators/login";

const loginCardSource = readFileSync(join(process.cwd(), "src/components/marketing/login-card.tsx"), "utf8");

describe("login behavior", () => {
  it("uses the real server action login flow", () => {
    expect(loginCardSource).toContain("loginAndSetSession");
    expect(loginSchema.safeParse({ email: "user@example.com", password: "12345678" }).success).toBe(true);
  });

  it("does not store credentials on the client", () => {
    expect(loginCardSource).not.toMatch(/\blocalStorage\b|\bsessionStorage\b/);
    expect(loginCardSource).not.toMatch(/\bconsole\./);
  });
});
