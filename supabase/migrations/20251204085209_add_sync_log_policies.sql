/*
  # Add RLS Policies for Grant Sync Log

  1. Security Changes
    - Add SELECT policy for authenticated users to view sync logs
    - Only edge functions (service role) can INSERT/UPDATE logs
    - Users can see sync history but cannot modify it
  
  2. Notes
    - grant_sync_log is a system table for tracking data imports
    - Read-only access helps users monitor grant data freshness
    - Write operations remain restricted to service role only
*/

-- Allow authenticated users to view sync logs
CREATE POLICY "Authenticated users can view sync logs"
  ON grant_sync_log
  FOR SELECT
  TO authenticated
  USING (true);
