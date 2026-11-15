-- =============================================================================
-- SD-QUEST: LEVELING RECALIBRATION, STAT POINTS & EQUIPMENT PLATES MIGRATION
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New query -> Paste & Run
-- =============================================================================

-- 1. ADD UNALLOCATED STAT POINTS TO PROFILES
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS unallocated_stat_points INTEGER DEFAULT 0 NOT NULL;

-- 2. ADD 2KG AND 1KG PLATES TO EQUIPMENT INVENTORY
ALTER TABLE equipment_inventory 
  ADD COLUMN IF NOT EXISTS plate_2kg_count INT DEFAULT 4 NOT NULL,
  ADD COLUMN IF NOT EXISTS plate_1kg_count INT DEFAULT 4 NOT NULL;

-- 3. CREATE CUSTOM WORKOUT PLANS TABLE FOR CUSTOM MODE
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

-- 4. RECALIBRATE grant_xp_and_attributes RPC (500 XP BASE CURVE + +3 STAT POINTS PER LEVEL UP)
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
    v_levels_gained INT := 0;
    v_new_stat_points INT;
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
                    -- Ignore unknown attributes safely
            END CASE;

            INSERT INTO attribute_transactions (user_id, attribute_name, delta, resulting_value, source_type, source_id, notes)
            VALUES (p_user_id, v_attr_key::attribute_type, v_attr_delta, v_new_val, p_source_type, p_source_id, p_notes);
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
    -- Calibrated base: Level 1 requires 500 XP (floor(500 * L^1.45))
    v_new_level := v_profile.current_level;
    v_new_xp := v_profile.current_xp + p_xp_delta;
    v_total_xp := v_profile.lifetime_total_xp + GREATEST(0, p_xp_delta);
    v_highest_level := v_profile.lifetime_highest_level;
    v_xp_for_next := GREATEST(500, v_profile.xp_to_next_level);
    v_new_stat_points := COALESCE(v_profile.unallocated_stat_points, 0);

    -- Level Up Progression Loop (500 * Level ^ 1.45)
    WHILE v_new_xp >= v_xp_for_next LOOP
        v_new_xp := v_new_xp - v_xp_for_next;
        v_new_level := v_new_level + 1;
        v_levels_gained := v_levels_gained + 1;
        v_xp_for_next := FLOOR(500 * POWER(v_new_level, 1.45))::INT;
        IF v_new_level > v_highest_level THEN
            v_highest_level := v_new_level;
        END IF;
    END LOOP;

    -- Award +3 Unallocated Stat Points per Level Gained (Solo Leveling System Rule)
    IF v_levels_gained > 0 THEN
        v_new_stat_points := v_new_stat_points + (v_levels_gained * 3);
    END IF;

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
        unallocated_stat_points = v_new_stat_points,
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
        'unallocated_stat_points', v_new_stat_points,
        'levels_gained', v_levels_gained,
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

