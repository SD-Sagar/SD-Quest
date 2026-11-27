-- Migration: Add last_completed_date to quests for recurring quests and daily habits
ALTER TABLE quests ADD COLUMN IF NOT EXISTS last_completed_date DATE;

-- Backfill last_completed_date from completed_at where available
UPDATE quests
SET last_completed_date = completed_at::DATE
WHERE completed_at IS NOT NULL AND last_completed_date IS NULL;

-- Automatically reset stale completed recurring quests to pending
UPDATE quests
SET status = 'pending'
WHERE recurrence != 'none'
  AND status = 'completed'
  AND (last_completed_date IS NULL OR last_completed_date < CURRENT_DATE);
