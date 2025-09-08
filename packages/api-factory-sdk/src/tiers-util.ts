import { Tier, TIER_FEATURES } from '@api-factory/core';

export function getAvailableFeaturesForTier(tier: Tier): string[] {
  return TIER_FEATURES[tier].features;
}

export function isFeatureAvailable(tier: Tier, feature: string): boolean {
  return getAvailableFeaturesForTier(tier).includes(feature);
}
