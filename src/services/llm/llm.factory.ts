
import { LLMProvider } from './llm.interface';
import { OpenAIProvider } from './openai.provider';
import { OpenRouterProvider } from './openrouter.provider';

export class LLMFactory {
  static createProvider(): LLMProvider {
    const provider = process.env.LLM_PROVIDER?.toLowerCase();

    switch (provider) {
      case 'openai':
        return new OpenAIProvider();
      case 'openrouter':
        return new OpenRouterProvider();
      default:
        console.warn(
          `Invalid LLM_PROVIDER specified. Defaulting to 'openai'.`
        );
        return new OpenAIProvider();
    }
  }
}
