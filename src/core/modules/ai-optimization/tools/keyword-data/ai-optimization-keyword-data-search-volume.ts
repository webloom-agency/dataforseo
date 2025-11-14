import { z } from 'zod';
import { BaseTool, DataForSEOFullResponse } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';
import { ZodRawShape } from 'zod';

export class AiOptimizationKeywordDataSearchVolumeTool extends BaseTool {

  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }
  
  getName(): string {
      return "ai_optimization_keyword_data_search_volume";
  }

  getDescription(): string {
      return "This endpoint provides search volume data for your target keywords, reflecting their estimated usage in AI LLMs";
  }

  getParams(): z.ZodRawShape {
    return {
      keywords: z.array(z.string()).describe("Keywords. The maximum number of keywords you can specify: 1000"),
      location_name: z.string().optional().describe(`full name of the location
optional field
example: 'United Kingdom', 'United States'
note: if not specified, location_code 2840 (United States) will be used`),
      location_code: z.number().optional().describe(`location code
optional field
example: 2840 (United States), 2250 (France)
note: use ai_optimization_keyword_data_locations_and_languages tool to get available locations`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      console.error(JSON.stringify(params, null, 2));
      const requestBody: any = {
        keywords: params.keywords,
      };
      
      // Add location (prefer location_code over location_name)
      if (params.location_code !== undefined) {
        requestBody.location_code = params.location_code;
      } else if (params.location_name !== undefined) {
        requestBody.location_name = params.location_name;
      }
      
      const response = await this.dataForSEOClient.makeRequest(`/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live`, 'POST', [requestBody]);
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

}