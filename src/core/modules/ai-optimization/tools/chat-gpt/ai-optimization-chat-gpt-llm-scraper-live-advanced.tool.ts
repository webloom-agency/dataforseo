import { z } from 'zod';
import { BaseTool } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';

export class AiOptimizationChatGptLlmScraperLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'ai_optimization_chat_gpt_llm_scraper_live_advanced';
  }

  getDescription(): string {
    return 'Get live ChatGPT search results for a keyword. Returns ChatGPT response with sources, search results, and formatted content in markdown. Requires location and language. Note: Currently only supports English language.';
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe("Search keyword (required). Maximum 2000 characters."),
      location_code: z.number().optional().describe(`location code (required if location_name/location_coordinate not specified)
example: 2840 (United States), 2826 (United Kingdom)
use separate API call to get available locations`),
      location_name: z.string().optional().describe(`full name of location (required if location_code/location_coordinate not specified)
example: "London,England,United Kingdom"
use separate API call to get available locations`),
      location_coordinate: z.string().optional().describe(`GPS coordinates (required if location_code/location_name not specified)
format: "latitude,longitude"
example: "52.6178549,-155.352142"
Note: location will be set to the country containing the coordinates`),
      language_code: z.string().optional().describe(`language code (required if language_name not specified)
currently only supported value: "en"
use separate API call to get available languages`),
      language_name: z.string().optional().describe(`full name of language (required if language_code not specified)
currently only supported value: "English"
use separate API call to get available languages`),
      force_web_search: z.boolean().optional().describe(`force AI agent to use web search
optional field
when enabled, the AI model is forced to access and cite current web information
default: false
Note: no guarantee web sources will be cited even if true`),
      tag: z.string().max(255).optional().describe("User-defined task identifier. Maximum 255 characters."),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      console.error(JSON.stringify(params, null, 2));
      
      // Validate required keyword
      if (!params.keyword) {
        return this.formatErrorResponse(new Error('keyword parameter is required'));
      }
      
      // Validate location (at least one required)
      if (!params.location_code && !params.location_name && !params.location_coordinate) {
        return this.formatErrorResponse(new Error('One of location_code, location_name, or location_coordinate is required'));
      }
      
      // Validate language (at least one required)
      if (!params.language_code && !params.language_name) {
        return this.formatErrorResponse(new Error('Either language_code or language_name is required'));
      }
      
      const requestBody: any = {
        keyword: params.keyword,
      };
      
      // Add location (prefer location_code, then location_name, then location_coordinate)
      if (params.location_code !== undefined) {
        requestBody.location_code = params.location_code;
      } else if (params.location_name !== undefined) {
        requestBody.location_name = params.location_name;
      } else if (params.location_coordinate !== undefined) {
        requestBody.location_coordinate = params.location_coordinate;
      }
      
      // Add language (prefer language_code)
      if (params.language_code !== undefined) {
        requestBody.language_code = params.language_code;
      } else if (params.language_name !== undefined) {
        requestBody.language_name = params.language_name;
      }
      
      // Add optional parameters
      if (params.force_web_search !== undefined) {
        requestBody.force_web_search = params.force_web_search;
      }
      if (params.tag !== undefined) {
        requestBody.tag = params.tag;
      }
      
      const response = await this.dataForSEOClient.makeRequest(
        '/v3/ai_optimization/chat_gpt/llm_scraper/live/advanced',
        'POST',
        [requestBody]
      );
      
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

