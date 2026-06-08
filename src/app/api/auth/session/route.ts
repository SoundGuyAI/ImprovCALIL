import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE, AUTH_SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { createSessionAndProfile } from "@/lib/auth/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idToken?: unknown;
      locale?: unknown;
      profile?: unknown;
    };
    if (typeof body.idToken !== "string" || body.idToken.length === 0) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    const { sessionCookie, profile } = await createSessionAndProfile(
      body.idToken,
      body.locale,
      body.profile && typeof body.profile === "object" ? body.profile : undefined
    );
    const response = NextResponse.json({ profile });
    response.cookies.set(AUTH_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth session creation failed", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
