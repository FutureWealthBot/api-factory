import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
export default function MarketingWorkspace() {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [campaign, setCampaign] = useState('');
    const [status, setStatus] = useState('');
    async function generateContent() {
        setStatus('Generating...');
        const res = await fetch('/api/marketing/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        setResult(data.result);
        setStatus('');
    }
    async function createPR() {
        setStatus('Creating PR...');
        const res = await fetch('/api/marketing/create-pr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign, content: result })
        });
        const data = await res.json();
        setStatus(data.ok ? `PR branch: ${data.branch}` : `Error: ${data.error}`);
    }
    return (_jsxs("div", { style: { maxWidth: 600, margin: '2rem auto' }, children: [_jsx("h2", { children: "Marketing Campaign Autopilot" }), _jsx("input", { value: campaign, onChange: e => setCampaign(e.target.value), placeholder: "Campaign name", style: { width: '100%', marginBottom: 8 } }), _jsx("textarea", { value: prompt, onChange: e => setPrompt(e.target.value), placeholder: "Describe the campaign or content to generate", rows: 4, style: { width: '100%', marginBottom: 8 } }), _jsx("button", { onClick: generateContent, disabled: !prompt || status.includes('Generating'), children: "Generate Content" }), _jsx("br", {}), _jsx("textarea", { value: result, readOnly: true, rows: 6, style: { width: '100%', margin: '8px 0' }, placeholder: "Generated content will appear here" }), _jsx("button", { onClick: createPR, disabled: !result || !campaign || status.includes('Creating'), children: "Create PR" }), _jsx("div", { children: status })] }));
}
