import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class SerpGoogleAiModeLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_google_ai_mode_live_advanced';
  }

  getDescription(): string {
    return 'Get real-time Google AI Mode/AI Overviews results. This endpoint returns Google Search results with AI-powered summaries and AI Overviews. Essential for tracking AI-generated content in Google Search and understanding how Google AI presents information for specific queries. Perfect for SEO agencies analyzing AI visibility.';
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe('Search keyword'),
      location_name: z.string().optional().describe('Full name of the location (e.g., "United States", "Paris,France")'),
      location_code: z.number().optional().describe('Location code (use locations endpoint to get the list)'),
      language_name: z.string().optional().describe('Full name of the language (e.g., "English", "French")'),
      language_code: z.string().optional().describe('Language code (e.g., "en", "fr")'),
      device: z.enum(['desktop', 'mobile']).optional().default('desktop').describe('Device type'),
      os: z.string().optional().describe('Operating system (e.g., "windows", "macos", "android", "ios")'),
      depth: z.number().optional().default(100).describe('Parsing depth (max number of results, up to 700)'),
      max_crawl_pages: z.number().optional().describe('Max pages to crawl for AI Overview sources'),
      search_param: z.string().optional().describe('Additional search parameters'),
      calculate_rectangles: z.boolean().optional().describe('Calculate pixel rectangles for each element'),
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
      if (params.max_crawl_pages) payload.max_crawl_pages = params.max_crawl_pages;
      if (params.search_param) payload.search_param = params.search_param;
      if (params.calculate_rectangles !== undefined) payload.calculate_rectangles = params.calculate_rectangles;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/serp/google/ai_mode/live/advanced',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

