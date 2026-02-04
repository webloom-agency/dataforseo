import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';
import { LocationResolver } from '../../../utils/location-resolver.js';

export class SerpOrganicLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_organic_live_advanced';
  }

  getDescription(): string {
    return 'Get search engine results for a keyword including organic results, paid ads (when available), featured snippets, local pack, people also ask, and other SERP features. Location can be provided in natural language (e.g., "Brussels", "NYC", "Paris") and will be auto-resolved to the correct format. Defaults to Paris if no location specified. Always includes adtest=on for paid ads.';
  }

  getParams(): z.ZodRawShape {
    return {
      search_engine: z.string().default('google').describe("search engine name, one of: google, yahoo, bing."),
      location_name: z.string().optional().describe(`location name - supports natural language input
Examples: "Brussels", "Bruxelles", "NYC", "Paris", "London"
Will be auto-resolved to full DataForSEO format (e.g., "Brussels,Brussels Capital,Belgium")
You can also provide the full format directly if known`),
      location_code: z.number().default(1006094).optional().describe(`location code for precise targeting
optional field - defaults to 1006094 (Paris, France) if not specified
RECOMMENDED: Use this instead of location_name for reliability
Common codes: 1006094 (Paris), 1023191 (New York), 1006886 (London)
If user mentions a city (e.g., "in New York"), use the appropriate location_code, NOT location_name`),
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
        language_code: params.language_code,
        keyword: params.keyword,
        depth: params.depth,
        max_crawl_pages: params.max_crawl_pages,
        device: params.device,
        // Always add adtest parameter to increase likelihood of seeing paid ads
        search_param: `adtest=${params.adtest || 'on'}`,
      };

      // Add location (prefer location_code for more reliable results)
      if (params.location_code !== undefined) {
        requestBody.location_code = params.location_code;
      } else if (params.location_name !== undefined) {
        // Auto-resolve location_name if not already in hierarchical format
        if (!LocationResolver.isAlreadyFormatted(params.location_name)) {
          console.error(`[SerpOrganicLiveAdvanced] Resolving location: "${params.location_name}"`);
          const resolved = await LocationResolver.resolve(
            this.dataForSEOClient,
            params.location_name,
            params.search_engine || 'google'
          );
          if (resolved) {
            // Use location_code for reliability (preferred by DataForSEO)
            requestBody.location_code = resolved.location_code;
            console.error(`[SerpOrganicLiveAdvanced] Resolved to location_code: ${resolved.location_code} (${resolved.location_name})`);
          } else {
            // Fallback: use as-is and let DataForSEO handle it
            console.error(`[SerpOrganicLiveAdvanced] Could not resolve "${params.location_name}", using as-is`);
            requestBody.location_name = params.location_name;
          }
        } else {
          requestBody.location_name = params.location_name;
        }
      } else {
        // Default to Paris location code if neither is provided
        requestBody.location_code = 1006094;
      }

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