import express from 'express';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const router: express.Router = express.Router();
const campaignsDir = path.join(process.cwd(), 'marketing', 'campaigns');

// GET /api/marketing/campaigns
router.get('/campaigns', (req, res) => {
  const campaigns = fs.readdirSync(campaignsDir).filter(f => fs.statSync(path.join(campaignsDir, f)).isDirectory());
  res.json({ campaigns });
});

// POST /api/marketing/generate
router.post('/generate', async (req, res) => {
  // Placeholder: integrate with LLM API (e.g., OpenAI)
  const { prompt } = req.body;
  const generated = `Generated content for: ${prompt}`;
  res.json({ result: generated });
});

// POST /api/marketing/create-pr
router.post('/create-pr', (req, res) => {
  // Placeholder: create branch, add file, open PR (requires GitHub token)
  const { campaign, content } = req.body;
  const branch = `marketing/${campaign}-${Date.now()}`;
  const filePath = path.join(campaignsDir, campaign, `content-${Date.now()}.md`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  // Simulate git branch and PR creation
  try {
    execSync(`git checkout -b ${branch}`);
    execSync(`git add ${filePath}`);
    execSync(`git commit -m "feat(marketing): add campaign content"`);
    execSync(`git push origin ${branch}`);
    // PR creation would use GitHub API (not implemented here)
    res.json({ ok: true, branch });
  } catch (e) {
    const err = e as Error;
    res.status(500).json({ error: err.message });
  }
});

export default router;
