import { randomUUID } from "node:crypto";

export type GuestPhoto = {
  id: string;
  guest_name: string | null;
  content_type: string;
  created_at: string;
};

export type GuestPhotoStatus = "pending" | "approved" | "rejected";
export type AdminGuestPhoto = GuestPhoto & { status: GuestPhotoStatus };
export type GuestPhotoReviewStatus = "approved" | "rejected";

const GUEST_PHOTO_BUCKET = "wedding-guest-photos";
const GUEST_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const GUEST_PHOTO_LIST_LIMIT = 60;
const GUEST_PUBLIC_PHOTO_LIST_LIMIT = 1000;

class GuestPhotoServiceError extends Error {}
class GuestPhotoNotFoundError extends Error {}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new GuestPhotoServiceError("Supabase server configuration is missing.");
  }

  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

function getSupabaseHeaders(serviceRoleKey: string): HeadersInit {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };
}

function parsePhotoList(value: unknown): GuestPhoto[] {
  if (!Array.isArray(value)) {
    throw new GuestPhotoServiceError("Supabase returned an invalid photo list.");
  }

  return value.map((photo: unknown) => {
    if (
      typeof photo !== "object" ||
      photo === null ||
      !("id" in photo) ||
      typeof photo.id !== "string" ||
      !("guest_name" in photo) ||
      (photo.guest_name !== null && typeof photo.guest_name !== "string") ||
      !("content_type" in photo) ||
      typeof photo.content_type !== "string" ||
      !("created_at" in photo) ||
      typeof photo.created_at !== "string"
    ) {
      throw new GuestPhotoServiceError("Supabase returned an invalid photo record.");
    }

    return {
      id: photo.id,
      guest_name: photo.guest_name,
      content_type: photo.content_type,
      created_at: photo.created_at,
    };
  });
}

function parseAdminPhotoList(value: unknown): AdminGuestPhoto[] {
  if (!Array.isArray(value)) {
    throw new GuestPhotoServiceError("Supabase returned an invalid photo list.");
  }

  return value.map((photo: unknown) => {
    if (
      typeof photo !== "object" ||
      photo === null ||
      !("id" in photo) ||
      typeof photo.id !== "string" ||
      !("guest_name" in photo) ||
      (photo.guest_name !== null && typeof photo.guest_name !== "string") ||
      !("content_type" in photo) ||
      typeof photo.content_type !== "string" ||
      !("created_at" in photo) ||
      typeof photo.created_at !== "string" ||
      !("status" in photo) ||
      (photo.status !== "pending" && photo.status !== "approved" && photo.status !== "rejected")
    ) {
      throw new GuestPhotoServiceError("Supabase returned an invalid photo record.");
    }

    return {
      id: photo.id,
      guest_name: photo.guest_name,
      content_type: photo.content_type,
      created_at: photo.created_at,
      status: photo.status,
    };
  });
}

function getImageType(file: File, bytes: Uint8Array): { contentType: string; extension: string } {
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP";

  if (isJpeg && file.type === "image/jpeg") {
    return { contentType: "image/jpeg", extension: "jpg" };
  }

  if (isPng && file.type === "image/png") {
    return { contentType: "image/png", extension: "png" };
  }

  if (isWebp && file.type === "image/webp") {
    return { contentType: "image/webp", extension: "webp" };
  }

  throw new GuestPhotoServiceError("Upload a valid JPG, PNG, or WebP photo.");
}

function getPhotoByIdQuery(id: string, select: string) {
  return new URLSearchParams({ id: `eq.${id}`, select, limit: "1" });
}

