import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isAdminAuthError, isValidAdminSession } from "@/lib/admin-auth";
import { getAdminGuestPhotos, isGuestPhotoServiceError } from "@/lib/guest-photos";

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
      return jsonResponse({ error: "Admin sign-in is required." }, 401);
    }

    const pageValue = new URL(request.url).searchParams.get("page") ?? "1";
    const page = Number(pageValue);

    if (!/^[1-9]\d*$/.test(pageValue) || !Number.isSafeInteger(page)) {
      return jsonResponse({ error: "Choose a valid photo gallery page." }, 400);
    }

    const offset = (page - 1) * 60;

    if (!Number.isSafeInteger(offset)) {
      return jsonResponse({ error: "Choose a valid photo gallery page." }, 400);
    }

    const { photos, hasMore } = await getAdminGuestPhotos(offset);

    return jsonResponse({ photos, hasMore });
  } catch (error) {
    if (isAdminAuthError(error) || isGuestPhotoServiceError(error) || error instanceof TypeError) {
      console.error("Guest photo moderation queue could not be loaded.", error);
      return jsonResponse({ error: "Guest photos are temporarily unavailable." }, 503);
    }

    throw error;
  }
}
