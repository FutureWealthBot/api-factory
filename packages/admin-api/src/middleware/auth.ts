// Simple auth middleware for admin-api

import express from 'express';

export function requireApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.header('x-api-key') || req.query.api_key;
  const expected = process.env.ADMIN_API_KEY || 'dev-key';
  if (String(key) !== expected) return res.status(401).json({ error: 'unauthorized' });
  next();
}
