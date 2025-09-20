Privacy-preserving architecture for Voice Starter

Goals
- Keep all user audio and models private to the operator's environment.
- Minimize external network exposure: default to localhost-only bindings.
- Make it easy to upgrade to a private-cloud VPC deployment with KMS and Vault.

Components

1. API service (Flask)
   - Endpoints: /health, /upload-audio, /train, /models, /synthesize
   - Authentication: token-based; for production use JWT with short-lived tokens.
   - Bind to 127.0.0.1 by default.

2. Model store
   - Local directory under `data/` with per-speaker subdirectories.
   - On disk encryption recommended (LUKS) or application-layer AES-256 using a key from Vault/KMS.

3. Worker(s)
   - Training workers run training jobs using Coqui YourTTS (or alternative). Jobs read audio from `data/` and write model artifacts back.
   - Workers can be scheduled on GPU-enabled instances for faster training.

4. Secrets and keys
   - Use HashiCorp Vault or cloud KMS for storing API tokens and encryption keys.
   - No long-term plaintext secrets in source.

5. Networking
   - Default: local-only. For cloud: deploy inside a VPC with private subnets and no public IPs.
   - Provide ingress via a bastion or private load balancer.

6. Auditing & retention
   - Log actions (uploads, training, synthesis) to append-only logs.
   - Provide configurable retention and deletion endpoints for GDPR/CCPA compliance.

Operational notes
- Backups: snapshot encrypted model store to secure object storage (SSE + IAM-only access).
- Rotation: support key rotation via Vault and re-encrypt artifacts.
- Monitoring: add Prometheus metrics for job durations, queue length, and errors.

Upgrading to production
- Replace token auth with OIDC/JWT and add RBAC.
- Deploy to k8s with node pools for GPU vs CPU.
- Use managed KMS and Vault for secrets + HSM for extremely sensitive keys.