async function getPhotoStoragePath(
  id: string,
  requiredStatus: GuestPhotoStatus | undefined,
): Promise<{ storagePath: string; contentType: string } | null> {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const query = getPhotoByIdQuery(id, "storage_path,content_type");
  if (requiredStatus) {
    query.set("status", `eq.${requiredStatus}`);
  }
  const response = await fetch(`${url}/rest/v1/wedding_guest_photos?${query}`, {
    headers: getSupabaseHeaders(serviceRoleKey),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GuestPhotoServiceError(`Supabase request failed with status ${response.status}.`);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new GuestPhotoServiceError("Supabase returned invalid photo data.");
    }

    throw error;
  }

  if (!Array.isArray(body) || body.length > 1) {
    throw new GuestPhotoServiceError("Supabase returned invalid photo data.");
  }

  if (body.length === 0) {
    return null;
  }

  const photo: unknown = body[0];

  if (
    typeof photo !== "object" ||
    photo === null ||
    !("storage_path" in photo) ||
    typeof photo.storage_path !== "string" ||
    !("content_type" in photo) ||
    typeof photo.content_type !== "string"
  ) {
    throw new GuestPhotoServiceError("Supabase returned invalid photo data.");
  }

  return { storagePath: photo.storage_path, contentType: photo.content_type };
}

