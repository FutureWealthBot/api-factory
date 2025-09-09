import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export default function TemplateUpload() {
    const [name, setName] = React.useState('');
    const [language, setLanguage] = React.useState('');
    const [tags, setTags] = React.useState('');
    const [author, setAuthor] = React.useState('');
    const [file, setFile] = React.useState(null);
    const [status, setStatus] = React.useState('');
    async function handleSubmit(e) {
        e.preventDefault();
        if (!file)
            return setStatus('Please select a file');
        const fileContent = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(fileContent)));
        const res = await fetch('/sdk-templates/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, language, tags, author, fileContent: base64, fileName: file.name })
        });
        const data = await res.json();
        setStatus(data.status === 'ok' ? 'Upload successful!' : 'Upload failed');
    }
    return (_jsxs("div", { children: [_jsx("h2", { children: "Upload SDK Template" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("input", { type: "text", placeholder: "Template Name", value: name, onChange: e => setName(e.target.value) }), _jsx("input", { type: "text", placeholder: "Language", value: language, onChange: e => setLanguage(e.target.value) }), _jsx("input", { type: "text", placeholder: "Tags (comma separated)", value: tags, onChange: e => setTags(e.target.value) }), _jsx("input", { type: "file", onChange: e => setFile(e.target.files?.[0] || null) }), _jsx("input", { type: "text", placeholder: "Author", value: author, onChange: e => setAuthor(e.target.value) }), _jsx("button", { type: "submit", children: "Upload" })] }), status && _jsx("div", { children: status })] }));
}
