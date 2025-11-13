import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPageKeywordDensityTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_keyword_density';
  }

  getDescription(): string {
    return 'Get keyword density analysis for a specific page. Returns frequency and density of keywords/phrases found on the page. Useful for content optimization and identifying over-optimization issues.';
  }

  getParams(): z.ZodRawShape {
    return {
      id: z.string().describe('Task ID from the task_post endpoint'),
      page_url: z.string().describe('URL of the specific page to analyze'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {
        page_url: params.page_url,
      };

      const response = await this.dataForSEOClient.makeRequest(
        `/v3/on_page/keyword_density/${params.id}`,
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

