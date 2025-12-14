const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ProPublicaOrg {
  ein: number;
  strein: string;
  name: string;
  sub_name: string;
  city: string;
  state: string;
  ntee_code: string;
  raw_ntee_code: string;
  subseccd: number;
  has_subseccd: boolean;
}

interface ProPublicaResponse {
  total_results: number;
  organizations: ProPublicaOrg[];
  num_pages: number;
  cur_page: number;
  per_page: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('q');
    const state = url.searchParams.get('state');
    const ntee = url.searchParams.get('ntee');

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ error: 'Missing search query parameter "q"' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build ProPublica API URL
    let apiUrl = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(searchQuery)}`;
    
    if (state) {
      apiUrl += `&state=${encodeURIComponent(state)}`;
    }
    
    if (ntee) {
      apiUrl += `&ntee=${encodeURIComponent(ntee)}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`ProPublica API error: ${response.status} ${response.statusText}`);
    }

    const data: ProPublicaResponse = await response.json();

    // Format response for easier consumption
    const formatted = {
      total: data.total_results,
      page: data.cur_page,
      pages: data.num_pages,
      per_page: data.per_page,
      results: data.organizations.map(org => ({
        ein: org.strein,
        name: org.name,
        city: org.city,
        state: org.state,
        ntee_code: org.ntee_code,
        subsection: org.subseccd,
        is_501c3: org.subseccd === 3,
      })),
    };

    return new Response(
      JSON.stringify(formatted),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Nonprofit lookup error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
