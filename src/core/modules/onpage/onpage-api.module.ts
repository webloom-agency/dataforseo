import { BaseModule, ToolDefinition } from '../base.module.js';
import { PromptDefinition } from '../prompt-definition.js';
import { onpagePrompts } from './onpage.prompt.js';
import { ContentParsingTool } from './tools/content-parsing.tool.js';
import { InstantPagesTool } from './tools/instant-pages.tool.js';
import { LighthouseTool } from './tools/lighthouse.tool.js';
import { OnPageTaskPostTool } from './tools/onpage-task-post.tool.js';
import { OnPageTasksReadyTool } from './tools/onpage-tasks-ready.tool.js';
import { OnPageSummaryTool } from './tools/onpage-summary.tool.js';
import { OnPagePagesTool } from './tools/onpage-pages.tool.js';
import { OnPageResourcesTool } from './tools/onpage-resources.tool.js';
import { OnPageLinksTool } from './tools/onpage-links.tool.js';

export class OnPageApiModule extends BaseModule {
  getTools(): Record<string, ToolDefinition> {
    const tools = [
      // Live endpoints (no task required)
      new ContentParsingTool(this.dataForSEOClient),
      new InstantPagesTool(this.dataForSEOClient),
      new LighthouseTool(this.dataForSEOClient),
      
      // Task management
      new OnPageTaskPostTool(this.dataForSEOClient),
      new OnPageTasksReadyTool(this.dataForSEOClient),
      
      // Task-based analysis endpoints
      new OnPageSummaryTool(this.dataForSEOClient),
      new OnPagePagesTool(this.dataForSEOClient),
      new OnPageResourcesTool(this.dataForSEOClient),
      new OnPageLinksTool(this.dataForSEOClient),
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
