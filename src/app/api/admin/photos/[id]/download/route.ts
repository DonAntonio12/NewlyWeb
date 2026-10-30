import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isAdminAuthError, isValidAdminSession } from "@/lib/admin-auth";
import {
  getGuestPhotoImage,
  isGuestPhotoNotFoundError,
  isGuestPhotoServiceError,
} from "@/lib/guest-photos";

const PHOTO_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getFileExtension(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      throw new Error("Unsupported guest photo content type.");
  }
}

export async function GET(
  _request: Request,
  context: RouteContext<"/api/admin/photos/[id]/download">,
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

    if (!PHOTO_ID_PATTERN.test(id)) {
      return new Response("Not found.", { status: 404 });
    }

    const image = await getGuestPhotoImage(id, "all");

    return new Response(image.body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="guest-photo-${id}.${getFileExtension(image.contentType)}"`,
        "Content-Type": image.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (isGuestPhotoNotFoundError(error)) {
      return new Response("Not found.", { status: 404 });
    }

    if (isAdminAuthError(error) || isGuestPhotoServiceError(error) || error instanceof TypeError) {
      console.error("Guest photo download could not be completed.", error);
      return new Response("Photo download unavailable.", {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      });
    }

    throw error;
  }
}
