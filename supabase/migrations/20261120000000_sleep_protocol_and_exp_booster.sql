-- 20261120000000_sleep_protocol_and_exp_booster.sql
-- Regenerative Sleep Protocol, Circadian Stasis, and 2X EXP Booster Telemetry

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS exp_booster_multiplier NUMERIC(4,2) DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS exp_booster_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_sleep_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sleep_deprived_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.exp_booster_multiplier IS 'Active EXP gain multiplier (e.g. 2.0x from 8-8.5h optimal sleep)';
COMMENT ON COLUMN profiles.exp_booster_expires_at IS 'Expiration timestamp for the 5-hour 2X EXP booster';
COMMENT ON COLUMN profiles.last_sleep_completed_at IS 'Timestamp of last completed main sleep protocol (12-hour biological cooldown)';
COMMENT ON COLUMN profiles.sleep_deprived_expires_at IS 'Expiration timestamp for the 5-hour sleep deprivation debuff (0.7x XP rate)';
