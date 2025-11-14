import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class SerpGoogleAdsSearchLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_google_ads_search_live_advanced';
  }

  getDescription(): string {
    return 'Get Google Ads data from a specific advertiser using their domain or advertiser ID. This endpoint retrieves all ads run by that advertiser from Google Ads Transparency Center, including ad creatives, formats (text/image/video), preview URLs, and date ranges when ads were shown. Useful for analyzing a specific competitor\'s advertising strategy.';
  }

  getParams(): z.ZodRawShape {
    return {
      target: z.string().optional().describe(`target advertiser domain
optional field (required if advertiser_id not provided)
domain name of the advertiser you want to get ads for
example: "apple.com", "nike.com"`),
      advertiser_id: z.string().optional().describe(`advertiser ID
optional field (required if target not provided)
unique identifier for the advertiser from Google Ads Transparency Center
example: "AR13752565271262920705"
note: you can get advertiser_id from the ads_advertisers endpoint`),
      location_name: z.string().default('United States').describe(`full name of the location
required field
Location format - hierarchical, comma-separated (from most specific to least)
Can be one of:
1. Country only: "United States"
2. Region,Country: "California,United States"
3. City,Region,Country: "San Francisco,California,United States"`),
      language_code: z.string().default('en').optional().describe("search engine language code (e.g., 'en')"),
      depth: z.number().min(1).max(700).default(100).optional().describe(`parsing depth
optional field
number of results to return
default value: 100
max value: 700`),
      search_partners: z.boolean().optional().describe(`include search partners
optional field
if true, will include ads shown on Google search partners
default: false`),
      date_from: z.string().optional().describe(`start date for ad data
optional field
format: "yyyy-mm-dd"
example: "2024-01-01"
note: ads data is available from June 2023 onwards`),
      date_to: z.string().optional().describe(`end date for ad data
optional field
format: "yyyy-mm-dd"
example: "2024-12-31"`),
      sort_by: z.string().optional().describe(`sort results by
optional field
can be one of: "last_shown", "first_shown"
default: "last_shown"`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      console.error(JSON.stringify(params, null, 2));
      
      // Validate that either target or advertiser_id is provided
      if (!params.target && !params.advertiser_id) {
        throw new Error('Either target (domain) or advertiser_id must be provided');
      }

      const requestBody: any = {
        location_name: params.location_name,
      };

      // Add either target or advertiser_id
      if (params.target) {
        requestBody.target = params.target;
      }
      if (params.advertiser_id) {
        requestBody.advertiser_id = params.advertiser_id;
      }

      // Add optional parameters only if they are provided
      if (params.language_code !== undefined) {
        requestBody.language_code = params.language_code;
      }
      if (params.depth !== undefined) {
        requestBody.depth = params.depth;
      }
      if (params.search_partners !== undefined) {
        requestBody.search_partners = params.search_partners;
      }
      if (params.date_from !== undefined) {
        requestBody.date_from = params.date_from;
      }
      if (params.date_to !== undefined) {
        requestBody.date_to = params.date_to;
      }
      if (params.sort_by !== undefined) {
        requestBody.sort_by = params.sort_by;
      }

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/serp/google/ads_search/live/advanced',
        'POST',
        [requestBody]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}
