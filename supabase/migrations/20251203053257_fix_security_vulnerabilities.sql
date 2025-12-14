/*
  # Fix Security Vulnerabilities

  ## Changes
  
  1. Function Security
     - Fix search_path vulnerability in `update_updated_at` function
     - Add security definer with proper search path
  
  2. RLS Policy for abuse_log
     - Add restrictive policy for service role only
     - No public access to abuse log data
  
  ## Security Notes
  - Function now has immutable search_path
  - abuse_log remains locked down (no authenticated user access)
  - Only service role can access abuse_log via backend
*/

-- Drop function with cascade to remove triggers
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- Recreate function with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION update_updated_at() IS 'Automatically updates updated_at timestamp. Secure search_path prevents injection attacks.';

-- Recreate all triggers that were dropped
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_grants_updated_at
  BEFORE UPDATE ON grants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_saved_grants_updated_at
  BEFORE UPDATE ON saved_grants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS policy for abuse_log (service role only)
-- This policy blocks all authenticated users from accessing abuse_log
-- Only service_role can access this table for admin/monitoring purposes
CREATE POLICY "Service role only access"
  ON abuse_log FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
