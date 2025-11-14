import { z } from 'zod';
import { BaseTool } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';

export class AiOptimizationLlmMentionsTopPagesLiveTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'ai_optimization_llm_mentions_top_pages_live';
  }

  getDescription(): string {
    return 'Get aggregated LLM mentions metrics grouped by the most frequently mentioned pages for specified target (domain or keyword). Returns top pages mentioned in AI-generated content (Google AI Overview or ChatGPT) with detailed metrics by location, language, and platform.';
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
- Domain: [{"domain": "en.wikipedia.org"}]
- Keyword: [{"keyword": "bmw", "search_scope": ["question"]}]
- Multiple: [{"domain": "en.wikipedia.org"}, {"keyword": "bmw"}]`),
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
      links_scope: z.string().optional().describe(`links source scope
optional field
specifies which links to use for extracting pages
possible values: sources, search_results
default: sources`),
      initial_dataset_filters: z.any().optional().describe(`array of results filtering parameters
optional field
you can add up to 8 filters with logical operators: and, or
supported operators: =, <>, in, not_in, like, not_like, ilike, not_ilike, match, not_match
example: ["ai_search_volume",">","1000"]`),
      items_list_limit: z.number().min(1).max(10).optional().describe(`maximum number of results in items array
optional field
minimum: 1, maximum: 10
default: 5`),
      internal_list_limit: z.number().min(1).max(10).optional().describe(`maximum number of elements within internal arrays
optional field
limits elements in sources_domain and search_results_domain arrays
minimum: 1, maximum: 10
default: 5`),
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
      if (params.links_scope !== undefined) {
        requestBody.links_scope = params.links_scope;
      }
      if (params.initial_dataset_filters !== undefined && Array.isArray(params.initial_dataset_filters) && params.initial_dataset_filters.length > 0) {
        requestBody.initial_dataset_filters = this.formatFilters(params.initial_dataset_filters);
      }
      if (params.items_list_limit !== undefined) {
        requestBody.items_list_limit = params.items_list_limit;
      }
      if (params.internal_list_limit !== undefined) {
        requestBody.internal_list_limit = params.internal_list_limit;
      }
      if (params.tag !== undefined) {
        requestBody.tag = params.tag;
      }

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/ai_optimization/llm_mentions/top_pages/live',
        'POST',
        [requestBody]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

