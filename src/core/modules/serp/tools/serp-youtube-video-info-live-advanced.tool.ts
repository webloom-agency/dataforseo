import { z } from 'zod';
import { BaseTool } from '../../base.tool.js';
import { DataForSEOClient } from '../../../client/dataforseo.client.js';
import { LocationResolver } from '../../../utils/location-resolver.js';

export class SerpYoutubeVideoInfoLiveAdvancedTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'serp_youtube_video_info_live_advanced';
  }

  getDescription(): string {
    return 'Provides data on the video you specify. Location supports natural language input (e.g., "Brussels", "NYC").';
  }

  getParams(): z.ZodRawShape {
    return {
      video_id: z.string().describe("ID of the video"),
      location_name: z.string().describe(`location name - supports natural language input
Examples: "Brussels", "NYC", "Paris", "United States"
Will be auto-resolved to full DataForSEO format if needed`),
      language_code: z.string().describe("search engine language code (e.g., 'en')"),
      device: z.string().default('desktop').optional().describe(`device type
optional field
can take the values:desktop, mobile
default value: desktop`),
      os: z.string().default('windows').optional().describe(`device operating system
optional field
if you specify desktop in the device field, choose from the following values: windows, macos
default value: windows
if you specify mobile in the device field, choose from the following values: android, ios
default value: android`)
    };
  }

  async handle(params:any): Promise<any> {
    try {
      console.error(JSON.stringify(params, null, 2));
      
      const requestBody: any = {
        video_id: params.video_id,
        language_code: params.language_code,
        device: params.device,
        os: params.os,
      };

      // Auto-resolve location_name if not already in hierarchical format
      if (params.location_name !== undefined) {
        if (!LocationResolver.isAlreadyFormatted(params.location_name)) {
          console.error(`[SerpYoutubeVideoInfo] Resolving location: "${params.location_name}"`);
          const resolved = await LocationResolver.resolve(this.dataForSEOClient, params.location_name, 'google');
          if (resolved) {
            requestBody.location_code = resolved.location_code;
            console.error(`[SerpYoutubeVideoInfo] Resolved to location_code: ${resolved.location_code} (${resolved.location_name})`);
          } else {
            requestBody.location_name = params.location_name;
          }
        } else {
          requestBody.location_name = params.location_name;
        }
      }

      const response = await this.dataForSEOClient.makeRequest(`/v3/serp/youtube/video_info/live/advanced`, 'POST', [requestBody]);
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
} 