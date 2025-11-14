import { z } from 'zod';
import { BaseTool } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';

export class GoogleAdsKeywordsForSiteTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'keywords_data_google_ads_keywords_for_site';
  }

  getDescription(): string {
    return `Get keyword suggestions relevant to a specified domain or page from Google Ads. Provides keywords with bids, search volumes, trends, and competition levels. Useful for competitive keyword research and discovering what keywords are relevant to any website or webpage.`;
  }

  getParams(): z.ZodRawShape {
    return {
      target: z.string().describe(`Domain or page URL (required)
The domain name of the target website or the url of the target page
Example: "example.com" or "https://example.com/page"`),
      target_type: z.string().optional().describe(`Search keywords for site or for url (optional)
Possible values: "site", "page"
Default: "page"
If set to "site", keywords will be provided for the entire site
If set to "page", keywords will be provided for the specified webpage`),
      location_name: z.string().optional().describe(`Full name of search engine location (optional)
If you do not indicate the location, you will receive worldwide results
Example: "London,England,United Kingdom"`),
      location_code: z.number().optional().describe(`Search engine location code (optional)
If you do not indicate the location, you will receive worldwide results
Example: 2840`),
      location_coordinate: z.string().optional().describe(`GPS coordinates of a location (optional)
Format: "latitude,longitude"
Example: "52.6178549,-155.352142"`),
      language_name: z.string().optional().describe(`Full name of search engine language (optional)
Example: "English"`),
      language_code: z.string().optional().describe(`Search engine language code (optional)
Example: "en"`),
      search_partners: z.boolean().optional().describe(`Include Google search partners (optional)
If true, results include owned, operated, and syndicated networks across Google and partner sites
Default: false`),
      date_from: z.string().optional().describe(`Starting date of the time range (optional)
Format: "yyyy-mm-dd"
Minimal value: 4 years from the current date
By default, data is returned for the past 12 months
Example: "2023-01-01"`),
      date_to: z.string().optional().describe(`Ending date of the time range (optional)
Format: "yyyy-mm-dd"
Cannot be greater than yesterday's date
Example: "2024-12-31"`),
      include_adult_keywords: z.boolean().optional().describe(`Include keywords associated with adult content (optional)
Default: false
Note: API may return no data for such keywords due to Google Ads restrictions`),
      sort_by: z.string().optional().describe(`Results sorting parameters (optional)
Possible values: "relevance", "search_volume", "competition_index", "low_top_of_page_bid", "high_top_of_page_bid"
Default: "relevance"`),
      tag: z.string().optional().describe(`User-defined task identifier (optional)
Character limit: 255`),
    };
  }

  protected supportOnlyFullResponse(): boolean {
    return true;
  }

  async handle(params: any): Promise<any> {
    try {
      const requestBody: any = {
        target: params.target,
      };

      // Add optional parameters if provided
      if (params.target_type !== undefined) requestBody.target_type = params.target_type;
      if (params.location_name !== undefined) requestBody.location_name = params.location_name;
      if (params.location_code !== undefined) requestBody.location_code = params.location_code;
      if (params.location_coordinate !== undefined) requestBody.location_coordinate = params.location_coordinate;
      if (params.language_name !== undefined) requestBody.language_name = params.language_name;
      if (params.language_code !== undefined) requestBody.language_code = params.language_code;
      if (params.search_partners !== undefined) requestBody.search_partners = params.search_partners;
      if (params.date_from !== undefined) requestBody.date_from = params.date_from;
      if (params.date_to !== undefined) requestBody.date_to = params.date_to;
      if (params.include_adult_keywords !== undefined) requestBody.include_adult_keywords = params.include_adult_keywords;
      if (params.sort_by !== undefined) requestBody.sort_by = params.sort_by;
      if (params.tag !== undefined) requestBody.tag = params.tag;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/keywords_data/google_ads/keywords_for_site/live',
        'POST',
        [requestBody]
      );
      
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

