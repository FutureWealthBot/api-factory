import React from 'react';

const PACKS = [
  { name: 'SOC2', file: '/agent-templates/compliance/SOC2.md' },
  { name: 'GDPR', file: '/agent-templates/compliance/GDPR.md' },
  { name: 'HIPAA', file: '/agent-templates/compliance/HIPAA.md' },
];

export default function ComplianceLink() {
  return (
    <div>
      <h3>Compliance Packs</h3>
      <ul>
        {PACKS.map(p => (
          <li key={p.name}><a href={p.file} target="_blank" rel="noopener noreferrer">{p.name}</a></li>
        ))}
      </ul>
    </div>
  );
}
