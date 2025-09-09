#!/usr/bin/env python3
"""Block if high-risk laws appear to be unaddressed in OpenAPI spec.

This is intentionally conservative: it looks for `info.x-compliance-controls` mapping that lists a law and a short remediation note.
If a requested law is not present, the script exits non-zero to block the PR.
"""
import argparse
import sys
import yaml


def load_spec(path='openapi.yaml'):
    with open(path, 'r') as f:
        return yaml.safe_load(f)


def gather_controls(spec):
    info = spec.get('info') or {}
    controls = info.get('x-compliance-controls') or {}
    return controls


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--spec', default='openapi.yaml')
    p.add_argument('--laws', nargs='+', required=True)
    args = p.parse_args()
    spec = load_spec(args.spec)
    controls = gather_controls(spec)
    missing = [l for l in args.laws if l not in controls]
    if missing:
        print('Blocking: missing high-risk compliance controls for:', ','.join(missing), file=sys.stderr)
        sys.exit(4)
    print('All requested high-risk laws have controls defined.')


if __name__ == '__main__':
    main()
