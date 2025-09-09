import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
const TIERS = [
    { name: 'core', description: 'Minimal, public, open API. Health, ping, echo, docs.' },
    { name: 'standard', description: 'Auth, rate limits, usage, keys, quotas.' },
    { name: 'advanced', description: 'Billing, Stripe, compliance, audit logs.' },
    { name: 'enterprise', description: 'Multi-region, SLA, dedicated gateway, white-label.' },
];
export default function ApiPublish() {
    const [tier, setTier] = useState('core');
    const [apiDef, setApiDef] = useState('{}');
    const [result, setResult] = useState([]);
    async function validate() {
        const res = await fetch('/tiers/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiDef: JSON.parse(apiDef), tier })
        });
        const data = await res.json();
        setResult(data.missing || []);
    }
    return (_jsxs("div", { children: [_jsx("h2", { children: "Publish API" }), _jsx("select", { value: tier, onChange: e => setTier(e.target.value), children: TIERS.map(t => _jsx("option", { value: t.name, children: t.name }, t.name)) }), _jsx("br", {}), _jsx("textarea", { value: apiDef, onChange: e => setApiDef(e.target.value), rows: 8, cols: 60, placeholder: "Paste API definition (JSON)" }), _jsx("br", {}), _jsx("button", { onClick: validate, children: "Validate & Publish" }), result.length > 0 && (_jsxs("div", { children: [_jsxs("b", { children: ["Missing fields for ", tier, ":"] }), _jsx("ul", { children: result.map(f => _jsx("li", { children: f }, f)) })] })), result.length === 0 && _jsx("div", { children: "All required fields present!" })] }));
}
