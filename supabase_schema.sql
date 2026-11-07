-- ========================================================
-- PROGRAMMER66 - SUPABASE COMPETITION & MULTI-TEAM SCHEMA
-- ========================================================
-- Safe & idempotent script. You can run this multiple times without error.

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

-- 5. Safe Realtime Replication (Checks before adding to avoid duplicate relation error)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'teams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
  END IF;
END $$;

-- 6. Enable Row Level Security (RLS) with Public Access Policies
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they already exist to prevent duplicate errors
DROP POLICY IF EXISTS "Allow public read access on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public insert on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public update on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public delete on rooms" ON public.rooms;

DROP POLICY IF EXISTS "Allow public read access on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public insert on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public update on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public delete on teams" ON public.teams;

DROP POLICY IF EXISTS "Allow public read access on submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow public insert on submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow public delete on submissions" ON public.submissions;

-- Create Policies
CREATE POLICY "Allow public read access on rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on rooms" ON public.rooms FOR DELETE USING (true);

CREATE POLICY "Allow public read access on teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert on teams" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on teams" ON public.teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on teams" ON public.teams FOR DELETE USING (true);

CREATE POLICY "Allow public read access on submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on submissions" ON public.submissions FOR DELETE USING (true);

-- ========================================================
-- 11. PLAYER AUTHENTICATION & CLOUD SAVE SCHEMA
-- ========================================================

-- Player Profiles Table (Connected to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.player_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Player Cloud Saves Table (Persistent Single-Player Farm State)
CREATE TABLE IF NOT EXISTS public.player_saves (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  money INTEGER NOT NULL DEFAULT 120,
  day INTEGER NOT NULL DEFAULT 1,
  time_of_day DOUBLE PRECISION NOT NULL DEFAULT 8.0,
  weather TEXT NOT NULL DEFAULT 'sunny',
  inventory JSONB NOT NULL DEFAULT '{}'::jsonb,
  tiles JSONB NOT NULL DEFAULT '{}'::jsonb,
  robots JSONB NOT NULL DEFAULT '[]'::jsonb,
  missions JSONB NOT NULL DEFAULT '[]'::jsonb,
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  saved_scripts JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for Player Data
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_saves ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies (Users can only access their own profile)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.player_profiles;
CREATE POLICY "Users can view their own profile" ON public.player_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.player_profiles;
CREATE POLICY "Users can insert their own profile" ON public.player_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.player_profiles;
CREATE POLICY "Users can update their own profile" ON public.player_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Player Saves RLS Policies (Users can only access their own saves)
DROP POLICY IF EXISTS "Users can view their own save" ON public.player_saves;
CREATE POLICY "Users can view their own save" ON public.player_saves
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own save" ON public.player_saves;
CREATE POLICY "Users can insert their own save" ON public.player_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own save" ON public.player_saves;
CREATE POLICY "Users can update their own save" ON public.player_saves
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================================
-- 12. SYSTEM SETTINGS & MAINTENANCE SCHEMA
-- ========================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for System Settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on system_settings" ON public.system_settings;
CREATE POLICY "Allow public read access on system_settings" ON public.system_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on system_settings" ON public.system_settings;
CREATE POLICY "Allow public insert on system_settings" ON public.system_settings
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on system_settings" ON public.system_settings;
CREATE POLICY "Allow public update on system_settings" ON public.system_settings
  FOR UPDATE USING (true);

-- Enable Realtime Replication for System Settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'system_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
  END IF;
END $$;

