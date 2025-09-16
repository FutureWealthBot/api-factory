import React, { useState } from 'react';

export default function MarketplacePage() {
  const [apis, setApis] = useState([]);
  const [form, setForm] = useState({ name: '', tier: '', tags: '', price: '', docs: '', description: '', owner: '', contact: '', logo: '', version: '' });
  const [message, setMessage] = useState('');

  const fetchApis = async () => {
    const res = await fetch('/marketplace');
    const data = await res.json();
    setApis(data.apis || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/marketplace/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        price: Number(form.price)
      })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('API published!');
      setForm({ name: '', tier: '', tags: '', price: '', docs: '', description: '', owner: '', contact: '', logo: '', version: '' });
      fetchApis();
    } else {
      setMessage(data.message || 'Error publishing API');
    }
  };

  React.useEffect(() => { fetchApis(); }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Marketplace</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <h2>Publish New API</h2>
        <input name="name" placeholder="API Name" value={form.name} onChange={handleChange} required />{' '}
        <input name="tier" placeholder="Tier (core, standard, etc)" value={form.tier} onChange={handleChange} required />{' '}
        <input name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} />{' '}
        <input name="price" placeholder="Price" type="number" value={form.price} onChange={handleChange} />{' '}
        <input name="docs" placeholder="OpenAPI Spec URL" value={form.docs} onChange={handleChange} required />{' '}
        <input name="version" placeholder="Version (e.g. 1.0.0)" value={form.version} onChange={handleChange} />{' '}
        <input name="owner" placeholder="Owner/Publisher" value={form.owner} onChange={handleChange} />{' '}
        <input name="contact" placeholder="Contact Email or Link" value={form.contact} onChange={handleChange} />{' '}
        <input name="logo" placeholder="Logo URL" value={form.logo} onChange={handleChange} />{' '}
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ verticalAlign: 'top', width: 300, height: 60 }} />{' '}
        <button type="submit">Publish</button>
        {message && <div style={{ color: message.includes('Error') ? 'red' : 'green', marginTop: 8 }}>{message}</div>}
      </form>
      <h2>Available APIs</h2>
      <ul>
        {apis.map((api: any) => (
          <li key={api.id} style={{ marginBottom: 16 }}>
            {api.logo && <img src={api.logo} alt="logo" style={{ width: 32, height: 32, verticalAlign: 'middle', marginRight: 8 }} />}
            <strong>{api.name}</strong> (Tier: {api.tier}, Price: {api.price}, Version: {api.version})<br />
            {api.description && <span>{api.description}<br /></span>}
            {api.owner && <span>Owner: {api.owner}<br /></span>}
            {api.contact && <span>Contact: <a href={api.contact} target="_blank" rel="noopener noreferrer">{api.contact}</a><br /></span>}
            Tags: {api.tags && api.tags.join(', ')}<br />
            <a href={api.docs} target="_blank" rel="noopener noreferrer">OpenAPI Spec</a>
          </li>
        ))}
        {apis.length === 0 && <li>No APIs published yet.</li>}
      </ul>
    </div>
  );
}
