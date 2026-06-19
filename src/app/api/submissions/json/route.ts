import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { FirestoreSubmission } from "@/lib/db";
import Ajv from "ajv";
import schema from "../../../../../docs/event-submission-schema.json";
import { getCurrentProfile } from "@/lib/auth/server";
import { isUserAdmin } from "@/lib/permissions";
import { ValidateFunction } from "ajv";

const ajv = new Ajv();
let validate: ValidateFunction | undefined;

function getValidate() {
  if (!validate) {
    validate = ajv.compile(schema);
  }
  return validate;
}

const MAX_EVENTS_PER_REQUEST = 50;

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    const isProdTestBypass =
      process.env.NODE_ENV === "production" &&
      process.env.E2E_ADMIN_BYPASS_SECRET === "e2e-bypass-secret-12345";

    const devBypass =
      (process.env.NODE_ENV === "development" || isProdTestBypass) &&
      process.env.ALLOW_DEV_BYPASS === "true" &&
      process.env.NEXT_PUBLIC_ADMIN_DEV_UID === "admin-test";
    if (!devBypass && !isUserAdmin(profile)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const validateFn = getValidate();
    const valid = validateFn(body);

    if (!valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validateFn.errors },
        { status: 400 }
      );
    }

    const events = Array.isArray(body) ? body : [body];

    if (events.length > MAX_EVENTS_PER_REQUEST) {
      return NextResponse.json(
        { error: `Batch too large. Maximum ${MAX_EVENTS_PER_REQUEST} events per request.` },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      events.map(async (event) => {
        const payload: Omit<FirestoreSubmission, "id"> = {
          type: "event",
          source: "api_json",
          submitterContact: {
            email: profile?.email || "admin@json-api",
          },
          data: {
            name: event.name,
            type: event.type || "Show",
            organizerId: event.organizerId || "",
            organizerName: event.organizerName,
            description: event.description,
            time: event.time,
            ...(event.endTime !== undefined ? { endTime: event.endTime } : {}),
            recurrence: event.recurrence,
            location: event.location,
            ...(event.mapLink !== undefined ? { mapLink: event.mapLink } : {}),
            region: event.region,
            language: event.language,
            cost: event.cost,
            access: event.access,
            hidden: false,
            featured: false,
          },
          links: event.links || [],
          status: "pending",
          createdAt: Date.now(),
        };
        const db = getAdminFirestore();
        const docRef = db.collection("submissions").doc();
        await docRef.set(payload);
        return docRef.id;
      })
    );

    const submissionIds: string[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        submissionIds.push(result.value);
      } else {
        errors.push(
          `Event at index ${index} failed: ${result.reason instanceof Error ? result.reason.message : String(result.reason ?? "Unknown error")}`
        );
      }
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { success: submissionIds.length > 0, submissionIds, errors },
        { status: submissionIds.length > 0 ? 207 : 500 }
      );
    }

    return NextResponse.json({ success: true, submissionIds }, { status: 201 });
  } catch (error: unknown) {
    console.error("JSON submission error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
