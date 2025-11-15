import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPageRawHtmlTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_raw_html';
  }

  getDescription(): string {
    return `Get the raw HTML of a crawled page. Returns the complete HTML source code as it was crawled. Useful for detailed analysis, debugging, or extracting specific elements. Note: store_raw_html must be enabled when starting the crawl.`;
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }

  getParams(): z.ZodRawShape {
    return {
      task_id: z.string().describe(`Task ID (required)
The UUID of a completed crawl task (with store_raw_html enabled)
Example: "07131248-1535-0216-1000-17384017ad04"`),
      
      url: z.string().describe(`Page URL (required)
The page URL to get HTML for
Must be an absolute URL from the crawled site
Example: "https://example.com/page"`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      if (!params.task_id || !params.url) {
        return {
          error: 'Missing required parameters',
          message: 'You must provide: task_id (with store_raw_html enabled during crawl), url',
        };
      }

      const requestBody: any = {
        id: params.task_id,
        url: params.url,
      };

      const response: any = await this.dataForSEOClient.makeRequest(
        '/v3/on_page/raw_html',
        'POST',
        [requestBody]
      );

      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

