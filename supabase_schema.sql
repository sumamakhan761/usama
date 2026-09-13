-- =========================================================
-- Osama - Mental Wellness, Habit & Spiritual Tracking Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================

-- 1. Daily Namaz Tracking (with photo proof URL)
create table if not exists public.daily_namaz (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date,
  prayer_name text not null, -- 'Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha'
  is_done boolean default false,
  photo_url text,
  completed_at timestamp with time zone,
  unique(date, prayer_name)
);

-- 2. Daily Habits & Gutka Counter
create table if not exists public.daily_gutka (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date unique,
  count integer default 0,
  updated_at timestamp with time zone default now()
);

-- 3. Breathing Sessions Log
create table if not exists public.breathing_sessions (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date,
  duration_seconds integer default 60,
  completed boolean default true,
  created_at timestamp with time zone default now()
);

-- 4. Notes & Voice Memos (Preserved history, no deletion)
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  note_type text not null check (note_type in ('text', 'voice')),
  content text,
  audio_url text,
  created_at timestamp with time zone default now()
);

-- 5. Custom Trackers (Thought / Impulse counters with +1 taps)
create table if not exists public.trackers (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  count integer default 0,
  date date not null default current_date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 6. Daily Medicine Tracker
create table if not exists public.daily_medicine (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date unique,
  is_done boolean default false,
  updated_at timestamp with time zone default now()
);

-- 7. Daily Pushups Challenge Log
create table if not exists public.daily_pushups (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date unique,
  completed boolean default true,
  duration_seconds integer default 60,
  created_at timestamp with time zone default now()
);

-- 8. Daily Mood Checker
create table if not exists public.daily_mood (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date unique,
  mood text not null,
  created_at timestamp with time zone default now()
);

-- =========================================================
-- Enable Row Level Security (RLS) & Grant Access for Anon
-- =========================================================

alter table public.daily_namaz enable row level security;
alter table public.daily_gutka enable row level security;
alter table public.breathing_sessions enable row level security;
alter table public.notes enable row level security;
alter table public.trackers enable row level security;
alter table public.daily_medicine enable row level security;
alter table public.daily_pushups enable row level security;
alter table public.daily_mood enable row level security;

-- Policies for public (anon) and authenticated roles
drop policy if exists "Allow all on daily_namaz" on public.daily_namaz;
create policy "Allow all on daily_namaz" on public.daily_namaz for all using (true) with check (true);

drop policy if exists "Allow all on daily_gutka" on public.daily_gutka;
create policy "Allow all on daily_gutka" on public.daily_gutka for all using (true) with check (true);

drop policy if exists "Allow all on breathing_sessions" on public.breathing_sessions;
create policy "Allow all on breathing_sessions" on public.breathing_sessions for all using (true) with check (true);

drop policy if exists "Allow all on notes" on public.notes;
create policy "Allow all on notes" on public.notes for all using (true) with check (true);

drop policy if exists "Allow all on trackers" on public.trackers;
create policy "Allow all on trackers" on public.trackers for all using (true) with check (true);

drop policy if exists "Allow all on daily_medicine" on public.daily_medicine;
create policy "Allow all on daily_medicine" on public.daily_medicine for all using (true) with check (true);

drop policy if exists "Allow all on daily_pushups" on public.daily_pushups;
create policy "Allow all on daily_pushups" on public.daily_pushups for all using (true) with check (true);

drop policy if exists "Allow all on daily_mood" on public.daily_mood;
create policy "Allow all on daily_mood" on public.daily_mood for all using (true) with check (true);

grant all on public.daily_namaz to anon, authenticated;
grant all on public.daily_gutka to anon, authenticated;
grant all on public.breathing_sessions to anon, authenticated;
grant all on public.notes to anon, authenticated;
grant all on public.trackers to anon, authenticated;
grant all on public.daily_medicine to anon, authenticated;
grant all on public.daily_pushups to anon, authenticated;
grant all on public.daily_mood to anon, authenticated;

-- =========================================================
-- Storage Buckets Setup
-- =========================================================
insert into storage.buckets (id, name, public)
values 
  ('namaz-proofs', 'namaz-proofs', true),
  ('voice-notes', 'voice-notes', true)
on conflict (id) do nothing;

drop policy if exists "Public Access to namaz-proofs" on storage.objects;
create policy "Public Access to namaz-proofs" on storage.objects for all using (bucket_id = 'namaz-proofs') with check (bucket_id = 'namaz-proofs');

drop policy if exists "Public Access to voice-notes" on storage.objects;
create policy "Public Access to voice-notes" on storage.objects for all using (bucket_id = 'voice-notes') with check (bucket_id = 'voice-notes');
