import { useState, useRef } from 'react';

export default function AIPlayground() {
  const [input, setInput] = useState('Tell me a famous quote about resilience');
  const [output, setOutput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  async function run(mode: 'sync'|'stream') {
    setOutput('');
    setStreaming(mode === 'stream');
    controllerRef.current = new AbortController();
    try {
      const res = await fetch('/api/v1/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, input: { type: 'text', text: input } }),
        signal: controllerRef.current.signal,
      });
      if (!res.ok) throw new Error('ai error');

      if (mode === 'sync') {
        const body = await res.json();
        setOutput(body.output?.text || JSON.stringify(body));
        setStreaming(false);
      } else {
        const reader = res.body?.getReader();
        if (!reader) throw new Error('no reader');
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          setOutput((s) => s + chunk);
        }
        setStreaming(false);
      }
    } catch (err:any) {
      setOutput('error: ' + String(err.message || err));
      setStreaming(false);
    }
  }

  return (
    <div className="ai-playground">
      <h3>AI Playground (mock)</h3>
      <textarea name="ai-input" value={input} onChange={(e) => setInput(e.target.value)} rows={3} />
      <div>
        <button onClick={() => run('sync')}>Run (sync)</button>
        <button onClick={() => run('stream')}>Run (stream)</button>
        {streaming && <button onClick={() => controllerRef.current?.abort()}>Stop</button>}
      </div>
      <pre data-testid="ai-output">{output}</pre>
    </div>
  );
}
