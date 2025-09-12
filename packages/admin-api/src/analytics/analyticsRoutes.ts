import express from 'express';
import fs from 'fs';
import path from 'path';

const router: express.Router = express.Router();
const storeFile = path.join(process.cwd(), 'data', 'analytics.json');

function ensureStore() {
  const dir = path.dirname(storeFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(storeFile)) fs.writeFileSync(storeFile, JSON.stringify({ events: [] }));
}

// POST /api/analytics/event
router.post('/event', (req, res) => {
  try {
    ensureStore();
    const store = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
    const event = { timestamp: Date.now(), ...req.body };
    store.events.push(event);
    fs.writeFileSync(storeFile, JSON.stringify(store, null, 2));
    res.json({ ok: true });
  } catch (e) {
    const err = e as Error;
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/summary
router.get('/summary', (req, res) => {
  try {
    ensureStore();
    const store = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
    // Simple aggregation
    const summary = {
      events: store.events.length,
      byType: store.events.reduce((acc: any, ev: any) => {
        acc[ev.type] = (acc[ev.type] || 0) + 1;
        return acc;
      }, {}),
    };
    res.json(summary);
  } catch (e) {
    const err = e as Error;
    res.status(500).json({ error: err.message });
  }
});

export default router;
