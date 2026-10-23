alter table public.wedding_rsvps
  add column id uuid;

update public.wedding_rsvps
set id = gen_random_uuid()
where id is null;

alter table public.wedding_rsvps
  alter column id set default gen_random_uuid(),
  alter column id set not null;

alter table public.wedding_rsvps
  drop constraint wedding_rsvps_pkey;

alter table public.wedding_rsvps
  add constraint wedding_rsvps_pkey primary key (id),
  alter column invitation_id drop not null,
  add column party_size bigint not null default 0 check (party_size >= 0);

update public.wedding_rsvps
set party_size = cardinality(party_names);

create unique index wedding_rsvps_invitation_id_key
  on public.wedding_rsvps (invitation_id)
  where invitation_id is not null;
