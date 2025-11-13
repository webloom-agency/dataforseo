import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPageNonIndexableTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_non_indexable';
  }

  getDescription(): string {
    return 'Get non-indexable pages from OnPage crawl. Returns pages that are blocked from indexing by robots.txt, noindex meta tags, X-Robots-Tag headers, or canonical tags pointing elsewhere. Critical for identifying indexation issues.';
  }

  getParams(): z.ZodRawShape {
    return {
      id: z.string().describe('Task ID from the task_post endpoint'),
      limit: z.number().optional().default(100).describe('Number of results to return'),
      offset: z.number().optional().describe('Offset for pagination'),
      filters: z.array(z.any()).optional().describe('Array of filter objects'),
      order_by: z.array(z.string()).optional().describe('Results ordering'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {};

      if (params.limit) payload.limit = params.limit;
      if (params.offset) payload.offset = params.offset;
      if (params.filters) payload.filters = params.filters;
      if (params.order_by) payload.order_by = params.order_by;

      const response = await this.dataForSEOClient.makeRequest(
        `/v3/on_page/non_indexable/${params.id}`,
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

