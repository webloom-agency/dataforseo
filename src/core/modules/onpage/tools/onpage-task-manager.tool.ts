import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class OnPageTaskManagerTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'onpage_task_manager';
  }

  getDescription(): string {
    return `Unified tool to manage OnPage crawling tasks: start new crawls, check crawl status, or stop running crawls. OnPage API crawls websites to check 60+ on-page SEO parameters including meta tags, duplicate content, broken links, page speed, and technical SEO issues. After starting a crawl, use the task_id to check progress or retrieve detailed results.`;
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }

  getParams(): z.ZodRawShape {
    return {
      action: z.string().describe(`Action to perform (required)
Possible values: "start", "status", "stop"
- "start": Begin a new crawl (requires target and max_crawl_pages)
- "status": Check crawl progress and get summary (requires task_id)
- "stop": Force stop a running crawl (requires task_id)`),
      
      task_id: z.string().optional().describe(`Task ID (required for "status" and "stop" actions)
The UUID of a previously started crawl task
Example: "07131248-1535-0216-1000-17384017ad04"
You'll receive this ID when starting a new crawl`),
      
      // Parameters for "start" action
      target: z.string().optional().describe(`Target domain (required for "start" action)
Domain name without https:// and www.
Example: "example.com"
If you specify a page URL, results will be returned for the entire domain`),
      
      max_crawl_pages: z.number().optional().describe(`Maximum pages to crawl (required for "start" action)
The number of pages to crawl on the specified domain
Example: 100
Note: Set to 1 to crawl only a single page`),
      
      start_url: z.string().optional().describe(`Starting URL (optional for "start" action)
The first URL to crawl (must be an absolute URL)
If not specified, crawl starts from the homepage
To crawl a single page, set this URL and max_crawl_pages to 1`),
      
      max_crawl_depth: z.number().optional().describe(`Crawl depth (optional for "start" action)
The linking depth of pages to crawl
Level 0 = starting page, level 1 = pages linked from starting page, etc.
Example: 3`),
      
      load_resources: z.boolean().optional().describe(`Load resources (optional for "start" action)
Set to true to load images, stylesheets, scripts, and broken resources
Default: false
Note: Additional charges apply`),
      
      enable_javascript: z.boolean().optional().describe(`Enable JavaScript (optional for "start" action)
Set to true to load and execute JavaScript on pages
Default: false
Note: Additional charges apply`),
      
      enable_browser_rendering: z.boolean().optional().describe(`Enable browser rendering (optional for "start" action)
Set to true to emulate a real browser and measure Core Web Vitals (FID, CLS, LCP)
Requires enable_javascript and load_resources to be true
Default: false
Note: Additional charges apply`),
      
      store_raw_html: z.boolean().optional().describe(`Store raw HTML (optional for "start" action)
Set to true to store HTML of crawled pages
Allows you to retrieve the HTML later via the Raw HTML endpoint
Default: false`),
      
      enable_content_parsing: z.boolean().optional().describe(`Enable content parsing (optional for "start" action)
Set to true to enable the Content Parsing endpoint
Default: false`),
      
      calculate_keyword_density: z.boolean().optional().describe(`Calculate keyword density (optional for "start" action)
Set to true to calculate keyword density for website pages
Default: false
Note: Additional charges apply`),
      
      check_spell: z.boolean().optional().describe(`Check spelling (optional for "start" action)
Set to true to check spelling on the website using Hunspell library
Default: false`),
      
      respect_sitemap: z.boolean().optional().describe(`Follow sitemap order (optional for "start" action)
Set to true to follow the order of pages in the primary sitemap
Default: false`),
      
      allow_subdomains: z.boolean().optional().describe(`Include subdomains (optional for "start" action)
Set to true to crawl all subdomains of the target website
Default: false`),
      
      crawl_delay: z.number().optional().describe(`Crawl delay in milliseconds (optional for "start" action)
Custom delay between crawler hits to the server
Default: 2000
Example: 1000`),
      
      custom_user_agent: z.string().optional().describe(`Custom user agent (optional for "start" action)
Custom user agent string for crawling
Default: "Mozilla/5.0 (compatible; RSiteAuditor)"`),
      
      tag: z.string().optional().describe(`User-defined task identifier (optional)
Character limit: 255
Use this to identify and match tasks with results`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const action = params.action?.toLowerCase();

      if (!action || !['start', 'status', 'stop'].includes(action)) {
        return {
          error: 'Invalid action',
          message: 'Action must be one of: "start", "status", "stop"',
          provided_action: params.action,
        };
      }

      // Handle "start" action
      if (action === 'start') {
        if (!params.target || !params.max_crawl_pages) {
          return {
            error: 'Missing required parameters',
            message: 'For "start" action, you must provide: target, max_crawl_pages',
            provided_params: {
              target: params.target || 'missing',
              max_crawl_pages: params.max_crawl_pages || 'missing',
            },
          };
        }

        const requestBody: any = {
          target: params.target,
          max_crawl_pages: params.max_crawl_pages,
        };

        // Add optional parameters
        if (params.start_url !== undefined) requestBody.start_url = params.start_url;
        if (params.max_crawl_depth !== undefined) requestBody.max_crawl_depth = params.max_crawl_depth;
        if (params.load_resources !== undefined) requestBody.load_resources = params.load_resources;
        if (params.enable_javascript !== undefined) requestBody.enable_javascript = params.enable_javascript;
        if (params.enable_browser_rendering !== undefined) requestBody.enable_browser_rendering = params.enable_browser_rendering;
        if (params.store_raw_html !== undefined) requestBody.store_raw_html = params.store_raw_html;
        if (params.enable_content_parsing !== undefined) requestBody.enable_content_parsing = params.enable_content_parsing;
        if (params.calculate_keyword_density !== undefined) requestBody.calculate_keyword_density = params.calculate_keyword_density;
        if (params.check_spell !== undefined) requestBody.check_spell = params.check_spell;
        if (params.respect_sitemap !== undefined) requestBody.respect_sitemap = params.respect_sitemap;
        if (params.allow_subdomains !== undefined) requestBody.allow_subdomains = params.allow_subdomains;
        if (params.crawl_delay !== undefined) requestBody.crawl_delay = params.crawl_delay;
        if (params.custom_user_agent !== undefined) requestBody.custom_user_agent = params.custom_user_agent;
        if (params.tag !== undefined) requestBody.tag = params.tag;

        const response: any = await this.dataForSEOClient.makeRequest(
          '/v3/on_page/task_post',
          'POST',
          [requestBody]
        );

        if (response?.tasks?.[0]?.result?.[0]?.id) {
          return {
            action: 'start',
            status: 'success',
            task_id: response.tasks[0].result[0].id,
            message: 'Crawl task started successfully. Use this task_id to check status.',
            target: params.target,
            max_crawl_pages: params.max_crawl_pages,
            cost: response.tasks[0].cost || 0,
            full_response: response,
          };
        }

        return response;
      }

      // Handle "status" action
      if (action === 'status') {
        if (!params.task_id) {
          return {
            error: 'Missing required parameter',
            message: 'For "status" action, you must provide: task_id',
          };
        }

        const response: any = await this.dataForSEOClient.makeRequest(
          `/v3/on_page/summary/${params.task_id}`,
          'GET',
          null
        );

        if (response?.tasks?.[0]?.result?.[0]) {
          const result = response.tasks[0].result[0];
          
          return {
            action: 'status',
            task_id: params.task_id,
            crawl_progress: result.crawl_progress,
            crawl_status: result.crawl_status,
            pages_crawled: result.crawl_status?.pages_crawled || 0,
            pages_in_queue: result.crawl_status?.pages_in_queue || 0,
            max_crawl_pages: result.crawl_status?.max_crawl_pages || 0,
            crawl_stop_reason: result.crawl_stop_reason,
            domain_info: result.domain_info,
            total_pages: result.total_pages,
            onpage_score: result.page_metrics?.onpage_score || null,
            page_metrics_summary: {
              broken_links: result.page_metrics?.broken_links || 0,
              broken_resources: result.page_metrics?.broken_resources || 0,
              duplicate_title: result.page_metrics?.duplicate_title || 0,
              duplicate_description: result.page_metrics?.duplicate_description || 0,
              duplicate_content: result.page_metrics?.duplicate_content || 0,
              non_indexable: result.page_metrics?.non_indexable || 0,
            },
            full_response: response,
          };
        }

        return response;
      }

      // Handle "stop" action
      if (action === 'stop') {
        if (!params.task_id) {
          return {
            error: 'Missing required parameter',
            message: 'For "stop" action, you must provide: task_id',
          };
        }

        const response: any = await this.dataForSEOClient.makeRequest(
          '/v3/on_page/force_stop',
          'POST',
          [{ id: params.task_id }]
        );

        return {
          action: 'stop',
          status: 'success',
          task_id: params.task_id,
          message: 'Force stop request sent. The crawl will stop and you can still retrieve data for pages already crawled.',
          full_response: response,
        };
      }

      return { error: 'Unknown error occurred' };
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

