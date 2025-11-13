import { BaseModule, ToolDefinition } from '../base.module.js';
import { PromptDefinition } from '../prompt-definition.js';
import { AiOptimizationKeywordDataLocationsAndLanguagesListTool } from './tools/keyword-data/ai-optimization-keyword-data-locations-and-languages.js';
import { AiOptimizationKeywordDataSearchVolumeTool } from './tools/keyword-data/ai-optimization-keyword-data-search-volume.js';
import { LlmMentionsLocationsAndLanguagesTool } from './tools/llm-mentions/llm-mentions-locations-and-languages.js';
import { LlmMentionsFiltersTool } from './tools/llm-mentions/llm-mentions-filters.js';
import { LlmMentionsSearchTool } from './tools/llm-mentions/llm-mentions-search.js';
import { ChatGptLlmResponsesModelsTool } from './tools/chatgpt/chatgpt-llm-responses-models.js';
import { ChatGptLlmResponsesLiveTool } from './tools/chatgpt/chatgpt-llm-responses-live.js';

export class AiOptimizationApiModule extends BaseModule {
  getTools(): Record<string, ToolDefinition> {
    const tools = [
      // AI Keyword Data
      new AiOptimizationKeywordDataLocationsAndLanguagesListTool(this.dataForSEOClient),
      new AiOptimizationKeywordDataSearchVolumeTool(this.dataForSEOClient),
      
      // LLM Mentions
      new LlmMentionsLocationsAndLanguagesTool(this.dataForSEOClient),
      new LlmMentionsFiltersTool(this.dataForSEOClient),
      new LlmMentionsSearchTool(this.dataForSEOClient),
      
      // ChatGPT
      new ChatGptLlmResponsesModelsTool(this.dataForSEOClient),
      new ChatGptLlmResponsesLiveTool(this.dataForSEOClient),
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