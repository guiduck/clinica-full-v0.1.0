import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveProfessionalProfileAction } from "@/actions/settings";

const requireUserMock = vi.hoisted(() => vi.fn());
const updateUserMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/require-user", () => ({ requireUser: requireUserMock }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { update: updateUserMock } } }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

const validInput = {
  name: "Guilherme Figueiredo",
  email: "gui@example.com",
  cpf: "529.982.247-25",
  specialty: "Psicologia",
  council: "CRP 06/12345",
};

describe("professional account settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1", email: "gui@example.com" });
    updateUserMock.mockResolvedValue({ id: "user-1" });
  });

  it("persists a valid CPF and professional fields for the authenticated owner", async () => {
    const result = await saveProfessionalProfileAction(validInput);

    expect(result.ok).toBe(true);
    expect(updateUserMock).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        name: validInput.name,
        cpf: "52998224725",
        specialty: validInput.specialty,
        council: validInput.council,
      },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/configuracoes");
  });

  it("rejects invalid CPF and email changes without writing", async () => {
    expect((await saveProfessionalProfileAction({ ...validInput, cpf: "123.456.789-01" })).ok).toBe(false);
    expect((await saveProfessionalProfileAction({ ...validInput, email: "other@example.com" })).ok).toBe(false);
    expect(updateUserMock).not.toHaveBeenCalled();
  });
});
