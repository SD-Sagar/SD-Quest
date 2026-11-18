-- =============================================================================
-- SD-QUEST: SCHEMA COMPATIBILITY & RPC FIX FOR ATTRIBUTE & XP TRANSACTIONS
-- =============================================================================

-- 1. Ensure attribute_transactions supports both attribute_type / attribute_name
--    and resulting_score / resulting_value for backward and forward compatibility.
ALTER TABLE attribute_transactions ADD COLUMN IF NOT EXISTS attribute_name TEXT;
ALTER TABLE attribute_transactions ADD COLUMN IF NOT EXISTS resulting_value NUMERIC(6,2);

-- Backfill values across columns
UPDATE attribute_transactions SET attribute_name = attribute_type WHERE attribute_name IS NULL;
UPDATE attribute_transactions SET resulting_value = resulting_score WHERE resulting_value IS NULL;
UPDATE attribute_transactions SET attribute_type = attribute_name WHERE attribute_type IS NULL;
UPDATE attribute_transactions SET resulting_score = resulting_value WHERE resulting_score IS NULL;

-- Remove NOT NULL constraints on legacy duplicates to prevent insert failures
ALTER TABLE attribute_transactions ALTER COLUMN attribute_type DROP NOT NULL;
ALTER TABLE attribute_transactions ALTER COLUMN resulting_score DROP NOT NULL;

-- Create sync trigger for attribute_transactions
CREATE OR REPLACE FUNCTION sync_attribute_transaction_columns()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.attribute_name IS NULL AND NEW.attribute_type IS NOT NULL THEN
        NEW.attribute_name := NEW.attribute_type;
    ELSIF NEW.attribute_type IS NULL AND NEW.attribute_name IS NOT NULL THEN
        NEW.attribute_type := NEW.attribute_name;
    END IF;

    IF NEW.resulting_value IS NULL AND NEW.resulting_score IS NOT NULL THEN
        NEW.resulting_value := NEW.resulting_score;
    ELSIF NEW.resulting_score IS NULL AND NEW.resulting_value IS NOT NULL THEN
        NEW.resulting_score := NEW.resulting_value;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_attribute_transaction_columns ON attribute_transactions;
CREATE TRIGGER trg_sync_attribute_transaction_columns
BEFORE INSERT OR UPDATE ON attribute_transactions
FOR EACH ROW
EXECUTE FUNCTION sync_attribute_transaction_columns();

-- 2. Ensure xp_transactions supports delta_xp / xp_delta
--    and resulting_xp / resulting_total_xp
ALTER TABLE xp_transactions ADD COLUMN IF NOT EXISTS xp_delta INTEGER;
ALTER TABLE xp_transactions ADD COLUMN IF NOT EXISTS resulting_total_xp BIGINT;

UPDATE xp_transactions SET xp_delta = delta_xp WHERE xp_delta IS NULL;
UPDATE xp_transactions SET resulting_total_xp = resulting_xp WHERE resulting_total_xp IS NULL;
UPDATE xp_transactions SET delta_xp = xp_delta WHERE delta_xp IS NULL;
UPDATE xp_transactions SET resulting_xp = COALESCE(resulting_total_xp, 0)::INTEGER WHERE resulting_xp IS NULL;

ALTER TABLE xp_transactions ALTER COLUMN delta_xp DROP NOT NULL;
ALTER TABLE xp_transactions ALTER COLUMN resulting_xp DROP NOT NULL;
ALTER TABLE xp_transactions ALTER COLUMN resulting_level DROP NOT NULL;

