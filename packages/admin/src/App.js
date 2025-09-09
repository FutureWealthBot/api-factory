import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import TemplateUpload from './components/sdk-templates/TemplateUpload';
import TemplateList from './components/sdk-templates/TemplateList';
import BillingManager from './components/billing/BillingManager';
import MarketplaceList from './components/marketplace/MarketplaceList';
import TierManager from './components/tiers/TierManager';
import ApiPublish from './components/tiers/ApiPublish';
import ComplianceLink from './components/tiers/ComplianceLink';
export default function App() {
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h1", { children: "Admin Dashboard" }), _jsxs("section", { children: [_jsx("h2", { children: "SDK Templates" }), _jsx(TemplateUpload, {}), _jsx(TemplateList, {})] }), _jsxs("section", { children: [_jsx("h2", { children: "API Marketplace" }), _jsx(MarketplaceList, {})] }), _jsxs("section", { children: [_jsx("h2", { children: "Billing" }), _jsx(BillingManager, {})] }), _jsxs("section", { children: [_jsx("h2", { children: "API Tiers & Publishing" }), _jsx(TierManager, {}), _jsx(ApiPublish, {}), _jsx(ComplianceLink, {})] })] }));
}
