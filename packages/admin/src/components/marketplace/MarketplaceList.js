import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export default function MarketplaceList() {
    const [apis, setApis] = React.useState([]);
    React.useEffect(() => {
        fetch('/marketplace').then(r => r.json()).then(data => setApis(data.apis || []));
    }, []);
    return (_jsxs("div", { children: [_jsx("h2", { children: "API Marketplace" }), _jsx("ul", { children: apis.map(api => (_jsxs("li", { children: [_jsx("b", { children: api.name }), " (Tier: ", api.tier, ") [$", api.price, "]", _jsx("br", {}), "Tags: ", api.tags && api.tags.join(', '), _jsx("br", {}), _jsx("a", { href: api.docs, target: "_blank", rel: "noopener noreferrer", children: "Docs" })] }, api.id))) })] }));
}
