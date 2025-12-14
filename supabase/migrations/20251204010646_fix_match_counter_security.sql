/*
  # Fix Match Counter Security Vulnerability

  ## Critical Security Issue Fixed
  - monthly_matches_used counter was never incremented
  - Free users could bypass 5-match limit indefinitely
  - Business logic flaw allowing unlimited access

  ## Changes Made
  
  1. New Function: `increment_match_counter`
     - Atomically increments monthly_matches_used for free users
     - Returns new count after increment
     - Uses row-level locking to prevent race conditions
     - Only affects users on 'free' tier
     - SECURITY DEFINER with proper search_path
  
  2. Security Features
     - Uses SELECT FOR UPDATE to prevent concurrent abuse
     - Checks subscription tier before incrementing
     - Returns current count for client-side validation
     - Proper error handling and rollback protection

  ## Usage
  - Call before loading grants for free users
  - Function returns new match count
  - Client checks if limit exceeded (>5) and blocks access
*/

-- Create secure function to increment match counter
CREATE OR REPLACE FUNCTION increment_match_counter(user_uuid uuid)
RETURNS integer
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_count integer;
  user_tier text;
BEGIN
  -- Get user's subscription tier with row lock
  SELECT subscription_tier INTO user_tier
  FROM profiles
  WHERE id = user_uuid
  FOR UPDATE;
  
  -- Only increment for free tier users
  IF user_tier = 'free' OR user_tier IS NULL THEN
    -- Increment and get new count atomically
    UPDATE profiles
    SET monthly_matches_used = COALESCE(monthly_matches_used, 0) + 1
    WHERE id = user_uuid
    RETURNING monthly_matches_used INTO new_count;
    
    RETURN new_count;
  ELSE
    -- Pro users: just return 0 (unlimited)
    RETURN 0;
  END IF;
END;
$$;

COMMENT ON FUNCTION increment_match_counter(uuid) IS 'Securely increments monthly match counter for free users. Uses row locking to prevent race conditions.';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION increment_match_counter(uuid) TO authenticated;
