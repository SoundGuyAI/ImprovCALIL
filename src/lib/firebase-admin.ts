import "server-only";

import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";

interface ServiceAccountConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function getPrivateKey(): string | undefined {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function getProjectId(): string | undefined {
  return (
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    process.env.GOOGLE_CLOUD_PROJECT ??
    process.env.GCLOUD_PROJECT
  );
}

function normalizeServiceAccount(raw: unknown): ServiceAccountConfig | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const projectId = record.project_id ?? record.projectId ?? getProjectId();
  const clientEmail = record.client_email ?? record.clientEmail;
  const privateKey = record.private_key ?? record.privateKey;

  if (
    typeof projectId !== "string" ||
    typeof clientEmail !== "string" ||
    typeof privateKey !== "string"
  ) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

function readServiceAccountJson(value: string | undefined): ServiceAccountConfig | null {
  if (!value) {
    return null;
  }

  try {
    return normalizeServiceAccount(JSON.parse(value));
  } catch {
    return null;
  }
}

function readServiceAccountFile(): ServiceAccountConfig | null {
  const secretPath = path.resolve(process.cwd(), ".secrets", "firebase-admin.json");
  if (!fs.existsSync(secretPath)) {
    return null;
  }

  const contents = fs.readFileSync(secretPath, "utf8").trim();
  if (!contents) {
    return null;
  }

  try {
    return normalizeServiceAccount(JSON.parse(contents));
  } catch {
    throw new Error("Firebase Admin service account file is not valid JSON.");
  }
}

function getServiceAccountConfig(): ServiceAccountConfig | null {
  const envServiceAccount = readServiceAccountJson(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  if (envServiceAccount) {
    return envServiceAccount;
  }

  const fileServiceAccount = readServiceAccountFile();
  if (fileServiceAccount) {
    return fileServiceAccount;
  }

  const projectId = getProjectId();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();
  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return { projectId, clientEmail, privateKey };
}

function initializeAdminApp(): App {
  const existing = getApps()[0];
  if (existing) {
    return existing;
  }

  const serviceAccount = getServiceAccountConfig();
  if (serviceAccount) {
    return initializeApp({
      credential: cert({
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
        privateKey: serviceAccount.privateKey,
      }),
    });
  }

  const projectId = getProjectId();

  if (!projectId) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID."
    );
  }

  process.env.GOOGLE_CLOUD_QUOTA_PROJECT ??= projectId;

  return initializeApp({
    credential: applicationDefault(),
    projectId,
  });
}

export function getAdminAuth(): Auth {
  return getAuth(initializeAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(initializeAdminApp());
}
