import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ profile: null }, { status: 401 });
  }
}
