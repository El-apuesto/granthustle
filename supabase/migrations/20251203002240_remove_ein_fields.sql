/*
  # Remove EIN/SSN Fields from Schema

  1. Changes
    - Remove ein_hash column from profiles table
    - Remove ein_hash column from abuse_log table
    - Update related indexes

  2. Security
    - No data loss for other fields
    - Maintains all RLS policies
*/

-- Drop indexes first
DROP INDEX IF EXISTS idx_profiles_ein_hash;
DROP INDEX IF EXISTS idx_abuse_log_ein;

-- Remove ein_hash from profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'ein_hash'
  ) THEN
    ALTER TABLE profiles DROP COLUMN ein_hash;
  END IF;
END $$;

-- Remove ein_hash from abuse_log
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'abuse_log' AND column_name = 'ein_hash'
  ) THEN
    ALTER TABLE abuse_log DROP COLUMN ein_hash;
  END IF;
END $$;