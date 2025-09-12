import express from 'express';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const router = express.Router();
const campaignsDir = path.join(process.cwd(), 'marketing', 'campaigns');

// GET /api/marketing/campaigns
router.get('/campaigns', (req, res) => {
  const campaigns = fs.existsSync(campaignsDir)
    ? fs.readdirSync(campaignsDir).filter(f => fs.statSync(path.join(campaignsDir, f)).isDirectory())
    : [];
  res.json({ campaigns });
});

// POST /api/marketing/generate
router.post('/generate', async (req, res) => {
  const { prompt } = req.body as { prompt?: string };
  // TODO: integrate with pluggable LLM provider adapters
  const generated = `Generated content for: ${prompt || ''}`;
  res.json({ result: generated });
});

// POST /api/marketing/create-pr
router.post('/create-pr', (req, res) => {
  const { campaign, content } = req.body as { campaign: string; content: string };
  if (!campaign || !content) return res.status(400).json({ error: 'campaign and content required' });

  const branch = `marketing/${campaign}-${Date.now()}`;
  const fileDir = path.join(campaignsDir, campaign);
  const filePath = path.join(fileDir, `content-${Date.now()}.md`);
  fs.mkdirSync(fileDir, { recursive: true });
  fs.writeFileSync(filePath, content);

  try {
    execSync(`git checkout -b ${branch}`);
    execSync(`git add ${filePath}`);
    execSync(`git commit -m "feat(marketing): add campaign content"`);
    execSync(`git push origin ${branch}`);
    // PR creation would use GitHub API (not implemented here)
    res.json({ ok: true, branch });
  } catch (err) {
    const e = err as Error;
    res.status(500).json({ error: e.message });
  }
});

export default router;
