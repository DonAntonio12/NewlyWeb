create table public.wedding_guest_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  guest_name text check (guest_name is null or char_length(guest_name) between 1 and 80),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index wedding_guest_photos_status_created_at_idx
  on public.wedding_guest_photos (status, created_at desc);

alter table public.wedding_guest_photos enable row level security;

revoke all on public.wedding_guest_photos from anon, authenticated;
grant all on public.wedding_guest_photos to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-guest-photos',
  'wedding-guest-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
