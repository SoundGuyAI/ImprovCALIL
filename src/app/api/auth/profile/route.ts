import { NextResponse } from "next/server";
import { getCurrentProfile, updateCurrentProfile } from "@/lib/auth/server";

export async function PATCH(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
    }

    const nextProfile = await updateCurrentProfile(profile, body);
    return NextResponse.json({ profile: nextProfile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
