#!/usr/bin/env python3
"""Check that required compliance tags are present in an OpenAPI spec.

This script looks for a vendor extension `x-compliance` at `info` or per-path and reports missing ones.
"""
import argparse
import sys
import yaml


def load_spec(path):
    with open(path, 'r') as f:
        return yaml.safe_load(f)


def gather_compliance(spec):
    found = set()
    info = spec.get('info') or {}
    top = info.get('x-compliance') or []
    for t in top:
        found.add(str(t))

    paths = spec.get('paths', {})
    for p, methods in paths.items():
        # check path-level vendor extensions
        path_ext = methods.get('x-compliance') if isinstance(methods, dict) else None
        if path_ext:
            for t in path_ext:
                found.add(str(t))
        for m, info in (methods or {}).items():
            if not isinstance(info, dict):
                continue
            ext = info.get('x-compliance') or []
            for t in ext:
                found.add(str(t))

    return found


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--spec', required=True)
    p.add_argument('--required', nargs='*', default=[])
    args = p.parse_args()
    spec = load_spec(args.spec)
    found = gather_compliance(spec)
    print('Found compliance tags:', ','.join(sorted(found)))
    missing = [r for r in args.required if r not in found]
    if missing:
        print('Missing required compliance tags:', ','.join(missing), file=sys.stderr)
        # return non-zero but keep workflow permissive for manual review (caller may choose to || true)
        sys.exit(3)


if __name__ == '__main__':
    main()
