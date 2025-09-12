export interface LLMProvider {
  generate(prompt: string, opts?: any): Promise<string>;
}

export class MockProvider implements LLMProvider {
  async generate(prompt: string) {
    return `Mock generated: ${prompt}`;
  }
}

// Placeholder OpenAI adapter (no dependency on openai lib yet)
export class OpenAIProvider implements LLMProvider {
  async generate(prompt: string, opts?: { model?: string; maxRetries?: number; timeoutMs?: number }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAIProvider: OPENAI_API_KEY not set');

    const model = opts?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const maxRetries = opts?.maxRetries ?? 3;
    const timeoutMs = opts?.timeoutMs ?? 10_000;

    let attempt = 0;
    const url = 'https://api.openai.com/v1/chat/completions';

    while (attempt <= maxRetries) {
      attempt++;
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
          signal: controller.signal,
        });
        clearTimeout(id);

        if (!res.ok) {
          const body = await res.text().catch(() => '');
          const msg = `OpenAI error ${res.status} ${res.statusText} - ${body}`;
          // Retry on 5xx
          if (res.status >= 500 && attempt <= maxRetries) {
            await this.delay(attempt);
            continue;
          }
          throw new Error(msg);
        }

        const data = await res.json().catch(() => ({}));
        const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '';
        return String(text).trim();
      } catch (err: any) {
        // AbortError or transient network error -> retry
        const isAbort = err?.name === 'AbortError';
        const canRetry = attempt <= maxRetries && (isAbort || /network|timeout|ECONNRESET|ENOTFOUND/i.test(String(err?.message)));
        if (canRetry) {
          await this.delay(attempt);
          continue;
        }
        throw new Error(`OpenAIProvider generate failed: ${err?.message || String(err)}`);
      }
    }
    throw new Error('OpenAIProvider: exhausted retries');
  }

  private async delay(attempt: number) {
    const backoff = Math.min(2000 * attempt, 10_000);
    return new Promise((res) => setTimeout(res, backoff));
  }
}
