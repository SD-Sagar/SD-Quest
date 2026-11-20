-- =============================================================================
-- SD-QUEST: CELLULAR HYDRATION SURGE TELEMETRY
-- Adds last_hydration_surge_at to profiles for 5-minute hydration fatigue boosts
-- =============================================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_hydration_surge_at TIMESTAMPTZ DEFAULT NULL;
