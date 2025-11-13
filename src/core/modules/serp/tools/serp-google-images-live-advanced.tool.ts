import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class SerpGoogleImagesLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_google_images_live_advanced';
  }

  getDescription(): string {
    return 'Get real-time Google Images search results. Returns image search results including image URLs, titles, sources, sizes, and metadata. Perfect for visual content analysis, image SEO, and competitor image research.';
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe('Search keyword for images'),
      location_name: z.string().optional().describe('Full name of the location'),
      location_code: z.number().optional().describe('Location code'),
      language_name: z.string().optional().describe('Full name of the language'),
      language_code: z.string().optional().describe('Language code (e.g., "en")'),
      device: z.enum(['desktop', 'mobile']).optional().default('desktop').describe('Device type'),
      os: z.string().optional().describe('Operating system'),
      depth: z.number().optional().default(100).describe('Number of results to return (max 700)'),
      search_param: z.string().optional().describe('Additional search parameters'),
      image_type: z.enum(['all', 'photo', 'clipart', 'lineart', 'animated']).optional().describe('Type of images to search for'),
      image_size: z.enum(['all', 'large', 'medium', 'icon']).optional().describe('Size of images'),
      image_color: z.string().optional().describe('Color filter (e.g., "red", "blue", "color", "gray", "transparent")'),
      time_range: z.string().optional().describe('Time range filter'),
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
      if (params.search_param) payload.search_param = params.search_param;
      if (params.image_type) payload.image_type = params.image_type;
      if (params.image_size) payload.image_size = params.image_size;
      if (params.image_color) payload.image_color = params.image_color;
      if (params.time_range) payload.time_range = params.time_range;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/serp/google/images/live/advanced',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

