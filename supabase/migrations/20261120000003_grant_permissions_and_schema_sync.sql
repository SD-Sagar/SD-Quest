-- =============================================================================
-- SD-QUEST: TABLE PRIVILEGES & COMPREHENSIVE SCHEMA SYNC MIGRATION
-- Migration: 20261120000003_grant_permissions_and_schema_sync.sql
-- =============================================================================

-- 1. Grant public schema usage and full table privileges to Supabase API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 2. Ensure default privileges for all newly created tables/sequences/functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 3. Verify all profiles telemetry and debuff columns exist with safe defaults
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS unallocated_stat_points INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_streak_date DATE,
  ADD COLUMN IF NOT EXISTS mental_fatigue NUMERIC(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS physical_fatigue NUMERIC(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS last_fatigue_update_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS exp_booster_multiplier NUMERIC(4,2) DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS exp_booster_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_sleep_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sleep_deprived_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_hydration_surge_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS poison_expires_at TIMESTAMPTZ DEFAULT NULL;

-- 4. Verify quest recreational flag
ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS is_fun BOOLEAN DEFAULT FALSE;

-- 5. Final re-grant to ensure all objects are accessible
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
