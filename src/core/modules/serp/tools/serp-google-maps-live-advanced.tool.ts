import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class SerpGoogleMapsLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_google_maps_live_advanced';
  }

  getDescription(): string {
    return 'Get real-time Google Maps results. Returns local business listings from Google Maps including business names, addresses, ratings, reviews, contact information, and coordinates. Essential for local SEO and business listings analysis.';
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe('Search keyword (e.g., "restaurants near me", "hotels in Paris")'),
      location_coordinate: z.string().optional().describe('GPS coordinates in the format "latitude,longitude" (e.g., "48.8566,2.3522")'),
      location_name: z.string().optional().describe('Full name of the location'),
      location_code: z.number().optional().describe('Location code'),
      language_name: z.string().optional().describe('Full name of the language'),
      language_code: z.string().optional().describe('Language code (e.g., "en")'),
      depth: z.number().optional().default(100).describe('Number of results to return (max 500)'),
      search_param: z.string().optional().describe('Additional search parameters'),
      zoom: z.number().optional().describe('Map zoom level (1-21)'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {
        keyword: params.keyword,
      };

      if (params.location_coordinate) payload.location_coordinate = params.location_coordinate;
      if (params.location_name) payload.location_name = params.location_name;
      if (params.location_code) payload.location_code = params.location_code;
      if (params.language_name) payload.language_name = params.language_name;
      if (params.language_code) payload.language_code = params.language_code;
      if (params.depth) payload.depth = params.depth;
      if (params.search_param) payload.search_param = params.search_param;
      if (params.zoom) payload.zoom = params.zoom;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/serp/google/maps/live/advanced',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

