import React from 'react';

export default function PricingPage() {
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <h1>Retirement Planner API Pricing</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Plan</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Price</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Features</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Starter</td>
            <td>$29/mo</td>
            <td>Pension, IRA, Social Security calculators<br />Basic support</td>
          </tr>
          <tr>
            <td>Advisors</td>
            <td>$299/mo</td>
            <td>All Starter features<br />Multi-client support<br />Priority support</td>
          </tr>
          <tr>
            <td>Enterprise</td>
            <td>Custom</td>
            <td>All Advisor features<br />Custom integrations<br />Compliance & SLA</td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 32 }}>
        <a href="mailto:sales@example.com" style={{ color: '#0070f3', textDecoration: 'underline' }}>Contact us for enterprise plans</a>
      </div>
    </div>
  );
}
