import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const TIERS = [
    { name: 'core', description: 'Minimal, public, open API. Health, ping, echo, docs.' },
    { name: 'standard', description: 'Auth, rate limits, usage, keys, quotas.' },
    { name: 'advanced', description: 'Billing, Stripe, compliance, audit logs.' },
    { name: 'enterprise', description: 'Multi-region, SLA, dedicated gateway, white-label.' },
];
export default function TierManager() {
    // TODO: Connect to backend for tier enforcement and API publishing
    return (_jsxs("div", { children: [_jsx("h2", { children: "API Tiers" }), _jsx("ul", { children: TIERS.map(tier => (_jsxs("li", { children: [_jsx("strong", { children: tier.name }), ": ", tier.description] }, tier.name))) })] }));
}
