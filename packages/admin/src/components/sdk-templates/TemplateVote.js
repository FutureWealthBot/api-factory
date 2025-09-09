import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export default function TemplateVote({ templateId, onVoted }) {
    async function vote(delta) {
        await fetch(`/sdk-templates/${templateId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delta })
        });
        if (onVoted)
            onVoted();
    }
    return (_jsxs("span", { children: [_jsx("button", { onClick: () => vote(1), children: "\uD83D\uDC4D" }), _jsx("button", { onClick: () => vote(-1), children: "\uD83D\uDC4E" })] }));
}
