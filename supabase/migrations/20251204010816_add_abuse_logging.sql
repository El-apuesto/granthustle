/*
  # Add Abuse Logging for Rate Limiting

  ## Security Enhancement
  - Log when users exceed match limits
  - Track abuse patterns (fingerprints, IPs, user agents)
  - Enable monitoring and blocking of abusive behavior

  ## New Function
  
  1. `log_abuse_attempt`
     - Records abuse attempts in abuse_log table
     - Automatically captures timestamp
     - Stores user ID, fingerprint, and abuse type
     - SECURITY DEFINER to allow authenticated users to log
     - Returns boolean (always true for client confirmation)
  
  ## Usage
  - Call when user exceeds limits
  - Call on suspicious activity patterns
  - Used for monitoring and analytics
*/

-- Create function to log abuse attempts
CREATE OR REPLACE FUNCTION log_abuse_attempt(
  user_uuid uuid,
  fingerprint_id text,
  abuse_type_param text,
  details_param jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert abuse log entry
  INSERT INTO abuse_log (user_id, fingerprint, abuse_type, details)
  VALUES (user_uuid, fingerprint_id, abuse_type_param, details_param);
  
  -- Always return true to indicate logging succeeded
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Silently fail if logging fails (don't block user flow)
    RETURN false;
END;
$$;

COMMENT ON FUNCTION log_abuse_attempt(uuid, text, text, jsonb) IS 'Logs abuse attempts for monitoring. Fails silently to not block normal operations.';

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION log_abuse_attempt(uuid, text, text, jsonb) TO authenticated;
