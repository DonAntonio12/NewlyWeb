import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "wedding_admin_session";
export const ADMIN_SESSION_DURATION_SECONDS = 12 * 60 * 60;

class AdminAuthError extends Error {}

function getAdminConfig() {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!password || password.length < 12 || !sessionSecret || sessionSecret.length < 32) {
    throw new AdminAuthError("Admin authentication is not configured securely.");
  }

  return { password, sessionSecret };
}

function createSignature(expiresAt: string, sessionSecret: string) {
  return createHmac("sha256", sessionSecret).update(expiresAt).digest("base64url");
}

export function isAdminAuthError(error: unknown): boolean {
  return error instanceof AdminAuthError;
}

export function verifyAdminPassword(candidate: string): boolean {
  const { password } = getAdminConfig();
  const candidateHash = createHash("sha256").update(candidate).digest();
  const passwordHash = createHash("sha256").update(password).digest();

  return timingSafeEqual(candidateHash, passwordHash);
}

export function createAdminSession(): string {
  const { sessionSecret } = getAdminConfig();
  const expiresAt = String(Math.floor(Date.now() / 1000) + ADMIN_SESSION_DURATION_SECONDS);

  return `${expiresAt}.${createSignature(expiresAt, sessionSecret)}`;
}

export function isValidAdminSession(session: string | undefined): boolean {
  if (!session) {
    return false;
  }

  const [expiresAt, signature, ...extra] = session.split(".");

  if (
    extra.length > 0 ||
    !/^\d+$/.test(expiresAt ?? "") ||
    !/^[A-Za-z0-9_-]{43}$/.test(signature ?? "")
  ) {
    return false;
  }

  const expiry = Number(expiresAt);

  if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const { sessionSecret } = getAdminConfig();
  const expected = Buffer.from(createSignature(expiresAt, sessionSecret));
  const received = Buffer.from(signature);

  return expected.length === received.length && timingSafeEqual(expected, received);
}
