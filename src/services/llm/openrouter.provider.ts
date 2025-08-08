import axios from 'axios';
import { LLMProvider } from './llm.interface';

export class OpenRouterProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private referer: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.model = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct';
    this.referer = process.env.OPENROUTER_REFERER || '';
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      console.log('[OpenRouter LLM Request]:', prompt); // Log request
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': this.referer,
            'X-Title': 'WhatsApp AI Bot',
          },
        }
      );
      const responseContent = response.data.choices[0].message.content || '';
      console.log('[OpenRouter LLM Response]:', responseContent); // Log response
      return responseContent;
    } catch (error) {
      console.error('Error generating OpenRouter response:', error);
      throw error;
    }
  }
}