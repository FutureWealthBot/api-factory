import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { createRoot } from 'react-dom/client';
import MarketingWorkspace from './MarketingWorkspace';
function App() {
    return (_jsxs("div", { children: [_jsx("h1", { children: "Admin Autopilot & Marketing" }), _jsx(MarketingWorkspace, {})] }));
}
const root = document.getElementById('root');
if (root) {
    createRoot(root).render(_jsx(App, {}));
}
