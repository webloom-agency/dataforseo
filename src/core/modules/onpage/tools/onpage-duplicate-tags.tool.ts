import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPageDuplicateTagsTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_duplicate_tags';
  }

  getDescription(): string {
    return `Get pages with duplicate title or description meta tags. Finds pages that have identical or very similar titles/descriptions, which can harm SEO performance. Critical for identifying and fixing duplicate content issues.`;
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }

  getParams(): z.ZodRawShape {
    return {
      task_id: z.string().describe(`Task ID (required)
The UUID of a completed crawl task
Example: "07131248-1535-0216-1000-17384017ad04"`),
      
      limit: z.number().optional().describe(`Maximum number of pages to return (optional)
Default: 100
Maximum: 1000`),
      
      offset: z.number().optional().describe(`Offset in results (optional)
Default: 0`),
      
      filters: z.any().optional().describe(`Filtering parameters (optional)
Up to 8 filters, operators: 'and'/'or'
Examples:
["type","=","title"]
["type","=","description"]`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      if (!params.task_id) {
        return {
          error: 'Missing required parameter',
          message: 'You must provide: task_id',
        };
      }

      const requestBody: any = {
        id: params.task_id,
      };

      if (params.limit !== undefined) requestBody.limit = params.limit;
      if (params.offset !== undefined) requestBody.offset = params.offset;
      if (params.filters !== undefined) requestBody.filters = params.filters;

      const response: any = await this.dataForSEOClient.makeRequest(
        '/v3/on_page/duplicate_tags',
        'POST',
        [requestBody]
      );

      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

