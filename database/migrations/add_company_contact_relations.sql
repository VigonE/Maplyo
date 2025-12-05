-- Migration: Add company_id and contact_id to prospects table
-- This creates foreign key relationships instead of duplicating data

-- Add company_id column with foreign key
ALTER TABLE prospects ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;

-- Add contact_id column with foreign key
ALTER TABLE prospects ADD COLUMN contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prospects_company ON prospects(company_id);
CREATE INDEX IF NOT EXISTS idx_prospects_contact ON prospects(contact_id);
