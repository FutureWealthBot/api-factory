/* eslint-disable @typescript-eslint/no-explicit-any */
export type ComplianceTag =
  | 'FTC'
  | 'HIPAA'
  | 'FERPA'
  | 'SEC'
  | 'CFTC'
  | 'FAA'
  | 'EPA'
  | 'FCRA'
  | 'TILA'
  | 'ECOA'
  | 'ADA'
  | 'COPPA'
  | 'FOIA'
  | 'NIST AI RMF'
  | 'Colorado SB 205'
  | 'NYC LL144';

export type PricingModel = 'subscription' | 'usage' | 'hybrid';

export type PriceEntry = { sku: string; price_usd: number };

export type PremiumApp = {
  id: string;
  name: string;
  tier: 'gold' | 'platinum' | 'enterprise';
  summary?: string;
  core_apis?: string[];
  us_compliance?: ComplianceTag[];
  pricing?: { model: PricingModel; list_prices?: PriceEntry[] };
  status: 'planned' | 'beta' | 'ga' | 'sunset';
  last_review?: string; // YYYY-MM-DD
};

export default PremiumApp;
