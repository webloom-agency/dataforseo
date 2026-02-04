import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';
import { LocationResolver } from '../../../utils/location-resolver.js';

export class SerpGoogleAdsAdvertisersLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_google_ads_advertisers_live_advanced';
  }

  getDescription(): string {
    return 'Get a list of advertisers who have run ads for a specific keyword from Google Ads Transparency Center. Returns advertiser information including advertiser IDs, verification status, approximate ad counts, and domains. Useful for competitive advertising research and identifying who is advertising on specific keywords. Location supports natural language input (e.g., "Brussels", "NYC").';
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe("Search keyword to find advertisers for (required)"),
      location_name: z.string().default('United States').describe(`location name - supports natural language input
Examples: "Brussels", "NYC", "Paris", "United States"
Will be auto-resolved to full DataForSEO format if needed`),
      language_code: z.string().default('en').optional().describe("search engine language code (e.g., 'en')"),
      device: z.string().default('desktop').optional().describe(`device type
optional field
can take the values: desktop, mobile
default value: desktop`),
      os: z.string().optional().describe(`device operating system
optional field
can take the values: windows, macos, android, ios
default value: windows`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      console.error(JSON.stringify(params, null, 2));
      const requestBody: any = {
        keyword: params.keyword,
      };

      // Auto-resolve location_name if not already in hierarchical format
      if (params.location_name !== undefined) {
        if (!LocationResolver.isAlreadyFormatted(params.location_name)) {
          console.error(`[SerpGoogleAdsAdvertisers] Resolving location: "${params.location_name}"`);
          const resolved = await LocationResolver.resolve(this.dataForSEOClient, params.location_name, 'google');
          if (resolved) {
            requestBody.location_code = resolved.location_code;
            console.error(`[SerpGoogleAdsAdvertisers] Resolved to location_code: ${resolved.location_code} (${resolved.location_name})`);
          } else {
            requestBody.location_name = params.location_name;
          }
        } else {
          requestBody.location_name = params.location_name;
        }
      }

      // Add optional parameters only if they are provided
      if (params.language_code !== undefined) {
        requestBody.language_code = params.language_code;
      }
      if (params.device !== undefined) {
        requestBody.device = params.device;
      }
      if (params.os !== undefined) {
        requestBody.os = params.os;
      }

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/serp/google/ads_advertisers/live/advanced',
        'POST',
        [requestBody]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

