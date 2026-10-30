import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isAdminAuthError, isValidAdminSession } from "@/lib/admin-auth";
import { getAdminRsvps, isSupabaseRsvpListError } from "@/lib/admin-rsvps";

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

    const requestedPage = Number(new URL(request.url).searchParams.get("page") ?? "1");

    if (!Number.isSafeInteger(requestedPage) || requestedPage < 1) {
      return jsonResponse({ error: "Please request a valid RSVP page." }, 400);
    }

    const result = await getAdminRsvps(requestedPage);

    return jsonResponse(result);
  } catch (error) {
    if (isAdminAuthError(error) || isSupabaseRsvpListError(error) || error instanceof TypeError) {
      console.error("Admin RSVPs could not be loaded.", error);
      return jsonResponse({ error: "RSVP service is unavailable. Please try again later." }, 503);
    }

    throw error;
  }
}
