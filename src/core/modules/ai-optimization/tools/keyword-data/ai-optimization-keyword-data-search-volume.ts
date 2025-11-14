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
      return "This endpoint provides global AI search volume data for your target keywords, reflecting their estimated usage across AI LLMs. Note: This endpoint returns global data and does not support location or language filtering.";
  }

  getParams(): z.ZodRawShape {
    return {
      keywords: z.array(z.string()).describe("Keywords. The maximum number of keywords you can specify: 1000. Returns AI search volume for the last month and 12-month trend."),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      console.error(JSON.stringify(params, null, 2));
      const response = await this.dataForSEOClient.makeRequest(`/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live`, 'POST', [{
        keywords: params.keywords
      }]);
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

}