import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import TemplateVote from './TemplateVote';
export default function TemplateList() {
    const [templates, setTemplates] = React.useState([]);
    React.useEffect(() => {
        fetch('/sdk-templates').then(r => r.json()).then(data => setTemplates(data.templates || []));
    }, []);
    return (_jsxs("div", { children: [_jsx("h2", { children: "SDK Templates" }), _jsx("ul", { children: templates.map(t => (_jsxs("li", { children: [_jsx("b", { children: t.name }), " (", t.language, ") by ", t.author, " [votes: ", t.votes, "]", _jsx("br", {}), _jsxs("span", { children: ["Tags: ", t.tags && t.tags.join(', ')] }), _jsx("br", {}), _jsx(TemplateVote, { templateId: String(t.id), onVoted: () => {
                                fetch('/sdk-templates').then(r => r.json()).then(data => setTemplates(data.templates || []));
                            } })] }, t.id))) })] }));
}
