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
      user_prompt: z.string().describe('The prompt/question to send to ChatGPT'),
      model_name: z.string().optional().describe('ChatGPT model to use (e.g., "gpt-4.1-mini", "gpt-4o-mini"). Use models endpoint to get available options'),
      temperature: z.number().optional().describe('Sampling temperature (0-2). Higher values = more random, lower = more focused'),
      max_output_tokens: z.number().optional().describe('Maximum number of tokens to generate in the response'),
      top_p: z.number().optional().describe('Top-p sampling parameter (0-2) for controlling response diversity'),
    };
  }

  async handle(params: any): Promise<any> {
    try {
      const payload: any = {
        user_prompt: params.user_prompt,
      };

      if (params.model_name) payload.model_name = params.model_name;
      if (params.temperature !== undefined) payload.temperature = params.temperature;
      if (params.max_output_tokens) payload.max_output_tokens = params.max_output_tokens;
      if (params.top_p !== undefined) payload.top_p = params.top_p;

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

