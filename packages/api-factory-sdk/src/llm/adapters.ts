// LLM provider adapter stubs

export interface LLMProvider {
  generate(prompt: string, options?: any): Promise<string>;
}

export class OpenAIAdapter implements LLMProvider {
  async generate(prompt: string) {
    // Placeholder: integrate OpenAI API
    return `OpenAI generated: ${prompt}`;
  }
}

export class MockAdapter implements LLMProvider {
  async generate(prompt: string) {
    return `Mock: ${prompt}`;
  }
}
