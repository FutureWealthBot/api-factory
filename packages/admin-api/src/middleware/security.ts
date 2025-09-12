// Placeholder for express-rate-limit
export function apiRateLimiter(req: any, res: any, next: any) { next(); }

// Audit logging middleware
export function auditLogger(req: any, res: any, next: any) {
  const record = `${new Date().toISOString()} ${req.method} ${req.originalUrl} - ${req.ip}`;
  console.log(record);
  next();
}
