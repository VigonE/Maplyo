-- Add latitude and longitude fields to companies table
-- This allows geocoding of company addresses

ALTER TABLE companies ADD COLUMN latitude REAL;
ALTER TABLE companies ADD COLUMN longitude REAL;
