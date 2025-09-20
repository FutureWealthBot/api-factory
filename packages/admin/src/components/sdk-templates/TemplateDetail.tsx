import { useState, useEffect } from 'react';

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

export default function TemplateDetail({ templateId }: { templateId: string }) {
  const [template, setTemplate] = useState<SdkTemplate | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    fetch(`/sdk-templates/${templateId}`)
      .then(r => r.json())
      .then(data => setTemplate(data.template || null));
    setIsAdmin(true); // TODO: Replace with real admin check
  }, [templateId]);

  async function approveTemplate() {
    await fetch(`/sdk-templates/${templateId}/approve`, { method: 'POST', headers: { 'x-api-key': 'admin' } });
    fetch(`/sdk-templates/${templateId}`)
      .then(r => r.json())
      .then(data => setTemplate(data.template || null));
  }

  if (!template) return <div>Loading...</div>;
  return (
    <div>
      <h2>Template Details</h2>
      <b>{template.name}</b> ({template.language}) v{template.version} by {template.author}
      <br />
      <span>Tags: {template.tags && template.tags.join(', ')}</span>
      <br />
      <span style={{ fontStyle: 'italic', color: '#555' }}>{template.readme}</span>
      <br />
      <span>Status: {template.approved ? <b style={{color:'#080'}}>Approved</b> : <b style={{color:'#a00'}}>Pending</b>}</span>
      <br />
      <span>Downloads: {template.downloadCount ?? 0}</span>
      <br />
      <a href={`/sdk-templates/${template.id}/download`} target="_blank" rel="noopener noreferrer">Download</a>
      <br />
      {isAdmin && !template.approved && (
        <button onClick={approveTemplate}>Approve</button>
      )}
    </div>
  );
}
