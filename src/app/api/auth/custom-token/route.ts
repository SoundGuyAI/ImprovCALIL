import { NextResponse } from "next/server";
import { createCustomTokenForCurrentProfile } from "@/lib/auth/server";

export async function GET() {
  try {
    const customToken = await createCustomTokenForCurrentProfile();
    if (!customToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ customToken });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
