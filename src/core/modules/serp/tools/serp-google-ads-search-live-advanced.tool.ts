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
    return 'Get Google Ads data from the Ads Transparency Center for a specific keyword. This endpoint provides information about advertisers, ad creatives, formats (text/image/video), preview URLs, and date ranges when ads were shown. Useful for competitive ad research and market analysis.';
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe("Search keyword to find ads for (required)"),
      location_name: z.string().default('United States').describe(`full name of the location
required field
Location format - hierarchical, comma-separated (from most specific to least)
Can be one of:
1. Country only: "United States"
2. Region,Country: "California,United States"
3. City,Region,Country: "San Francisco,California,United States"`),
      language_code: z.string().default('en').describe("search engine language code (e.g., 'en')"),
      depth: z.number().min(1).max(700).default(100).optional().describe(`parsing depth
optional field
number of results to return
default value: 100
max value: 700`),
      advertiser_ids: z.array(z.string()).optional().describe(`filter by advertiser IDs
optional field
array of advertiser IDs to filter results
example: ["AR13752565271262920705", "AR02439908557932462081"]`),
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
      const requestBody: any = {
        keyword: params.keyword,
        location_name: params.location_name,
        language_code: params.language_code,
      };

      // Add optional parameters only if they are provided
      if (params.depth !== undefined) {
        requestBody.depth = params.depth;
      }
      if (params.advertiser_ids !== undefined && params.advertiser_ids.length > 0) {
        requestBody.advertiser_ids = params.advertiser_ids;
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

