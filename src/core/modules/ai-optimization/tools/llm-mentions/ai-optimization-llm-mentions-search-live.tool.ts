import { z } from 'zod';
import { BaseTool } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';

export class AiOptimizationLlmMentionsSearchLiveTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'ai_optimization_llm_mentions_search_live';
  }

  getDescription(): string {
    return 'Get mention data and related metrics from AI-powered search results (Google AI Overview or ChatGPT). Track how your domain or keywords are mentioned in AI search responses, including search volume, sources, and answer contexts. Useful for monitoring brand visibility in AI-generated content and optimizing for AI search.';
  }

  getParams(): z.ZodRawShape {
    return {
      target: z.any().describe(`array of target entities (required)
you can specify up to 10 entities
each entity must contain either domain or keyword

Target entity structure:
- domain (string, optional): target domain without https:// and www. (e.g., "en.wikipedia.org")
- keyword (string, optional): target keyword up to 2000 characters (e.g., "bmw")
- search_filter (string, optional): "include" or "exclude" (default: "include")
- search_scope (array, optional): for domain: ["any"], ["sources"], ["search_results"]; for keyword: ["any"], ["question"], ["answer"]
- match_type (string, optional): "word_match" or "partial_match" (default: "word_match")

Examples:
- Domain entity: [{"domain": "en.wikipedia.org", "search_filter": "exclude"}]
- Keyword entity: [{"keyword": "bmw", "search_scope": ["question"], "match_type": "partial_match"}]
- Multiple: [{"domain": "en.wikipedia.org"}, {"keyword": "bmw", "match_type": "partial_match"}]`),
      location_name: z.string().optional().describe(`full name of search location
optional field
example: "United States", "United Kingdom"
default: United States`),
      location_code: z.number().optional().describe(`search location code
optional field
example: 2840
default: 2840`),
      language_name: z.string().optional().describe(`full name of search language
optional field
example: "English"`),
      language_code: z.string().optional().describe(`search language code
optional field
example: "en", "fr"
default: en`),
      platform: z.string().optional().describe(`target AI platform
optional field
possible values: google (Google AI Overview), chat_gpt (ChatGPT)
default: google`),
      filters: z.any().optional().describe(`array of results filtering parameters
optional field
you can add up to 8 filters with logical operators: and, or
supported operators: =, <>, in, not_in, like, not_like, ilike, not_ilike, match, not_match
example: ["ai_search_volume",">","1000"]`),
      order_by: z.any().optional().describe(`results sorting rules
optional field
use same values as in filters array
sorting types: asc (ascending), desc (descending)
example: ["ai_search_volume,desc"]
maximum 3 sorting rules`),
      offset: z.number().min(0).max(20000).optional().describe(`offset in the results array
optional field
default: 0
maximum: 20000`),
      search_after_token: z.string().optional().describe(`token for subsequent requests (pagination beyond 20,000 results)
optional field
use the token from a previous response to get the next set of results
when using this, all other parameters must be identical to the previous request`),
      limit: z.number().min(1).max(1000).optional().describe(`maximum number of returned objects
optional field
default: 100
maximum: 1000`),
      tag: z.string().max(255).optional().describe(`user-defined task identifier
optional field
maximum 255 characters`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      console.error(JSON.stringify(params, null, 2));
      
      // Validate target parameter
      if (!params.target || !Array.isArray(params.target) || params.target.length === 0) {
        return this.formatErrorResponse(new Error('target parameter is required and must be a non-empty array'));
      }
      
      const requestBody: any = {
        target: params.target,
      };

      // Add optional parameters only if they are provided
      if (params.location_name !== undefined) {
        requestBody.location_name = params.location_name;
      }
      if (params.location_code !== undefined) {
        requestBody.location_code = params.location_code;
      }
      if (params.language_name !== undefined) {
        requestBody.language_name = params.language_name;
      }
      if (params.language_code !== undefined) {
        requestBody.language_code = params.language_code;
      }
      if (params.platform !== undefined) {
        requestBody.platform = params.platform;
      }
      if (params.filters !== undefined && Array.isArray(params.filters) && params.filters.length > 0) {
        requestBody.filters = this.formatFilters(params.filters);
      }
      if (params.order_by !== undefined && Array.isArray(params.order_by) && params.order_by.length > 0) {
        requestBody.order_by = this.formatOrderBy(params.order_by);
      }
      if (params.offset !== undefined) {
        requestBody.offset = params.offset;
      }
      if (params.search_after_token !== undefined) {
        requestBody.search_after_token = params.search_after_token;
      }
      if (params.limit !== undefined) {
        requestBody.limit = params.limit;
      }
      if (params.tag !== undefined) {
        requestBody.tag = params.tag;
      }

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/ai_optimization/llm_mentions/search/live',
        'POST',
        [requestBody]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

