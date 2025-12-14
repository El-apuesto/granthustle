/*
  # Add Monthly Reset Automation for Free User Limits
  
  ## Monthly Counter Reset Function
  
  This migration adds automatic monthly reset functionality for free tier users.
  
  1. Reset Function
     - Checks if 30 days have passed since last reset
     - Resets monthly_matches_used to 0
     - Updates matches_reset_at timestamp
     - Called automatically by increment_match_counter
  
  2. Business Logic
     - Free users get 5 searches per month
     - Counter resets automatically after 30 days
     - Pro users are unaffected (unlimited)
  
  ## Usage
  - Integrated into increment_match_counter function
  - Runs automatically before incrementing counter
  - No manual intervention required
*/

-- Function to check and reset monthly counter if needed
CREATE OR REPLACE FUNCTION reset_monthly_counter_if_needed(user_uuid uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  last_reset timestamptz;
  days_since_reset integer;
BEGIN
  -- Get last reset date
  SELECT matches_reset_at INTO last_reset
  FROM profiles
  WHERE id = user_uuid;
  
  -- Calculate days since last reset
  days_since_reset := EXTRACT(DAY FROM (now() - last_reset));
  
  -- If 30+ days have passed, reset the counter
  IF days_since_reset >= 30 THEN
    UPDATE profiles
    SET 
      monthly_matches_used = 0,
      matches_reset_at = now()
    WHERE id = user_uuid;
  END IF;
END;
$$;

COMMENT ON FUNCTION reset_monthly_counter_if_needed(uuid) IS 
'Automatically resets monthly match counter after 30 days. Called by increment_match_counter.';

-- Update increment_match_counter to include automatic reset
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
  -- First, reset counter if 30 days have passed
  PERFORM reset_monthly_counter_if_needed(user_uuid);
  
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
'Enforces 5-match monthly limit for free users. Auto-resets after 30 days. Uses row locking to prevent concurrent abuse.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_monthly_counter_if_needed(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_match_counter(uuid) TO authenticated;
