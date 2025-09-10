#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/unlock_next_release.sh <released-version>
# Example: scripts/unlock_next_release.sh v1.0.0

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_FILE="$ROOT_DIR/RELEASES/LOCK"
HISTORY_FILE="$ROOT_DIR/RELEASES/HISTORY.md"

if [ $# -ne 1 ]; then
  echo "Usage: $0 <released-version>" >&2
  exit 2
fi

RELEASED="$1"

if [ ! -f "$LOCK_FILE" ]; then
  echo "Lock file not found: $LOCK_FILE" >&2
  exit 1
fi

# Read current next and locked values
CURRENT_NEXT=$(grep '^next:' "$LOCK_FILE" | awk '{print $2}')
CURRENT_LOCKED=$(grep '^locked:' "$LOCK_FILE" | awk '{print $2}')

if [ "$RELEASED" != "$CURRENT_NEXT" ]; then
  echo "Released version ($RELEASED) does not match LOCK next value ($CURRENT_NEXT). Aborting." >&2
  exit 3
fi

# Compute next patch (assumes semantic version vMAJOR.MINOR.PATCH)
strip_v() { echo "$1" | sed 's/^v//' ; }
inc_patch() {
  IFS='.' read -r MAJ MIN PATCH <<< "$(strip_v "$1")"
  PATCH=$((PATCH + 1))
  echo "v${MAJ}.${MIN}.${PATCH}"
}

NEXT_VERSION=$(inc_patch "$CURRENT_NEXT")

# Update LOCK file: set next to NEXT_VERSION and locked: false
tmpfile=$(mktemp)
awk -v nv="$NEXT_VERSION" 'BEGIN{FS=":"; OFS=":"} 
  /^next:/{print $1": "nv; next} 
  /^locked:/{print $1": false"; next} 
  {print $0}' "$LOCK_FILE" > "$tmpfile"
mv "$tmpfile" "$LOCK_FILE"

# Append to history
echo "- $(date +%F): Unlocked $NEXT_VERSION after releasing $RELEASED" >> "$HISTORY_FILE"

echo "Unlocked next release: $NEXT_VERSION and set locked: false"
