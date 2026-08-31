import { describe, expect, it } from "vitest";
import { loginSchema } from "../../utils/validators/login";
import { registerSchema } from "../../utils/validators/register";

describe("auth validation", () => {
  it("rejects missing login credentials with Portuguese messages", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "",
      rememberMe: false
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected validation to fail");
    }
    expect(result.error.flatten().fieldErrors.email).toContain("Informe seu e-mail.");
    expect(result.error.flatten().fieldErrors.password).toContain("Informe sua senha.");
  });

  it("accepts valid login input", () => {
    const result = loginSchema.safeParse({
      email: "terapeuta@clinica.com.br",
      password: "senha-local",
      rememberMe: true
    });

    expect(result.success).toBe(true);
  });

  it("requires a minimally strong registration password", () => {
    const result = registerSchema.safeParse({
      name: "Dra Ana",
      email: "ana@clinica.com.br",
      password: "123"
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected validation to fail");
    }
    expect(result.error.flatten().fieldErrors.password).toContain("A senha precisa ter pelo menos 8 caracteres.");
  });
});
