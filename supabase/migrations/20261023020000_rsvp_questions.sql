alter table public.wedding_rsvps
  add column questions text check (questions is null or char_length(questions) <= 1000);
