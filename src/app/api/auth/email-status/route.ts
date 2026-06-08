import { NextResponse } from "next/server";
import {
  checkEmailLookupRateLimit,
  getEmailLookupClientKey,
} from "@/lib/auth/email-lookup-rate-limit";
import { getAdminAuth } from "@/lib/firebase-admin";

type EmailStatus = "password" | "register" | "googleOnly";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown };
    if (typeof body.email !== "string" || body.email.trim().length === 0) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const email = body.email.trim();
    const rateLimit = checkEmailLookupRateLimit(getEmailLookupClientKey(request), email);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many email lookups",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const user = await getAdminAuth()
      .getUserByEmail(email)
      .catch((error: unknown) => {
        if (isFirebaseUserNotFound(error)) {
          return null;
        }
        throw error;
      });

    if (!user) {
      return NextResponse.json({ status: "register" satisfies EmailStatus });
    }

    const providerIds = user.providerData.map((provider) => provider.providerId);
    const status: EmailStatus = providerIds.includes("password") ? "password" : "googleOnly";

    return NextResponse.json({ status });
  } catch (error) {
    console.error("Auth email status lookup failed", error);
    return NextResponse.json({ error: "Unable to look up email status" }, { status: 500 });
  }
}

function isFirebaseUserNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return (error as { code?: unknown }).code === "auth/user-not-found";
}
