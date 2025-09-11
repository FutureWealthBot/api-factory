Developer data directory (local only)

This folder `api-factory/backend/data/` is intended for local developer-only data used by the backend during local development and tests.

Guidelines:
- Do NOT commit secrets into this directory. Add any credentials to environment variables or a secure vault.
- This repo now contains `.gitignore` entry for `api-factory/backend/data/` to reduce accidental commits.
- If you need to share sample data, add a non-sensitive `example.json` file and commit that instead.
- If secrets were ever committed, rotate them immediately and remove them from history.

Recommended commands:

```bash
# reset local copy after history rewrite
git fetch && git checkout chore/clean-e2e-logs && git reset --hard origin/chore/clean-e2e-logs

# create sample file for sharing (non-sensitive)
cp api-factory/backend/data/keys.json api-factory/backend/data/keys.example.json
git add api-factory/backend/data/keys.example.json && git commit -m "chore: add non-sensitive example key file" && git push origin chore/clean-e2e-logs
```
