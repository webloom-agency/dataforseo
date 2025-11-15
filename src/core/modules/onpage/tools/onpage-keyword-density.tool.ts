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
    return `Get keyword density and frequency data for terms appearing on a specific page or across the website. Returns top keywords, their frequency, and density percentages. Useful for content optimization and identifying keyword stuffing issues. Note: calculate_keyword_density must be enabled when starting the crawl.`;
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }

  getParams(): z.ZodRawShape {
    return {
      task_id: z.string().describe(`Task ID (required)
The UUID of a completed crawl task (with calculate_keyword_density enabled)
Example: "07131248-1535-0216-1000-17384017ad04"`),
      
      url: z.string().optional().describe(`Page URL (optional)
The page URL to get keyword density for
If not specified, returns data for the entire website
Must be an absolute URL from the crawled site
Example: "https://example.com/page"`),
      
      limit: z.number().optional().describe(`Maximum number of keywords to return (optional)
Default: 100
Maximum: 1000`),
      
      offset: z.number().optional().describe(`Offset in results (optional)
Default: 0`),
      
      filters: z.any().optional().describe(`Filtering parameters (optional)
Up to 8 filters, operators: 'and'/'or'
Examples:
["frequency",">",10]
["density",">",1]`),
      
      order_by: z.array(z.string()).optional().describe(`Sorting rules (optional)
Examples: ["frequency,desc"], ["density,desc"]`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      if (!params.task_id) {
        return {
          error: 'Missing required parameter',
          message: 'You must provide: task_id (with calculate_keyword_density enabled during crawl)',
        };
      }

      const requestBody: any = {
        id: params.task_id,
      };

      if (params.url !== undefined) requestBody.url = params.url;
      if (params.limit !== undefined) requestBody.limit = params.limit;
      if (params.offset !== undefined) requestBody.offset = params.offset;
      if (params.filters !== undefined) requestBody.filters = params.filters;
      if (params.order_by !== undefined) requestBody.order_by = params.order_by;

      const response: any = await this.dataForSEOClient.makeRequest(
        '/v3/on_page/keyword_density',
        'POST',
        [requestBody]
      );

      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

