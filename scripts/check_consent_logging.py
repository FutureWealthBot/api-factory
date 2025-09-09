#!/usr/bin/env python3
"""Check an OpenAPI spec for obvious consent and audit logging markers.

This is a lightweight heuristic tool, intended to be conservative: it scans paths and
components for keywords like 'consent', 'audit', 'log', 'consent_required' and reports
findings. It does NOT provide legal advice.
"""
import argparse
import sys
import yaml


def load_spec(path):
    with open(path, 'r') as f:
        return yaml.safe_load(f)


def scan_for_consent_and_audit(spec):
    consent_hits = []
    audit_hits = []
    paths = spec.get('paths', {})
    for p, methods in paths.items():
        for m, info in (methods or {}).items():
            desc = info.get('description') or ''
            if 'consent' in desc.lower() or 'consent' in (info.get('summary') or '').lower():
                consent_hits.append(p + ' ' + m)
            # check parameters and responses
            for param in info.get('parameters', []) or []:
                if 'consent' in (param.get('name') or '').lower() or 'consent' in (param.get('description') or '').lower():
                    consent_hits.append(p + ' ' + m + ' param:' + (param.get('name') or ''))
            if 'audit' in desc.lower() or 'log' in desc.lower():
                audit_hits.append(p + ' ' + m)

    # check components/schema properties
    comps = spec.get('components', {})
    for name, schema in (comps.get('schemas') or {}).items():
        props = schema.get('properties') or {}
        for k, v in props.items():
            if 'consent' in k.lower() or 'consent' in (v.get('description') or '').lower():
                consent_hits.append('schema.' + name + '.' + k)
            if 'audit' in k.lower() or 'log' in (v.get('description') or '').lower():
                audit_hits.append('schema.' + name + '.' + k)

    return consent_hits, audit_hits


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--spec', required=True)
    args = p.parse_args()
    spec = load_spec(args.spec)
    consent_hits, audit_hits = scan_for_consent_and_audit(spec)
    print(f'Consent markers found: {len(consent_hits)}')
    for h in consent_hits[:20]:
        print('  -', h)
    print(f'Audit/log markers found: {len(audit_hits)}')
    for h in audit_hits[:20]:
        print('  -', h)

    # fail if no consent markers AND no audit markers — conservative block
    if len(consent_hits) == 0 and len(audit_hits) == 0:
        print('No consent or audit markers detected — please confirm compliance controls.', file=sys.stderr)
        sys.exit(2)


if __name__ == '__main__':
    main()
