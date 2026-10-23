create table public.wedding_invitations (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  guest_name text not null check (char_length(guest_name) between 1 and 100),
  seat_limit smallint not null check (seat_limit between 1 and 20),
  created_at timestamptz not null default now()
);

create table public.wedding_rsvps (
  invitation_id uuid primary key references public.wedding_invitations (id) on delete cascade,
  guest_name text not null check (char_length(guest_name) between 1 and 100),
  attending boolean not null,
  party_names text[] not null default '{}',
  contact text check (contact is null or char_length(contact) <= 150),
  submitted_at timestamptz not null default now()
);

alter table public.wedding_invitations enable row level security;
alter table public.wedding_rsvps enable row level security;

revoke all on public.wedding_invitations from anon, authenticated;
revoke all on public.wedding_rsvps from anon, authenticated;
grant all on public.wedding_invitations to service_role;
grant all on public.wedding_rsvps to service_role;
