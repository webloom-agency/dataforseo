import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class SerpGoogleAdsAdvertisersLocationsListTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_google_ads_advertisers_locations_list';
  }

  getDescription(): string {
    return 'Get the list of supported locations for Google Ads Advertisers. This endpoint returns available locations that can be used with the Google Ads Advertisers API.';
  }

  getParams(): z.ZodRawShape {
    return {
      country_iso_code: z.string().optional().describe(`country ISO code
optional field
ISO 3166-1 alpha-2 country code
example: "US", "GB", "FR"`),
      location_name: z.string().optional().describe(`location name or part of it
optional field
example: "United States", "California", "San Francisco"`),
      location_type: z.string().optional().describe(`location type
optional field
can be one of: Country, Region, City
example: "City"`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: Record<string, unknown> = {};

      if (params.country_iso_code) {
        payload['country_iso_code'] = params.country_iso_code;
      }
      if (params.location_type) {
        payload['location_type'] = params.location_type;
      }
      if (params.location_name) {
        payload['location_name'] = params.location_name;
      }

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/serp/google/ads_advertisers/locations',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

