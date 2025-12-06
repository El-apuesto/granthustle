/*
  Expand Grants Schema for Multi-Source Integration

  Overview:
  Expands grants table to handle data from Grants.gov, Candid, Instrumentl,
  GrantStation, GrantForward, and state grant portals.

  New Columns:
  - source tracking (source, source_id, source_url, last_synced_at, sync_status)
  - federal metadata (cfda_number, opportunity_number, agency info)
  - enhanced matching (funding types, categories, keywords, full_text)
  - additional fields (posted_date, close_date, archive_date, cost_sharing)

  Indexes:
  - Full text search
  - Source tracking
  - Federal-specific lookups
*/

-- Add source tracking columns
ALTER TABLE grants ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE grants ADD COLUMN IF NOT EXISTS source_id text;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS last_synced_at timestamptz DEFAULT now();
ALTER TABLE grants ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'active' CHECK (sync_status IN ('active', 'expired', 'archived'));

-- Add federal grant metadata
ALTER TABLE grants ADD COLUMN IF NOT EXISTS cfda_number text;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS opportunity_number text;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS funding_instrument_types text[];
ALTER TABLE grants ADD COLUMN IF NOT EXISTS funding_activity_categories text[];
ALTER TABLE grants ADD COLUMN IF NOT EXISTS agency_code text;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS agency_name text;

-- Add enhanced date tracking
ALTER TABLE grants ADD COLUMN IF NOT EXISTS posted_date date;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS close_date date;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS archive_date date;

-- Add enhanced funding information
ALTER TABLE grants ADD COLUMN IF NOT EXISTS estimated_total_funding bigint;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS expected_awards integer;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS cost_sharing_required boolean DEFAULT false;

-- Add additional information
ALTER TABLE grants ADD COLUMN IF NOT EXISTS additional_info_url text;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS full_text text;
ALTER TABLE grants ADD COLUMN IF NOT EXISTS keywords text[];

-- Create unique constraint on source + source_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_grants_source_unique 
  ON grants(source, source_id) 
  WHERE source_id IS NOT NULL;

-- Create indexes for source tracking
CREATE INDEX IF NOT EXISTS idx_grants_source ON grants(source);
CREATE INDEX IF NOT EXISTS idx_grants_sync_status ON grants(sync_status);
CREATE INDEX IF NOT EXISTS idx_grants_last_synced ON grants(last_synced_at);

-- Create indexes for federal grants
CREATE INDEX IF NOT EXISTS idx_grants_cfda ON grants(cfda_number) WHERE cfda_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_grants_opportunity ON grants(opportunity_number) WHERE opportunity_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_grants_agency_code ON grants(agency_code) WHERE agency_code IS NOT NULL;

-- Create GIN indexes for array columns
CREATE INDEX IF NOT EXISTS idx_grants_funding_instruments ON grants USING gin(funding_instrument_types);
CREATE INDEX IF NOT EXISTS idx_grants_funding_categories ON grants USING gin(funding_activity_categories);
CREATE INDEX IF NOT EXISTS idx_grants_keywords ON grants USING gin(keywords);

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_grants_close_date ON grants(close_date) WHERE close_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_grants_posted_date ON grants(posted_date) WHERE posted_date IS NOT NULL;

-- Create full text search index
CREATE INDEX IF NOT EXISTS idx_grants_full_text_search ON grants USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(full_text, '')));

-- Create grant sync log table
CREATE TABLE IF NOT EXISTS grant_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  sync_started_at timestamptz DEFAULT now(),
  sync_completed_at timestamptz,
  records_processed integer DEFAULT 0,
  records_created integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sync_log_source ON grant_sync_log(source);
CREATE INDEX IF NOT EXISTS idx_sync_log_started ON grant_sync_log(sync_started_at);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON grant_sync_log(status);

-- Enable RLS on grant_sync_log (admin only via service role)
ALTER TABLE grant_sync_log ENABLE ROW LEVEL SECURITY;