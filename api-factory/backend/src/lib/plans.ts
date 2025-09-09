export type PlanInfo = {
  id: string;
  quota: number; // requests per billing period (simple quota)
  rateLimit: number; // requests per minute fallback
};

const PLANS: Record<string, PlanInfo> = {
  starter: { id: 'starter', quota: 1000, rateLimit: 60 },
  pro: { id: 'pro', quota: 10000, rateLimit: 600 },
  enterprise: { id: 'enterprise', quota: 100000, rateLimit: 5000 },
};

const STARTER = PLANS.starter as PlanInfo;

export function getPlanInfo(name: string | undefined): PlanInfo {
  if (!name) return STARTER;
  const normalized = name.toLowerCase();
  const found = PLANS[normalized];
  return found ? found : STARTER;
}

export default { PLANS, getPlanInfo };
