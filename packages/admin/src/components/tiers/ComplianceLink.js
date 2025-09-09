import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const PACKS = [
    { name: 'SOC2', file: '/agent-templates/compliance/SOC2.md' },
    { name: 'GDPR', file: '/agent-templates/compliance/GDPR.md' },
    { name: 'HIPAA', file: '/agent-templates/compliance/HIPAA.md' },
];
export default function ComplianceLink() {
    return (_jsxs("div", { children: [_jsx("h3", { children: "Compliance Packs" }), _jsx("ul", { children: PACKS.map(p => (_jsx("li", { children: _jsx("a", { href: p.file, target: "_blank", rel: "noopener noreferrer", children: p.name }) }, p.name))) })] }));
}
