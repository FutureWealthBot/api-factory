import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
export default function BillingManager() {
    const [status, setStatus] = useState('');
    async function payOnChain() {
        // TODO: Integrate with wallet/on-chain payment
        const res = await fetch('/billing/onchain', { method: 'POST' });
        const data = await res.json();
        setStatus(data.message);
    }
    async function payStripe() {
        // TODO: Integrate with Stripe checkout
        const res = await fetch('/billing/stripe', { method: 'POST' });
        const data = await res.json();
        setStatus(data.message);
    }
    return (_jsxs("div", { children: [_jsx("h2", { children: "Billing Management" }), _jsx("button", { onClick: payOnChain, children: "Pay with Crypto (On-Chain)" }), _jsx("button", { onClick: payStripe, children: "Pay with Stripe" }), status && _jsx("div", { children: status })] }));
}
