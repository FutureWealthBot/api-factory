import { useState, useEffect } from 'react';

import TemplateVote from './TemplateVote';

type SdkTemplate = {
  id: string;
  name: string;
  language?: string;
  author?: string;
  votes?: number;
  tags?: string[];
  version?: string;
  readme?: string;
  approved?: boolean;
  downloadCount?: number;
};

export default function TemplateList() {
  const [templates, setTemplates] = useState<SdkTemplate[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    fetch('/sdk-templates').then(r => r.json()).then(data => setTemplates(data.templates || []));
    // TODO: Replace with real admin check
    setIsAdmin(true);
  }, []);

  async function approveTemplate(id: string) {
    await fetch(`/sdk-templates/${id}/approve`, { method: 'POST', headers: { 'x-api-key': 'admin' } });
    fetch('/sdk-templates').then(r => r.json()).then(data => setTemplates(data.templates || []));
  }

  return (
    <div>
      <h2>SDK Templates</h2>
      <ul>
  {templates.map((t: SdkTemplate) => (
          <li key={t.id} style={{ marginBottom: 16, border: t.approved ? '1px solid #0a0' : '1px solid #aaa', padding: 8 }}>
            <b>{t.name}</b> ({t.language}) v{t.version} by {t.author} [votes: {t.votes}]
            <br />
            <span>Tags: {t.tags && t.tags.join(', ')}</span>
            <br />
            <span style={{ fontStyle: 'italic', color: '#555' }}>{t.readme}</span>
            <br />
            <span>Status: {t.approved ? <b style={{color:'#080'}}>Approved</b> : <b style={{color:'#a00'}}>Pending</b>}</span>
            <br />
            <span>Downloads: {t.downloadCount ?? 0}</span>
            <br />
            <a href={`/sdk-templates/${t.id}/download`} target="_blank" rel="noopener noreferrer">Download</a>
            <br />
            {isAdmin && !t.approved && (
              <button onClick={() => approveTemplate(t.id)}>Approve</button>
            )}
            <TemplateVote templateId={String(t.id)} onVoted={() => {
              fetch('/sdk-templates').then(r => r.json()).then(data => setTemplates(data.templates || []));
            }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
