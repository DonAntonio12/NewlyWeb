import { getApprovedGuestPhotos, isGuestPhotoServiceError, uploadGuestPhoto } from "@/lib/guest-photos";

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

export async function GET() {
  try {
    const photos = await getApprovedGuestPhotos();

    return jsonResponse({ photos });
  } catch (error) {
    if (isGuestPhotoServiceError(error) || error instanceof TypeError) {
      console.error("Approved guest photos could not be loaded.", error);
      return jsonResponse({ error: "Guest photos are temporarily unavailable." }, 503);
    }

    throw error;
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return jsonResponse({ error: "Please upload photos from the wedding website." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > 5 * 1024 * 1024 + 32 * 1024) {
    return jsonResponse({ error: "Each photo must be 5 MB or smaller." }, 413);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    if (error instanceof TypeError) {
      return jsonResponse({ error: "The photo could not be read. Please try again." }, 400);
    }

    throw error;
  }

  const file = formData.get("photo");
  const rawGuestName = formData.get("guestName");

  if (
    typeof File === "undefined" ||
    !(file instanceof File) ||
    (rawGuestName !== null && typeof rawGuestName !== "string")
  ) {
    return jsonResponse({ error: "Choose a photo before uploading." }, 400);
  }

  const guestName = typeof rawGuestName === "string" ? rawGuestName.trim() || null : null;

  if (guestName !== null && guestName.length > 80) {
    return jsonResponse({ error: "Names must be 80 characters or fewer." }, 400);
  }

  if (formData.get("consent") !== "on") {
    return jsonResponse({ error: "Please agree to the photo review terms before uploading." }, 400);
  }

  try {
    await uploadGuestPhoto(file, guestName);

    return jsonResponse({ success: true });
  } catch (error) {
    if (isGuestPhotoServiceError(error)) {
      if (
        error.message.startsWith("Upload a valid") ||
        error.message.startsWith("Choose an image")
      ) {
        return jsonResponse({ error: error.message }, 400);
      }

      console.error("Guest photo could not be uploaded.", error);
      return jsonResponse({ error: "The photo could not be uploaded. Please try again later." }, 503);
    }

    if (error instanceof TypeError) {
      console.error("Guest photo could not be uploaded.", error);
      return jsonResponse({ error: "The photo could not be uploaded. Please try again later." }, 503);
    }

    throw error;
  }
}
