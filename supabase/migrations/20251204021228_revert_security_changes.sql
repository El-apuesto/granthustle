/*
  # Revert Security Changes
  
  Removes the following unwanted changes:
  - Match counter enforcement function
  - Abuse logging function
  - Restrictive abuse_log policy
  
  Note: Keeping basic search_path settings on functions as they don't affect functionality
*/

-- Drop match counter function
DROP FUNCTION IF EXISTS increment_match_counter(uuid);

-- Drop abuse logging function
DROP FUNCTION IF EXISTS log_abuse_attempt(uuid, text, text, jsonb);

-- Drop restrictive policy on abuse_log
DROP POLICY IF EXISTS "Service role only access" ON abuse_log;

-- Add back open policy for abuse_log (users can read their own logs)
CREATE POLICY "Users can read own abuse logs"
  ON abuse_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
