/*
  # Grant Search Dashboard - Core Schema

  ## Overview
  Complete database schema for grant search SaaS with anti-abuse features.

  ## New Tables

  ### 1. profiles
  Extends auth.users with eligibility data, subscription info, and anti-abuse tracking.
  - `id` (uuid, FK to auth.users)
  - `email` (text, indexed)
  - `org_name` (text, required)
  - `ein_hash` (text, hashed EIN or SSN last-4 for fraud prevention)
  - `device_fingerprint` (text, for abuse detection)
  - `eligibility` (jsonb, stores 7-question answers)
  - `subscription_tier` (text: free, intro, season_pass, annual_pass)
  - `subscription_status` (text: active, cancelled, expired)
  - `stripe_customer_id` (text)
  - `subscription_ends_at` (timestamptz, for season/annual passes)
  - `intro_converted_at` (timestamptz, tracks $9→$29 conversion)
  - `monthly_matches_used` (integer, for free tier limit)
  - `matches_reset_at` (timestamptz, tracks monthly reset)
  - `questionnaire_completed` (boolean, default false)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. grants
  Master grant database with all eligibility criteria.
  - `id` (uuid)
  - `title` (text, indexed)
  - `funder_name` (text)
  - `funder_type` (text: federal, foundation, corporate, arts)
  - `description` (text)
  - `award_min` (integer, minimum award amount)
  - `award_max` (integer, maximum award amount)
  - `deadline` (date, indexed)
  - `is_rolling` (boolean, for ongoing deadlines)
  - `apply_url` (text)
  - `eligibility_criteria` (jsonb, structured matching data)
  - `countries` (text[], allowed countries)
  - `states` (text[], allowed states/provinces)
  - `entity_types` (text[], legal entity requirements)
  - `revenue_max` (integer, maximum revenue eligibility)
  - `fields` (text[], primary field tags)
  - `demographics` (text[], demographic focus tags)
  - `project_stages` (text[], acceptable project stages)
  - `requires_fiscal_sponsor` (boolean)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. saved_grants
  User's saved grants and tracking.
  - `id` (uuid)
  - `user_id` (uuid, FK to auth.users)
  - `grant_id` (uuid, FK to grants)
  - `status` (text: saved, in_progress, submitted)
  - `notes` (text)
  - `reminder_30d` (boolean)
  - `reminder_14d` (boolean)
  - `reminder_7d` (boolean)
  - `reminder_3d` (boolean)
  - `reminder_1d` (boolean)
  - `saved_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. submissions
  Application tracking and template storage.
  - `id` (uuid)
  - `user_id` (uuid, FK to auth.users)
  - `grant_id` (uuid, FK to grants)
  - `template_type` (text: federal, foundation, corporate, arts)
  - `application_data` (jsonb, pre-filled template data)
  - `status` (text: draft, completed, submitted)
  - `submitted_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. abuse_log
  Track suspicious activity for anti-abuse measures.
  - `id` (uuid)
  - `user_id` (uuid, FK to auth.users, nullable)
  - `email` (text)
  - `ein_hash` (text)
  - `device_fingerprint` (text)
  - `stripe_card_fingerprint` (text)
  - `action` (text: signup, subscription_attempt, match_view)
  - `blocked` (boolean)
  - `reason` (text)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Grants table is public read-only
  - Abuse log is admin-only

  ## Indexes
  - Performance indexes on frequently queried columns
  - Foreign key indexes for joins
  - Composite indexes for common query patterns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  org_name text NOT NULL,
  ein_hash text,
  device_fingerprint text,
  eligibility jsonb DEFAULT '{}'::jsonb,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'intro', 'season_pass', 'annual_pass')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  stripe_customer_id text,
  subscription_ends_at timestamptz,
  intro_converted_at timestamptz,
  monthly_matches_used integer DEFAULT 0,
  matches_reset_at timestamptz DEFAULT now(),
  questionnaire_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_ein_hash ON profiles(ein_hash) WHERE ein_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_device_fingerprint ON profiles(device_fingerprint) WHERE device_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Create grants table
CREATE TABLE IF NOT EXISTS grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  funder_name text NOT NULL,
  funder_type text NOT NULL CHECK (funder_type IN ('federal', 'foundation', 'corporate', 'arts')),
  description text NOT NULL,
  award_min integer DEFAULT 0,
  award_max integer DEFAULT 0,
  deadline date,
  is_rolling boolean DEFAULT false,
  apply_url text NOT NULL,
  eligibility_criteria jsonb DEFAULT '{}'::jsonb,
  countries text[] DEFAULT ARRAY['USA', 'Canada'],
  states text[],
  entity_types text[],
  revenue_max integer,
  fields text[],
  demographics text[],
  project_stages text[],
  requires_fiscal_sponsor boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grants_deadline ON grants(deadline) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_grants_funder_type ON grants(funder_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_grants_active ON grants(is_active);
CREATE INDEX IF NOT EXISTS idx_grants_fields ON grants USING gin(fields);
CREATE INDEX IF NOT EXISTS idx_grants_demographics ON grants USING gin(demographics);

-- Create saved_grants table
CREATE TABLE IF NOT EXISTS saved_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_id uuid NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  status text DEFAULT 'saved' CHECK (status IN ('saved', 'in_progress', 'submitted')),
  notes text,
  reminder_30d boolean DEFAULT true,
  reminder_14d boolean DEFAULT true,
  reminder_7d boolean DEFAULT true,
  reminder_3d boolean DEFAULT true,
  reminder_1d boolean DEFAULT true,
  saved_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, grant_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_grants_user ON saved_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_grants_grant ON saved_grants(grant_id);
CREATE INDEX IF NOT EXISTS idx_saved_grants_status ON saved_grants(status);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_id uuid NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  template_type text NOT NULL CHECK (template_type IN ('federal', 'foundation', 'corporate', 'arts')),
  application_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'submitted')),
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_grant ON submissions(grant_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Create abuse_log table
CREATE TABLE IF NOT EXISTS abuse_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  ein_hash text,
  device_fingerprint text,
  stripe_card_fingerprint text,
  action text NOT NULL,
  blocked boolean DEFAULT false,
  reason text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_abuse_log_email ON abuse_log(email);
CREATE INDEX IF NOT EXISTS idx_abuse_log_ein ON abuse_log(ein_hash) WHERE ein_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_abuse_log_fingerprint ON abuse_log(device_fingerprint) WHERE device_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_abuse_log_card ON abuse_log(stripe_card_fingerprint) WHERE stripe_card_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_abuse_log_created ON abuse_log(created_at);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE abuse_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for grants (public read)
CREATE POLICY "Anyone can view active grants"
  ON grants FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for saved_grants
CREATE POLICY "Users can view own saved grants"
  ON saved_grants FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved grants"
  ON saved_grants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved grants"
  ON saved_grants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved grants"
  ON saved_grants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for submissions
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own submissions"
  ON submissions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- No public access to abuse_log (admin only via service role)

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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