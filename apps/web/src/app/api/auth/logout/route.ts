import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { deleteCurrentSession } from "@/lib/auth/session";

export async function POST() {
  await deleteCurrentSession();
  revalidateTag("current-user");

  return NextResponse.json({ ok: true });
}
