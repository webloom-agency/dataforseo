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
      return "Get global AI search volume data for keywords, reflecting their estimated usage in AI LLMs. Returns AI search volume for the last month and 12-month trend. Maximum 1000 keywords per request.";
  }

  getParams(): z.ZodRawShape {
    return {
      keywords: z.array(z.string()).describe("Array of keywords to get AI search volume for. Maximum 1000 keywords."),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      console.error(JSON.stringify(params, null, 2));
      
      const response = await this.dataForSEOClient.makeRequest(
        `/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live`, 
        'POST', 
        [{
          keywords: params.keywords
        }]
      );
      
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }

}

