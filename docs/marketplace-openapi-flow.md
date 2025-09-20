# OpenAPI-Driven Publish/Discover Flow

## Overview
This workflow enables API providers to publish APIs to the marketplace using an OpenAPI spec, and allows consumers to discover and preview APIs with rich metadata and endpoint details.

---

## 1. Publish Flow
- **Step 1:** Provider fills out the publish form in the Admin Web UI, including an OpenAPI spec URL and metadata (name, tier, tags, price, etc).
- **Step 2:** Backend fetches the OpenAPI spec from the provided URL.
- **Step 3:** Backend validates the spec (must be valid OpenAPI JSON or YAML, and contain required fields).
- **Step 4:** On success, backend stores the API entry, including the parsed OpenAPI spec and summary fields (title, version, paths, etc).
- **Step 5:** API is now discoverable in the marketplace.

## 2. Discover Flow
- **Step 1:** Consumer visits the marketplace page in the Admin Web UI.
- **Step 2:** UI fetches the list of published APIs from `/marketplace`.
- **Step 3:** For each API, the UI displays:
  - Name, tier, tags, price, description, owner, contact, logo, version
  - OpenAPI summary: title, version, number of endpoints (paths)
  - Link to the full OpenAPI spec
- **Step 4:** Optionally, the UI can allow previewing the full OpenAPI spec or generating SDKs/docs on demand.

## 3. Example API Entry (Backend)
```json
{
  "id": "abc123",
  "name": "Payments API",
  "tier": "standard",
  "tags": ["payments"],
  "price": 10,
  "docs": "https://example.com/openapi.yaml",
  "description": "A simple payments API.",
  "owner": "Acme Corp",
  "contact": "support@acme.com",
  "logo": "https://example.com/logo.png",
  "version": "1.0.0",
  "openapi": {
    "openapi": "3.0.1",
    "info": { "title": "Payments API", "version": "1.0.0" },
    "paths": { "/pay": { ... } }
  }
}
```

## 4. Notes
- The backend should expose OpenAPI summary fields in the `/marketplace` response for easy UI consumption.
- The UI should surface OpenAPI metadata and allow users to preview or download the spec.
- Future: Enable SDK generation, endpoint testing, and community reviews directly from the marketplace UI.
