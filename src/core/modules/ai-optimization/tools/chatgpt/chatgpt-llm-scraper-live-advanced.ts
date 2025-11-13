import { z } from 'zod';
import { BaseTool } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';

export class ChatGptLlmScraperLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'ai_optimization_chatgpt_llm_scraper_live_advanced';
  }

  getDescription(): string {
    return 'Scrape ChatGPT search results in real-time. Get structured data from ChatGPT search interface including AI responses, sources, and citations. Essential for analyzing how ChatGPT presents information for specific queries.';
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe('Search query to scrape ChatGPT results for'),
      location_name: z.string().optional().describe('Full name of the location (e.g., "United States")'),
      location_code: z.number().optional().describe('Location code (alternative to location_name)'),
      language_code: z.string().optional().describe('Language code (e.g., "en")'),
      depth: z.number().optional().describe('Depth of search results to retrieve'),
      model: z.string().optional().describe('ChatGPT model to use for scraping'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {
        keyword: params.keyword,
      };

      if (params.location_name) payload.location_name = params.location_name;
      if (params.location_code) payload.location_code = params.location_code;
      if (params.language_code) payload.language_code = params.language_code;
      if (params.depth) payload.depth = params.depth;
      if (params.model) payload.model = params.model;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/ai_optimization/chat_gpt/llm_scraper/live/advanced',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

