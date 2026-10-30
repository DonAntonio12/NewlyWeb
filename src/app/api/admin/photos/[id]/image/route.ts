import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isAdminAuthError, isValidAdminSession } from "@/lib/admin-auth";
import {
  getGuestPhotoImage,
  isGuestPhotoNotFoundError,
  isGuestPhotoServiceError,
} from "@/lib/guest-photos";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/admin/photos/[id]/image">,
) {
  try {
    const cookieStore = await cookies();

    if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
      return new Response("Admin sign-in is required.", {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const { id } = await context.params;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return new Response("Not found.", { status: 404 });
    }

    const image = await getGuestPhotoImage(id, "all");

    return new Response(image.body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": image.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (isGuestPhotoNotFoundError(error)) {
      return new Response("Not found.", { status: 404 });
    }

    if (isAdminAuthError(error) || isGuestPhotoServiceError(error) || error instanceof TypeError) {
      console.error("Guest photo preview could not be loaded.", error);
      return new Response("Photo unavailable.", {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      });
    }

    throw error;
  }
}
