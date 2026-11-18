-- 20261118000001_smart_dynamic_streak_system.sql
-- Smart Dynamic Streak System with Lore-Accurate Sanctuary Protection & Reward Multipliers

-- 1. ADD DYNAMIC STREAK COLUMNS TO PROFILES
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_streak_date DATE DEFAULT NULL;

-- 2. ENSURE PROFILES HAVE SANITIZED DEFAULTS
UPDATE profiles
SET 
  current_streak = COALESCE(current_streak, 0),
  longest_streak = COALESCE(longest_streak, 0);

COMMENT ON COLUMN profiles.current_streak IS 'Consecutive days completing daily system directives or harvesting the Blessed Crate';
COMMENT ON COLUMN profiles.longest_streak IS 'All-time longest consecutive streak achieved';
COMMENT ON COLUMN profiles.last_streak_date IS 'Calendar date of last secured streak day';
