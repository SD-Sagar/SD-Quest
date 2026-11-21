-- =============================================================================
-- SD-QUEST: CUSTOM FOOD CATALOG & HIDDEN PRESET ARCHITECTURE
-- Migration: 20261121000000_custom_food_and_hidden_presets.sql
-- =============================================================================

-- 1. Ensure food_catalog has description and is_poisonous flags
ALTER TABLE food_catalog 
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_poisonous BOOLEAN DEFAULT FALSE;

-- 2. Ensure RLS policies permit authenticated users to insert, update and delete their own custom foods and hidden markers
DROP POLICY IF EXISTS "food_catalog_access" ON food_catalog;
CREATE POLICY "food_catalog_access" ON food_catalog FOR ALL 
USING (user_id IS NULL OR user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Re-grant privileges to API roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
