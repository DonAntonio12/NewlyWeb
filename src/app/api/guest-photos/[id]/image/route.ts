import {
  getGuestPhotoImage,
  isGuestPhotoNotFoundError,
  isGuestPhotoServiceError,
} from "@/lib/guest-photos";

export async function GET(_request: Request, context: RouteContext<"/api/guest-photos/[id]/image">) {
  const { id } = await context.params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return new Response("Not found.", { status: 404 });
  }

  try {
    const image = await getGuestPhotoImage(id, "approved");

    return new Response(image.body, {
      headers: {
        "Cache-Control": "public, max-age=60",
        "Content-Type": image.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (isGuestPhotoNotFoundError(error)) {
      return new Response("Not found.", { status: 404 });
    }

    if (isGuestPhotoServiceError(error) || error instanceof TypeError) {
      console.error("Approved guest photo could not be loaded.", error);
      return new Response("Photo unavailable.", {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      });
    }

    throw error;
  }
}
