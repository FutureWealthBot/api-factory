## Deployment guide

This document shows quick, repeatable ways to deploy the project locally (Docker Compose), build images, and use the existing CI that publishes images to GHCR.

Summary of what exists in the repository


Prerequisites


Local Docker Compose (quick)

1. From the repository root run:

```bash
docker compose up --build -d
```

2. Check logs:

```bash
docker compose logs -f api
docker compose logs -f web
```

3. Stop and remove:

```bash
docker compose down
```

Ports


Build images locally (manual)

If you prefer to build images manually and tag/push them yourself:

```bash
docker build -f Dockerfile.api -t <your-registry>/api-factory-api:latest .
docker build -f Dockerfile.web -t <your-registry>/api-factory-web:latest .

# push (requires login to your registry)
docker push <your-registry>/api-factory-api:latest
docker push <your-registry>/api-factory-web:latest
```

GitHub Actions (CI)

There is an existing workflow at `.github/workflows/docker.yml` which uses `docker/build-push-action` to build and push two images to GitHub Container Registry (GHCR) under `ghcr.io/<owner>/...` when commits are pushed to `main`.

To use it as-is:


Vercel

Front-end apps include `vercel.json` under `apps/web` and `apps/admin-web` which makes them easy to deploy on Vercel — connect the repo and Vercel will use the config to build and publish the site.

Notes & gotchas


Next steps I can perform for you


Debugging builds and GHCR login

If a build fails locally, run the verbose helper which captures logs to `./build-logs`:

```bash
# If the script is executable:
./scripts/verbose-build.sh

# Or use the Makefile target (works even without +x permission):
make verbose-build
```

To push to GitHub Container Registry (GHCR):

1. Create a Personal Access Token (PAT) with `write:packages` and `repo` scopes (or use `GITHUB_TOKEN` in Actions).

2. Login locally:

```bash
echo "<GHCR_PAT>" | docker login ghcr.io -u <github-username> --password-stdin
```

3. Then tag and push (or use the provided Makefile):

```bash
# Tag and push via make (example)
make push OWNER=<github-username> REGISTRY=ghcr.io
```

If you see authentication errors when pushing, verify your PAT scopes and that the username is correct.

If you want me to continue, tell me which of the next steps above to run.

CI image tags

The GitHub Actions workflow tags images with both `latest` and the commit SHA so you can reference a specific build. Example image names:

- `ghcr.io/<owner>/fwb-web:latest`
- `ghcr.io/<owner>/fwb-web:<commit-sha>`

Use the SHA-tagged image for reproducible deploys and rollbacks.
