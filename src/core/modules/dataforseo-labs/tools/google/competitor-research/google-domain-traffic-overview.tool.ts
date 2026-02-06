import { z } from 'zod';
import { DataForSEOClient } from '../../../../../client/dataforseo.client.js';
import { BaseTool } from '../../../../base.tool.js';
import { LocationResolver } from '../../../../../utils/location-resolver.js';

export class GoogleDomainTrafficOverviewTool extends BaseTool {
  constructor(private client: DataForSEOClient) {
    super(client);
  }

  getName(): string {
    return 'dataforseo_labs_google_domain_traffic_overview';
  }

  getDescription(): string {
    return `Get comprehensive traffic overview for a domain including organic traffic estimates, paid search traffic, and AI visibility/mentions with month-by-month historical data for the last 12 months. Returns current metrics plus detailed monthly breakdown showing traffic trends across organic search, paid ads, Google AI Overview, and ChatGPT. Perfect for tracking domain performance over time and comparing traffic sources.`;
  }

  getParams(): z.ZodRawShape {
    return {
      target: z.string().describe(`Target domain (required)
Domain name without https:// or www.
Example: "example.com"`),
      location_name: z.string().default("United States").describe(`Full name of the location (optional)
Only in format "Country" (not "City" or "Region")
Default: "United States"
Examples: "United Kingdom", "United States", "Canada"`),
      language_code: z.string().default("en").describe(`Language code (optional)
Default: "en"
Example: "en", "fr", "de"`),
      include_ai_visibility: z.boolean().default(true).describe(`Include AI visibility data (optional)
If true, includes data on how often the domain appears in Google AI Overview and ChatGPT responses
Default: true
Note: AI data availability varies by location and language`),
      ignore_synonyms: z.boolean().default(true).describe(`Ignore highly similar keywords (optional)
If set to true, results will be more accurate by excluding near-duplicate keywords
Default: true`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      // Resolve location to country level (this endpoint only accepts country names)
      const locationName = await LocationResolver.resolveToCountry(this.client, params.location_name) || params.location_name;
      
      const results: any = {
        target: params.target,
        location_name: locationName,
        language_code: params.language_code,
        period: 'last_12_months',
        organic_traffic: null,
        paid_traffic: null,
        ai_visibility: null,
        monthly_breakdown: [],
        error_details: [],
      };

      // 1. Get current overview from Domain Rank Overview
      try {
        const currentResponse: any = await this.client.makeRequest(
          '/v3/dataforseo_labs/google/domain_rank_overview/live',
          'POST',
          [{
            target: params.target,
            location_name: locationName,
            language_code: params.language_code,
            ignore_synonyms: params.ignore_synonyms,
          }]
        );

        if (currentResponse?.tasks?.[0]?.result?.[0]?.items?.[0]) {
          const data = currentResponse.tasks[0].result[0].items[0];
          
          // Current metrics summary
          results.organic_traffic = {
            metrics: data.metrics?.organic || null,
            keywords_count: data.metrics?.organic?.count || 0,
            estimated_traffic_volume: data.metrics?.organic?.etv || 0,
            traffic_cost: data.metrics?.organic?.estimated_paid_traffic_cost || 0,
            positions_distribution: data.metrics?.organic?.pos_1 ? {
              top_3: (data.metrics.organic.pos_1 || 0) + (data.metrics.organic.pos_2_3 || 0),
              top_10: data.metrics.organic.pos_4_10 || 0,
              top_20: data.metrics.organic.pos_11_20 || 0,
              top_50: data.metrics.organic.pos_21_50 || 0,
              top_100: data.metrics.organic.pos_51_100 || 0,
            } : null,
          };

          results.paid_traffic = {
            metrics: data.metrics?.paid || null,
            keywords_count: data.metrics?.paid?.count || 0,
            estimated_traffic_volume: data.metrics?.paid?.etv || 0,
            traffic_cost: data.metrics?.paid?.estimated_paid_traffic_cost || 0,
            positions_distribution: data.metrics?.paid?.pos_1 ? {
              top_3: (data.metrics.paid.pos_1 || 0) + (data.metrics.paid.pos_2_3 || 0),
              top_10: data.metrics.paid.pos_4_10 || 0,
              top_20: data.metrics.paid.pos_11_20 || 0,
              top_50: data.metrics.paid.pos_21_50 || 0,
              top_100: data.metrics.paid.pos_51_100 || 0,
            } : null,
          };
        }
      } catch (error: any) {
        results.error_details.push({
          source: 'current_overview',
          message: error.message || 'Failed to retrieve current overview data',
        });
      }

      // 2. Get historical monthly data from Historical Rank Overview
      try {
        // Calculate date 12 months ago
        const today = new Date();
        const twelveMonthsAgo = new Date(today);
        twelveMonthsAgo.setMonth(today.getMonth() - 12);
        const dateFrom = twelveMonthsAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        const historicalResponse: any = await this.client.makeRequest(
          '/v3/dataforseo_labs/google/historical_rank_overview/live',
          'POST',
          [{
            target: params.target,
            location_name: locationName,
            language_code: params.language_code,
            ignore_synonyms: params.ignore_synonyms,
            date_from: dateFrom, // Request last 12 months explicitly
          }]
        );

        if (historicalResponse?.tasks?.[0]?.result?.[0]?.items) {
          const items = historicalResponse.tasks[0].result[0].items;
          
          // Create a map of monthly data
          const monthlyMap: any = {};

          // Process each month's data
          items.forEach((monthData: any) => {
            const key = `${monthData.year}-${String(monthData.month).padStart(2, '0')}`;
            
            monthlyMap[key] = {
              year: monthData.year,
              month: monthData.month,
              organic: {
                keywords_count: monthData.metrics?.organic?.count || 0,
                estimated_traffic_volume: monthData.metrics?.organic?.etv || 0,
                traffic_cost: monthData.metrics?.organic?.estimated_paid_traffic_cost || 0,
              },
              paid: {
                keywords_count: monthData.metrics?.paid?.count || 0,
                estimated_traffic_volume: monthData.metrics?.paid?.etv || 0,
                traffic_cost: monthData.metrics?.paid?.estimated_paid_traffic_cost || 0,
              },
            };
          });

          // Store for later AI data merge
          results._monthly_map = monthlyMap;
        }
      } catch (error: any) {
        results.error_details.push({
          source: 'historical_data',
          message: error.message || 'Failed to retrieve historical data',
        });
      }

      // 3. Get AI visibility data if requested
      if (params.include_ai_visibility) {
        try {
          // Get Google AI Overview mentions with more data for monthly breakdown
          const googleAiResponse: any = await this.client.makeRequest(
            '/v3/ai_optimization/llm_mentions/search/live',
            'POST',
            [{
              target: [{ domain: params.target.replace(/^(https?:\/\/)?(www\.)?/, '') }],
              location_name: locationName,
              language_code: params.language_code,
              platform: 'google',
              limit: 100, // Get more items to aggregate monthly data
            }]
          );

          const googleAiData = googleAiResponse?.tasks?.[0]?.result?.[0];
          
          // Get ChatGPT mentions
          const chatGptResponse: any = await this.client.makeRequest(
            '/v3/ai_optimization/llm_mentions/search/live',
            'POST',
            [{
              target: [{ domain: params.target.replace(/^(https?:\/\/)?(www\.)?/, '') }],
              location_name: locationName,
              language_code: params.language_code,
              platform: 'chat_gpt',
              limit: 100, // Get more items to aggregate monthly data
            }]
          );

          const chatGptData = chatGptResponse?.tasks?.[0]?.result?.[0];

          results.ai_visibility = {
            google_ai_overview: {
              total_mentions: googleAiData?.total_count || 0,
              note: googleAiData?.total_count === 0 
                ? 'No mentions found. AI Overview availability varies by location and language.' 
                : null,
            },
            chatgpt: {
              total_mentions: chatGptData?.total_count || 0,
              note: chatGptData?.total_count === 0 
                ? 'No mentions found. ChatGPT data is primarily English-centric.' 
                : null,
            },
            total_ai_mentions: (googleAiData?.total_count || 0) + (chatGptData?.total_count || 0),
          };

          // Process monthly AI data from items
          const monthlyMap = results._monthly_map || {};

          // Process Google AI monthly searches
          if (googleAiData?.items) {
            googleAiData.items.forEach((item: any) => {
              if (item.monthly_searches) {
                item.monthly_searches.forEach((monthData: any) => {
                  const key = `${monthData.year}-${String(monthData.month).padStart(2, '0')}`;
                  if (!monthlyMap[key]) {
                    monthlyMap[key] = { year: monthData.year, month: monthData.month };
                  }
                  if (!monthlyMap[key].ai_visibility) {
                    monthlyMap[key].ai_visibility = {
                      google_ai_search_volume: 0,
                      chatgpt_search_volume: 0,
                      total_ai_search_volume: 0,
                    };
                  }
                  monthlyMap[key].ai_visibility.google_ai_search_volume += monthData.search_volume || 0;
                });
              }
            });
          }

          // Process ChatGPT monthly searches
          if (chatGptData?.items) {
            chatGptData.items.forEach((item: any) => {
              if (item.monthly_searches) {
                item.monthly_searches.forEach((monthData: any) => {
                  const key = `${monthData.year}-${String(monthData.month).padStart(2, '0')}`;
                  if (!monthlyMap[key]) {
                    monthlyMap[key] = { year: monthData.year, month: monthData.month };
                  }
                  if (!monthlyMap[key].ai_visibility) {
                    monthlyMap[key].ai_visibility = {
                      google_ai_search_volume: 0,
                      chatgpt_search_volume: 0,
                      total_ai_search_volume: 0,
                    };
                  }
                  monthlyMap[key].ai_visibility.chatgpt_search_volume += monthData.search_volume || 0;
                });
              }
            });
          }

          results._monthly_map = monthlyMap;
        } catch (error: any) {
          results.ai_visibility = {
            error: 'Failed to retrieve AI visibility data',
            message: error.message || 'Unknown error',
            note: 'AI visibility data may not be available for all locations and languages',
          };
          results.error_details.push({
            source: 'ai_visibility',
            message: error.message || 'Failed to retrieve AI visibility data',
          });
        }
      }

      // 4. Compile monthly breakdown - always return 12 months
      const monthlyMap = results._monthly_map || {};
      
      // Generate array of last 12 months (most recent first)
      const today = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const last12Months: Array<{ year: number; month: number; key: string }> = [];
      
      for (let i = 0; i < 12; i++) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        const key = `${year}-${String(month).padStart(2, '0')}`;
        last12Months.push({ year, month, key });
      }

      results.monthly_breakdown = last12Months.map(({ year, month, key }) => {
        const data = monthlyMap[key] || {};
        
        // Calculate total AI search volume if present
        let aiVisibility = {
          google_ai_search_volume: 0,
          chatgpt_search_volume: 0,
          total_ai_search_volume: 0,
        };
        
        if (data.ai_visibility) {
          aiVisibility = {
            google_ai_search_volume: data.ai_visibility.google_ai_search_volume || 0,
            chatgpt_search_volume: data.ai_visibility.chatgpt_search_volume || 0,
            total_ai_search_volume: 
              (data.ai_visibility.google_ai_search_volume || 0) + 
              (data.ai_visibility.chatgpt_search_volume || 0),
          };
        }

        const monthName = monthNames[month - 1];
        const organic = data.organic || {
          keywords_count: 0,
          estimated_traffic_volume: 0,
          traffic_cost: 0,
        };
        const paid = data.paid || {
          keywords_count: 0,
          estimated_traffic_volume: 0,
          traffic_cost: 0,
        };

        return {
          period: `${monthName} ${year}`,
          year,
          month,
          organic_traffic: organic,
          paid_traffic: paid,
          ai_visibility: aiVisibility,
          total_traffic_estimate: 
            (organic.estimated_traffic_volume || 0) + 
            (paid.estimated_traffic_volume || 0) +
            (aiVisibility.total_ai_search_volume || 0),
        };
      });

      // Clean up temporary field
      delete results._monthly_map;

      // Add summary
      results.summary = {
        total_organic_keywords: results.organic_traffic?.keywords_count || 0,
        total_paid_keywords: results.paid_traffic?.keywords_count || 0,
        total_ai_mentions: results.ai_visibility?.total_ai_mentions || 0,
        organic_traffic_value: results.organic_traffic?.estimated_traffic_volume || 0,
        paid_traffic_value: results.paid_traffic?.estimated_traffic_volume || 0,
        months_available: results.monthly_breakdown?.length || 0,
      };

      return results;
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

