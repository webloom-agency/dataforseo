import { BaseModule, ToolDefinition } from '../base.module.js';
import { PromptDefinition } from '../prompt-definition.js';
import { onpagePrompts } from './onpage.prompt.js';
import { ContentParsingTool } from './tools/content-parsing.tool.js';
import { InstantPagesTool } from './tools/instant-pages.tool.js';
import { LighthouseTool } from './tools/lighthouse.tool.js';
import { OnPageTaskManagerTool } from './tools/onpage-task-manager.tool.js';
import { OnPagePagesTool } from './tools/onpage-pages.tool.js';
import { OnPageNonIndexableTool } from './tools/onpage-non-indexable.tool.js';
import { OnPageDuplicateTagsTool } from './tools/onpage-duplicate-tags.tool.js';
import { OnPageDuplicateContentTool } from './tools/onpage-duplicate-content.tool.js';
import { OnPageLinksTool } from './tools/onpage-links.tool.js';
import { OnPageResourcesTool } from './tools/onpage-resources.tool.js';
import { OnPagePagesByResourceTool } from './tools/onpage-pages-by-resource.tool.js';
import { OnPageRedirectChainsTool } from './tools/onpage-redirect-chains.tool.js';
import { OnPageWaterfallTool } from './tools/onpage-waterfall.tool.js';
import { OnPageKeywordDensityTool } from './tools/onpage-keyword-density.tool.js';
import { OnPageMicrodataTool } from './tools/onpage-microdata.tool.js';
import { OnPageRawHtmlTool } from './tools/onpage-raw-html.tool.js';

export class OnPageApiModule extends BaseModule {
  getTools(): Record<string, ToolDefinition> {
    const tools = [
      new OnPageTaskManagerTool(this.dataForSEOClient),
      new OnPagePagesTool(this.dataForSEOClient),
      new OnPageNonIndexableTool(this.dataForSEOClient),
      new OnPageDuplicateTagsTool(this.dataForSEOClient),
      new OnPageDuplicateContentTool(this.dataForSEOClient),
      new OnPageLinksTool(this.dataForSEOClient),
      new OnPageResourcesTool(this.dataForSEOClient),
      new OnPagePagesByResourceTool(this.dataForSEOClient),
      new OnPageRedirectChainsTool(this.dataForSEOClient),
      new OnPageWaterfallTool(this.dataForSEOClient),
      new OnPageKeywordDensityTool(this.dataForSEOClient),
      new OnPageMicrodataTool(this.dataForSEOClient),
      new OnPageRawHtmlTool(this.dataForSEOClient),
      new ContentParsingTool(this.dataForSEOClient),
      new InstantPagesTool(this.dataForSEOClient),
      new LighthouseTool(this.dataForSEOClient),
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
      return onpagePrompts.reduce((acc, prompt) => ({
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
