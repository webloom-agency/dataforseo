import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';
import { LocationResolver } from '../../../utils/location-resolver.js';

export class SerpGoogleAiModeLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_google_ai_mode_live_advanced';
  }

  getDescription(): string {
    return 'Get Google AI-powered search results (AI Overviews) for a keyword. This endpoint provides AI-generated summaries and contextual information from Google\'s AI Mode search feature, including AI overview snippets, references, and related products. Location supports natural language input (e.g., "Brussels", "NYC").';
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe("Search keyword (required)"),
      location_name: z.string().default('United States').describe(`location name - supports natural language input
Examples: "Brussels", "NYC", "Paris", "United States"
Will be auto-resolved to full DataForSEO format if needed`),
      language_code: z.string().default('en').describe("search engine language code (e.g., 'en')"),
      depth: z.number().min(10).max(700).default(100).optional().describe(`parsing depth
optional field
number of results in SERP
default value: 100
max value: 700`),
      max_crawl_pages: z.number().min(1).max(100).optional().default(1).describe(`page crawl limit
optional field
number of search results pages to crawl
max value: 100
Note: the max_crawl_pages and depth parameters complement each other`),
      device: z.string().default('desktop').optional().describe(`device type
optional field
can take the values: desktop, mobile
default value: desktop`),
      os: z.string().optional().describe(`device operating system
optional field
can take the values: windows, macos, android, ios
default value: windows`),
      browser_version: z.string().optional().describe(`browser version
optional field
specify the browser version to be used when accessing Google AI Mode
supported browsers: chrome, firefox, safari, edge
example: "latest" or specific version like "120.0.6099.129"`),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      console.error(JSON.stringify(params, null, 2));
      const requestBody: any = {
        keyword: params.keyword,
        language_code: params.language_code,
      };

      // Auto-resolve location_name if not already in hierarchical format
      if (params.location_name !== undefined) {
        if (!LocationResolver.isAlreadyFormatted(params.location_name)) {
          console.error(`[SerpGoogleAiMode] Resolving location: "${params.location_name}"`);
          const resolved = await LocationResolver.resolve(this.dataForSEOClient, params.location_name, 'google');
          if (resolved) {
            requestBody.location_code = resolved.location_code;
            console.error(`[SerpGoogleAiMode] Resolved to location_code: ${resolved.location_code} (${resolved.location_name})`);
          } else {
            requestBody.location_name = params.location_name;
          }
        } else {
          requestBody.location_name = params.location_name;
        }
      }

      // Add optional parameters only if they are provided
      if (params.depth !== undefined) {
        requestBody.depth = params.depth;
      }
      if (params.max_crawl_pages !== undefined) {
        requestBody.max_crawl_pages = params.max_crawl_pages;
      }
      if (params.device !== undefined) {
        requestBody.device = params.device;
      }
      if (params.os !== undefined) {
        requestBody.os = params.os;
      }
      if (params.browser_version !== undefined) {
        requestBody.browser_version = params.browser_version;
      }

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/serp/google/ai_mode/live/advanced',
        'POST',
        [requestBody]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

