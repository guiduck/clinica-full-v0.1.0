import { NextResponse } from "next/server";
import { getPublicAppUrl } from "@/services/email/email-config";
import { verifyAccountEmail } from "@/services/auth/email-flows";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  try {
    await verifyAccountEmail(token);
    return NextResponse.redirect(`${getPublicAppUrl()}/login?verified=1`);
  } catch {
    return NextResponse.redirect(`${getPublicAppUrl()}/login?verification=invalid`);
  }
}
