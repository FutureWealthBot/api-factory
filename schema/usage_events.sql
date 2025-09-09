-- usage_events table for API-Factory
-- columns: api_key (nullable), route, method, status, bytes, ts
CREATE TABLE IF NOT EXISTS usage_events (
  id bigserial PRIMARY KEY,
  api_key text NULL,
  route text NOT NULL,
  method text NOT NULL,
  status integer NOT NULL,
  bytes bigint NULL,
  ts timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_ts ON usage_events (ts DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_api_key ON usage_events (api_key);
