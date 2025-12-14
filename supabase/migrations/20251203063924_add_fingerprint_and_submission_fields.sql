/*
  # Add Fingerprint Tracking and Submission Fields

  ## Changes
  
  1. Profiles Table
     - Add browser_fingerprint column for FingerprintJS tracking
  
  2. Submissions Table
     - Add template_type column
     - Add target_beneficiaries column
     - Add measurable_outcomes column
     - Add project_duration column
  
  3. Abuse Log
     - Add browser_fingerprint column for cross-reference tracking
  
  ## Security Notes
  - Fingerprints are hashed for privacy
  - RLS policies remain restrictive
*/

-- Add fingerprint to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'browser_fingerprint'
  ) THEN
    ALTER TABLE profiles ADD COLUMN browser_fingerprint text;
  END IF;
END $$;

-- Add fingerprint to abuse_log
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'abuse_log' AND column_name = 'browser_fingerprint'
  ) THEN
    ALTER TABLE abuse_log ADD COLUMN browser_fingerprint text;
  END IF;
END $$;

-- Add missing fields to submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'template_type'
  ) THEN
    ALTER TABLE submissions ADD COLUMN template_type text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'target_beneficiaries'
  ) THEN
    ALTER TABLE submissions ADD COLUMN target_beneficiaries text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'measurable_outcomes'
  ) THEN
    ALTER TABLE submissions ADD COLUMN measurable_outcomes text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'project_duration'
  ) THEN
    ALTER TABLE submissions ADD COLUMN project_duration text;
  END IF;
END $$;

-- Create index for fingerprint lookups
CREATE INDEX IF NOT EXISTS idx_profiles_fingerprint ON profiles(browser_fingerprint);
CREATE INDEX IF NOT EXISTS idx_abuse_log_fingerprint ON abuse_log(browser_fingerprint);
