-- =============================================================================
-- SD-QUEST MIGRATION: 20261121000001_expand_gym_equipment_and_toggle.sql
-- Description: Adds master gym module toggle and expanded equipment fields
-- (10kg plates, straight barbell, curly EZ bar, back pull cable pulley attachment)
-- =============================================================================

-- 1. Add enable_gym toggle to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS enable_gym BOOLEAN DEFAULT TRUE NOT NULL;

-- 2. Expand equipment_inventory with new apparatus and 10kg plate counters
ALTER TABLE equipment_inventory 
  ADD COLUMN IF NOT EXISTS plate_10kg_count INT DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS has_barbell BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS barbell_weight_kg NUMERIC(4,2) DEFAULT 7.0 NOT NULL,
  ADD COLUMN IF NOT EXISTS has_ez_bar BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS ez_bar_weight_kg NUMERIC(4,2) DEFAULT 5.0 NOT NULL,
  ADD COLUMN IF NOT EXISTS has_cable_pulley BOOLEAN DEFAULT FALSE NOT NULL;

-- 3. Ensure permissions are granted to all roles
GRANT ALL ON TABLE profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE equipment_inventory TO anon, authenticated, service_role;