-- 5. FUNCTION TO ALLOCATE STAT POINTS MANUALLY
CREATE OR REPLACE FUNCTION allocate_stat_point(
    p_user_id UUID,
    p_attribute TEXT,
    p_points INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile profiles%ROWTYPE;
    v_attributes player_attributes%ROWTYPE;
    v_new_val NUMERIC(6,2);
    v_remaining_points INT;
BEGIN
    IF p_points <= 0 THEN
        RAISE EXCEPTION 'Points must be at least 1';
    END IF;

    SELECT * INTO v_profile FROM profiles WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Hunter profile not found';
    END IF;

    IF v_profile.unallocated_stat_points < p_points THEN
        RAISE EXCEPTION 'Insufficient unallocated stat points. Available: %', v_profile.unallocated_stat_points;
    END IF;

    SELECT * INTO v_attributes FROM player_attributes WHERE user_id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Player attributes not found';
    END IF;

    -- Allocate +1.00 per point to chosen attribute
    CASE LOWER(p_attribute)
        WHEN 'strength' THEN
            v_new_val := v_attributes.strength + (p_points * 1.0);
            v_attributes.strength := v_new_val;
            IF v_new_val > v_attributes.highest_strength THEN v_attributes.highest_strength := v_new_val; END IF;
        WHEN 'agility' THEN
            v_new_val := v_attributes.agility + (p_points * 1.0);
            v_attributes.agility := v_new_val;
            IF v_new_val > v_attributes.highest_agility THEN v_attributes.highest_agility := v_new_val; END IF;
        WHEN 'endurance' THEN
            v_new_val := v_attributes.endurance + (p_points * 1.0);
            v_attributes.endurance := v_new_val;
            IF v_new_val > v_attributes.highest_endurance THEN v_attributes.highest_endurance := v_new_val; END IF;
        WHEN 'discipline' THEN
            v_new_val := v_attributes.discipline + (p_points * 1.0);
            v_attributes.discipline := v_new_val;
            IF v_new_val > v_attributes.highest_discipline THEN v_attributes.highest_discipline := v_new_val; END IF;
        WHEN 'mentality' THEN
            v_new_val := v_attributes.mentality + (p_points * 1.0);
            v_attributes.mentality := v_new_val;
            IF v_new_val > v_attributes.highest_mentality THEN v_attributes.highest_mentality := v_new_val; END IF;
        WHEN 'vitality' THEN
            v_new_val := v_attributes.vitality + (p_points * 1.0);
            v_attributes.vitality := v_new_val;
            IF v_new_val > v_attributes.highest_vitality THEN v_attributes.highest_vitality := v_new_val; END IF;
        WHEN 'intelligence' THEN
            v_new_val := v_attributes.intelligence + (p_points * 1.0);
            v_attributes.intelligence := v_new_val;
            IF v_new_val > v_attributes.highest_intelligence THEN v_attributes.highest_intelligence := v_new_val; END IF;
        ELSE
            RAISE EXCEPTION 'Invalid attribute: %', p_attribute;
    END CASE;

    v_remaining_points := v_profile.unallocated_stat_points - p_points;

    UPDATE profiles
    SET unallocated_stat_points = v_remaining_points,
        updated_at = NOW()
    WHERE id = p_user_id;

    UPDATE player_attributes
    SET strength = v_attributes.strength,
        agility = v_attributes.agility,
        endurance = v_attributes.endurance,
        discipline = v_attributes.discipline,
        mentality = v_attributes.mentality,
        vitality = v_attributes.vitality,
        intelligence = v_attributes.intelligence,
        highest_strength = v_attributes.highest_strength,
        highest_agility = v_attributes.highest_agility,
        highest_endurance = v_attributes.highest_endurance,
        highest_discipline = v_attributes.highest_discipline,
        highest_mentality = v_attributes.highest_mentality,
        highest_vitality = v_attributes.highest_vitality,
        highest_intelligence = v_attributes.highest_intelligence,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    INSERT INTO attribute_transactions (user_id, attribute_name, delta, resulting_value, source_type, notes)
    VALUES (p_user_id, p_attribute::attribute_type, (p_points * 1.0), v_new_val, 'stat_point_allocation', 'Manual stat allocation from Hunter System');

    RETURN jsonb_build_object(
        'success', true,
        'allocated_attribute', p_attribute,
        'points_spent', p_points,
        'remaining_points', v_remaining_points,
        'new_attribute_value', v_new_val
    );
END;
$$;

-- 6. RECALIBRATE EXISTING USERS WHO HIT LEVEL 2 PREMATURELY OR AWARD THEM THEIR 3 FREE STAT POINTS
-- If user has level 2 from previous test workout, make sure they have 3 unallocated points to spend!
UPDATE profiles 
SET unallocated_stat_points = GREATEST(unallocated_stat_points, 3)
WHERE current_level = 2 AND unallocated_stat_points = 0;

