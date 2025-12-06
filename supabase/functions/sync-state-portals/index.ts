import { createClient } from 'npm:@supabase/supabase-js@2';
import * as cheerio from 'npm:cheerio@1.0.0-rc.12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface StatePortalConfig {
  name: string;
  state: string;
  url: string;
  apiEndpoint?: string;
  scrapingSelector?: string;
}

const STATE_PORTALS: StatePortalConfig[] = [
  {
    name: 'Florida SHARE',
    state: 'FL',
    url: 'https://www.floridajobs.org/rebuildflorida',
    apiEndpoint: 'https://api.floridajobs.org/grants/v1/opportunities',
  },
  {
    name: 'NY Grants Gateway',
    state: 'NY',
    url: 'https://grantsgateway.ny.gov',
    apiEndpoint: 'https://grantsgateway.ny.gov/api/opportunities',
  },
  {
    name: 'Texas eGrants',
    state: 'TX',
    url: 'https://www.egrants.org',
    apiEndpoint: 'https://www.egrants.org/api/grants',
  },
  {
    name: 'California Grants Portal',
    state: 'CA',
    url: 'https://www.grants.ca.gov',
    apiEndpoint: 'https://api.grants.ca.gov/v1/grants',
  },
  {
    name: 'Illinois GATA',
    state: 'IL',
    url: 'https://grants.illinois.gov',
    apiEndpoint: 'https://grants.illinois.gov/api/grants',
  },
  {
    name: 'Pennsylvania eGrants',
    state: 'PA',
    url: 'https://www.egrants.pa.gov',
  },
  {
    name: 'Ohio Grants',
    state: 'OH',
    url: 'https://grants.ohio.gov',
  },
  {
    name: 'Michigan Grants',
    state: 'MI',
    url: 'https://www.michigan.gov/grants',
  },
  {
    name: 'Washington Grants Portal',
    state: 'WA',
    url: 'https://www.grants.wa.gov',
  },
  {
    name: 'Massachusetts Grants',
    state: 'MA',
    url: 'https://www.mass.gov/grants',
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let totalProcessed = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalFailed = 0;

    const results = [];

    // Process each state portal
    for (const portal of STATE_PORTALS) {
      const { data: syncLog } = await supabase
        .from('grant_sync_log')
        .insert({
          source: `state_${portal.state.toLowerCase()}`,
          status: 'running',
          metadata: { portal_name: portal.name },
        })
        .select()
        .single();

      const syncLogId = syncLog?.id;

      let processedCount = 0;
      let createdCount = 0;
      let updatedCount = 0;
      let failedCount = 0;

      try {
        console.log(`Processing ${portal.name}...`);

        if (portal.apiEndpoint) {
          // Try API approach first
          try {
            const grants = await fetchFromApi(portal);
            
            for (const grant of grants) {
              processedCount++;
              const result = await upsertGrant(supabase, grant, portal);
              if (result.created) createdCount++;
              else if (result.updated) updatedCount++;
              else failedCount++;
            }
          } catch (apiError) {
            console.error(`API failed for ${portal.name}, skipping:`, apiError);
            failedCount++;
          }
        } else {
          // Web scraping approach
          try {
            const grants = await scrapePortal(portal);
            
            for (const grant of grants) {
              processedCount++;
              const result = await upsertGrant(supabase, grant, portal);
              if (result.created) createdCount++;
              else if (result.updated) updatedCount++;
              else failedCount++;
            }
          } catch (scrapeError) {
            console.error(`Scraping failed for ${portal.name}:`, scrapeError);
            failedCount++;
          }
        }

        // Update sync log
        await supabase
          .from('grant_sync_log')
          .update({
            sync_completed_at: new Date().toISOString(),
            records_processed: processedCount,
            records_created: createdCount,
            records_updated: updatedCount,
            records_failed: failedCount,
            status: 'completed',
          })
          .eq('id', syncLogId);

        results.push({
          portal: portal.name,
          processed: processedCount,
          created: createdCount,
          updated: updatedCount,
          failed: failedCount,
        });

        totalProcessed += processedCount;
        totalCreated += createdCount;
        totalUpdated += updatedCount;
        totalFailed += failedCount;

      } catch (error) {
        await supabase
          .from('grant_sync_log')
          .update({
            sync_completed_at: new Date().toISOString(),
            records_processed: processedCount,
            records_failed: failedCount,
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', syncLogId);

        results.push({
          portal: portal.name,
          error: error.message,
        });
      }

      // Rate limiting between portals
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_processed: totalProcessed,
        total_created: totalCreated,
        total_updated: totalUpdated,
        total_failed: totalFailed,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('State portal sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function fetchFromApi(portal: StatePortalConfig): Promise<any[]> {
  const response = await fetch(portal.apiEndpoint!, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  return normalizeApiResponse(data, portal.state);
}

async function scrapePortal(portal: StatePortalConfig): Promise<any[]> {
  const response = await fetch(portal.url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const grants: any[] = [];
  
  $('.grant-listing, .opportunity-item, .grant-item').each((_i, elem) => {
    const $elem = $(elem);
    grants.push({
      title: $elem.find('.title, h3, h2').first().text().trim(),
      description: $elem.find('.description, .summary, p').first().text().trim(),
      deadline: $elem.find('.deadline, .due-date').first().text().trim(),
      url: $elem.find('a').first().attr('href'),
    });
  });
  
  return grants.filter(g => g.title);
}

function normalizeApiResponse(data: any, state: string): any[] {
  if (Array.isArray(data)) return data;
  if (data.grants) return data.grants;
  if (data.opportunities) return data.opportunities;
  if (data.results) return data.results;
  if (data.data) return data.data;
  return [];
}

async function upsertGrant(supabase: any, grant: any, portal: StatePortalConfig) {
  try {
    const grantData = {
      source: `state_${portal.state.toLowerCase()}`,
      source_id: grant.id?.toString() || `${portal.state}_${Date.now()}_${Math.random()}`,
      source_url: grant.url || portal.url,
      title: grant.title || 'Untitled Grant',
      funder_name: grant.funder || `${portal.state} State Government`,
      funder_type: 'federal',
      description: grant.description?.substring(0, 2000) || '',
      full_text: grant.description || '',
      award_min: grant.amount_min || grant.award_min || 0,
      award_max: grant.amount_max || grant.award_max || 0,
      deadline: grant.deadline || grant.close_date || null,
      is_rolling: grant.is_rolling || false,
      apply_url: grant.application_url || grant.url || portal.url,
      states: [portal.state],
      countries: ['USA'],
      last_synced_at: new Date().toISOString(),
      sync_status: 'active',
      is_active: true,
    };

    const { error, data: result } = await supabase
      .from('grants')
      .upsert(grantData, {
        onConflict: 'source,source_id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) throw error;

    const wasCreated = result && result[0]?.created_at === result[0]?.updated_at;
    return { created: wasCreated, updated: !wasCreated };
  } catch (error) {
    console.error('Error upserting grant:', error);
    return { created: false, updated: false };
  }
}
