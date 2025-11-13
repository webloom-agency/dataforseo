import { z } from 'zod';
import { BaseTool } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';

export class LlmMentionsAggregatedMetricsTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'ai_optimization_llm_mentions_aggregated_metrics';
  }

  getDescription(): string {
    return 'Get aggregated LLM mentions metrics. Provides consolidated overview of key mention metrics across different dimensions such as location, language, AI platform, and source domains. Perfect for high-level AI visibility analysis.';
  }

  getParams(): z.ZodRawShape {
    return {
      target: z.string().describe('Target keyword or domain to analyze'),
      location_name: z.string().optional().describe('Full name of the location (e.g., "United States")'),
      location_code: z.number().optional().describe('Location code (alternative to location_name)'),
      language_code: z.string().optional().describe('Language code (e.g., "en")'),
      ai_platform: z.array(z.string()).optional().describe('Filter by AI platforms (e.g., ["chatgpt", "gemini"])'),
      date_from: z.string().optional().describe('Start date in YYYY-MM-DD format'),
      date_to: z.string().optional().describe('End date in YYYY-MM-DD format'),
      aggregation_dimension: z.enum(['location', 'language', 'ai_platform', 'domain']).optional()
        .describe('Dimension to aggregate by: location, language, ai_platform, or domain'),
      filters: z.array(z.any()).optional().describe('Array of filter objects'),
      order_by: z.array(z.string()).optional().describe('Results ordering'),
      limit: z.number().optional().default(100).describe('Number of results to return'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {
        target: params.target,
      };

      if (params.location_name) payload.location_name = params.location_name;
      if (params.location_code) payload.location_code = params.location_code;
      if (params.language_code) payload.language_code = params.language_code;
      if (params.ai_platform) payload.ai_platform = params.ai_platform;
      if (params.date_from) payload.date_from = params.date_from;
      if (params.date_to) payload.date_to = params.date_to;
      if (params.aggregation_dimension) payload.aggregation_dimension = params.aggregation_dimension;
      if (params.filters) payload.filters = params.filters;
      if (params.order_by) payload.order_by = params.order_by;
      if (params.limit) payload.limit = params.limit;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/ai_optimization/llm_mentions/aggregated_metrics/live',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

