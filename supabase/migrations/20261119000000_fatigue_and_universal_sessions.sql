-- 20261119000000_fatigue_and_universal_sessions.sql
-- Universal Dynamic Timestamp Sessions & Dual Fatigue Telemetry Engine

-- 1. ADD FATIGUE COLUMNS TO PROFILES
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mental_fatigue NUMERIC(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS physical_fatigue NUMERIC(5,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS last_fatigue_update_at TIMESTAMPTZ DEFAULT NOW();

-- 2. ADD 'IS_FUN' RECREATIONAL PROTOCOL FLAG TO QUESTS
ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS is_fun BOOLEAN DEFAULT FALSE;

-- 3. ENSURE SANITIZED CONSTRAINTS
UPDATE profiles
SET 
  mental_fatigue = COALESCE(mental_fatigue, 0.00),
  physical_fatigue = COALESCE(physical_fatigue, 0.00),
  last_fatigue_update_at = COALESCE(last_fatigue_update_at, NOW());

COMMENT ON COLUMN profiles.mental_fatigue IS 'Cognitive and neurological fatigue (0.00 to 100.00%)';
COMMENT ON COLUMN profiles.physical_fatigue IS 'Muscular and cardiovascular fatigue (0.00 to 100.00%)';
COMMENT ON COLUMN profiles.last_fatigue_update_at IS 'Timestamp when fatigue was last recalculated for passive time decay';
COMMENT ON COLUMN quests.is_fun IS 'Whether the quest includes fun/recreation to halt or heavily dampen fatigue accumulation';
