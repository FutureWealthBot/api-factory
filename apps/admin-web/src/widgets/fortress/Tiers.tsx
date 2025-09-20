// apps/admin-web/src/widgets/fortress/Tiers.tsx
type Tier = {
  name: string;
  badge?: string;
  audience: string;
  features: string[];
  security: string[];
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

          {/* No compliance section for downscaled tiers */}
        </div>
      ))}
    </div>
  );
}
