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
  return (
    <div>
      <h2>Billing Management</h2>
      <button onClick={payOnChain}>Pay with Crypto (On-Chain)</button>
      <button onClick={payStripe}>Pay with Stripe</button>
      {status && <div>{status}</div>}
    </div>
  );
}
