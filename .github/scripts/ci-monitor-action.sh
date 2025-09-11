#!/usr/bin/env bash
set -euo pipefail

# GitHub Actions scheduled CI monitor script.
# Runs inside GitHub Actions runner; uses GITHUB_TOKEN available in the workflow.

REPO="${GITHUB_REPOSITORY:-}"
if [[ -z "$REPO" ]]; then
  echo "GITHUB_REPOSITORY not set; are you running inside GitHub Actions?" >&2
  exit 1
fi

API="https://api.github.com/repos/$REPO"

# Ensure the ci-failure label exists
if ! curl -s -H "Authorization: token $GITHUB_TOKEN" "$API/labels/ci-failure" | jq -e . >/dev/null 2>&1; then
  echo "Creating label ci-failure"
  curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" -d '{"name":"ci-failure","color":"b60205","description":"Automatically created for CI failures"}' "$API/labels" >/dev/null
fi

echo "Fetching recent completed workflow runs on main..."
runs_json=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API/actions/runs?branch=main&status=completed&per_page=50")

echo "$runs_json" | jq -c '.workflow_runs[] | select(.conclusion == "failure" or .conclusion == "timed_out" or .conclusion == "cancelled")' | while read -r run; do
  run_id=$(echo "$run" | jq -r '.id')
  name=$(echo "$run" | jq -r '.name')
  number=$(echo "$run" | jq -r '.run_number')
  url=$(echo "$run" | jq -r '.html_url')
  updated_at=$(echo "$run" | jq -r '.updated_at')

  # dedupe: check if any existing issue body contains the run URL
  echo "Checking for existing issue for run $run_id..."
  existing_issue=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API/issues?state=all&per_page=100" | jq -r --arg url "$url" '.[] | select(.body != null and (.body | contains($url))) | .number' | head -n1 || true)
  if [[ -n "$existing_issue" && "$existing_issue" != "null" ]]; then
    echo "Found existing issue #$existing_issue for run $run_id — skipping"
    continue
  fi

  echo "Creating issue for failed run: $name (#$number)"
  # try to fetch logs (best-effort)
  logs_excerpt="(logs not fetched in scheduled action)"

  issue_title="CI failure: $name (run #$number)"
  issue_body="Detected a failed workflow run on main:\n\n- Workflow: $name\n- Run #: $number\n- Conclusion: failed\n- Updated: $updated_at\n- URL: $url\n\n$logs_excerpt\n\nThis issue was created automatically by the scheduled CI monitor."

  payload=$(jq -n --arg t "$issue_title" --arg b "$issue_body" '{title:$t, body:$b, labels:["ci-failure"]}')
  curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Content-Type: application/json" -d "$payload" "$API/issues" >/dev/null
  echo "Issue created (or attempted) for run $run_id"
done

echo "Done."
