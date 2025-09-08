import React from 'react';
import { Tier, TIER_FEATURES } from '@api-factory/core';

export function TierFeaturesCard() {
	return (
		<div style={{ display: 'flex', gap: 24 }}>
			{Object.values(Tier)
				.filter((v) => typeof v === 'number')
				.map((tierNum) => {
					const tier = tierNum as Tier;
					const { name, description, features } = TIER_FEATURES[tier];
					return (
						<div key={tier} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, minWidth: 220 }}>
							<h3>{name}</h3>
							<p style={{ fontStyle: 'italic' }}>{description}</p>
							<ul>
								{features.map((f) => (
									<li key={f}>{f}</li>
								))}
							</ul>
						</div>
					);
				})}
		</div>
	);
}