-- =============================================================================
-- SD-QUEST: MASTER DATABASE MIGRATION (LIFELONG REAL-LIFE RPG ENGINE)
-- Follows promt.txt specification: Sections 1 through 20
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------
CREATE TYPE hunter_rank AS ENUM ('Recruit', 'Warrior', 'Vanguard', 'Spartan');
CREATE TYPE quest_classification AS ENUM ('permanent', 'temporary', 'scheduled');
CREATE TYPE quest_category AS ENUM ('career', 'fitness', 'routine', 'education', 'household', 'social', 'personal');
CREATE TYPE quest_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'excused');
CREATE TYPE condition_status AS ENUM ('normal', 'fatigued', 'chicken', 'medical_sanctuary');
CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
CREATE TYPE meal_type AS ENUM ('breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner', 'custom');

-- -----------------------------------------------------------------------------
-- 2. PROFILES (Character Profile & Bio)
-- -----------------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dob DATE NOT NULL,
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    sex TEXT CHECK (sex IN ('male', 'female', 'other')),
    fitness_experience TEXT CHECK (fitness_experience IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    fitness_objective TEXT DEFAULT 'Hypertrophy & Lifelong Physical Conditioning',
    current_level INTEGER DEFAULT 1 NOT NULL,
    current_xp INTEGER DEFAULT 0 NOT NULL,
    xp_to_next_level INTEGER DEFAULT 100 NOT NULL,
    lifetime_highest_level INTEGER DEFAULT 1 NOT NULL,
    lifetime_total_xp BIGINT DEFAULT 0 NOT NULL,
    rank hunter_rank DEFAULT 'Recruit' NOT NULL,
    title TEXT DEFAULT 'Awakened Recruit',
    condition condition_status DEFAULT 'normal' NOT NULL,
    chicken_status_expires_at TIMESTAMPTZ,
    medical_sanctuary_expires_at TIMESTAMPTZ,
    active_main_quest TEXT DEFAULT 'fitness' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------------------------------------
-- 3. THE 7 ATTRIBUTES ENGINE
-- -----------------------------------------------------------------------------
CREATE TABLE player_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    strength NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    endurance NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    intelligence NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    discipline NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    mentality NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    agility NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    vitality NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    highest_strength NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    highest_endurance NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    highest_intelligence NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    highest_discipline NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    highest_mentality NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    highest_agility NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    highest_vitality NUMERIC(6,2) DEFAULT 10.00 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_attributes UNIQUE(user_id)
);

-- Immutable audit ledger for every attribute change
CREATE TABLE attribute_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    attribute_type TEXT NOT NULL,
    delta NUMERIC(6,2) NOT NULL,
    resulting_score NUMERIC(6,2) NOT NULL,
    source_type TEXT NOT NULL, -- 'workout', 'quest_completion', 'penalty', 'manual'
    source_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Immutable audit ledger for every XP transaction
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    delta_xp INTEGER NOT NULL,
    resulting_xp INTEGER NOT NULL,
    resulting_level INTEGER NOT NULL,
    source_type TEXT NOT NULL,
    source_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------------------------------------
-- 4. HOME GYM EQUIPMENT INVENTORY (Section 7)
-- -----------------------------------------------------------------------------
CREATE TABLE equipment_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    has_bench BOOLEAN DEFAULT TRUE NOT NULL,
    bench_positions TEXT[] DEFAULT ARRAY['Flat', 'Incline 15°', 'Incline 30°', 'Incline 45°', 'Incline 60°', 'Incline 75°', 'Seated 90°', 'Decline'],
    dumbbell_handle_weight_kg NUMERIC(4,2) DEFAULT 2.0 NOT NULL,
    plate_5kg_count INT DEFAULT 8 NOT NULL,   -- 40kg
    plate_2_5kg_count INT DEFAULT 4 NOT NULL, -- 10kg
    plate_1_25kg_count INT DEFAULT 8 NOT NULL,-- 10kg (Total ~60kg)
    custom_plates JSONB DEFAULT '[]'::jsonb NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_equipment UNIQUE(user_id)
);

