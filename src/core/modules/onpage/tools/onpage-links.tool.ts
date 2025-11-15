import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPageLinksTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_links';
  }

  getDescription(): string {
    return `Get all internal and external links detected on the crawled website. Returns detailed link data including source page, destination, anchor text, dofollow/nofollow attributes, and link context. Essential for link structure analysis and identifying broken links.`;
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }

  getParams(): z.ZodRawShape {
    return {
      task_id: z.string().describe(`Task ID (required)
The UUID of a completed crawl task
Example: "07131248-1535-0216-1000-17384017ad04"`),
      
      limit: z.number().optional().describe(`Maximum number of links to return (optional)
Default: 100
Maximum: 10000`),
      
      offset: z.number().optional().describe(`Offset in results (optional)
Default: 0`),
      
      filters: z.any().optional().describe(`Filtering parameters (optional)
Up to 8 filters, operators: 'and'/'or'
Examples:
["type","=","external"]
["type","=","internal"]
["dofollow","=",true]
[["is_broken","=",true],"and",["type","=","internal"]]`),
      
      order_by: z.array(z.string()).optional().describe(`Sorting rules (optional)
Examples: ["type,asc"], ["dofollow,desc"]`),
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
      if (params.order_by !== undefined) requestBody.order_by = params.order_by;

      const response: any = await this.dataForSEOClient.makeRequest(
        '/v3/on_page/links',
        'POST',
        [requestBody]
      );

      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

