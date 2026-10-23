import type { RsvpSubmission } from "@/lib/rsvp-types";

class SupabaseRequestError extends Error {}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new SupabaseRequestError("Supabase server configuration is missing.");
  }

  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

export async function saveRsvp(submission: RsvpSubmission): Promise<void> {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/wedding_rsvps`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    cache: "no-store",
    body: JSON.stringify({
      invitation_id: null,
      guest_name: submission.guestName,
      attending: submission.attending,
      party_names: [],
      contact: submission.contact,
      questions: submission.questions,
      submitted_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new SupabaseRequestError(`Supabase request failed with status ${response.status}.`);
  }
}

export function isSupabaseRequestError(error: unknown): boolean {
  return error instanceof SupabaseRequestError;
}
