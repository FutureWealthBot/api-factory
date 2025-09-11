#!/usr/bin/env bash
set -euo pipefail

# CI monitor: polls recent workflow runs on the default branch (main)
# and files a GitHub issue for each new failed run. Uses the authenticated
# `gh` CLI available in this environment.

REPO="$(git config --get remote.origin.url || true)"
if [[ -z "$REPO" ]]; then
  echo "Could not detect git remote. Set REMOTE_REPO env var to owner/repo or run from a git repo." >&2
  exit 1
fi

# convert git remote URL to owner/repo if necessary
if [[ "$REPO" == git@* ]]; then
  # git@github.com:owner/repo.git
  REPO=$(echo "$REPO" | sed -E 's/.*:([^/]+\/[^.]+)(\.git)?$/\1/')
else
  # https://github.com/owner/repo.git
  REPO=$(echo "$REPO" | sed -E 's#https?://[^/]+/([^/]+/[^.]+)(\.git)?#\1#')
fi

STATE_FILE=".ci-monitor-state.json"
POLL_INTERVAL=${POLL_INTERVAL:-60}
MAX_LOG_LINES=800

mkdir -p $(dirname "$STATE_FILE") 2>/dev/null || true
if [[ ! -f "$STATE_FILE" ]]; then
  echo '{}' > "$STATE_FILE"
fi

echo "Starting CI monitor for repo: $REPO (poll every ${POLL_INTERVAL}s)"

while true; do
  # fetch recent completed runs on main
  runs_json=$(gh api -X GET "/repos/$REPO/actions/runs" -f branch=main -f status=completed -f per_page=50 2>/dev/null || true)
  if [[ -z "$runs_json" ]]; then
    echo "gh API call failed or returned empty. Ensure gh is authenticated and repo exists." >&2
    sleep "$POLL_INTERVAL"
    continue
  fi

  # iterate failing runs
  echo "$runs_json" | jq -c '.workflow_runs[] | select(.conclusion == "failure" or .conclusion == "timed_out" or .conclusion == "cancelled")' | while read -r run; do
    run_id=$(echo "$run" | jq -r '.id')
    name=$(echo "$run" | jq -r '.name')
    number=$(echo "$run" | jq -r '.run_number')
    url=$(echo "$run" | jq -r '.html_url')
    updated_at=$(echo "$run" | jq -r '.updated_at')

    seen=$(jq -r --arg id "$run_id" 'has($id) | tostring' "$STATE_FILE")
    if [[ "$seen" == "true" ]]; then
      continue
    fi

    echo "New failed run: $name (#$number) $url"

    # try to fetch logs for the run (may be large) with retries
    log_tmp=$(mktemp)

    download_with_retries() {
      local cmd="$1" attempts=5 backoff=2 i=0
      while [ $i -lt $attempts ]; do
        if eval "$cmd"; then
          return 0
        fi
        i=$((i+1))
        sleep $backoff
        backoff=$((backoff*2))
        echo "Retry $i/$attempts for command: $cmd"
      done
      return 1
    }

    if download_with_retries "gh run view $run_id --repo $REPO --log > $log_tmp 2>/dev/null"; then
      tail -n "$MAX_LOG_LINES" "$log_tmp" > "$log_tmp.tail"
      log_excerpt=$(sed 's/```/`\`\`/g' "$log_tmp.tail")
      rm -f "$log_tmp" "$log_tmp.tail"
    else
      echo "gh run view failed — trying gh run download (logs zip)"
      tmpzip=$(mktemp --suffix=.zip)
      if download_with_retries "gh run download $run_id --repo $REPO -D $(dirname $tmpzip) --logs 2>/dev/null || true"; then
        # find the downloaded zip in the dir
        dl_dir=$(dirname $tmpzip)
        zipfile=$(ls -1 $dl_dir/*.zip 2>/dev/null | head -n1 || true)
        if [[ -n "$zipfile" ]]; then
          tmpdir=$(mktemp -d)
          unzip -qq "$zipfile" -d "$tmpdir" || true
          find "$tmpdir" -type f -print0 | xargs -0 cat 2>/dev/null | tail -n "$MAX_LOG_LINES" > "$tmpdir/tail.txt" || true
          logs_excerpt=$(sed 's/```/`\`\`/g' "$tmpdir/tail.txt" || true)
          rm -rf "$tmpdir" "$zipfile"
        else
          logs_excerpt="(failed to find downloaded zip)"
        fi
      else
        logs_excerpt="(failed to fetch logs after retries)"
      fi
    fi

    issue_title="CI failure: $name (run #$number)"
    issue_body="Detected a failed workflow run on main:\n\n- Workflow: $name\n- Run #: $number\n- Conclusion: failed\n- Updated: $updated_at\n- URL: $url\n\nLogs (tail, last ${MAX_LOG_LINES} lines):\n\n\`\`\`\n$log_excerpt\n\`\`\`\n\nThis issue was created automatically by scripts/ci-monitor.sh."

    # create issue and capture number
    echo "Creating issue for run $run_id..."
    issue_url=$(echo "$issue_body" | gh issue create --repo "$REPO" --title "$issue_title" --body - --label "ci-failure" --assignee @me 2>/dev/null || true)
    if [[ -n "$issue_url" ]]; then
      echo "Created issue: $issue_url"
    else
      echo "Failed to create issue via gh. You may need additional permissions." >&2
    fi

    # mark seen
    tmp=$(mktemp)
    jq --arg id "$run_id" '. + {($id): true}' "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
  done

  sleep "$POLL_INTERVAL"
done
