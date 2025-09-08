import React from 'react';

import TemplateVote from './TemplateVote';

export default function TemplateList() {
  const [templates, setTemplates] = React.useState<any[]>([]);
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
            <TemplateVote templateId={t.id} onVoted={() => {
              fetch('/sdk-templates').then(r => r.json()).then(data => setTemplates(data.templates || []));
            }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
