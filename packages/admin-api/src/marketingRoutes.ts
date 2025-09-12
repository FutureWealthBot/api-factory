import express from 'express';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { MockProvider, OpenAIProvider } from './llm/adapters';
import { requireApiKey } from './middleware/auth';

const router: express.Router = express.Router();
const campaignsDir = path.join(process.cwd(), 'marketing', 'campaigns');

// GET /api/marketing/campaigns
router.get('/campaigns', (req, res) => {
  const campaigns = fs.existsSync(campaignsDir)
    ? fs.readdirSync(campaignsDir).filter((f) => fs.statSync(path.join(campaignsDir, f)).isDirectory())
    : [];
  res.json({ campaigns });
});

// POST /api/marketing/generate
router.post('/generate', async (req, res) => {
  const { prompt, provider: providerNameBody, model } = req.body as { prompt?: string; provider?: string; model?: string };
  try {
    const providerName = providerNameBody || process.env.LLM_PROVIDER || 'mock';
    const provider = providerName === 'openai' ? new OpenAIProvider() : new MockProvider();

    const result = await provider.generate(prompt || '', { model });
    res.json({ result });
  } catch (e) {
    const err = e as Error;
    console.error('generate error:', err);
    res.status(500).json({ error: 'LLM generation failed', details: err.message });
  }
});

// POST /api/marketing/create-pr
router.post('/create-pr', requireApiKey, (req, res) => {
  const { campaign, content } = req.body as { campaign?: string; content?: string };
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
