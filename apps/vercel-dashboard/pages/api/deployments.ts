import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  const per_page = 50;
  const url = `https://api.github.com/repos/FutureWealthBot/api-factory/deployments?per_page=${per_page}`;
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } });
    if (!r.ok) return res.status(r.status).json({ error: 'GitHub API error', status: r.status, body: await r.text() });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
}
