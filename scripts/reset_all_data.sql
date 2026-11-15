-- =============================================================================
-- SD-QUEST: INSTANT MASTER DATA WIPE / FRESH START SCRIPT
-- Copy and paste this directly into: Supabase Dashboard -> SQL Editor -> Run
-- =============================================================================

-- OPTION A: WIPE ALL GAME DATA BUT KEEP YOUR EMAIL & PASSWORD (RECOMMENDED)
-- This clears all character stats, workouts, quests, plans, and equipment so
-- you can log in with your existing account and go through Character Creation fresh!

TRUNCATE TABLE 
    workout_set_logs,
    workout_sessions,
    quest_timer_sessions,
    quests,
    attribute_transactions,
    xp_transactions,
    player_attributes,
    equipment_inventory,
    daily_nutrition_targets,
    nutrition_logs,
    hydration_logs,
    activity_logs,
    body_measurements,
    progress_photos,
    medical_sanctuary_records,
    monthly_player_snapshots,
    scheduled_reminders,
    future_self_messages,
    custom_workout_plans,
    profiles
CASCADE;

-- OPTION B: UNCOMMENT THE LINE BELOW IF YOU ALSO WANT TO DELETE ALL AUTH ACCOUNTS
-- DELETE FROM auth.users;

SELECT 'DATABASE RESET SUCCESSFUL: ALL GAME TABLES HAVE BEEN EMPTIED FOR A FRESH RE-AWAKENING.' AS result;