-- Create sync trigger for xp_transactions
CREATE OR REPLACE FUNCTION sync_xp_transaction_columns()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.xp_delta IS NULL AND NEW.delta_xp IS NOT NULL THEN
        NEW.xp_delta := NEW.delta_xp;
    ELSIF NEW.delta_xp IS NULL AND NEW.xp_delta IS NOT NULL THEN
        NEW.delta_xp := NEW.xp_delta;
    END IF;

    IF NEW.resulting_total_xp IS NULL AND NEW.resulting_xp IS NOT NULL THEN
        NEW.resulting_total_xp := NEW.resulting_xp;
    ELSIF NEW.resulting_xp IS NULL AND NEW.resulting_total_xp IS NOT NULL THEN
        NEW.resulting_xp := LEAST(2147483647, NEW.resulting_total_xp)::INTEGER;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_xp_transaction_columns ON xp_transactions;
CREATE TRIGGER trg_sync_xp_transaction_columns
BEFORE INSERT OR UPDATE ON xp_transactions
FOR EACH ROW
EXECUTE FUNCTION sync_xp_transaction_columns();

-- 3. RECALIBRATE grant_xp_and_attributes RPC FUNCTION
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
            
            CASE LOWER(v_attr_key)
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

            INSERT INTO attribute_transactions (
                user_id,
                attribute_type,
                attribute_name,
                delta,
                resulting_score,
                resulting_value,
                source_type,
                source_id,
                notes
            ) VALUES (
                p_user_id,
                v_attr_key,
                v_attr_key,
                v_attr_delta,
                v_new_val,
                v_new_val,
                p_source_type,
                p_source_id,
                p_notes
            );
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

    -- 4. Calculate XP & Level Progression (Quadratic Curve: XP(L) = 500 + 25 * (L^2 - 1))
    v_new_level := v_profile.current_level;
    v_new_xp := v_profile.current_xp + p_xp_delta;
    v_total_xp := v_profile.lifetime_total_xp + GREATEST(0, p_xp_delta);
    v_highest_level := v_profile.lifetime_highest_level;
    v_xp_for_next := GREATEST(500, 500 + (25 * (v_new_level * v_new_level - 1)));
    v_new_stat_points := COALESCE(v_profile.unallocated_stat_points, 0);

    -- Level Up Progression Loop with NO MAX LEVEL (Infinite Hunter Progression)
    WHILE v_new_xp >= v_xp_for_next LOOP
        v_new_xp := v_new_xp - v_xp_for_next;
        v_new_level := v_new_level + 1;
        v_levels_gained := v_levels_gained + 1;
        v_xp_for_next := 500 + (25 * (v_new_level * v_new_level - 1));
        IF v_new_level > v_highest_level THEN
            v_highest_level := v_new_level;
        END IF;
    END LOOP;

    -- Award +3 Unallocated Stat Points per Level Gained (Solo Leveling System Rule)
    IF v_levels_gained > 0 THEN
        v_new_stat_points := v_new_stat_points + (v_levels_gained * 3);
    END IF;

    -- 10-Class Rank Calculation (Every 10 levels till Spartan at Level 100+)
    IF v_new_level >= 100 THEN
        v_new_rank := 'Spartan';
    ELSIF v_new_level >= 90 THEN
        v_new_rank := 'Ascendant';
    ELSIF v_new_level >= 80 THEN
        v_new_rank := 'Sovereign';
    ELSIF v_new_level >= 70 THEN
        v_new_rank := 'Juggernaut';
    ELSIF v_new_level >= 60 THEN
        v_new_rank := 'Warlord';
    ELSIF v_new_level >= 50 THEN
        v_new_rank := 'Gladiator';
    ELSIF v_new_level >= 40 THEN
        v_new_rank := 'Knight';
    ELSIF v_new_level >= 30 THEN
        v_new_rank := 'Vanguard';
    ELSIF v_new_level >= 20 THEN
        v_new_rank := 'Warrior';
    ELSIF v_new_level >= 10 THEN
        v_new_rank := 'Initiate';
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
        unallocated_stat_points = v_new_stat_points,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log transaction with both column configurations
    INSERT INTO xp_transactions (
        user_id,
        delta_xp,
        xp_delta,
        resulting_xp,
        resulting_total_xp,
        resulting_level,
        source_type,
        source_id,
        notes
    ) VALUES (
        p_user_id,
        p_xp_delta,
        p_xp_delta,
        v_new_xp,
        v_total_xp,
        v_new_level,
        p_source_type,
        p_source_id,
        p_notes
    );

    -- Return full result payload
    RETURN jsonb_build_object(
        'xp_gained', p_xp_delta,
        'new_xp', v_new_xp,
        'xp_to_next', v_xp_for_next,
        'new_level', v_new_level,
        'levels_gained', v_levels_gained,
        'new_rank', v_new_rank,
        'unallocated_stat_points', v_new_stat_points,
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

-- 4. RECALIBRATE allocate_stat_point RPC FUNCTION
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
    v_remaining_points INT;
    v_new_val NUMERIC(6,2);
BEGIN
    SELECT * INTO v_profile FROM profiles WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Hunter profile not found for user %', p_user_id;
    END IF;

    IF COALESCE(v_profile.unallocated_stat_points, 0) < p_points THEN
        RAISE EXCEPTION 'Insufficient unallocated stat points. Available: %', COALESCE(v_profile.unallocated_stat_points, 0);
    END IF;

    SELECT * INTO v_attributes FROM player_attributes WHERE user_id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Player attributes not found for user %', p_user_id;
    END IF;

    CASE LOWER(p_attribute)
        WHEN 'strength' THEN
            v_new_val := v_attributes.strength + (p_points * 1.0);
            v_attributes.strength := v_new_val;
            IF v_new_val > v_attributes.highest_strength THEN
                v_attributes.highest_strength := v_new_val;
            END IF;
        WHEN 'agility' THEN
            v_new_val := v_attributes.agility + (p_points * 1.0);
            v_attributes.agility := v_new_val;
            IF v_new_val > v_attributes.highest_agility THEN
                v_attributes.highest_agility := v_new_val;
            END IF;
        WHEN 'endurance' THEN
            v_new_val := v_attributes.endurance + (p_points * 1.0);
            v_attributes.endurance := v_new_val;
            IF v_new_val > v_attributes.highest_endurance THEN
                v_attributes.highest_endurance := v_new_val;
            END IF;
        WHEN 'discipline' THEN
            v_new_val := v_attributes.discipline + (p_points * 1.0);
            v_attributes.discipline := v_new_val;
            IF v_new_val > v_attributes.highest_discipline THEN
                v_attributes.highest_discipline := v_new_val;
            END IF;
        WHEN 'mentality' THEN
            v_new_val := v_attributes.mentality + (p_points * 1.0);
            v_attributes.mentality := v_new_val;
            IF v_new_val > v_attributes.highest_mentality THEN
                v_attributes.highest_mentality := v_new_val;
            END IF;
        WHEN 'vitality' THEN
            v_new_val := v_attributes.vitality + (p_points * 1.0);
            v_attributes.vitality := v_new_val;
            IF v_new_val > v_attributes.highest_vitality THEN
                v_attributes.highest_vitality := v_new_val;
            END IF;
        WHEN 'intelligence' THEN
            v_new_val := v_attributes.intelligence + (p_points * 1.0);
            v_attributes.intelligence := v_new_val;
            IF v_new_val > v_attributes.highest_intelligence THEN
                v_attributes.highest_intelligence := v_new_val;
            END IF;
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

    INSERT INTO attribute_transactions (
        user_id,
        attribute_type,
        attribute_name,
        delta,
        resulting_score,
        resulting_value,
        source_type,
        notes
    ) VALUES (
        p_user_id,
        p_attribute,
        p_attribute,
        (p_points * 1.0),
        v_new_val,
        v_new_val,
        'stat_point_allocation',
        'Manual stat allocation from Hunter System'
    );

    RETURN jsonb_build_object(
        'success', true,
        'allocated_attribute', p_attribute,
        'points_spent', p_points,
        'remaining_points', v_remaining_points,
        'new_attribute_value', v_new_val
    );
END;
$$;