-- -----------------------------------------------------------------------------
-- 5. EXERCISE CATALOG & WORKOUT PLANS
-- -----------------------------------------------------------------------------
CREATE TABLE exercise_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    target_muscle TEXT NOT NULL,
    secondary_muscles TEXT[] DEFAULT '{}',
    bench_angle TEXT,
    required_equipment TEXT DEFAULT 'dumbbells' NOT NULL,
    instructions TEXT[] NOT NULL,
    form_cues TEXT[] DEFAULT '{}',
    common_mistakes TEXT[] DEFAULT '{}',
    alternatives TEXT[] DEFAULT '{}',
    default_sets INT DEFAULT 3 NOT NULL,
    default_reps_min INT DEFAULT 8 NOT NULL,
    default_reps_max INT DEFAULT 12 NOT NULL,
    default_rest_seconds INT DEFAULT 90 NOT NULL
);

CREATE TABLE training_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    title TEXT NOT NULL,
    target_muscles TEXT NOT NULL,
    is_rest_day BOOLEAN DEFAULT FALSE NOT NULL,
    skipping_target INT DEFAULT 100 NOT NULL,
    exercises JSONB DEFAULT '[]'::jsonb NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_split_day UNIQUE(user_id, day_of_week)
);

CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    split_day day_of_week NOT NULL,
    title TEXT NOT NULL,
    target_muscles TEXT NOT NULL,
    duration_minutes INT DEFAULT 0,
    total_tonnage_kg NUMERIC(8,2) DEFAULT 0 NOT NULL,
    skipping_target INT DEFAULT 100 NOT NULL,
    skipping_completed INT DEFAULT 0 NOT NULL,
    status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'completed' NOT NULL,
    notes TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE workout_set_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    target_muscle TEXT NOT NULL,
    set_number INT NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL,
    reps INT NOT NULL,
    rpe NUMERIC(3,1),
    bench_angle TEXT,
    plate_breakdown TEXT,
    completed BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------------------------------------
-- 6. INTELLIGENT QUEST ENGINE (Sections 5 & 6)
-- -----------------------------------------------------------------------------
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    classification quest_classification NOT NULL,
    category quest_category NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE NOT NULL,
    deadline TIMESTAMPTZ,
    recurrence TEXT DEFAULT 'none' NOT NULL, -- 'none', 'daily', 'weekly', 'weekdays', 'custom'
    recurrence_days SMALLINT[] DEFAULT '{}', -- 0 = Sunday, 1 = Monday ... 6 = Saturday
    estimated_duration_minutes INT NOT NULL,
    actual_duration_minutes INT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium' NOT NULL,
    difficulty hunter_rank DEFAULT 'Recruit' NOT NULL,
    attribute_rewards JSONB DEFAULT '{}'::jsonb NOT NULL,
    xp_reward INT DEFAULT 50 NOT NULL,
    penalty_config JSONB DEFAULT '{}'::jsonb NOT NULL,
    status quest_status DEFAULT 'pending' NOT NULL,
    is_manual BOOLEAN DEFAULT TRUE NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE quest_timer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    accumulated_seconds INT DEFAULT 0 NOT NULL,
    is_running BOOLEAN DEFAULT TRUE NOT NULL,
    ended_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- 7. BODY MEASUREMENTS & PROGRESS PHOTOGRAPHS (Section 8)
-- -----------------------------------------------------------------------------
CREATE TABLE body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL,
    chest_cm NUMERIC(5,2),
    waist_cm NUMERIC(5,2),
    hips_cm NUMERIC(5,2),
    neck_cm NUMERIC(5,2),
    arms_cm NUMERIC(5,2),
    forearms_cm NUMERIC(5,2),
    thighs_cm NUMERIC(5,2),
    calves_cm NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE progress_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    photo_url TEXT NOT NULL,
    photo_type TEXT CHECK (photo_type IN ('front', 'side', 'back')) DEFAULT 'front' NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------------------------------------
