import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_DURATION_SECONDS,
  createAdminSession,
  isAdminAuthError,
  verifyAdminPassword,
} from "@/lib/admin-auth";

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return jsonResponse({ error: "Please sign in from the admin page." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > 8_192) {
    return jsonResponse({ error: "The sign-in request is too large." }, 413);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonResponse({ error: "Please enter the admin password." }, 400);
    }

    throw error;
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("password" in body) ||
    typeof body.password !== "string" ||
    body.password.length > 1_024
  ) {
    return jsonResponse({ error: "Please enter the admin password." }, 400);
  }

  try {
    if (!verifyAdminPassword(body.password)) {
      return jsonResponse({ error: "Incorrect admin password." }, 401);
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_DURATION_SECONDS,
    });

    return jsonResponse({ success: true });
  } catch (error) {
    if (isAdminAuthError(error)) {
      console.error("Admin authentication is not configured securely.", error);
      return jsonResponse({ error: "Admin sign-in is not configured." }, 503);
    }

    throw error;
  }
}

export async function DELETE(request: Request) {
  if (!hasSameOrigin(request)) {
    return jsonResponse({ error: "Please sign out from the admin page." }, 403);
  }

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);

  return jsonResponse({ success: true });
}
