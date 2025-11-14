import { z } from 'zod';
import { DataForSEOClient } from '../../../../../client/dataforseo.client.js';
import { BaseTool } from '../../../../base.tool.js';

export class GoogleDomainTrafficOverviewTool extends BaseTool {
  constructor(private client: DataForSEOClient) {
    super(client);
  }

  getName(): string {
    return 'dataforseo_labs_google_domain_traffic_overview';
  }

  getDescription(): string {
    return `Get comprehensive traffic overview for a domain including organic traffic estimates, paid search traffic, and AI visibility/mentions over the last 12 months. This tool combines data from multiple sources to provide a complete picture of a domain's search presence across traditional and AI-powered search.`;
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
      const results: any = {
        target: params.target,
        location_name: params.location_name,
        language_code: params.language_code,
        period: 'last_12_months',
        organic_traffic: null,
        paid_traffic: null,
        ai_visibility: null,
        error_details: [],
      };

      // 1. Get organic and paid traffic estimates from Domain Rank Overview
      try {
        const trafficResponse = await this.client.makeRequest(
          '/v3/dataforseo_labs/google/domain_rank_overview/live',
          'POST',
          [{
            target: params.target,
            location_name: params.location_name,
            language_code: params.language_code,
            ignore_synonyms: params.ignore_synonyms,
          }]
        );

        if (trafficResponse?.tasks?.[0]?.result?.[0]) {
          const data = trafficResponse.tasks[0].result[0];
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
          source: 'organic_paid_traffic',
          message: error.message || 'Failed to retrieve organic/paid traffic data',
        });
      }

      // 2. Get AI visibility data if requested
      if (params.include_ai_visibility) {
        try {
          // Get Google AI Overview mentions
          const googleAiResponse = await this.client.makeRequest(
            '/v3/ai_optimization/llm_mentions/search/live',
            'POST',
            [{
              target: [{ domain: params.target.replace(/^(https?:\/\/)?(www\.)?/, '') }],
              location_name: params.location_name,
              language_code: params.language_code,
              platform: 'google',
              limit: 1, // We just need the total count
            }]
          );

          const googleAiData = googleAiResponse?.tasks?.[0]?.result?.[0];
          
          // Get ChatGPT mentions
          const chatGptResponse = await this.client.makeRequest(
            '/v3/ai_optimization/llm_mentions/search/live',
            'POST',
            [{
              target: [{ domain: params.target.replace(/^(https?:\/\/)?(www\.)?/, '') }],
              location_name: params.location_name,
              language_code: params.language_code,
              platform: 'chat_gpt',
              limit: 1, // We just need the total count
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

      // Add summary
      results.summary = {
        total_organic_keywords: results.organic_traffic?.keywords_count || 0,
        total_paid_keywords: results.paid_traffic?.keywords_count || 0,
        total_ai_mentions: results.ai_visibility?.total_ai_mentions || 0,
        organic_traffic_value: results.organic_traffic?.estimated_traffic_volume || 0,
        paid_traffic_value: results.paid_traffic?.estimated_traffic_volume || 0,
      };

      return results;
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

