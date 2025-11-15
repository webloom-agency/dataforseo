import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPageDuplicateContentTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_duplicate_content';
  }

  getDescription(): string {
    return `Find pages with content similar to a specified page. Returns a list of pages that have duplicate or substantially similar content, helping identify canonicalization issues and content duplication problems that can hurt SEO.`;
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }

  getParams(): z.ZodRawShape {
    return {
      task_id: z.string().describe(`Task ID (required)
The UUID of a completed crawl task
Example: "07131248-1535-0216-1000-17384017ad04"`),
      
      url: z.string().describe(`Target page URL (required)
The page URL to check for duplicates
Must be an absolute URL from the crawled site
Example: "https://example.com/page"`),
      
      limit: z.number().optional().describe(`Maximum number of pages to return (optional)
Default: 100
Maximum: 1000`),
      
      offset: z.number().optional().describe(`Offset in results (optional)
Default: 0`),
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

      if (params.limit !== undefined) requestBody.limit = params.limit;
      if (params.offset !== undefined) requestBody.offset = params.offset;

      const response: any = await this.dataForSEOClient.makeRequest(
        '/v3/on_page/duplicate_content',
        'POST',
        [requestBody]
      );

      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

