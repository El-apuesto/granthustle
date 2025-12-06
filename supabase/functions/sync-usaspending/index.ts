import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface USASpendingAward {
  Award?: {
    id?: string;
    fain?: string;
    uri?: string;
    description?: string;
    total_obligation?: number;
    date_signed?: string;
  };
  Recipient?: {
    recipient_name?: string;
  };
  place_of_performance?: {
    state_name?: string;
    country_name?: string;
  };
  funding_agency?: {
    toptier_agency_name?: string;
    toptier_agency_code?: string;
  };
  cfda?: {
    program_number?: string;
    program_title?: string;
  };
  period_of_performance?: {
    start_date?: string;
    end_date?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: syncLog } = await supabase
      .from('grant_sync_log')
      .insert({
        source: 'usaspending',
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
      const baseUrl = 'https://api.usaspending.gov/api/v2/search/spending_by_award/';
      
      const pages = 5;
      
      for (let page = 1; page <= pages; page++) {
        const requestBody = {
          filters: {
            award_type_codes: ['02', '03', '04', '05'],
            time_period: [
              {
                start_date: getDateDaysAgo(365),
                end_date: getDateDaysAgo(0),
              }
            ],
          },
          fields: [
            'Award',
            'Recipient',
            'funding_agency',
            'place_of_performance',
            'cfda',
            'period_of_performance',
          ],
          limit: 100,
          page: page,
        };

        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`USASpending API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const results = data.results || [];

        if (results.length === 0) {
          break;
        }

        for (const award of results as USASpendingAward[]) {
          processedCount++;

          try {
            const awardId = award.Award?.fain || award.Award?.id || `usa-${processedCount}`;
            const description = award.Award?.description || award.cfda?.program_title || 'Federal assistance award';
            const agencyName = award.funding_agency?.toptier_agency_name || 'Federal Government';
            const amount = award.Award?.total_obligation || 0;

            const grantData = {
              source: 'usaspending',
              source_id: awardId,
              source_url: award.Award?.uri || `https://www.usaspending.gov/award/${awardId}`,
              title: award.cfda?.program_title || `${agencyName} Award`,
              funder_name: agencyName,
              funder_type: 'federal',
              description: description.substring(0, 2000),
              full_text: description,
              award_min: Math.floor(amount * 0.8),
              award_max: Math.ceil(amount * 1.2),
              deadline: award.period_of_performance?.end_date || null,
              is_rolling: false,
              apply_url: award.Award?.uri || `https://www.usaspending.gov/award/${awardId}`,
              cfda_number: award.cfda?.program_number || null,
              agency_code: award.funding_agency?.toptier_agency_code || null,
              agency_name: agencyName,
              posted_date: award.Award?.date_signed || award.period_of_performance?.start_date || null,
              estimated_total_funding: Math.floor(amount),
              last_synced_at: new Date().toISOString(),
              sync_status: 'active',
              is_active: false,
              countries: [award.place_of_performance?.country_name || 'USA'],
              keywords: [
                award.cfda?.program_number,
                agencyName,
                'federal assistance',
              ].filter(Boolean),
            };

            const { error, data: result } = await supabase
              .from('grants')
              .upsert(grantData, {
                onConflict: 'source,source_id',
                ignoreDuplicates: false,
              })
              .select();

            if (error) {
              console.error('Error upserting award:', error);
              failedCount++;
            } else {
              const wasCreated = result && result[0]?.created_at === result[0]?.updated_at;
              if (wasCreated) {
                createdCount++;
              } else {
                updatedCount++;
              }
            }
          } catch (error) {
            console.error('Error processing award:', error);
            failedCount++;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

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
