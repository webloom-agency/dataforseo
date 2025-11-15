import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPageWaterfallTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_waterfall';
  }

  getDescription(): string {
    return `Get detailed page speed waterfall data showing how resources load on a specific page. Returns timing information for each resource (DNS lookup, connection time, download time, etc.) and identifies render-blocking resources. Essential for page speed optimization.`;
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }

  getParams(): z.ZodRawShape {
    return {
      task_id: z.string().describe(`Task ID (required)
The UUID of a completed crawl task
Example: "07131248-1535-0216-1000-17384017ad04"`),
      
      url: z.string().describe(`Page URL (required)
The page URL to get waterfall data for
Must be an absolute URL from the crawled site
Example: "https://example.com/page"`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      if (!params.task_id || !params.url) {
        return {
          error: 'Missing required parameters',
          message: 'You must provide: task_id, url',
        };
      }

      const requestBody: any = {
        id: params.task_id,
        url: params.url,
      };

      const response: any = await this.dataForSEOClient.makeRequest(
        '/v3/on_page/waterfall',
        'POST',
        [requestBody]
      );

      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

