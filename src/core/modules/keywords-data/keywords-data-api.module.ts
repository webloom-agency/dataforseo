import { BaseModule, ToolDefinition } from '../base.module.js';
import { PromptDefinition } from '../prompt-definition.js';
import { DataForSeoTrendsDemographyTool } from './tools/dataforseo-trends/dataforseo-trends-demography.tool.js';
import { DataForSeoTrendsExploreTool } from './tools/dataforseo-trends/dataforseo-trends-explore.tool.js';
import { DataForSeoTrendsSubregionInterestsTool } from './tools/dataforseo-trends/dataforseo-trends-subregion-interests.tool.js';
import { GoogleAdsSearchVolumeTool } from './tools/google-ads/google-ads-search-volume.tool.js';
import { GoogleAdsKeywordsForSiteTool } from './tools/google-ads/google-ads-keywords-for-site.tool.js';
import { GoogleAdsKeywordsForKeywordsTool } from './tools/google-ads/google-ads-keywords-for-keywords.tool.js';
import { GoogleAdsAdTrafficByKeywordsTool } from './tools/google-ads/google-ads-ad-traffic-by-keywords.tool.js';
import { GoogleTrendsCategoriesTool } from './tools/google-trends/google-trends-categories.tool.js';
import { GoogleTrendsExploreTool } from './tools/google-trends/google-trends-explore.tool.js';
import { GoogleTrendsLocationsTool } from './tools/google-trends/google-trends-locations.tool.js';

export class KeywordsDataApiModule extends BaseModule {
  getTools(): Record<string, ToolDefinition> {
    const tools = [
      // Google Ads
      new GoogleAdsSearchVolumeTool(this.dataForSEOClient),
      new GoogleAdsKeywordsForSiteTool(this.dataForSEOClient),
      new GoogleAdsKeywordsForKeywordsTool(this.dataForSEOClient),
      new GoogleAdsAdTrafficByKeywordsTool(this.dataForSEOClient),

      // DataForSEO Trends
      new DataForSeoTrendsDemographyTool(this.dataForSEOClient),
      new DataForSeoTrendsSubregionInterestsTool(this.dataForSEOClient),
      new DataForSeoTrendsExploreTool(this.dataForSEOClient),

      // Google Trends
      new GoogleTrendsCategoriesTool(this.dataForSEOClient),
      new GoogleTrendsExploreTool(this.dataForSEOClient),
      new GoogleTrendsLocationsTool(this.dataForSEOClient),
      // Add more tools here
    ];

    return tools.reduce((acc, tool) => ({
      ...acc,
      [tool.getName()]: {
        description: tool.getDescription(),
        params: tool.getParams(),
        handler: (params: any) => tool.handle(params),
      },
    }), {});
  }

  getPrompts(): Record<string, PromptDefinition> {
    return {};
  }
} 