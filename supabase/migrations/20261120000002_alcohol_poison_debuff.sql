-- =============================================================================
-- SD-QUEST: ALCOHOL INTOXICATION / POISON DEBUFF TELEMETRY
-- Adds poison_expires_at to profiles for live debuff tracking and clearance
-- =============================================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS poison_expires_at TIMESTAMPTZ DEFAULT NULL;
