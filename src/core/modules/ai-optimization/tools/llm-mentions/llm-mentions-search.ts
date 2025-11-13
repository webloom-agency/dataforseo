import { z } from 'zod';
import { BaseTool } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';

export class LlmMentionsSearchTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'ai_optimization_llm_mentions_search';
  }

  getDescription(): string {
    return 'Search for LLM mentions of keywords and domains. This endpoint provides detailed and structured mentions data for target keywords and domains, including mentions count, quoted links from AI responses, and AI search volume. Essential for tracking AI visibility and optimizing for LLM citations.';
  }

  getParams(): z.ZodRawShape {
    return {
      language_code: z.string().describe('Language code (REQUIRED, e.g., "en", "fr")'),
      location_code: z.number().describe('Location code (REQUIRED, e.g., 2840 for United States). Use locations_and_languages endpoint to get codes'),
      platform: z.string().describe('AI platform (REQUIRED, e.g., "google" for Google AI Overview, "chat_gpt" for ChatGPT)'),
      target: z.array(z.object({
        keyword: z.string().describe('The keyword or domain to search mentions for'),
        search_scope: z.array(z.string()).optional().describe('Search scope, e.g., ["answer"] to analyze LLM responses')
      })).describe('Array of targets to analyze'),
      filters: z.array(z.any()).optional().describe('Array of filter objects to refine results'),
      order_by: z.array(z.string()).optional().describe('Results ordering'),
      limit: z.number().optional().describe('Number of results to return'),
      offset: z.number().optional().describe('Offset for pagination'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {
        language_code: params.language_code,
        location_code: params.location_code,
        platform: params.platform,
        target: params.target,
      };

      if (params.filters) payload.filters = params.filters;
      if (params.order_by) payload.order_by = params.order_by;
      if (params.limit) payload.limit = params.limit;
      if (params.offset) payload.offset = params.offset;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/ai_optimization/llm_mentions/search/live',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

