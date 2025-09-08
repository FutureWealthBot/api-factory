import React from 'react';

const TIERS = [
  { name: 'core', description: 'Minimal, public, open API. Health, ping, echo, docs.' },
  { name: 'standard', description: 'Auth, rate limits, usage, keys, quotas.' },
  { name: 'advanced', description: 'Billing, Stripe, compliance, audit logs.' },
  { name: 'enterprise', description: 'Multi-region, SLA, dedicated gateway, white-label.' },
];

export default function TierManager() {
  // TODO: Connect to backend for tier enforcement and API publishing
  return (
    <div>
      <h2>API Tiers</h2>
      <ul>
        {TIERS.map(tier => (
          <li key={tier.name}>
            <strong>{tier.name}</strong>: {tier.description}
          </li>
        ))}
      </ul>
      {/* Add UI for schema checks and publish standards */}
    </div>
  );
}
