import OpenAI from 'openai';
import { LLMProvider } from './llm.interface';

export class OpenAIProvider implements LLMProvider {
  private openai: OpenAI;
  private model: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      console.log('[OpenAI LLM Request]:', prompt); // Log request
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: 'system', content: prompt }],
        model: this.model,
      });
      const responseContent = completion.choices[0].message.content || '';
      console.log('[OpenAI LLM Response]:', responseContent); // Log response
      return responseContent;
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      throw error;
    }
  }
}