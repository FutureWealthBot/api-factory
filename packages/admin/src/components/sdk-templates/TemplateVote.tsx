import React from 'react';

export default function TemplateVote({ templateId, onVoted }: { templateId: string, onVoted?: () => void }) {
  async function vote(delta: number) {
    await fetch(`/sdk-templates/${templateId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta })
    });
    if (onVoted) onVoted();
  }
  return (
    <span>
      <button onClick={() => vote(1)}>👍</button>
      <button onClick={() => vote(-1)}>👎</button>
    </span>
  );
}