-- 8. NUTRITION & HYDRATION (Sections 9 & 10)
-- -----------------------------------------------------------------------------
CREATE TABLE daily_nutrition_targets (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    target_calories INT DEFAULT 2200 NOT NULL,
    target_protein_g INT DEFAULT 120 NOT NULL,
    target_carbs_g INT DEFAULT 250 NOT NULL,
    target_fat_g INT DEFAULT 60 NOT NULL,
    monthly_budget_inr INT DEFAULT 4500 NOT NULL,
    sattu_daily_grams INT DEFAULT 50 NOT NULL,
    boiled_eggs_weekly_days INT DEFAULT 4 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE food_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for system presets
    name TEXT NOT NULL,
    default_serving TEXT NOT NULL,
    calories INT NOT NULL,
    protein_g NUMERIC(5,2) NOT NULL,
    carbs_g NUMERIC(5,2) NOT NULL,
    fat_g NUMERIC(5,2) NOT NULL,
    approx_cost_inr NUMERIC(6,2) DEFAULT 0 NOT NULL,
    category TEXT DEFAULT 'staple' NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE nutrition_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    log_date DATE DEFAULT CURRENT_DATE NOT NULL,
    meal_type meal_type NOT NULL,
    food_name TEXT NOT NULL,
    serving_size TEXT NOT NULL,
    calories INT NOT NULL,
    protein_g NUMERIC(5,2) NOT NULL,
    carbs_g NUMERIC(5,2) NOT NULL,
    fat_g NUMERIC(5,2) NOT NULL,
    cost_inr NUMERIC(6,2) DEFAULT 0 NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE hydration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    log_date DATE DEFAULT CURRENT_DATE NOT NULL,
    amount_ml INT DEFAULT 300 NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------------------------------------
-- 9. WALKING & ACTIVITY TRACKER (Section 11)
-- -----------------------------------------------------------------------------
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    log_date DATE DEFAULT CURRENT_DATE NOT NULL,
    steps INT DEFAULT 0 NOT NULL,
    walking_duration_minutes INT DEFAULT 0 NOT NULL,
    distance_km NUMERIC(5,2) DEFAULT 0 NOT NULL,
    estimated_calories_burned INT DEFAULT 0 NOT NULL,
    source TEXT CHECK (source IN ('manual', 'device_synced')) DEFAULT 'manual' NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_daily_activity UNIQUE(user_id, log_date)
);

-- -----------------------------------------------------------------------------
-- 10. MEDICAL SANCTUARY & DISCIPLINARY ENGINE (Section 14)
-- -----------------------------------------------------------------------------
CREATE TABLE medical_sanctuary_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    notes TEXT
);

-- -----------------------------------------------------------------------------
-- 11. 6-MONTH RETENTION & PERMANENT MONTHLY SNAPSHOTS (Section 15)
-- -----------------------------------------------------------------------------
CREATE TABLE monthly_player_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    year_month TEXT NOT NULL, -- Format: YYYY-MM
    ending_level INT NOT NULL,
    ending_rank hunter_rank NOT NULL,
    total_xp_gained INT NOT NULL,
    total_workouts_completed INT NOT NULL,
    total_tonnage_kg BIGINT NOT NULL,
    total_skips_performed BIGINT NOT NULL,
    total_quests_completed INT NOT NULL,
    average_discipline NUMERIC(6,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_monthly_snapshot UNIQUE(user_id, year_month)
);

-- -----------------------------------------------------------------------------
-- 12. SCHEDULING, REMINDERS & FUTURE MESSAGES (Section 16)
-- -----------------------------------------------------------------------------
CREATE TABLE scheduled_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL, -- 'workout', 'hydration', 'meal', 'quest'
    title TEXT NOT NULL,
    message TEXT,
    scheduled_time TIME NOT NULL,
    days_of_week SMALLINT[] DEFAULT '{1,2,3,4,5,6,0}',
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE future_self_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    unlock_date DATE NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- -----------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_sanctuary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_player_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_self_messages ENABLE ROW LEVEL SECURITY;

