import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/session";
import { loginUser } from "@/services/auth/login";
import { loginSchema } from "@/utils/validators/login";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message || "Dados invalidos." }, { status: 400 });
  }

  const result = await loginUser(parsed.data.email, parsed.data.password);

  if (result.error || !result.data) {
    return NextResponse.json({ message: result.errorUserMessage, debug: result.debug }, { status: result.status });
  }

  await setSessionCookie(result.data.token, new Date(result.data.expiresAt));

  return NextResponse.json({ user: result.data.user });
}
