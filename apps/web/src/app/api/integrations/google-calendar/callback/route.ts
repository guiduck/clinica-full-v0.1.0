import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getPublicAppUrl } from "@/services/email/email-config";
import { connectGoogleCalendar } from "@/services/integrations/google-calendar";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${getPublicAppUrl()}/login`);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("google_calendar_state")?.value;
  if (!code || !state || !storedState || state !== storedState) return NextResponse.redirect(`${getPublicAppUrl()}/configuracoes?tab=seguranca&calendar=invalid`);
  try {
    await connectGoogleCalendar(user.id, code);
    const response = NextResponse.redirect(`${getPublicAppUrl()}/configuracoes?tab=seguranca&calendar=connected`);
    response.cookies.delete("google_calendar_state");
    return response;
  } catch {
    return NextResponse.redirect(`${getPublicAppUrl()}/configuracoes?tab=seguranca&calendar=failed`);
  }
}
