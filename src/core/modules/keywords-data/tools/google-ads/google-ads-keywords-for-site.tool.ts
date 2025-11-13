import { z } from 'zod';
import { BaseTool } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';

export class GoogleAdsKeywordsForSiteTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'keywords_data_google_ads_keywords_for_site';
  }

  getDescription(): string {
    return 'Get keyword ideas for a specific website. Returns a list of keywords relevant to the specified website with search volume, competition, and CPC data. Essential for competitor keyword research and discovering what keywords a domain ranks for in paid search.';
  }

  getParams(): z.ZodRawShape {
    return {
      target: z.string().describe('Target website URL or domain (e.g., "example.com" or "https://example.com/page")'),
      location_name: z.string().optional().describe('Full name of the location (e.g., "United States")'),
      location_code: z.number().optional().describe('Location code'),
      language_name: z.string().optional().describe('Full name of the language (e.g., "English")'),
      language_code: z.string().optional().describe('Language code (e.g., "en")'),
      include_seed_keyword: z.boolean().optional().describe('Include seed keywords in results'),
      include_serp_info: z.boolean().optional().describe('Include SERP information'),
      limit: z.number().optional().default(100).describe('Number of results to return (max 1000)'),
      offset: z.number().optional().describe('Offset for pagination'),
      filters: z.array(z.any()).optional().describe('Array of filter objects'),
      order_by: z.array(z.string()).optional().describe('Results ordering (e.g., ["search_volume,desc"])'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {
        target: params.target,
      };

      if (params.location_name) payload.location_name = params.location_name;
      if (params.location_code) payload.location_code = params.location_code;
      if (params.language_name) payload.language_name = params.language_name;
      if (params.language_code) payload.language_code = params.language_code;
      if (params.include_seed_keyword !== undefined) payload.include_seed_keyword = params.include_seed_keyword;
      if (params.include_serp_info !== undefined) payload.include_serp_info = params.include_serp_info;
      if (params.limit) payload.limit = params.limit;
      if (params.offset) payload.offset = params.offset;
      if (params.filters) payload.filters = params.filters;
      if (params.order_by) payload.order_by = params.order_by;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/keywords_data/google_ads/keywords_for_site/live',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

