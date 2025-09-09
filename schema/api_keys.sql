-- api_keys table for API-Factory
CREATE TABLE IF NOT EXISTS api_keys (
  key text PRIMARY KEY,
  plan text NULL,
  quota bigint NULL,
  status text NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys (status);
