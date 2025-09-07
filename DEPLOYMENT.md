# API Factory - Deployment Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   pnpm install  # or npm install
   ```

2. **Build All Applications**
   ```bash
   # Build core package
   cd packages/core && pnpm build

   # Build API CLI
   cd apps/api-cli && pnpm build

   # Build Web Apps
   cd apps/web && pnpm build
   cd apps/admin-web && pnpm build
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the API Server**
   ```bash
   cd apps/api-cli
   pnpm start  # or node dist/server.js
   ```

## Configuration

### API Server
- `PORT`: Server port (default: 8787)
- `BIND_HOST`: Bind address (default: 0.0.0.0)
- `API_FACTORY_ADMIN_KEY`: Admin authentication token (default: dev-admin-key-change-me)

### Admin Web Interface
- `VITE_API_FACTORY_ADMIN_KEY`: Must match API_FACTORY_ADMIN_KEY for admin actions

## API Endpoints

- `GET /_api/healthz` - Health check
- `GET /_api/metrics` - Prometheus metrics
- `GET /api/v1/hello/ping` - Ping test
- `POST /api/v1/actions` - Admin actions (requires auth)

## Features

✅ **Implemented**
- Rate limiting (100 requests/minute)
- Admin authentication
- Prometheus metrics
- Health monitoring
- CORS support
- TypeScript build system
- ESLint configuration

📋 **Production Checklist**
- [ ] Change default admin key
- [ ] Set up HTTPS/TLS
- [ ] Configure rate limiting for production
- [ ] Set up monitoring/alerting
- [ ] Add logging
- [ ] Configure database connections
- [ ] Set up CI/CD pipeline
- [ ] Add comprehensive tests