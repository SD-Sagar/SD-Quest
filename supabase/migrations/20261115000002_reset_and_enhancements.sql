-- =============================================================================
-- SD-QUEST: SCHEMA ENHANCEMENTS & COMPLETE DATABASE RESET UTILITY
-- Migration: 20261115000002_reset_and_enhancements.sql
-- =============================================================================

-- 1. ADD PERSISTENCE COLUMNS FOR CROSS-DEVICE STATE (NO LOCALSTORAGE)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS last_mystery_box_claimed_date DATE,
  ADD COLUMN IF NOT EXISTS active_session_state JSONB DEFAULT NULL;

ALTER TABLE workout_sessions 
  ADD COLUMN IF NOT EXISTS calories_burned INT DEFAULT 0;

-- 2. ENSURE CUSTOM WORKOUT PLANS TABLE EXISTS WITH RLS
CREATE TABLE IF NOT EXISTS custom_workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    day_routines JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE custom_workout_plans ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'custom_workout_plans' AND policyname = 'custom_plans_owner_policy'
    ) THEN
        CREATE POLICY custom_plans_owner_policy ON custom_workout_plans
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 3. STORED PROCEDURE: RESET ALL APPLICATION DATA FOR A FRESH START
-- You can run `SELECT reset_all_sdquest_data();` in the Supabase SQL editor anytime.
CREATE OR REPLACE FUNCTION reset_all_sdquest_data(p_delete_auth_users BOOLEAN DEFAULT FALSE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Truncate child & transactional tables
    TRUNCATE TABLE workout_set_logs CASCADE;
    TRUNCATE TABLE workout_sessions CASCADE;
    TRUNCATE TABLE quest_timer_sessions CASCADE;
    TRUNCATE TABLE quests CASCADE;
    TRUNCATE TABLE attribute_transactions CASCADE;
    TRUNCATE TABLE xp_transactions CASCADE;
    TRUNCATE TABLE player_attributes CASCADE;
    TRUNCATE TABLE equipment_inventory CASCADE;
    TRUNCATE TABLE daily_nutrition_targets CASCADE;
    TRUNCATE TABLE nutrition_logs CASCADE;
    TRUNCATE TABLE hydration_logs CASCADE;
    TRUNCATE TABLE activity_logs CASCADE;
    TRUNCATE TABLE body_measurements CASCADE;
    TRUNCATE TABLE progress_photos CASCADE;
    TRUNCATE TABLE medical_sanctuary_records CASCADE;
    TRUNCATE TABLE monthly_player_snapshots CASCADE;
    TRUNCATE TABLE scheduled_reminders CASCADE;
    TRUNCATE TABLE future_self_messages CASCADE;
    TRUNCATE TABLE custom_workout_plans CASCADE;
    
    -- 2. Truncate hunter profiles
    TRUNCATE TABLE profiles CASCADE;

    -- 3. Optionally delete auth accounts if requested
    IF p_delete_auth_users THEN
        DELETE FROM auth.users;
        RETURN 'SUCCESS: Complete database wiped including all auth accounts. Ready for fresh Awakening!';
    END IF;

    RETURN 'SUCCESS: All game tables erased cleanly. Existing auth accounts can log in and re-create their characters!';
END;
$$;
