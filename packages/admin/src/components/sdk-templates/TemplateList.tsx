import React from 'react';

import TemplateVote from './TemplateVote';

type SdkTemplate = {
  id: string;
  name: string;
  language?: string;
  author?: string;
  votes?: number;
  tags?: string[];
};

export default function TemplateList() {
  const [templates, setTemplates] = React.useState<SdkTemplate[]>([]);
  React.useEffect(() => {
    fetch('/sdk-templates').then(r => r.json()).then(data => setTemplates(data.templates || []));
  }, []);
  return (
    <div>
      <h2>SDK Templates</h2>
      <ul>
        {templates.map(t => (
          <li key={t.id}>
            <b>{t.name}</b> ({t.language}) by {t.author} [votes: {t.votes}]<br />
            <span>Tags: {t.tags && t.tags.join(', ')}</span><br />
            <TemplateVote templateId={String(t.id)} onVoted={() => {
              fetch('/sdk-templates').then(r => r.json()).then(data => setTemplates(data.templates || []));
            }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
