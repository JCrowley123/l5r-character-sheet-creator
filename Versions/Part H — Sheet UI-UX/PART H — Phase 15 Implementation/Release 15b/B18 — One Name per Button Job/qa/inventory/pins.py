#!/usr/bin/env python3
"""B18 stage 1: which harnesses pin a label. Read-only.

Searches the harness scripts (.js .cjs .mjs .py) in every qa/ folder under Versions/, and the checks files
(expected-checks*.json, *checks*.json), for each label a group would change. A pin is a line that holds the label
as a quoted string, as a word inside a regular expression, or in a Playwright text selector; for a label of two words or
more, a plain case-insensitive match counts too. Many releases carry copies of the same harness, so hits are reported per
distinct file name with the number of copies and one example path.

Usage: python pins.py <groups.json> <out.json>
  groups.json: {"name": ["label", ...], ...}
"""
import json, os, re, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = HERE
while not os.path.exists(os.path.join(ROOT, 'build.py')):
    ROOT = os.path.dirname(ROOT)
VERS = os.path.join(ROOT, 'Versions')


def harness_files():
    out = []
    for dp, dn, fn in os.walk(VERS):
        dn[:] = [d for d in dn if d not in ('node_modules', '.git')]
        parts = dp.replace('\\', '/').split('/')
        if 'qa' not in parts or 'B18 — One Name per Button Job' in dp or 'mockup' in parts:
            continue      # B18's own scripts and the Release 15b mock-up scripts are not harnesses
        for f in fn:
            low = f.lower()
            if low.endswith(('.js', '.cjs', '.mjs', '.py')) or (low.endswith('.json') and 'check' in low):
                out.append(os.path.join(dp, f))
    return out


def patterns(label):
    esc = re.escape(label)
    pats = [re.compile(r'([\'"`])' + esc + r'\1')]                       # quoted exact
    if ' ' in label or len(label) >= 9:
        pats.append(re.compile(esc, re.I))                                # plain phrase
    else:
        w = re.escape(label)
        pats.append(re.compile(r'/[^/\n]*(\^|\\b)' + w + r'(\$|\\b)[^/\n]*/[a-z]*', re.I))   # regex literal with the word
        pats.append(re.compile(r'(text-is|has-text|hasText|getByText|getByRole)[^\n]{0,40}' + w, re.I))
    return pats


def main(groups_path, out_path):
    groups = json.load(open(groups_path, encoding='utf-8'))
    files = harness_files()
    cache = {}
    for f in files:
        try:
            cache[f] = open(f, encoding='utf-8', errors='replace').read().split('\n')
        except OSError:
            pass
    result = {}
    for gid, labels in groups.items():
        g = {}
        for label in labels:
            pats = patterns(label)
            by_name = defaultdict(lambda: {'copies': 0, 'example': '', 'lines': []})
            for f, lines in cache.items():
                hits = [i + 1 for i, ln in enumerate(lines) if any(p.search(ln) for p in pats)]
                if hits:
                    rel = os.path.relpath(f, ROOT).replace('\\', '/')
                    e = by_name[os.path.basename(f)]
                    e['copies'] += 1
                    if not e['example']:
                        e['example'] = rel
                        e['lines'] = hits[:3]
            g[label] = {'files': len(by_name), 'copies': sum(v['copies'] for v in by_name.values()),
                        'by_name': {k: v for k, v in sorted(by_name.items())}}
        result[gid] = g
    json.dump({'harness_files_searched': len(cache), 'groups': result}, open(out_path, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print('harness files searched', len(cache))
    for gid, g in result.items():
        print(gid, {k: (v['files'], v['copies']) for k, v in g.items()})


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
