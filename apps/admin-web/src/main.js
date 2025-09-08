import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { createRoot } from "react-dom/client";
function Card(props) {
    return (_jsxs("div", { style: {
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }, children: [_jsx("h3", { style: { marginTop: 0 }, children: props.title }), props.children] }));
}
function App() {
    const [health, setHealth] = React.useState(null);
    const [ping, setPing] = React.useState(null);
    const [lastAction, setLastAction] = React.useState(null);
    const [echoText, setEchoText] = React.useState("hello world");
    const [tgMsg, setTgMsg] = React.useState("hello from Admin");
    const [tgChatId, setTgChatId] = React.useState("123");
    async function fetchHealth() {
        const r = await fetch("/_api/healthz");
        setHealth(await r.json());
    }
    async function fetchPing() {
        const r = await fetch("/api/v1/hello/ping");
        setPing(await r.json());
    }
    async function callAction(body) {
        const r = await fetch("/api/v1/actions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body)
        });
        const json = await r.json();
        setLastAction(json);
    }
    // Actions
    const triggerCollection = () => callAction({ action: "trigger_collection" });
    const sendTelegram = () => callAction({ action: "send_telegram_alert", payload: { chat_id: tgChatId, message: tgMsg } });
    const upsertSample = () => callAction({ action: "upsert_opportunities", payload: { items: [{ id: "x1", pair: "BTC/USDT" }] } });
    // Simple echo to show POST works
    const echo = async () => {
        const r = await fetch("/api/v1/hello/echo", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ from: "admin-web", text: echoText })
        });
        const json = await r.json();
        setLastAction(json);
    };
    React.useEffect(() => {
        fetchHealth().catch(console.error);
        fetchPing().catch(console.error);
    }, []);
    return (_jsxs("div", { style: { fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto" }, children: [_jsx("h1", { style: { marginTop: 0 }, children: "API Factory \u2013 Admin" }), _jsx("p", { children: "Vite dev server \u2192 proxy \u2192 Fastify API" }), _jsxs(Card, { title: "Service Health", children: [_jsxs("div", { style: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }, children: [_jsx("button", { onClick: fetchHealth, children: "Refresh Health" }), _jsx("button", { onClick: fetchPing, children: "Ping" }), _jsx("a", { href: "/_api/metrics", target: "_blank", rel: "noreferrer", children: "Open Metrics" }), _jsx("a", { href: "/", target: "_blank", rel: "noreferrer", children: "API Index" })] }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }, children: [_jsx("pre", { style: { margin: 0 }, children: JSON.stringify(health, null, 2) }), _jsx("pre", { style: { margin: 0 }, children: JSON.stringify(ping, null, 2) })] })] }), _jsx(Card, { title: "Actions", children: _jsxs("div", { style: { display: "grid", gap: 12 }, children: [_jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [_jsx("button", { onClick: triggerCollection, children: "Trigger Collection" }), _jsx("button", { onClick: upsertSample, children: "Upsert Sample Opportunity" })] }), _jsxs("div", { style: { display: "grid", gap: 8 }, children: [_jsxs("label", { children: ["Echo Text:", _jsx("input", { value: echoText, onChange: e => setEchoText(e.target.value), style: { marginLeft: 8, width: 300 } })] }), _jsx("button", { onClick: echo, children: "POST /hello/echo" })] }), _jsxs("div", { style: { display: "grid", gap: 8 }, children: [_jsxs("label", { children: ["Telegram Chat ID:", _jsx("input", { value: tgChatId, onChange: e => setTgChatId(e.target.value), style: { marginLeft: 8, width: 220 } })] }), _jsxs("label", { children: ["Telegram Message:", _jsx("input", { value: tgMsg, onChange: e => setTgMsg(e.target.value), style: { marginLeft: 8, width: 300 } })] }), _jsx("button", { onClick: sendTelegram, children: "Send Test Telegram Alert" })] }), _jsxs("div", { children: [_jsx("h4", { children: "Last Response" }), _jsx("pre", { style: { margin: 0 }, children: JSON.stringify(lastAction, null, 2) })] })] }) })] }));
}
createRoot(document.getElementById("root")).render(_jsx(App, {}));
