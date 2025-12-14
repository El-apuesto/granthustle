import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GrantsGovOpportunity {
  opportunityId: string;
  opportunityNumber: string;
  opportunityTitle: string;
  opportunityDescription: string;
  agencyCode: string;
  agencyName: string;
  cfdaNumbers?: string;
  postedDate: string;
  closeDate?: string;
  archiveDate?: string;
  awardCeiling?: number;
  awardFloor?: number;
  estimatedTotalProgramFunding?: number;
  expectedNumberOfAwards?: number;
  costSharingOrMatchingRequirement: string;
  fundingInstrumentTypes?: string[];
  fundingActivityCategories?: string[];
  eligibleApplicants?: string[];
  additionalInformationOnEligibility?: string;
  opportunityURL: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create sync log entry
    const { data: syncLog } = await supabase
      .from('grant_sync_log')
      .insert({
        source: 'grants_gov',
        status: 'running',
      })
      .select()
      .single();

    const syncLogId = syncLog?.id;

    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    try {
      // Grants.gov REST API v2 - No API key required
      const baseUrl = 'https://api.grants.gov/v2/grants/search';
      let offset = 0;
      const limit = 25; // Max per request
      let hasMore = true;

      while (hasMore) {
        const url = `${baseUrl}?offset=${offset}&limit=${limit}&status=posted`;

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Grants.gov API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const opportunities = data.opportunities || [];

        if (opportunities.length === 0) {
          hasMore = false;
          break;
        }

        // Process each opportunity
        for (const opp of opportunities as GrantsGovOpportunity[]) {
          processedCount++;

          try {
            const grantData = {
              source: 'grants_gov',
              source_id: opp.opportunityId,
              source_url: opp.opportunityURL,
              title: opp.opportunityTitle,
              funder_name: opp.agencyName || 'Federal Government',
              funder_type: 'federal',
              description: opp.opportunityDescription?.substring(0, 2000) || '',
              full_text: opp.opportunityDescription || '',
              award_min: opp.awardFloor || 0,
              award_max: opp.awardCeiling || 0,
              deadline: opp.closeDate ? new Date(opp.closeDate).toISOString().split('T')[0] : null,
              is_rolling: !opp.closeDate,
              apply_url: opp.opportunityURL,
              cfda_number: opp.cfdaNumbers,
              opportunity_number: opp.opportunityNumber,
              agency_code: opp.agencyCode,
              agency_name: opp.agencyName,
              posted_date: opp.postedDate ? new Date(opp.postedDate).toISOString().split('T')[0] : null,
              close_date: opp.closeDate ? new Date(opp.closeDate).toISOString().split('T')[0] : null,
              archive_date: opp.archiveDate ? new Date(opp.archiveDate).toISOString().split('T')[0] : null,
              estimated_total_funding: opp.estimatedTotalProgramFunding || null,
              expected_awards: opp.expectedNumberOfAwards || null,
              cost_sharing_required: opp.costSharingOrMatchingRequirement === 'Yes',
              funding_instrument_types: opp.fundingInstrumentTypes || [],
              funding_activity_categories: opp.fundingActivityCategories || [],
              entity_types: opp.eligibleApplicants || [],
              additional_info_url: opp.opportunityURL,
              last_synced_at: new Date().toISOString(),
              sync_status: 'active',
              is_active: true,
              countries: ['USA'],
            };

            // Upsert grant (update if exists, insert if new)
            const { error, data: result } = await supabase
              .from('grants')
              .upsert(grantData, {
                onConflict: 'source,source_id',
                ignoreDuplicates: false,
              })
              .select();

            if (error) {
              console.error('Error upserting grant:', error);
              failedCount++;
            } else {
              // Check if it was an insert or update based on created_at
              const wasCreated = result && result[0]?.created_at === result[0]?.updated_at;
              if (wasCreated) {
                createdCount++;
              } else {
                updatedCount++;
              }
            }
          } catch (error) {
            console.error('Error processing opportunity:', error);
            failedCount++;
          }
        }

        offset += limit;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
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

      return new Response(
        JSON.stringify({
          success: true,
          processed: processedCount,
          created: createdCount,
          updated: updatedCount,
          failed: failedCount,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      // Update sync log with error
      await supabase
        .from('grant_sync_log')
        .update({
          sync_completed_at: new Date().toISOString(),
          records_processed: processedCount,
          records_created: createdCount,
          records_updated: updatedCount,
          records_failed: failedCount,
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', syncLogId);

      throw error;
    }
  } catch (error) {
    console.error('Sync error:', error);
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

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