async function deletePhotoObject(storagePath: string): Promise<void> {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}/storage/v1/object/${GUEST_PHOTO_BUCKET}/${storagePath}`, {
    method: "DELETE",
    headers: getSupabaseHeaders(serviceRoleKey),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GuestPhotoServiceError(
      `Supabase Storage request failed with status ${response.status}.`,
    );
  }
}

export function isGuestPhotoServiceError(error: unknown): error is Error {
  return error instanceof GuestPhotoServiceError;
}

export function isGuestPhotoNotFoundError(error: unknown): error is Error {
  return error instanceof GuestPhotoNotFoundError;
}

export async function uploadGuestPhoto(file: File, guestName: string | null): Promise<void> {
  if (file.size === 0 || file.size > GUEST_PHOTO_MAX_BYTES) {
    throw new GuestPhotoServiceError("Choose an image that is 5 MB or smaller.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const image = getImageType(file, bytes);
  const { url, serviceRoleKey } = getSupabaseConfig();
  const id = randomUUID();
  const storagePath = `${id}.${image.extension}`;
  const storageResponse = await fetch(
    `${url}/storage/v1/object/${GUEST_PHOTO_BUCKET}/${storagePath}`,
    {
      method: "POST",
      headers: {
        ...getSupabaseHeaders(serviceRoleKey),
        "Content-Type": image.contentType,
        "x-upsert": "false",
      },
      body: file,
      cache: "no-store",
    },
  );

  if (!storageResponse.ok) {
    throw new GuestPhotoServiceError(
      `Supabase Storage request failed with status ${storageResponse.status}.`,
    );
  }

  try {
    const insertResponse = await fetch(`${url}/rest/v1/wedding_guest_photos`, {
      method: "POST",
      headers: {
        ...getSupabaseHeaders(serviceRoleKey),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        id,
        storage_path: storagePath,
        content_type: image.contentType,
        guest_name: guestName,
      }),
      cache: "no-store",
    });

    if (!insertResponse.ok) {
      throw new GuestPhotoServiceError(
        `Supabase request failed with status ${insertResponse.status}.`,
      );
    }
  } catch (error) {
    try {
      await deletePhotoObject(storagePath);
    } catch (cleanupError) {
      console.error("An incomplete guest photo upload could not be cleaned up.", cleanupError);
    }

    throw error;
  }
}

export async function getApprovedGuestPhotos(): Promise<GuestPhoto[]> {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const query = new URLSearchParams({
    select: "id,guest_name,content_type,created_at",
    status: "eq.approved",
    order: "created_at.desc",
    limit: String(GUEST_PUBLIC_PHOTO_LIST_LIMIT),
  });
  const response = await fetch(`${url}/rest/v1/wedding_guest_photos?${query}`, {
    headers: getSupabaseHeaders(serviceRoleKey),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GuestPhotoServiceError(`Supabase request failed with status ${response.status}.`);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new GuestPhotoServiceError("Supabase returned invalid photo data.");
    }

    throw error;
  }

  return parsePhotoList(body);
}

export async function getAdminGuestPhotos(
  offset: number,
): Promise<{ photos: AdminGuestPhoto[]; hasMore: boolean }> {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const query = new URLSearchParams({
    select: "id,guest_name,content_type,created_at,status",
    order: "created_at.desc,id.desc",
    limit: String(GUEST_PHOTO_LIST_LIMIT + 1),
    offset: String(offset),
  });
  const response = await fetch(`${url}/rest/v1/wedding_guest_photos?${query}`, {
    headers: getSupabaseHeaders(serviceRoleKey),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GuestPhotoServiceError(`Supabase request failed with status ${response.status}.`);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new GuestPhotoServiceError("Supabase returned invalid photo data.");
    }

    throw error;
  }

  const photos = parseAdminPhotoList(body);

  return {
    photos: photos.slice(0, GUEST_PHOTO_LIST_LIMIT),
    hasMore: photos.length > GUEST_PHOTO_LIST_LIMIT,
  };
}

export async function getGuestPhotoImage(
  id: string,
  requiredStatus: GuestPhotoStatus | "all",
): Promise<{ body: ReadableStream<Uint8Array>; contentType: string }> {
  const photo = await getPhotoStoragePath(
    id,
    requiredStatus === "all" ? undefined : requiredStatus,
  );

  if (!photo) {
    throw new GuestPhotoNotFoundError("Photo not found.");
  }

  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(
    `${url}/storage/v1/object/${GUEST_PHOTO_BUCKET}/${photo.storagePath}`,
    { headers: getSupabaseHeaders(serviceRoleKey), cache: "no-store" },
  );

  if (!response.ok || !response.body) {
    throw new GuestPhotoServiceError(
      `Supabase Storage request failed with status ${response.status}.`,
    );
  }

  return { body: response.body, contentType: photo.contentType };
}

export async function reviewGuestPhoto(
  id: string,
  status: GuestPhotoReviewStatus,
): Promise<void> {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const query = new URLSearchParams({
    id: `eq.${id}`,
    status: "eq.pending",
    select: "id",
  });
  const response = await fetch(`${url}/rest/v1/wedding_guest_photos?${query}`, {
    method: "PATCH",
    headers: {
      ...getSupabaseHeaders(serviceRoleKey),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ status }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GuestPhotoServiceError(`Supabase request failed with status ${response.status}.`);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new GuestPhotoServiceError("Supabase returned an invalid review result.");
    }

    throw error;
  }

  if (
    !Array.isArray(body) ||
    body.length !== 1 ||
    typeof body[0] !== "object" ||
    body[0] === null ||
    !("id" in body[0]) ||
    typeof body[0].id !== "string"
  ) {
    throw new GuestPhotoNotFoundError("This photo is no longer waiting for review.");
  }
}

export async function reviewGuestPhotos(
  ids: string[],
  status: GuestPhotoReviewStatus,
): Promise<string[]> {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const reviewedIds: string[] = [];

  for (let start = 0; start < ids.length; start += 100) {
    const batch = ids.slice(start, start + 100);
    const query = new URLSearchParams({
      id: `in.(${batch.join(",")})`,
      select: "id",
    });
    const response = await fetch(`${url}/rest/v1/wedding_guest_photos?${query}`, {
      method: "PATCH",
      headers: {
        ...getSupabaseHeaders(serviceRoleKey),
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ status }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new GuestPhotoServiceError(`Supabase request failed with status ${response.status}.`);
    }

    let body: unknown;

    try {
      body = await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new GuestPhotoServiceError("Supabase returned an invalid review result.");
      }

      throw error;
    }

    if (
      !Array.isArray(body) ||
      body.some(
        (photo: unknown) =>
          typeof photo !== "object" ||
          photo === null ||
          !("id" in photo) ||
          typeof photo.id !== "string",
      )
    ) {
      throw new GuestPhotoServiceError("Supabase returned an invalid review result.");
    }

    reviewedIds.push(...body.map((photo: { id: string }) => photo.id));
  }

  return reviewedIds;
}
