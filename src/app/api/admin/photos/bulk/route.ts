import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isAdminAuthError, isValidAdminSession } from "@/lib/admin-auth";
import { isGuestPhotoServiceError, reviewGuestPhotos } from "@/lib/guest-photos";

const PHOTO_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BULK_PHOTOS = 500;

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

export async function PATCH(request: Request) {
  if (!hasSameOrigin(request)) {
    return jsonResponse({ error: "Please review photos from the admin page." }, 403);
  }

  try {
    const cookieStore = await cookies();

    if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
      return jsonResponse({ error: "Admin sign-in is required." }, 401);
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);

    if (contentLength > 64 * 1024) {
      return jsonResponse({ error: "The bulk review request is too large." }, 413);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        return jsonResponse({ error: "Please send a valid bulk review request." }, 400);
      }

      throw error;
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("status" in body) ||
      (body.status !== "approved" && body.status !== "rejected") ||
      !("ids" in body) ||
      !Array.isArray(body.ids) ||
      body.ids.length === 0 ||
      body.ids.length > MAX_BULK_PHOTOS ||
      !body.ids.every((id: unknown) => typeof id === "string" && PHOTO_ID_PATTERN.test(id)) ||
      new Set(body.ids).size !== body.ids.length
    ) {
      return jsonResponse({ error: "Select valid photos and choose approve or reject." }, 400);
    }

    const ids = await reviewGuestPhotos(body.ids, body.status);

    return jsonResponse({ ids });
  } catch (error) {
    if (isAdminAuthError(error) || isGuestPhotoServiceError(error) || error instanceof TypeError) {
      console.error("Bulk guest photo review could not be saved.", error);
      return jsonResponse({ error: "The selected photo reviews could not be updated." }, 503);
    }

    throw error;
  }
}
