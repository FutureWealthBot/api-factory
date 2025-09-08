// API Tier definitions and schema enforcement

export type ApiTier = 'core' | 'standard' | 'advanced' | 'enterprise';

export interface ApiTierSpec {
  name: ApiTier;
  description: string;
  requiredFields: string[];
  publishStandards: string[];
}

export const API_TIERS: ApiTierSpec[] = [
  {
    name: 'core',
    description: 'Minimal, public, open API. Health, ping, echo, docs.',
    requiredFields: ['openapi', 'health', 'ping', 'docs'],
    publishStandards: ['OpenAPI spec', 'Public docs'],
  },
  {
    name: 'standard',
    description: 'Auth, rate limits, usage, keys, quotas.',
    requiredFields: ['auth', 'rateLimit', 'usage', 'apiKey', 'quota'],
    publishStandards: ['API key support', 'Usage metrics'],
  },
  {
    name: 'advanced',
    description: 'Billing, Stripe, compliance, audit logs.',
    requiredFields: ['billing', 'stripe', 'compliance', 'auditLog'],
    publishStandards: ['Stripe integration', 'Compliance checks'],
  },
  {
    name: 'enterprise',
    description: 'Multi-region, SLA, dedicated gateway, white-label.',
    requiredFields: ['multiRegion', 'sla', 'dedicatedGateway', 'whiteLabel'],
    publishStandards: ['SLA', 'Dedicated infra'],
  },
];

// Example: Validate API definition against tier
export function validateApiForTier(apiDef: any, tier: ApiTier): string[] {
  const spec = API_TIERS.find(t => t.name === tier);
  if (!spec) return ['Unknown tier'];
  const missing = spec.requiredFields.filter(f => !(f in apiDef));
  return missing;
}
// Tier definitions and feature mapping for API Factory

export enum Tier {
  Core = 1,
  Standard = 2,
  Advanced = 3,
  Enterprise = 4,
}

export interface TierFeatures {
  name: string;
  description: string;
  features: string[];
}

export const TIER_FEATURES: Record<Tier, TierFeatures> = {
  [Tier.Core]: {
    name: "Core",
    description: "Foundation, schema, endpoints, basic docs, fast prototyping.",
    features: [
      "Schema scaffold",
      "REST + RPC endpoints",
      "Basic OpenAPI docs",
      "Fast prototyping",
    ],
  },
  [Tier.Standard]: {
    name: "Standard",
    description: "Auth, rate limits, CI/CD, versioning.",
    features: [
      "All Core features",
      "Auth (JWT, API keys)",
      "Rate limits & quotas",
      "CI/CD pipelines",
      "Versioned docs & SDKs",
    ],
  },
  [Tier.Advanced]: {
    name: "Advanced",
    description: "Monetization-ready, billing, metrics, SDKs.",
    features: [
      "All Standard features",
      "Stripe billing",
      "Tiered SDKs",
      "Usage tracking & metrics",
      "Revenue-ready APIs",
    ],
  },
  [Tier.Enterprise]: {
    name: "Enterprise",
    description: "Multi-region, compliance, dedicated gateway, SLA, white-label.",
    features: [
      "All Advanced features",
      "Multi-region deploy",
      "Compliance & audit logs",
      "Dedicated gateway",
      "SLA & white-label",
    ],
  },
};

export function getTierFeatures(tier: Tier): TierFeatures {
  return TIER_FEATURES[tier];
}
