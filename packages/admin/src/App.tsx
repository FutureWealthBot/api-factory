import React from 'react';
import TemplateUpload from './components/sdk-templates/TemplateUpload';
import TemplateList from './components/sdk-templates/TemplateList';
import BillingManager from './components/billing/BillingManager';
import MarketplaceList from './components/marketplace/MarketplaceList';
import MarketplacePage from './components/marketplace/MarketplacePage';
import TierManager from './components/tiers/TierManager';
import ApiPublish from './components/tiers/ApiPublish';
import ComplianceLink from './components/tiers/ComplianceLink';

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <section>
        <h2>SDK Templates</h2>
        <TemplateUpload />
        <TemplateList />
      </section>
      <section>
        <h2>API Marketplace</h2>
        <MarketplacePage />
      </section>
      <section>
        <h2>Billing</h2>
        <BillingManager />
      </section>
      <section>
        <h2>API Tiers & Publishing</h2>
        <TierManager />
        <ApiPublish />
        <ComplianceLink />
      </section>
    </div>
  );
}
