import { z } from 'zod';
import { DataForSEOClient } from '../../../../../client/dataforseo.client.js';
import { BaseTool } from '../../../../base.tool.js';
import { LocationResolver } from '../../../../../utils/location-resolver.js';

export class GoogleDomainRankOverviewTool extends BaseTool {
  constructor(private client: DataForSEOClient) {
    super(client);
  }

  getName(): string {
    return 'dataforseo_labs_google_domain_rank_overview';
  }

  getDescription(): string {
    return `This endpoint will provide you with ranking and traffic data from organic and paid search for the specified domain. You will be able to review the domain ranking distribution in SERPs as well as estimated monthly traffic volume for both organic and paid results.`;
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
          `ignore highly similar keywords, if set to true, results will be more accurate`)
    };
  }

  async handle(params: any): Promise<any> {
    try {
      // Resolve location to country level (this endpoint only accepts country names)
      const locationName = await LocationResolver.resolveToCountry(this.client, params.location_name) || params.location_name;
      
      const response = await this.client.makeRequest('/v3/dataforseo_labs/google/domain_rank_overview/live', 'POST', [{
        target: params.target,
        location_name: locationName,
        language_code: params.language_code,
        ignore_synonyms: params.ignore_synonyms
      }]);
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
} 