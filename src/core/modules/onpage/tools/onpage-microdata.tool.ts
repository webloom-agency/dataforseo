import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPageMicrodataTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_microdata';
  }

  getDescription(): string {
    return `Get microdata (structured data) validation results for crawled pages. Returns Schema.org markup, JSON-LD, and other structured data found on pages, along with validation errors. Essential for optimizing rich snippets and structured data. Note: validate_micromarkup must be enabled when starting the crawl.`;
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }

  getParams(): z.ZodRawShape {
    return {
      task_id: z.string().describe(`Task ID (required)
The UUID of a completed crawl task (with validate_micromarkup enabled)
Example: "07131248-1535-0216-1000-17384017ad04"`),
      
      limit: z.number().optional().describe(`Maximum number of pages to return (optional)
Default: 100
Maximum: 1000`),
      
      offset: z.number().optional().describe(`Offset in results (optional)
Default: 0`),
      
      filters: z.any().optional().describe(`Filtering parameters (optional)
Up to 8 filters, operators: 'and'/'or'
Examples:
["checks.has_micromarkup","=",true]
["checks.has_micromarkup_errors","=",true]`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      if (!params.task_id) {
        return {
          error: 'Missing required parameter',
          message: 'You must provide: task_id (with validate_micromarkup enabled during crawl)',
        };
      }

      const requestBody: any = {
        id: params.task_id,
      };

      if (params.limit !== undefined) requestBody.limit = params.limit;
      if (params.offset !== undefined) requestBody.offset = params.offset;
      if (params.filters !== undefined) requestBody.filters = params.filters;

      const response: any = await this.dataForSEOClient.makeRequest(
        '/v3/on_page/microdata',
        'POST',
        [requestBody]
      );

      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

