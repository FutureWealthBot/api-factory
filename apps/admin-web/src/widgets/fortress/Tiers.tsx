// apps/admin-web/src/widgets/fortress/Tiers.tsx
type Tier = {
  name: string;
  badge?: string;
  audience: string;
  features: string[];
  security: string[];
  compliance?: string[];
  price: string;
};

const tiers: Tier[] = [
  {
    name: 'Starter',
    badge: '🚀',
    audience: 'Solo devs & hobbyists',
    features: [
      'API creation in hours',
      'Standardized auth (JWT, API keys)',
      'Built-in billing & usage tracking',
      'Basic logging & rate limits',
    ],
    security: ['Basic WAF', 'TLS 1.3'],
    price: 'Free → $29/mo',
  },
  {
    name: 'Pro',
    badge: '🔰 (AI-Shielded APIs)',
    audience: 'Startups & small teams',
    features: [
      'Everything in Starter',
      'SDKs for 3 languages',
      'Team roles + API key rotation',
      'Quotas + usage dashboards',
    ],
    security: ['AI-adaptive firewall', 'ML-based DDoS', 'Decoy endpoints'],
    price: '$99–$199/mo',
  },
  {
    name: 'Enterprise',
    badge: '🏦 (AI Cyber Fortress)',
    audience: 'Enterprises & fintechs',
    features: [
      'Everything in Pro',
      'Multi-region deployment',
      'Advanced analytics & monitoring',
      'Private marketplace options',
    ],
    security: [
      'Zero-Trust architecture',
      'Real-time anomaly detection (AI vs AI)',
      'Automated quarantine + key rotation',
      'Immutable audit logs',
    ],
    compliance: ['SOC2', 'HIPAA', 'GDPR ready'],
    price: '$999–$2,500/mo',
  },
  {
    name: 'Government / Defense',
    badge: '🛡️',
    audience: 'Agencies & critical infrastructure',
    features: [
      'All Enterprise features',
      'On-prem/sovereign cloud',
      '24/7 war-room support',
      'Custom compliance packs (CJIS, FedRAMP, ITAR)',
    ],
    security: [
      'Dedicated AI Cyber Shield agents',
      'Honey-API deception grids',
      'Master key escrow + audit approvals',
    ],
    price: 'Custom ($10k+/mo)',
  },
];

export default function Tiers() {
  return (
    <div className="tiers-grid">
      {tiers.map((t) => (
        <div className="tier-card" key={t.name}>
          <header className="tier-head">
            <h3>{t.name} {t.badge && <span className="tier-badge">{t.badge}</span>}</h3>
            <div className="tier-price">{t.price}</div>
          </header>
          <p className="tier-audience">For: {t.audience}</p>

          <h4>Features</h4>
          <ul>{t.features.map((f, i) => <li key={i}>{f}</li>)}</ul>

          <h4>Security</h4>
          <ul>{t.security.map((s, i) => <li key={i}>{s}</li>)}</ul>

          {t.compliance && (
            <>
              <h4>Compliance</h4>
              <ul>{t.compliance.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
