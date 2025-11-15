import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPagePagesByResourceTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_pages_by_resource';
  }

  getDescription(): string {
    return `Get a list of pages that contain a specific resource (image, script, stylesheet, etc.). Find all pages using a particular asset, useful for identifying which pages will be affected if you change or remove a resource.`;
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }

  getParams(): z.ZodRawShape {
    return {
      task_id: z.string().describe(`Task ID (required)
The UUID of a completed crawl task
Example: "07131248-1535-0216-1000-17384017ad04"`),
      
      url: z.string().describe(`Resource URL (required)
The URL of the resource to search for
Must be an absolute URL
Example: "https://example.com/images/logo.png"`),
      
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
        '/v3/on_page/page_by_resource',
        'POST',
        [requestBody]
      );

      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

