-- 20261121000003_circadian_sleep_columns.sql
-- Circadian 26h Sleep Window, Rolling Cumulative Rest, and Sleep Start Telemetry

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_sleep_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rolling_sleep_minutes INTEGER DEFAULT 0;

COMMENT ON COLUMN profiles.last_sleep_started_at IS 'Timestamp when the active 26-hour circadian cycle began (anchor of last sleep start)';
COMMENT ON COLUMN profiles.rolling_sleep_minutes IS 'Cumulative sleep minutes logged within the active 26-hour circadian window (minimum 240m / 4.0h required)';
