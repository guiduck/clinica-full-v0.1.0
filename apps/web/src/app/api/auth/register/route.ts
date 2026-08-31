import { NextResponse } from "next/server";
import { registerUser } from "@/services/auth/register";
import { registerSchema } from "@/utils/validators/register";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Dados invalidos." }, { status: 400 });
  }

  const result = await registerUser(parsed.data);

  if (result.error || !result.data) {
    return NextResponse.json({ message: result.errorUserMessage, debug: result.debug }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: 201 });
}
