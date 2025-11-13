import { z } from 'zod';
import { BaseTool } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';

export class GoogleAdsAdTrafficByKeywordsTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'keywords_data_google_ads_ad_traffic_by_keywords';
  }

  getDescription(): string {
    return 'Get estimated ad traffic data for keywords. Returns estimated impressions, clicks, CTR, and cost for specified keywords in Google Ads. Essential for forecasting PPC campaign performance and budget planning.';
  }

  getParams(): z.ZodRawShape {
    return {
      keywords: z.array(z.string()).describe('Keywords to get ad traffic estimates for (max 1000)'),
      location_name: z.string().optional().describe('Full name of the location (e.g., "United States")'),
      location_code: z.number().optional().describe('Location code'),
      language_name: z.string().optional().describe('Full name of the language (e.g., "English")'),
      language_code: z.string().optional().describe('Language code (e.g., "en")'),
      match: z.enum(['exact', 'broad', 'phrase']).optional().describe('Keyword match type for traffic estimation'),
      bid: z.number().optional().describe('Bid amount in account currency'),
      date_from: z.string().optional().describe('Start date for traffic estimation (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('End date for traffic estimation (YYYY-MM-DD)'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {
        keywords: params.keywords,
      };

      if (params.location_name) payload.location_name = params.location_name;
      if (params.location_code) payload.location_code = params.location_code;
      if (params.language_name) payload.language_name = params.language_name;
      if (params.language_code) payload.language_code = params.language_code;
      if (params.match) payload.match = params.match;
      if (params.bid) payload.bid = params.bid;
      if (params.date_from) payload.date_from = params.date_from;
      if (params.date_to) payload.date_to = params.date_to;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/keywords_data/google_ads/ad_traffic_by_keywords/live',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

