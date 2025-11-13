import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPageSummaryTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_summary';
  }

  getDescription(): string {
    return 'Get OnPage crawl summary. Returns aggregated statistics and overview of the website crawl including total pages, errors, warnings, and key SEO metrics. Essential for understanding overall site health.';
  }

  getParams(): z.ZodRawShape {
    return {
      id: z.string().describe('Task ID from the task_post endpoint'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const response = await this.dataForSEOClient.makeRequest(
        `/v3/on_page/summary/${params.id}`,
        'GET',
        null
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

