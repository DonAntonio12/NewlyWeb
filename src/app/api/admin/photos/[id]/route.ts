import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isAdminAuthError, isValidAdminSession } from "@/lib/admin-auth";
import {
  isGuestPhotoNotFoundError,
  isGuestPhotoServiceError,
  reviewGuestPhoto,
} from "@/lib/guest-photos";

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

export async function PATCH(request: Request, context: RouteContext<"/api/admin/photos/[id]">) {
  if (!hasSameOrigin(request)) {
    return jsonResponse({ error: "Please review photos from the admin page." }, 403);
  }

  try {
    const cookieStore = await cookies();

    if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
      return jsonResponse({ error: "Admin sign-in is required." }, 401);
    }

    const { id } = await context.params;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return jsonResponse({ error: "Please choose a valid photo." }, 400);
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);

    if (contentLength > 1_024) {
      return jsonResponse({ error: "The review request is too large." }, 413);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        return jsonResponse({ error: "Please send a valid review request." }, 400);
      }

      throw error;
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("status" in body) ||
      (body.status !== "approved" && body.status !== "rejected")
    ) {
      return jsonResponse({ error: "Choose whether to approve or reject the photo." }, 400);
    }

    await reviewGuestPhoto(id, body.status);

    return jsonResponse({ success: true });
  } catch (error) {
    if (isGuestPhotoNotFoundError(error)) {
      return jsonResponse({ error: "This photo has already been reviewed or no longer exists." }, 404);
    }

    if (isAdminAuthError(error) || isGuestPhotoServiceError(error) || error instanceof TypeError) {
      console.error("Guest photo review could not be saved.", error);
      return jsonResponse({ error: "The photo review could not be updated. Please try again." }, 503);
    }

    throw error;
  }
}