-- Standard User Isolation Policies
CREATE POLICY "profiles_owner" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "player_attributes_owner" ON player_attributes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "attribute_transactions_owner" ON attribute_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "xp_transactions_owner" ON xp_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "equipment_inventory_owner" ON equipment_inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "training_splits_owner" ON training_splits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workout_sessions_owner" ON workout_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workout_set_logs_owner" ON workout_set_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "quests_owner" ON quests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "quest_timer_sessions_owner" ON quest_timer_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "body_measurements_owner" ON body_measurements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "progress_photos_owner" ON progress_photos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "daily_nutrition_targets_owner" ON daily_nutrition_targets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "food_catalog_access" ON food_catalog FOR ALL USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "nutrition_logs_owner" ON nutrition_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "hydration_logs_owner" ON hydration_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "activity_logs_owner" ON activity_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "medical_sanctuary_records_owner" ON medical_sanctuary_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "monthly_player_snapshots_owner" ON monthly_player_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "scheduled_reminders_owner" ON scheduled_reminders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "future_self_messages_owner" ON future_self_messages FOR ALL USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 14. SERVER-SIDE SECURE GAME ENGINE (Anti-Cheat Transaction Function)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION grant_xp_and_attributes(
    p_user_id UUID,
    p_xp_delta INT,
    p_attr_deltas JSONB, -- e.g. '{"strength": 0.40, "discipline": 0.20}'
    p_source_type TEXT,
    p_source_id TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile profiles%ROWTYPE;
    v_attributes player_attributes%ROWTYPE;
    v_attr_key TEXT;
    v_attr_delta NUMERIC(6,2);
    v_current_val NUMERIC(6,2);
    v_new_val NUMERIC(6,2);
    v_xp_for_next INT;
    v_new_level INT;
    v_new_xp INT;
    v_new_rank hunter_rank;
    v_highest_level INT;
    v_total_xp BIGINT;
BEGIN
    -- 1. Fetch current profile
    SELECT * INTO v_profile FROM profiles WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Hunter profile not found for ID %', p_user_id;
    END IF;

    -- 2. Fetch current attributes
    SELECT * INTO v_attributes FROM player_attributes WHERE user_id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Player attributes not found for user %', p_user_id;
    END IF;

    -- 3. Apply Attribute Deltas & log to attribute_transactions
    IF p_attr_deltas IS NOT NULL THEN
        FOR v_attr_key, v_attr_delta IN SELECT * FROM jsonb_each_text(p_attr_deltas)
        LOOP
            v_attr_delta := v_attr_delta::NUMERIC;
            
            CASE v_attr_key
                WHEN 'strength' THEN
                    v_new_val := GREATEST(1.0, v_attributes.strength + v_attr_delta);
                    v_attributes.strength := v_new_val;
                    IF v_new_val > v_attributes.highest_strength THEN
                        v_attributes.highest_strength := v_new_val;
                    END IF;
                WHEN 'endurance' THEN
                    v_new_val := GREATEST(1.0, v_attributes.endurance + v_attr_delta);
                    v_attributes.endurance := v_new_val;
                    IF v_new_val > v_attributes.highest_endurance THEN
                        v_attributes.highest_endurance := v_new_val;
                    END IF;
                WHEN 'intelligence' THEN
                    v_new_val := GREATEST(1.0, v_attributes.intelligence + v_attr_delta);
                    v_attributes.intelligence := v_new_val;
                    IF v_new_val > v_attributes.highest_intelligence THEN
                        v_attributes.highest_intelligence := v_new_val;
                    END IF;
                WHEN 'discipline' THEN
                    v_new_val := GREATEST(1.0, v_attributes.discipline + v_attr_delta);
                    v_attributes.discipline := v_new_val;
                    IF v_new_val > v_attributes.highest_discipline THEN
                        v_attributes.highest_discipline := v_new_val;
                    END IF;
                WHEN 'mentality' THEN
                    v_new_val := GREATEST(1.0, v_attributes.mentality + v_attr_delta);
                    v_attributes.mentality := v_new_val;
                    IF v_new_val > v_attributes.highest_mentality THEN
                        v_attributes.highest_mentality := v_new_val;
                    END IF;
                WHEN 'agility' THEN
                    v_new_val := GREATEST(1.0, v_attributes.agility + v_attr_delta);
                    v_attributes.agility := v_new_val;
                    IF v_new_val > v_attributes.highest_agility THEN
                        v_attributes.highest_agility := v_new_val;
                    END IF;
                WHEN 'vitality' THEN
                    v_new_val := GREATEST(1.0, v_attributes.vitality + v_attr_delta);
                    v_attributes.vitality := v_new_val;
                    IF v_new_val > v_attributes.highest_vitality THEN
                        v_attributes.highest_vitality := v_new_val;
                    END IF;
                ELSE
                    -- Ignore unrecognized attribute keys safely
            END CASE;

            INSERT INTO attribute_transactions (user_id, attribute_type, delta, resulting_score, source_type, source_id, notes)
            VALUES (p_user_id, v_attr_key, v_attr_delta, v_new_val, p_source_type, p_source_id, p_notes);
        END LOOP;

        UPDATE player_attributes
        SET strength = v_attributes.strength,
            endurance = v_attributes.endurance,
            intelligence = v_attributes.intelligence,
            discipline = v_attributes.discipline,
            mentality = v_attributes.mentality,
            agility = v_attributes.agility,
            vitality = v_attributes.vitality,
            highest_strength = v_attributes.highest_strength,
            highest_endurance = v_attributes.highest_endurance,
            highest_intelligence = v_attributes.highest_intelligence,
            highest_discipline = v_attributes.highest_discipline,
            highest_mentality = v_attributes.highest_mentality,
            highest_agility = v_attributes.highest_agility,
            highest_vitality = v_attributes.highest_vitality,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;

    -- 4. Calculate XP & Level Progression
    v_new_level := v_profile.current_level;
    v_new_xp := v_profile.current_xp + p_xp_delta;
    v_total_xp := v_profile.lifetime_total_xp + GREATEST(0, p_xp_delta);
    v_highest_level := v_profile.lifetime_highest_level;
    v_xp_for_next := v_profile.xp_to_next_level;

    -- Level Up Progression Loop (100 * Level ^ 1.35)
    WHILE v_new_xp >= v_xp_for_next LOOP
        v_new_xp := v_new_xp - v_xp_for_next;
        v_new_level := v_new_level + 1;
        v_xp_for_next := FLOOR(100 * POWER(v_new_level, 1.35))::INT;
        IF v_new_level > v_highest_level THEN
            v_highest_level := v_new_level;
        END IF;
    END LOOP;

    -- Rank Calculation
    IF v_new_level >= 50 THEN
        v_new_rank := 'Spartan';
    ELSIF v_new_level >= 25 THEN
        v_new_rank := 'Vanguard';
    ELSIF v_new_level >= 10 THEN
        v_new_rank := 'Warrior';
    ELSE
        v_new_rank := 'Recruit';
    END IF;

    -- Update Profile
    UPDATE profiles
    SET current_level = v_new_level,
        current_xp = v_new_xp,
        xp_to_next_level = v_xp_for_next,
        lifetime_highest_level = v_highest_level,
        lifetime_total_xp = v_total_xp,
        rank = v_new_rank,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Insert XP Transaction
    INSERT INTO xp_transactions (user_id, delta_xp, resulting_xp, resulting_level, source_type, source_id, notes)
    VALUES (p_user_id, p_xp_delta, v_new_xp, v_new_level, p_source_type, p_source_id, p_notes);

    RETURN jsonb_build_object(
        'current_level', v_new_level,
        'current_xp', v_new_xp,
        'xp_to_next_level', v_xp_for_next,
        'rank', v_new_rank,
        'attributes', jsonb_build_object(
            'strength', v_attributes.strength,
            'endurance', v_attributes.endurance,
            'intelligence', v_attributes.intelligence,
            'discipline', v_attributes.discipline,
            'mentality', v_attributes.mentality,
            'agility', v_attributes.agility,
            'vitality', v_attributes.vitality
        )
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 15. SEED DATA (AFFORDABLE BENGALI STAPLES & MASTER EXERCISE CATALOG)
-- -----------------------------------------------------------------------------
INSERT INTO food_catalog (name, default_serving, calories, protein_g, carbs_g, fat_g, approx_cost_inr, category, is_verified)
VALUES
('Chana Sattu (Water + Lemon + Salt)', '50g (2 tbsp)', 205, 10.5, 32.0, 2.5, 12.00, 'staple', true),
('Boiled Whole Egg', '1 large egg', 74, 6.3, 0.5, 5.0, 7.00, 'staple', true),
('Black Coffee (Unsweetened)', '1 cup (200ml)', 4, 0.3, 0.2, 0.0, 5.00, 'staple', true),
('Bengali Lunch (Bhat + Machher Jhol + Dal)', '150g rice, 1 pc fish, dal', 580, 28.5, 78.0, 14.0, 65.00, 'lunch', false),
('Bengali Dinner (Roti/Bhat + Murgir Jhol + Dal)', '100g chicken, roti/rice, dal', 620, 34.0, 72.0, 16.0, 75.00, 'dinner', false),
('Roti + Bengali Dal + Dim Bhaja', '3 rotis, 1 egg, 1 bowl dal', 480, 19.0, 64.0, 12.0, 30.00, 'dinner', false);

INSERT INTO exercise_catalog (id, name, target_muscle, secondary_muscles, bench_angle, required_equipment, instructions, form_cues, common_mistakes, alternatives, default_sets, default_reps_min, default_reps_max, default_rest_seconds)
VALUES
('ex-goblet-squat', 'Goblet Dumbbell Squat', 'Quadriceps & Glutes', ARRAY['Core', 'Calves'], 'Flat', 'dumbbells', ARRAY['Hold single dumbbell vertically against upper chest.', 'Squat down until thighs are parallel.', 'Drive up through heels.'], ARRAY['Chest proud', 'Knees in line with toes'], ARRAY['Rounding lower back', 'Knees caving'], ARRAY['DB Front Squat', 'DB Sumo Squat'], 4, 8, 12, 90),
('ex-db-rdl', 'Dumbbell Romanian Deadlift (RDL)', 'Hamstrings & Glutes', ARRAY['Lower Back', 'Forearms'], 'Flat', 'dumbbells', ARRAY['Hold two dumbbells in front of thighs.', 'Hinge at hips, sliding dumbbells along shins.', 'Squeeze glutes to return to standing.'], ARRAY['Push hips back', 'Keep dumbbells tight to legs'], ARRAY['Squatting instead of hinging'], ARRAY['Single-Leg DB RDL'], 3, 8, 10, 90),
('ex-inc-db-press', 'Incline Dumbbell Bench Press (30°)', 'Upper Pectorals', ARRAY['Anterior Delts', 'Triceps'], 'Incline 30°', 'bench_and_dumbbells', ARRAY['Set bench to 30 degrees.', 'Retract shoulder blades.', 'Press dumbbells along converging arc.'], ARRAY['Wrists over elbows', 'Elbows tucked 45°'], ARRAY['Excessive incline above 45°', 'Flaring elbows 90°'], ARRAY['Flat DB Press', 'Floor Press'], 3, 8, 12, 90),
('ex-one-arm-db-row', 'One-Arm Dumbbell Row', 'Latissimus Dorsi', ARRAY['Rhomboids', 'Biceps'], 'Flat', 'bench_and_dumbbells', ARRAY['Place one knee and hand on flat bench.', 'Pull dumbbell back toward hip pocket.', 'Pause for 1s at top.'], ARRAY['Pull with elbow', 'Zero torso rotation'], ARRAY['Yanking with lower back'], ARRAY['Chest-Supported Incline Row'], 4, 8, 12, 75),
('ex-seated-db-press', 'Seated Dumbbell Overhead Press (90°)', 'Anterior & Lateral Deltoids', ARRAY['Triceps', 'Upper Traps'], 'Seated 90°', 'bench_and_dumbbells', ARRAY['Set bench to 90 degrees.', 'Press directly overhead without clanking weights.', 'Lower smoothly to ear level.'], ARRAY['Brace core tight', 'Elbows 30° forward'], ARRAY['Hyperextending lower back'], ARRAY['Standing DB Press', 'Arnold Press'], 3, 8, 12, 90),
('ex-inc-db-curl', 'Incline Dumbbell Bicep Curl (45°)', 'Biceps (Long Head)', ARRAY['Brachialis', 'Forearms'], 'Incline 45°', 'bench_and_dumbbells', ARRAY['Set bench to 45 degrees.', 'Curl up while supinating wrists.', 'Lower with a strict 3-second negative.'], ARRAY['Elbows pinned behind torso'], ARRAY['Swinging elbows forward'], ARRAY['Seated Hammer Curl'], 3, 10, 12, 60),
('ex-overhead-tricep-ext', 'Seated Overhead Dumbbell Tricep Extension', 'Triceps (Long Head)', ARRAY['Triceps Lateral Head'], 'Seated 90°', 'bench_and_dumbbells', ARRAY['Cup single heavy dumbbell overhead.', 'Lower smoothly behind head until forearms touch biceps.', 'Extend elbows to lockout.'], ARRAY['Elbows pointed forward'], ARRAY['Flaring elbows wide'], ARRAY['DB Skull Crushers'], 3, 10, 12, 75);

-- -----------------------------------------------------------------------------
-- 16. PROGRESS PHOTOS SUPABASE STORAGE BUCKET CONFIGURATION
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress_photos', 'progress_photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own progress photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'progress_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own progress photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'progress_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own progress photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'progress_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- -----------------------------------------------------------------------------
-- 17. BASELINE TABLE PRIVILEGES FOR SUPABASE ROLES
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;


