create table if not exists public.mentorship_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null check (role in ('mentee', 'mentor')),
  full_name text,
  company text,
  goals text,
  created_at timestamptz not null default now()
);

create unique index if not exists mentorship_waitlist_email_role_idx
  on public.mentorship_waitlist (lower(email), role);

alter table public.mentorship_waitlist enable row level security;

drop policy if exists "Anyone can join mentorship waitlist" on public.mentorship_waitlist;
create policy "Anyone can join mentorship waitlist"
  on public.mentorship_waitlist
  for insert
  with check (true);
