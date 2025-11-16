import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';

export class SerpOrganicLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_organic_live_advanced';
  }

  getDescription(): string {
    return 'Get search engine results for a keyword including organic results, paid ads (when available), featured snippets, local pack, people also ask, and other SERP features. The tool is optimized for retrieving paid ads by: 1) using city-level location by default (Paris,France), 2) automatically adding adtest=on parameter. For best paid ad results, always specify a city (e.g., "Paris,France" not just "France").';
  }

  getParams(): z.ZodRawShape {
    return {
      search_engine: z.string().default('google').describe("search engine name, one of: google, yahoo, bing."),
      location_name: z.string().default('Paris,France').describe(`full name of the location
required field
Location format - hierarchical, comma-separated (from most specific to least)
 Can be one of:
 1. Country only: "United States"
 2. Region,Country: "California,United States"
 3. City,Region,Country: "Paris,France" or "San Francisco,California,United States"
Note: Using a city location (e.g., "Paris,France") instead of just country often shows more paid ads`),
      depth: z.number().min(10).max(700).default(10).describe(`parsing depth
optional field
number of results in SERP`),
      language_code: z.string().describe("search engine language code (e.g., 'en')"),
      keyword: z.string().describe("Search keyword"),
      max_crawl_pages: z.number().min(1).max(7).optional().default(1).describe(`page crawl limit
optional field
number of search results pages to crawl
max value: 100
Note: the max_crawl_pages and depth parameters complement each other`),
      device: z.string().default('desktop').optional().describe(`device type
optional field
can take the values:desktop, mobile
default value: desktop`),
      os: z.string().optional().describe(`device operating system
optional field
can take the values: windows, macos, android, ios
default value: windows
note: if you specify 'mobile' as device, os should be android or ios`),
      se_domain: z.string().optional().describe(`search engine domain
optional field
domain name of the search engine used for the search
example: google.fr, google.co.uk, google.de
note: using country-specific domain can help retrieve localized ads`),
      priority: z.number().min(1).max(2).optional().describe(`task execution priority
optional field
can take the values: 1 (normal priority), 2 (high priority)
default value: 1
note: high priority costs more but executes faster`),
      adtest: z.string().default('on').optional().describe(`ad test mode
optional field
can take the values: 'on', 'off'
default value: 'on'
note: setting to 'on' forces Google to show test ads, significantly increasing the likelihood of seeing paid ads in results`),
      people_also_ask_click_depth: z.number().min(1).max(4).optional()
      .describe(`clicks on the corresponding element
        specify the click depth on the people_also_ask element to get additional people_also_ask_element items;`)
    };
  }

  async handle(params:any): Promise<any> {
    try {
      console.error(JSON.stringify(params, null, 2));
      
      const requestBody: any = {
        location_name: params.location_name,
        language_code: params.language_code,
        keyword: params.keyword,
        depth: params.depth,
        max_crawl_pages: params.max_crawl_pages,
        device: params.device,
        // Always add adtest parameter to increase likelihood of seeing paid ads
        search_param: `adtest=${params.adtest || 'on'}`,
      };

      // Add optional parameters only if they are provided
      if (params.os !== undefined) {
        requestBody.os = params.os;
      }
      if (params.se_domain !== undefined) {
        requestBody.se_domain = params.se_domain;
      }
      if (params.priority !== undefined) {
        requestBody.priority = params.priority;
      }
      if (params.people_also_ask_click_depth !== undefined && params.people_also_ask_click_depth > 0) {
        requestBody.people_also_ask_click_depth = params.people_also_ask_click_depth;
      }

      const response = await this.dataForSEOClient.makeRequest(`/v3/serp/${params.search_engine}/organic/live/advanced`, 'POST', [requestBody]);
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
} 