import React from 'react';

export default function TemplateUpload() {
  const [name, setName] = React.useState('');
  const [language, setLanguage] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setStatus('Please select a file');
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

  return (
    <div>
      <h2>Upload SDK Template</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Template Name" value={name} onChange={e => setName(e.target.value)} />
        <input type="text" placeholder="Language" value={language} onChange={e => setLanguage(e.target.value)} />
        <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        <input type="text" placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} />
        <button type="submit">Upload</button>
      </form>
      {status && <div>{status}</div>}
    </div>
  );
}
