#!/usr/bin/env bash
## ChatOps helper functions for the repo
# Source this file: source .chatops/chatops.sh

w() { mkdir -p "$(dirname "$1")" && cat > "$1"; echo "wrote $1"; }      # write file from stdin
a() { mkdir -p "$(dirname "$1")" && cat >> "$1"; echo "appended $1"; }  # append to file from stdin
wb64() { mkdir -p "$(dirname "$1")" && base64 -d > "$1"; echo "wrote (b64) $1"; }

gnew() { git checkout -b "$1"; }
gsave() { git add -A && git commit -m "${*:-chore: chat update}"; }
gpush() { local BR="$(git rev-parse --abbrev-ref HEAD)"; git push -u origin "$BR"; }
gpr() { command -v gh >/dev/null && gh pr create --fill || echo "Open PR: https://github.com/$(git config --get remote.origin.url | sed -E 's#.*github.com[:/](.+)\.git#\1#')/compare/$(git rev-parse --abbrev-ref HEAD)"; }

applypatch() {
  git apply -p0 --index -v - <<'PATCH'
# paste a unified diff here, then replace this line with your patch before running
PATCH
}

## Authentication helpers
unset_github_token() { unset GITHUB_TOKEN; echo "GITHUB_TOKEN unset for this shell"; }
gh_login_with_token() {
  if [ -z "$1" ]; then
    echo "Usage: gh_login_with_token <PAT>"; return 1
  fi
  echo "$1" | gh auth login --with-token
}
gh_login_interactive() { gh auth login; }

## CI helpers
rerun_build_and_push() {
  if ! command -v gh >/dev/null; then
    echo "gh CLI not installed"; return 2
  fi
  # try workflow dispatch, fall back to empty commit trigger
  if gh workflow run build-and-push; then
    echo "Workflow dispatch requested"
    return 0
  else
    echo "Dispatch failed, creating empty commit to trigger push workflow"
    git commit --allow-empty -m "chore(ci): rerun build-and-push" && git push
  fi
}

## Convenience: show run logs for the last build-and-push run
show_last_build_logs() {
  if ! command -v gh >/dev/null; then
    echo "gh CLI not installed"; return 2
  fi
  local runid
  runid=$(gh run list --workflow=build-and-push --limit 1 --json databaseId --jq '.[0].databaseId') || true
  if [ -z "$runid" ] || [ "$runid" = "null" ]; then
    echo "No recent run found for workflow 'build-and-push'"
    return 1
  fi
  echo "Fetching logs for run id: $runid"
  gh run view "$runid" --log
}

export -f w a wb64 gnew gsave gpush gpr applypatch unset_github_token gh_login_with_token gh_login_interactive rerun_build_and_push show_last_build_logs
