import { NextResponse } from "next/server";
import { createSubmission } from "@/lib/db";
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

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    const devBypass = process.env.NEXT_PUBLIC_ADMIN_DEV_UID === "admin-test";
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

    const results = await Promise.allSettled(
      events.map((event) =>
        createSubmission({
          type: "event",
          source: "api_json",
          submitterContact: {
            email: profile?.email || "admin@json-api",
          },
          data: {
            name: event.name,
            type: event.type,
            organizerId: event.organizerId,
            organizerName: event.organizerName,
            description: event.description,
            time: event.time,
            endTime: event.endTime,
            recurrence: event.recurrence,
            location: event.location,
            mapLink: event.mapLink,
            region: event.region,
            language: event.language,
            cost: event.cost,
            access: event.access,
            hidden: false,
            featured: false,
          },
          links: event.links || [],
        })
      )
    );

    const submissionIds: string[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        submissionIds.push(result.value);
      } else {
        errors.push(`Event at index ${index} failed: ${result.reason?.message || "Unknown error"}`);
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal Server Error", message: errorMessage },
      { status: 500 }
    );
  }
}
