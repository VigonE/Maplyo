-- Migration pour ajouter les champs de localisation détaillés aux prospects

-- Ajouter city, country et postal_code à la table prospects
ALTER TABLE prospects ADD COLUMN city TEXT;
ALTER TABLE prospects ADD COLUMN country TEXT;
ALTER TABLE prospects ADD COLUMN postal_code TEXT;
