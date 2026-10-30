export type AdminRsvp = {
  id: string;
  guest_name: string;
  attending: boolean;
  contact: string | null;
  questions: string | null;
  submitted_at: string;
};

const ADMIN_RSVP_PAGE_SIZE = 50;

class SupabaseRsvpListError extends Error {}

function parseTotal(response: Response): number {
  const total = Number(response.headers.get("content-range")?.split("/")[1]);

  if (!Number.isSafeInteger(total) || total < 0) {
    throw new SupabaseRsvpListError("Supabase did not return a valid RSVP count.");
  }

  return total;
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new SupabaseRsvpListError("Supabase server configuration is missing.");
  }

  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

function parseAdminRsvps(value: unknown): AdminRsvp[] {
  if (!Array.isArray(value)) {
    throw new SupabaseRsvpListError("Supabase returned an invalid RSVP response.");
  }

  return value.map((row: unknown) => {
    if (
      typeof row !== "object" ||
      row === null ||
      !("id" in row) ||
      typeof row.id !== "string" ||
      !("guest_name" in row) ||
      typeof row.guest_name !== "string" ||
      !("attending" in row) ||
      typeof row.attending !== "boolean" ||
      !("contact" in row) ||
      (row.contact !== null && typeof row.contact !== "string") ||
      !("questions" in row) ||
      (row.questions !== null && typeof row.questions !== "string") ||
      !("submitted_at" in row) ||
      typeof row.submitted_at !== "string"
    ) {
      throw new SupabaseRsvpListError("Supabase returned an invalid RSVP record.");
    }

    return {
      id: row.id,
      guest_name: row.guest_name,
      attending: row.attending,
      contact: row.contact,
      questions: row.questions,
      submitted_at: row.submitted_at,
    };
  });
}

export function isSupabaseRsvpListError(error: unknown): boolean {
  return error instanceof SupabaseRsvpListError;
}

export async function getAdminRsvps(page: number): Promise<{
  rsvps: AdminRsvp[];
  total: number;
  attending: number;
  declining: number;
}> {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const offset = (page - 1) * ADMIN_RSVP_PAGE_SIZE;
  const query = new URLSearchParams({
    select: "id,guest_name,attending,contact,questions,submitted_at",
    order: "submitted_at.desc,id.desc",
    limit: String(ADMIN_RSVP_PAGE_SIZE),
    offset: String(offset),
  });
  const response = await fetch(`${url}/rest/v1/wedding_rsvps?${query}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "count=exact",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new SupabaseRsvpListError(`Supabase request failed with status ${response.status}.`);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new SupabaseRsvpListError("Supabase returned invalid RSVP data.");
    }

    throw error;
  }

  async function getAttendanceCount(attending: boolean): Promise<number> {
    const query = new URLSearchParams({
      select: "id",
      attending: `eq.${attending}`,
    });
    const countResponse = await fetch(`${url}/rest/v1/wedding_rsvps?${query}`, {
      method: "HEAD",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "count=exact",
      },
      cache: "no-store",
    });

    if (!countResponse.ok) {
      throw new SupabaseRsvpListError(
        `Supabase request failed with status ${countResponse.status}.`,
      );
    }

    return parseTotal(countResponse);
  }

  const [attending, declining] = await Promise.all([
    getAttendanceCount(true),
    getAttendanceCount(false),
  ]);

  return { rsvps: parseAdminRsvps(body), total: parseTotal(response), attending, declining };
}
