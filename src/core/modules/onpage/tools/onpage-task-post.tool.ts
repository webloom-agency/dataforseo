import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPageTaskPostTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_task_post';
  }

  getDescription(): string {
    return 'Create an OnPage crawl task. Initiates a full website crawl to analyze SEO metrics, identify issues, and gather comprehensive on-page data. Use tasks_ready endpoint to check when the task is complete, then retrieve results using other OnPage endpoints.';
  }

  getParams(): z.ZodRawShape {
    return {
      target: z.string().describe('Target website URL to crawl (e.g., "https://example.com")'),
      max_crawl_pages: z.number().optional().describe('Maximum number of pages to crawl (default: 10,000)'),
      start_url: z.string().optional().describe('Specific URL to start crawling from'),
      enable_javascript: z.boolean().optional().describe('Enable JavaScript rendering'),
      load_resources: z.boolean().optional().describe('Load page resources (CSS, JS, images)'),
      custom_robots_txt: z.string().optional().describe('Custom robots.txt content'),
      respect_sitemap: z.boolean().optional().describe('Respect sitemap.xml'),
      custom_user_agent: z.string().optional().describe('Custom User-Agent'),
      browser_preset: z.string().optional().describe('Browser preset (e.g., "desktop", "mobile")'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {
        target: params.target,
      };

      if (params.max_crawl_pages) payload.max_crawl_pages = params.max_crawl_pages;
      if (params.start_url) payload.start_url = params.start_url;
      if (params.enable_javascript !== undefined) payload.enable_javascript = params.enable_javascript;
      if (params.load_resources !== undefined) payload.load_resources = params.load_resources;
      if (params.custom_robots_txt) payload.custom_robots_txt = params.custom_robots_txt;
      if (params.respect_sitemap !== undefined) payload.respect_sitemap = params.respect_sitemap;
      if (params.custom_user_agent) payload.custom_user_agent = params.custom_user_agent;
      if (params.browser_preset) payload.browser_preset = params.browser_preset;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/on_page/task_post',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

