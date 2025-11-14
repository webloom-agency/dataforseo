import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class SerpGoogleAdsAdvertisersLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_google_ads_advertisers_live_advanced';
  }

  getDescription(): string {
    return 'Get a list of advertisers who have run ads for a specific keyword from Google Ads Transparency Center. Returns advertiser information including advertiser IDs, verification status, approximate ad counts, and domains. Useful for competitive advertising research and identifying who is advertising on specific keywords.';
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe("Search keyword to find advertisers for (required)"),
      location_name: z.string().default('United States').describe(`full name of the location
required field
Location format - hierarchical, comma-separated (from most specific to least)
Can be one of:
1. Country only: "United States"
2. Region,Country: "California,United States"
3. City,Region,Country: "San Francisco,California,United States"`),
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
        location_name: params.location_name,
      };

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

