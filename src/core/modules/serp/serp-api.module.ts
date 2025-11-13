import { BaseModule, ToolDefinition } from '../base.module.js';
import { PromptDefinition } from '../prompt-definition.js';
import { z } from 'zod';
import { SerpOrganicLiveAdvancedTool } from './tools/serp-organic-live-advanced.tool.js';
import { SerpOrganicLocationsListTool } from './tools/serp-organic-locations-list.tool.js';
import { SerpYoutubeOrganicLiveAdvancedTool } from './tools/serp-youtube-organic-live-advanced.tool.js';
import { SerpYoutubeVideoInfoLiveAdvancedTool } from './tools/serp-youtube-video-info-live-advanced.tool.js';
import { SerpYoutubeVideoCommentsLiveAdvancedTool } from './tools/serp-youtube-video-comments-live-advanced-tool.js';
import { SerpYoutubeVideoSubtitlesLiveAdvancedTool } from './tools/serp-youtube-video-subtitles-live-advanced-tool.js';
import { SerpYoutubeLocationsListTool } from './tools/serp-youtube-locations-list.tool.js';
import { SerpYoutubeLanguagesListTool } from './tools/serp-youtube-languages-list.tool.js';
import { SerpGoogleAiModeLanguagesTool } from './tools/serp-google-ai-mode-languages.tool.js';
import { SerpGoogleAiModeLiveAdvancedTool } from './tools/serp-google-ai-mode-live-advanced.tool.js';
import { SerpGoogleNewsLiveAdvancedTool } from './tools/serp-google-news-live-advanced.tool.js';
import { SerpGoogleMapsLiveAdvancedTool } from './tools/serp-google-maps-live-advanced.tool.js';
import { SerpGoogleImagesLiveAdvancedTool } from './tools/serp-google-images-live-advanced.tool.js';
import { serpPrompts } from './serp.prompt.js';

export class SerpApiModule extends BaseModule {
  getTools(): Record<string, ToolDefinition> {
    const tools = [
      // Google Organic
      new SerpOrganicLiveAdvancedTool(this.dataForSEOClient),
      new SerpOrganicLocationsListTool(this.dataForSEOClient),

      // Google AI Mode/Overviews
      new SerpGoogleAiModeLanguagesTool(this.dataForSEOClient),
      new SerpGoogleAiModeLiveAdvancedTool(this.dataForSEOClient),

      // Google News
      new SerpGoogleNewsLiveAdvancedTool(this.dataForSEOClient),

      // Google Maps
      new SerpGoogleMapsLiveAdvancedTool(this.dataForSEOClient),

      // Google Images
      new SerpGoogleImagesLiveAdvancedTool(this.dataForSEOClient),

      // YouTube
      new SerpYoutubeLocationsListTool(this.dataForSEOClient),
      new SerpYoutubeLanguagesListTool(this.dataForSEOClient),
      new SerpYoutubeOrganicLiveAdvancedTool(this.dataForSEOClient),
      new SerpYoutubeVideoInfoLiveAdvancedTool(this.dataForSEOClient),
      new SerpYoutubeVideoCommentsLiveAdvancedTool(this.dataForSEOClient),
      new SerpYoutubeVideoSubtitlesLiveAdvancedTool(this.dataForSEOClient),
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
    return serpPrompts.reduce((acc, prompt) => ({
      ...acc,
      [prompt.name]: {
        description: prompt.description,
        params: prompt.params,
        handler: (params: any) => {

          return prompt.handler(params);
        },
      },
    }), {});
  }
} 