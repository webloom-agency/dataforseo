import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class SerpGoogleAiModeLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_google_ai_mode_live_advanced';
  }

  getDescription(): string {
    return 'Get Google AI-powered search results (AI Overviews) for a keyword. This endpoint provides AI-generated summaries and contextual information from Google\'s AI Mode search feature, including AI overview snippets, references, and related products.';
  }

  getParams(): z.ZodRawShape {
    return {
      keyword: z.string().describe("Search keyword (required)"),
      location_name: z.string().default('United States').describe(`full name of the location
required field
Location format - hierarchical, comma-separated (from most specific to least)
Can be one of:
1. Country only: "United States"
2. Region,Country: "California,United States"
3. City,Region,Country: "San Francisco,California,United States"`),
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
        location_name: params.location_name,
        language_code: params.language_code,
      };

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

