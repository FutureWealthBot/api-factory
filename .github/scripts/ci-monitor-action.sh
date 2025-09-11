
#!/usr/bin/env bash
set -euo pipefail

# Enhanced GitHub Actions scheduled CI monitor script.
# - lists failing jobs for a run
# - downloads run logs (zip), extracts a tail excerpt
# - deduplicates more reliably by checking for the run URL and title

REPO="${GITHUB_REPOSITORY:-}"
if [[ -z "$REPO" ]]; then
  echo "GITHUB_REPOSITORY not set; are you running inside GitHub Actions?" >&2
  exit 1
fi

API="https://api.github.com/repos/$REPO"

MAX_LOG_LINES=${MAX_LOG_LINES:-800}

echo "Ensuring label 'ci-failure' exists..."
if ! curl -s -H "Authorization: token $GITHUB_TOKEN" "$API/labels/ci-failure" | jq -e . >/dev/null 2>&1; then
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

  echo "Checking for existing issue for run $run_id..."
  existing_issue=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API/issues?state=all&labels=ci-failure&per_page=100" | jq -r --arg url "$url" '.[] | select(.body != null and (.body | contains($url))) | .number' | head -n1 || true)
  if [[ -n "$existing_issue" && "$existing_issue" != "null" ]]; then
    echo "Found existing issue #$existing_issue for run $run_id — skipping"
    continue
  fi

  echo "Gathering failing job details for run $run_id..."
  jobs_json=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API/actions/runs/$run_id/jobs?per_page=50")
  failed_jobs=$(echo "$jobs_json" | jq -r '.jobs[] | select(.conclusion != "success") | "- " + (.name // "(unnamed job)") + " (" + (.conclusion // "unknown") + ")"' | paste -s -d"\n" - || true)
  if [[ -z "$failed_jobs" ]]; then
    failed_jobs="(no job-level failures listed)"
  fi

  # attempt to download logs zip and extract a tail
  echo "Downloading logs for run $run_id (best-effort)..."
  tmpzip=$(mktemp --suffix=.zip)
  if curl -s -L -H "Authorization: token $GITHUB_TOKEN" "$API/actions/runs/$run_id/logs" -o "$tmpzip"; then
    tmpdir=$(mktemp -d)
    unzip -qq "$tmpzip" -d "$tmpdir" || true
    # concatenate all files and tail
    find "$tmpdir" -type f -print0 | xargs -0 cat 2>/dev/null | tail -n "$MAX_LOG_LINES" > "$tmpdir/tail.txt" || true
    logs_excerpt=$(sed 's/```/`\`\`/g' "$tmpdir/tail.txt" || true)
    rm -rf "$tmpdir" "$tmpzip"
  else
    logs_excerpt="(failed to download logs)"
  fi

  issue_title="CI failure: $name (run #$number)"
  issue_body="Detected a failed workflow run on main:\n\n- Workflow: $name\n- Run #: $number\n- Conclusion: failed\n- Updated: $updated_at\n- URL: $url\n\nFailing jobs:\n$failed_jobs\n\nLogs (tail, last ${MAX_LOG_LINES} lines):\n\n\`\`\`\n$logs_excerpt\n\`\`\`\n\nThis issue was created automatically by the scheduled CI monitor."

  # create issue
  echo "Creating issue for run $run_id..."
  payload=$(jq -n --arg t "$issue_title" --arg b "$issue_body" '{title:$t, body:$b, labels:["ci-failure"]}')
  curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Content-Type: application/json" -d "$payload" "$API/issues" >/dev/null
  echo "Issue created (or attempted) for run $run_id"
done

echo "Done."
