-- ========================================================
-- PROGRAMMER66 - SUPABASE COMPETITION & MULTI-TEAM SCHEMA
-- ========================================================
-- Paste this entire script into your Supabase SQL Editor and click "Run"

-- 1. Create Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  remaining_seconds INTEGER NOT NULL DEFAULT 1800,
  active_challenge_id TEXT,
  settings JSONB NOT NULL DEFAULT '{"maxTeams": 16, "maxTeamSize": 4, "allowDroneAssistance": true, "difficulty": "beginner"}'::jsonb,
  challenges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  started_at TIMESTAMPTZ
);

-- 2. Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  completed_challenges JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  submitted_code TEXT,
  last_submission_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  code TEXT,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'passed',
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create Indexes for High Performance Live Queries
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);
CREATE INDEX IF NOT EXISTS idx_teams_room_id ON public.teams(room_id);
CREATE INDEX IF NOT EXISTS idx_teams_score ON public.teams(score DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_room_id ON public.submissions(room_id);

-- 5. Enable Realtime Replication on All Competition Tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;

-- 6. Enable Row Level Security (RLS) with Public Access Policies
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rooms" ON public.rooms FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert on teams" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on teams" ON public.teams FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on submissions" ON public.submissions FOR INSERT WITH CHECK (true);
