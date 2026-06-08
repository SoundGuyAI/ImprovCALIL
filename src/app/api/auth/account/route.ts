import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/constants";
import { deleteCurrentAccount, getCurrentProfile } from "@/lib/auth/server";

export async function DELETE(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { email?: unknown };
    await deleteCurrentAccount(profile, body.email);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(AUTH_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    response.cookies.set("improv_cal_il_logged_in", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete account";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
