-- =============================================================================
-- SD-QUEST MIGRATION: 20261121000002_add_leg_developer_attachment.sql
-- Description: Adds has_leg_developer to equipment_inventory (plate-loaded bench leg extension & curl attachment)
-- =============================================================================

ALTER TABLE equipment_inventory 
  ADD COLUMN IF NOT EXISTS has_leg_developer BOOLEAN DEFAULT FALSE NOT NULL;

GRANT ALL ON TABLE equipment_inventory TO anon, authenticated, service_role;
