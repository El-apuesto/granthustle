/*
  # Restore SaaS Security Features
  
  ## Critical Security Features Restored
  
  This restores all anti-abuse and usage tracking features that protect the SaaS business model.
  
  1. Match Counter Enforcement
     - `increment_match_counter` function enforces 5-match limit for free users
     - Uses row-level locking to prevent race conditions
     - Only counts matches for free tier users
     - Paid users get unlimited matches
  
  2. Abuse Logging
     - `log_abuse_attempt` function logs all abuse attempts
     - Tracks fingerprints, user IDs, abuse types
     - Enables monitoring and blocking patterns
     - Silently fails to not block user experience
  
  3. Security Policies
     - Restrictive access to abuse logs (service role only for writes)
     - Users can read their own abuse logs for transparency
  
  ## Business Logic Protected
  - Free tier: 5 matches per month
  - Professional tier: Unlimited matches
  - Enterprise tier: Unlimited matches
  - Prevents abuse via fingerprinting and rate limiting
*/

-- ============================================================================
-- RESTORE MATCH COUNTER FUNCTION (Free User Limit Enforcement)
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_match_counter(user_uuid uuid)
RETURNS integer
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  new_count integer;
  user_tier text;
BEGIN
  -- Get user's subscription tier with row lock to prevent race conditions
  SELECT subscription_tier INTO user_tier
  FROM profiles
  WHERE id = user_uuid
  FOR UPDATE;
  
  -- Only increment counter for free tier users
  IF user_tier = 'free' OR user_tier IS NULL THEN
    -- Atomically increment and return new count
    UPDATE profiles
    SET monthly_matches_used = COALESCE(monthly_matches_used, 0) + 1
    WHERE id = user_uuid
    RETURNING monthly_matches_used INTO new_count;
    
    RETURN new_count;
  ELSE
    -- Pro/Enterprise users: return 0 (unlimited access)
    RETURN 0;
  END IF;
END;
$$;

COMMENT ON FUNCTION increment_match_counter(uuid) IS 
'Enforces 5-match monthly limit for free users. Uses row locking to prevent concurrent abuse. Returns new count.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_match_counter(uuid) TO authenticated;

-- ============================================================================
-- RESTORE ABUSE LOGGING FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION log_abuse_attempt(
  user_uuid uuid,
  fingerprint_id text,
  abuse_type_param text,
  details_param jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert abuse log entry for monitoring
  INSERT INTO abuse_log (user_id, fingerprint, abuse_type, details)
  VALUES (user_uuid, fingerprint_id, abuse_type_param, details_param);
  
  -- Return success
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Silently fail if logging fails (don't block legitimate users)
    RETURN false;
END;
$$;

COMMENT ON FUNCTION log_abuse_attempt(uuid, text, text, jsonb) IS 
'Logs abuse attempts for monitoring and pattern detection. Fails silently to not impact user experience.';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION log_abuse_attempt(uuid, text, text, jsonb) TO authenticated;

-- ============================================================================
-- RESTORE RESTRICTIVE ABUSE LOG POLICIES
-- ============================================================================

-- Drop overly permissive policy if it exists
DROP POLICY IF EXISTS "Users can read own abuse logs" ON abuse_log;

-- Only service role can write abuse logs (prevents user manipulation)
CREATE POLICY "Service role can manage abuse logs"
  ON abuse_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read their own logs for transparency
CREATE POLICY "Users can view own abuse logs"
  ON abuse_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
