-- Fix host_id column type from UUID to VARCHAR
-- This allows Clerk user IDs (like "user_XXX") to be stored

-- Step 1: Make host_id nullable temporarily (in case there are existing records)
ALTER TABLE properties
  ALTER COLUMN host_id DROP NOT NULL;

-- Step 2: Change column type from uuid to varchar
ALTER TABLE properties
  ALTER COLUMN host_id TYPE VARCHAR(255) USING host_id::text;

-- Step 3: Update any existing records to use ownerId value (if needed)
UPDATE properties
SET host_id = "ownerId"
WHERE host_id IS NULL OR host_id = '';

-- Step 4: Make it NOT NULL again
ALTER TABLE properties
  ALTER COLUMN host_id SET NOT NULL;

-- Verify the change
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'properties'
  AND column_name IN ('host_id', 'ownerId');
