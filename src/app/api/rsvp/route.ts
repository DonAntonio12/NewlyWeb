import { isSupabaseRequestError, saveRsvp } from "@/lib/supabase-rsvp";
import type { RsvpSubmission } from "@/lib/rsvp-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRequest(value: unknown): RsvpSubmission | null {
  if (
    !isRecord(value) ||
    value.action !== "submit" ||
    typeof value.guestName !== "string" ||
    typeof value.attending !== "boolean" ||
    typeof value.contact !== "string" ||
    typeof value.questions !== "string"
  ) {
    return null;
  }

  return {
    guestName: value.guestName,
    attending: value.attending,
    contact: value.contact || null,
    questions: value.questions || null,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return jsonResponse({ error: "Please submit your RSVP from the wedding website." }, 403);
      }
    } catch {
      return jsonResponse({ error: "Please submit your RSVP from the wedding website." }, 403);
    }
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > 8_192) {
    return jsonResponse({ error: "The RSVP request is too large." }, 413);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonResponse({ error: "Please send a valid RSVP request." }, 400);
    }

    throw error;
  }

  const payload = parseRequest(body);

  if (!payload) {
    return jsonResponse({ error: "Please check the RSVP details and try again." }, 400);
  }

  const guestName = payload.guestName.trim();
  const contact = payload.contact?.trim() || null;
  const questions = payload.questions?.trim() || null;

  if (
    guestName.length === 0 ||
    guestName.length > 100 ||
    (contact !== null && contact.length > 150) ||
    (questions !== null && questions.length > 1000)
  ) {
    return jsonResponse({ error: "Please check the RSVP details and try again." }, 400);
  }

  try {
    await saveRsvp({
      guestName,
      attending: payload.attending,
      contact,
      questions,
    });

    return jsonResponse({ success: true });
  } catch (error) {
    if (isSupabaseRequestError(error) || error instanceof TypeError) {
      console.error("RSVP could not be completed.", error);
      return jsonResponse(
        { error: "RSVP service is unavailable. Please try again later." },
        503,
      );
    }

    throw error;
  }
}
