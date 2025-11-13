import { z } from 'zod';
import { BaseTool } from '../../../base.tool.js';
import { DataForSEOClient } from '../../../../client/dataforseo.client.js';

export class ChatGptLlmResponsesLiveTool extends BaseTool {
  constructor(dataForSEOClient: DataForSEOClient) {
    super(dataForSEOClient);
  }

  getName(): string {
    return 'ai_optimization_chatgpt_llm_responses_live';
  }

  getDescription(): string {
    return 'Get live ChatGPT responses. Send queries to ChatGPT and receive AI-generated responses in real-time. Perfect for testing how ChatGPT responds to specific queries and analyzing AI-generated content for SEO optimization.';
  }

  getParams(): z.ZodRawShape {
    return {
      prompt: z.string().describe('The prompt/question to send to ChatGPT'),
      model: z.string().optional().describe('ChatGPT model to use (e.g., "gpt-4", "gpt-3.5-turbo"). Use models endpoint to get available options'),
      temperature: z.number().optional().describe('Sampling temperature (0-2). Higher values = more random, lower = more focused'),
      max_tokens: z.number().optional().describe('Maximum number of tokens to generate in the response'),
      system_prompt: z.string().optional().describe('System message to set the behavior/context for ChatGPT'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {
        prompt: params.prompt,
      };

      if (params.model) payload.model = params.model;
      if (params.temperature !== undefined) payload.temperature = params.temperature;
      if (params.max_tokens) payload.max_tokens = params.max_tokens;
      if (params.system_prompt) payload.system_prompt = params.system_prompt;

      const response = await this.dataForSEOClient.makeRequest(
        '/v3/ai_optimization/chat_gpt/llm_responses/live',
        'POST',
        [payload]
      );
      return this.validateAndFormatResponse(response);
    } catch (error) {
      return this.formatErrorResponse(error);
    }
  }
}

