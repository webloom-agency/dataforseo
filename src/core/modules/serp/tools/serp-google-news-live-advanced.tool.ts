import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class SerpGoogleNewsLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_google_news_live_advanced';
  }

  getDescription(): string {
    return 'Get real-time Google News results. Returns Google News search results including news articles, headlines, sources, and publication dates. Perfect for monitoring news coverage, brand mentions, and trending topics.';
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe('Search keyword for news articles'),
      location_name: z.string().optional().describe('Full name of the location (e.g., "United States")'),
      location_code: z.number().optional().describe('Location code'),
      language_name: z.string().optional().describe('Full name of the language (e.g., "English")'),
      language_code: z.string().optional().describe('Language code (e.g., "en")'),
      device: z.enum(['desktop', 'mobile']).optional().default('desktop').describe('Device type'),
      os: z.string().optional().describe('Operating system'),
      depth: z.number().optional().default(100).describe('Number of results to return (max 700)'),
      time_range: z.string().optional().describe('Time range filter (e.g., "qdr:d" for past day, "qdr:w" for past week, "qdr:m" for past month)'),
      sort_by: z.enum(['date', 'relevance']).optional().describe('Sort order for news results'),
      search_param: z.string().optional().describe('Additional search parameters'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {
        keyword: params.keyword,
      };

      if (params.location_name) payload.location_name = params.location_name;
      if (params.location_code) payload.location_code = params.location_code;
      if (params.language_name) payload.language_name = params.language_name;
      if (params.language_code) payload.language_code = params.language_code;
      if (params.device) payload.device = params.device;
      if (params.os) payload.os = params.os;
      if (params.depth) payload.depth = params.depth;
      if (params.time_range) payload.time_range = params.time_range;
      if (params.sort_by) payload.sort_by = params.sort_by;
      if (params.search_param) payload.search_param = params.search_param;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/serp/google/news/live/advanced',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

