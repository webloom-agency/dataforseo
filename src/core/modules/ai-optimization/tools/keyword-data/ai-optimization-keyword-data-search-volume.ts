import { z } from 'zod';
import { BaseTool, DataForSEOFullResponse } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';
import { ZodRawShape } from 'zod';

export class AiOptimizationKeywordDataSearchVolumeTool extends BaseTool {

  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }
  
  getName(): string {
      return "ai_optimization_keyword_data_search_volume";
  }

  getDescription(): string {
      return "Get AI search volume data for keywords. Returns AI search volume for the last month and 12-month trend. Requires location and language. Use ai_optimization_keyword_data_locations_and_languages to get available options.";
  }

  getParams(): z.ZodRawShape {
    return {
      keywords: z.array(z.string()).describe("Array of keywords. Maximum 1000 keywords. Keywords will be converted to lowercase."),
      location_code: z.number().optional().describe(`location code (required if location_name not specified)
example: 2840 (United States), 2250 (France)
use ai_optimization_keyword_data_locations_and_languages to get available locations`),
      location_name: z.string().optional().describe(`full name of the location (required if location_code not specified)
example: "United States", "France"
use ai_optimization_keyword_data_locations_and_languages to get available locations`),
      language_code: z.string().optional().describe(`language code (required if language_name not specified)
example: "en", "fr"
use ai_optimization_keyword_data_locations_and_languages to get available languages`),
      language_name: z.string().optional().describe(`full name of the language (required if language_code not specified)
example: "English", "French"
use ai_optimization_keyword_data_locations_and_languages to get available languages`),
      tag: z.string().optional().describe("User-defined task identifier. Maximum 255 characters."),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      console.error(JSON.stringify(params, null, 2));
      
      // Validate required fields
      if (!params.location_code && !params.location_name) {
        return this.formatErrorResponse(new Error('Either location_code or location_name is required'));
      }
      if (!params.language_code && !params.language_name) {
        return this.formatErrorResponse(new Error('Either language_code or language_name is required'));
      }
      
      const requestBody: any = {
        keywords: params.keywords
      };
      
      // Add location (prefer location_code)
      if (params.location_code !== undefined) {
        requestBody.location_code = params.location_code;
      } else if (params.location_name !== undefined) {
        requestBody.location_name = params.location_name;
      }
      
      // Add language (prefer language_code)
      if (params.language_code !== undefined) {
        requestBody.language_code = params.language_code;
      } else if (params.language_name !== undefined) {
        requestBody.language_name = params.language_name;
      }
      
      // Add optional tag
      if (params.tag !== undefined) {
        requestBody.tag = params.tag;
      }
      
      const response = await this.dataForSEOClient.makeRequest(
        `/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live`, 
        'POST', 
        [requestBody]
      );
      
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

}

