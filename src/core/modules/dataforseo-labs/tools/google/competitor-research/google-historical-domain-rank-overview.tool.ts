import { z } from 'zod';
import { DataForSEOClient } from '../../../../../client/dataforseo.client.js';
import { BaseTool, DataForSEOResponse } from '../../../../base.tool.js';
import { LocationResolver } from '../../../../../utils/location-resolver.js';

export class GoogleHistoricalDomainRankOverviewTool extends BaseTool {
  constructor(private client: DataForSEOClient) {
    super(client);
  }

  getName(): string {
    return 'dataforseo_labs_google_historical_rank_overview';
  }

  getDescription(): string {
    return `This endpoint will provide you with historical data on rankings and traffic of the specified domain, such as domain ranking distribution in SERPs and estimated monthly traffic volume for both organic and paid results`;
  }

  getParams(): z.ZodRawShape {
    return {
      target: z.string().describe(`target domain`),
      location_name: z.string().default("United States").describe(`full name of the location
required field
only in format "Country" (not "City" or "Region")
example:
'United Kingdom', 'United States', 'Canada'`),
      language_code: z.string().default("en").describe(
        `language code
        required field
        example:
        en`),
      ignore_synonyms: z.boolean().default(true).describe(
          `ignore highly similar keywords, if set to true, results will be more accurate`),        
      include_clickstream_data: z.boolean().optional().default(false).describe(
        `Include or exclude data from clickstream-based metrics in the result`)
    };
  }

  async handle(params: any): Promise<any> {
    try {
      // Resolve location to country level (this endpoint only accepts country names)
      const locationName = await LocationResolver.resolveToCountry(this.client, params.location_name) || params.location_name;
      
      const response = await this.client.makeRequest('/v3/dataforseo_labs/google/historical_rank_overview/live', 'POST', [{
        target: params.target,
        location_name: locationName,
        language_code: params.language_code,
        ignore_synonyms: params.ignore_synonyms,
        include_clickstream_data: params.include_clickstream_data
      }]);
      return this.validateAndFormatResponse(response);

    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
} 