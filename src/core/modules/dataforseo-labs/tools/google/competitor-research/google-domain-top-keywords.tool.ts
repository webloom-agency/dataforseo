import { z } from 'zod';
import { DataForSEOClient } from '../../../../../client/dataforseo.client.js';
import { BaseTool } from '../../../../base.tool.js';

export class GoogleDomainTopKeywordsTool extends BaseTool {
  constructor(private client: DataForSEOClient) {
    super(client);
  }

  getName(): string {
    return 'dataforseo_labs_google_domain_top_keywords';
  }

  getDescription(): string {
    return `Get top organic, paid, and AI keywords for a domain in a single comprehensive view. Returns the most valuable keywords a domain ranks for in organic search, paid search, and AI-powered search results (Google AI Overview & ChatGPT), including search volume, position, traffic estimates, and CPC data. Perfect for competitive analysis and identifying keyword opportunities across all search channels.`;
  }

  getParams(): z.ZodRawShape {
    return {
      target: z.string().describe(`Target domain or page URL (required)
Domain name without https:// or www., or webpage URL with https://
Example: "example.com" or "https://example.com/page"`),
      location_name: z.string().default("United States").describe(`Full name of the location (optional)
Only in format "Country" (not "City" or "Region")
Default: "United States"
Examples: "United Kingdom", "United States", "Canada"`),
      language_code: z.string().default("en").describe(`Language code (optional)
Default: "en"
Example: "en", "fr", "de"`),
      organic_limit: z.number().min(1).max(1000).default(50).describe(`Maximum number of organic keywords to return (optional)
Default: 50
Range: 1-1000`),
      paid_limit: z.number().min(1).max(1000).default(50).describe(`Maximum number of paid keywords to return (optional)
Default: 50
Range: 1-1000`),
      ai_limit: z.number().min(1).max(1000).default(50).describe(`Maximum number of AI keywords to return (optional)
Default: 50
Range: 1-1000
AI keywords are those where the domain appears in Google AI Overview or ChatGPT responses`),
      include_ai_keywords: z.boolean().default(true).describe(`Include AI keywords (optional)
Default: true
If false, only organic and paid keywords will be returned
Note: AI data availability varies by location and language`),
      sort_by: z.string().default("search_volume").describe(`Sort results by (optional)
Possible values: "search_volume", "rank", "cpc", "traffic"
Default: "search_volume"
Organic and paid keywords will be sorted by this metric in descending order
AI keywords will be sorted by AI search volume in descending order`),
      min_search_volume: z.number().optional().describe(`Minimum search volume filter (optional)
Only return keywords with search volume >= this value
Example: 100`),
      include_subdomains: z.boolean().default(false).describe(`Include keywords from subdomains (optional)
Default: false`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const results: any = {
        target: params.target,
        location_name: params.location_name,
        language_code: params.language_code,
        organic_keywords: [],
        paid_keywords: [],
        ai_keywords: [],
        summary: {
          total_organic_keywords: 0,
          total_paid_keywords: 0,
          total_ai_keywords: 0,
          organic_traffic_potential: 0,
          paid_traffic_cost: 0,
          ai_search_volume: 0,
        },
        error_details: [],
      };

      // Determine sort field mapping
      let sortField = 'keyword_data.keyword_info.search_volume';
      if (params.sort_by === 'rank') {
        sortField = 'ranked_serp_element.serp_item.rank_absolute';
      } else if (params.sort_by === 'cpc') {
        sortField = 'keyword_data.keyword_info.cpc';
      } else if (params.sort_by === 'traffic') {
        sortField = 'ranked_serp_element.serp_item.etv';
      }

      const sortDirection = params.sort_by === 'rank' ? 'asc' : 'desc';

      // Build filters
      const baseFilters: any[] = [];
      if (params.min_search_volume) {
        baseFilters.push(['keyword_data.keyword_info.search_volume', '>=', params.min_search_volume]);
      }

      // 1. Get organic keywords
      try {
        const organicFilters = [...baseFilters];
        if (organicFilters.length > 0) {
          organicFilters.push('and');
        }
        organicFilters.push(['ranked_serp_element.serp_item.type', '=', 'organic']);

        const organicResponse: any = await this.client.makeRequest(
          '/v3/dataforseo_labs/google/ranked_keywords/live',
          'POST',
          [{
            target: params.target,
            location_name: params.location_name,
            language_code: params.language_code,
            limit: params.organic_limit,
            filters: organicFilters,
            order_by: [`${sortField},${sortDirection}`],
            include_subdomains: params.include_subdomains,
            include_clickstream_data: false,
          }]
        );

        if (organicResponse?.tasks?.[0]?.result?.[0]?.items) {
          const items = organicResponse.tasks[0].result[0].items;
          results.organic_keywords = items.map((item: any) => ({
            keyword: item.keyword_data?.keyword || '',
            search_volume: item.keyword_data?.keyword_info?.search_volume || 0,
            position: item.ranked_serp_element?.serp_item?.rank_absolute || 0,
            previous_position: item.ranked_serp_element?.serp_item?.previous_rank_absolute || null,
            url: item.ranked_serp_element?.serp_item?.url || '',
            etv: item.ranked_serp_element?.serp_item?.etv || 0,
            cpc: item.keyword_data?.keyword_info?.cpc || 0,
            competition: item.keyword_data?.keyword_info?.competition || null,
            search_intent: item.keyword_data?.search_intent_info?.main_intent || null,
            impressions: item.keyword_data?.impressions_info?.value || null,
          }));
          
          results.summary.total_organic_keywords = organicResponse.tasks[0].result[0].total_count || 0;
          results.summary.organic_traffic_potential = items.reduce(
            (sum: number, item: any) => sum + (item.ranked_serp_element?.serp_item?.etv || 0), 
            0
          );
        }
      } catch (error: any) {
        results.error_details.push({
          source: 'organic_keywords',
          message: error.message || 'Failed to retrieve organic keywords',
        });
      }

      // 2. Get paid keywords
      try {
        const paidFilters = [...baseFilters];
        if (paidFilters.length > 0) {
          paidFilters.push('and');
        }
        paidFilters.push(['ranked_serp_element.serp_item.type', '=', 'paid']);

        const paidResponse: any = await this.client.makeRequest(
          '/v3/dataforseo_labs/google/ranked_keywords/live',
          'POST',
          [{
            target: params.target,
            location_name: params.location_name,
            language_code: params.language_code,
            limit: params.paid_limit,
            filters: paidFilters,
            order_by: [`${sortField},${sortDirection}`],
            include_subdomains: params.include_subdomains,
            include_clickstream_data: false,
          }]
        );

        if (paidResponse?.tasks?.[0]?.result?.[0]?.items) {
          const items = paidResponse.tasks[0].result[0].items;
          results.paid_keywords = items.map((item: any) => ({
            keyword: item.keyword_data?.keyword || '',
            search_volume: item.keyword_data?.keyword_info?.search_volume || 0,
            position: item.ranked_serp_element?.serp_item?.rank_absolute || 0,
            previous_position: item.ranked_serp_element?.serp_item?.previous_rank_absolute || null,
            url: item.ranked_serp_element?.serp_item?.url || '',
            etv: item.ranked_serp_element?.serp_item?.etv || 0,
            cpc: item.keyword_data?.keyword_info?.cpc || 0,
            competition: item.keyword_data?.keyword_info?.competition || null,
            estimated_cost: (item.ranked_serp_element?.serp_item?.etv || 0) * (item.keyword_data?.keyword_info?.cpc || 0),
            ad_title: item.ranked_serp_element?.serp_item?.title || null,
          }));
          
          results.summary.total_paid_keywords = paidResponse.tasks[0].result[0].total_count || 0;
          results.summary.paid_traffic_cost = items.reduce(
            (sum: number, item: any) => {
              const etv = item.ranked_serp_element?.serp_item?.etv || 0;
              const cpc = item.keyword_data?.keyword_info?.cpc || 0;
              return sum + (etv * cpc);
            },
            0
          );
        }
      } catch (error: any) {
        results.error_details.push({
          source: 'paid_keywords',
          message: error.message || 'Failed to retrieve paid keywords',
        });
      }

      // 3. Get AI keywords if requested
      if (params.include_ai_keywords) {
        try {
          const cleanTarget = params.target.replace(/^(https?:\/\/)?(www\.)?/, '');
          
          // Build AI filters
          const aiFilters: any[] = [];
          if (params.min_search_volume) {
            aiFilters.push(['ai_search_volume', '>=', params.min_search_volume]);
          }

          // Get Google AI Overview mentions
          const googleAiResponse: any = await this.client.makeRequest(
            '/v3/ai_optimization/llm_mentions/search/live',
            'POST',
            [{
              target: [{ domain: cleanTarget }],
              location_name: params.location_name,
              language_code: params.language_code,
              platform: 'google',
              filters: aiFilters.length > 0 ? aiFilters : undefined,
              order_by: ['ai_search_volume,desc'],
              limit: Math.ceil(params.ai_limit / 2), // Split between Google and ChatGPT
            }]
          );

          // Get ChatGPT mentions
          const chatGptResponse: any = await this.client.makeRequest(
            '/v3/ai_optimization/llm_mentions/search/live',
            'POST',
            [{
              target: [{ domain: cleanTarget }],
              location_name: params.location_name,
              language_code: params.language_code,
              platform: 'chat_gpt',
              filters: aiFilters.length > 0 ? aiFilters : undefined,
              order_by: ['ai_search_volume,desc'],
              limit: Math.ceil(params.ai_limit / 2), // Split between Google and ChatGPT
            }]
          );

          // Debug logging
          console.log('[DOMAIN_TOP_KEYWORDS] Google AI Response:', JSON.stringify(googleAiResponse).substring(0, 500));
          console.log('[DOMAIN_TOP_KEYWORDS] ChatGPT Response:', JSON.stringify(chatGptResponse).substring(0, 500));

          const googleAiItems = googleAiResponse?.tasks?.[0]?.result?.[0]?.items || [];
          const chatGptItems = chatGptResponse?.tasks?.[0]?.result?.[0]?.items || [];

          console.log('[DOMAIN_TOP_KEYWORDS] Google AI Items Count:', googleAiItems.length);
          console.log('[DOMAIN_TOP_KEYWORDS] ChatGPT Items Count:', chatGptItems.length);

          // Combine and process AI keywords
          const allAiKeywords = [
            ...googleAiItems.map((item: any) => ({ ...item, platform: 'google_ai_overview' })),
            ...chatGptItems.map((item: any) => ({ ...item, platform: 'chatgpt' })),
          ];

          // Sort by AI search volume and limit
          allAiKeywords.sort((a: any, b: any) => (b.ai_search_volume || 0) - (a.ai_search_volume || 0));
          const limitedAiKeywords = allAiKeywords.slice(0, params.ai_limit);

          results.ai_keywords = limitedAiKeywords.map((item: any) => ({
            keyword: item.question || '',
            platform: item.platform,
            ai_search_volume: item.ai_search_volume || 0,
            monthly_searches: item.monthly_searches || [],
            answer: item.answer ? item.answer.substring(0, 200) + '...' : null, // Truncate for readability
            sources_count: item.sources?.length || 0,
            domain_mentioned_in: item.sources?.some((s: any) => s.domain?.includes(cleanTarget)) ? 'sources' : 'answer',
          }));

          results.summary.total_ai_keywords = 
            (googleAiResponse?.tasks?.[0]?.result?.[0]?.total_count || 0) +
            (chatGptResponse?.tasks?.[0]?.result?.[0]?.total_count || 0);
          
          results.summary.ai_search_volume = limitedAiKeywords.reduce(
            (sum: number, item: any) => sum + (item.ai_search_volume || 0),
            0
          );
        } catch (error: any) {
          results.ai_keywords = [];
          results.error_details.push({
            source: 'ai_keywords',
            message: error.message || 'Failed to retrieve AI keywords',
            note: 'AI data may not be available for all locations and languages',
          });
        }
      }

      // Add insights
      results.insights = {
        organic_keywords_shown: results.organic_keywords.length,
        paid_keywords_shown: results.paid_keywords.length,
        ai_keywords_shown: results.ai_keywords.length,
        avg_organic_position: results.organic_keywords.length > 0
          ? (results.organic_keywords.reduce((sum: number, k: any) => sum + k.position, 0) / results.organic_keywords.length).toFixed(1)
          : 0,
        avg_paid_position: results.paid_keywords.length > 0
          ? (results.paid_keywords.reduce((sum: number, k: any) => sum + k.position, 0) / results.paid_keywords.length).toFixed(1)
          : 0,
        top_organic_keyword: results.organic_keywords[0]?.keyword || null,
        top_paid_keyword: results.paid_keywords[0]?.keyword || null,
        top_ai_keyword: results.ai_keywords[0]?.keyword || null,
        total_keywords_across_all_channels: 
          results.organic_keywords.length + 
          results.paid_keywords.length + 
          results.ai_keywords.length,
      };

      return results;
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

