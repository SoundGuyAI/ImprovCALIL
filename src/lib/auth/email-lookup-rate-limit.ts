export const EMAIL_LOOKUP_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
export const EMAIL_LOOKUP_UNIQUE_EMAIL_LIMIT = 10;
export const EMAIL_LOOKUP_REQUEST_LIMIT = 30;
export const EMAIL_LOOKUP_UNKNOWN_CLIENT_REQUEST_LIMIT = 5;
export const EMAIL_LOOKUP_UNKNOWN_CLIENT_UNIQUE_EMAIL_LIMIT = 2;

interface EmailLookupAttempt {
  email: string;
  timestamp: number;
}

interface EmailLookupRateLimitState {
  attempts: Map<string, EmailLookupAttempt[]>;
}

export interface EmailLookupRateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const globalRateLimitState = globalThis as typeof globalThis & {
  __impcalEmailLookupRateLimit?: EmailLookupRateLimitState;
};

function getRateLimitState(): EmailLookupRateLimitState {
  globalRateLimitState.__impcalEmailLookupRateLimit ??= {
    attempts: new Map<string, EmailLookupAttempt[]>(),
  };

  return globalRateLimitState.__impcalEmailLookupRateLimit;
}

export function checkEmailLookupRateLimit(
  clientKey: string,
  email: string,
  now = Date.now()
): EmailLookupRateLimitResult {
  const state = getRateLimitState();
  const windowStart = now - EMAIL_LOOKUP_RATE_LIMIT_WINDOW_MS;
  const normalizedEmail = email.trim().toLowerCase();
  const recentAttempts = (state.attempts.get(clientKey) ?? []).filter(
    (attempt) => attempt.timestamp > windowStart
  );
  const uniqueEmails = new Set(recentAttempts.map((attempt) => attempt.email));
  const wouldAddUniqueEmail = normalizedEmail.length > 0 && !uniqueEmails.has(normalizedEmail);
  const isUnknownClient = clientKey === "unknown-client";
  const requestLimit = isUnknownClient
    ? EMAIL_LOOKUP_UNKNOWN_CLIENT_REQUEST_LIMIT
    : EMAIL_LOOKUP_REQUEST_LIMIT;
  const uniqueEmailLimit = isUnknownClient
    ? EMAIL_LOOKUP_UNKNOWN_CLIENT_UNIQUE_EMAIL_LIMIT
    : EMAIL_LOOKUP_UNIQUE_EMAIL_LIMIT;
  const exceedsRequestLimit = recentAttempts.length >= requestLimit;
  const exceedsUniqueEmailLimit = uniqueEmails.size >= uniqueEmailLimit && wouldAddUniqueEmail;

  if (exceedsRequestLimit || exceedsUniqueEmailLimit) {
    const oldestRelevantAttempt = recentAttempts
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)[0];
    const retryAfterMs = oldestRelevantAttempt
      ? Math.max(0, oldestRelevantAttempt.timestamp + EMAIL_LOOKUP_RATE_LIMIT_WINDOW_MS - now)
      : EMAIL_LOOKUP_RATE_LIMIT_WINDOW_MS;

    state.attempts.set(clientKey, recentAttempts);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  recentAttempts.push({ email: normalizedEmail, timestamp: now });
  state.attempts.set(clientKey, recentAttempts);

  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetEmailLookupRateLimitForTests(): void {
  globalRateLimitState.__impcalEmailLookupRateLimit = {
    attempts: new Map<string, EmailLookupAttempt[]>(),
  };
}

export function getEmailLookupClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || realIp || cfIp || vercelIp || "unknown-client";
}
