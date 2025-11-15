import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPagePagesTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_pages';
  }

  getDescription(): string {
    return `Get a list of crawled pages with detailed check-ups and performance metrics from a completed OnPage crawl. Returns comprehensive data for each page including SEO checks, meta tags, content analysis, page speed, broken links, and 60+ other on-page factors. Use this after starting a crawl with onpage_task_manager.`;
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }

  getParams(): z.ZodRawShape {
    return {
      task_id: z.string().describe(`Task ID (required)
The UUID of a completed crawl task
You get this ID from the onpage_task_manager when starting a crawl
Example: "07131248-1535-0216-1000-17384017ad04"`),
      
      limit: z.number().optional().describe(`Maximum number of pages to return (optional)
Default: 100
Maximum: 1000`),
      
      offset: z.number().optional().describe(`Offset in the results array (optional)
Default: 0
If you specify 10, the first ten pages will be omitted`),
      
      filters: z.any().optional().describe(`Array of filtering parameters (optional)
You can add up to 8 filters
Set logical operators 'and'/'or' between conditions
Supported operators: regex, not_regex, <, <=, >, >=, =, <>, in, not_in, like, not_like
Use % with like/not_like to match any string
Examples:
["checks.is_broken","=",true]
[["checks.is_4xx_code","=",true],"or",["checks.is_5xx_code","=",true]]
["onpage_score","<",80]`),
      
      order_by: z.array(z.string()).optional().describe(`Results sorting rules (optional)
Possible values: "url", "size", "encoded_size", "total_transfer_size", "fetch_time", "onpage_score", "checks.no_content_encoding", etc.
Add ',asc' or ',desc' for sorting direction
Examples: ["onpage_score,asc"], ["size,desc"]`),
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
        '/v3/on_page/pages',
        'POST',
        [requestBody]
      );

      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

