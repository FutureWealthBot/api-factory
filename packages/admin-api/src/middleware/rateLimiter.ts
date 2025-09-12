// Simple in-memory rate limiter middleware

import express from 'express';

const requests: Record<string, { ts: number[] }> = {};
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX = Number(process.env.RATE_LIMIT_MAX || 60);

export function simpleRateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.ip || 'global';
  const now = Date.now();
  if (!requests[key]) requests[key] = { ts: [] };
  requests[key].ts = requests[key].ts.filter((t) => now - t < WINDOW_MS);
  if (requests[key].ts.length >= MAX) return res.status(429).json({ error: 'rate limit exceeded' });
  requests[key].ts.push(now);
  next();
}
