#!/usr/bin/env python3
"""B18 stage 1: the button words every question or message window is called with. Read-only.

The sheet has one shared question window (appConfirm, appConfirm3Way) and one message window (appAlert), in
src/sheet/120-persistence.js. Each caller picks the words of its buttons: appConfirm(message, okLabel, okClass,
cancelLabel), appConfirm3Way(message, okLabel, okClass, cancelLabel), appAlert(message, okLabel). A text search for a button
cannot find these, because the words are arguments. This script reads every call, splits its arguments (with quotes,
brackets and template strings respected) and lists each literal button word with where it is called.

Usage: python dialog_labels.py <out.json>
"""
import json, os, re, sys
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = HERE
while not os.path.exists(os.path.join(ROOT, 'build.py')):
    ROOT = os.path.dirname(ROOT)
SRC = os.path.join(ROOT, 'Versions', 'Part F — Cross-Platform Delivery',
                   'PART F — Phase 0 Source Reorganization for Maintainability', 'src')
CALL = re.compile(r'\b(appConfirm3Way|appConfirm|appAlert)\s*\(')


def split_args(t, i):
    """t[i] is just after the opening bracket. Returns (list of raw top-level args, index after the closing bracket)."""
    depth, args, cur, q = 0, [], [], None
    n = len(t)
    while i < n:
        c = t[i]
        if q:
            cur.append(c)
            if c == '\\':
                cur.append(t[i + 1]); i += 2; continue
            if c == q:
                q = None
            i += 1
            continue
        if c in '\'"`':
            q = c; cur.append(c)
        elif c in '([{':
            depth += 1; cur.append(c)
        elif c in ')]}':
            if depth == 0:
                args.append(''.join(cur).strip())
                return args, i + 1
            depth -= 1; cur.append(c)
        elif c == ',' and depth == 0:
            args.append(''.join(cur).strip()); cur = []
        else:
            cur.append(c)
        i += 1
    return args, i


def literal(a):
    m = re.fullmatch(r"""(['"`])((?:\\.|(?!\1).)*)\1""", a or '', re.S)
    return m.group(2) if m and '${' not in m.group(2) else None


def main(out):
    found = OrderedDict()
    for dp, dn, fn in os.walk(SRC):
        dn[:] = [d for d in dn if d != 'vendor']
        for f in sorted(fn):
            if not f.endswith('.js'):
                continue
            p = os.path.join(dp, f)
            t = open(p, encoding='utf-8', errors='replace').read()
            rel = os.path.relpath(p, SRC).replace('\\', '/')
            for m in CALL.finditer(t):
                # skip the definitions themselves
                if re.search(r'function\s*$', t[max(0, m.start() - 12):m.start()]):
                    continue
                args, _ = split_args(t, m.end())
                line = t.count('\n', 0, m.start()) + 1
                fn_name = m.group(1)
                words = []
                if fn_name == 'appAlert':
                    words.append(('message-ok', args[1] if len(args) > 1 else None, 'OK'))
                else:
                    words.append(('question-ok', args[1] if len(args) > 1 else None, 'OK'))
                    words.append(('question-cancel', args[3] if len(args) > 3 else None, 'Cancel'))
                    if fn_name == 'appConfirm3Way':
                        words[0] = ('question3-ok', words[0][1], 'OK')
                for role, raw, default in words:
                    lit = literal(raw) if raw else None
                    label = lit if lit is not None else (default if not raw else None)
                    key = (role, label if label is not None else '(built at runtime: %s)' % (raw or '')[:50])
                    e = found.setdefault(key, {'role': role, 'label': key[1], 'default': raw is None or raw == '', 'sites': []})
                    e['sites'].append('%s:%d' % (rel, line))
    rows = list(found.values())
    for r in rows:
        r['count'] = len(r['sites'])
        r['sites'] = r['sites'][:6]
    json.dump(rows, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print('distinct button words', len(rows), 'calls', sum(r['count'] for r in rows))
    for r in sorted(rows, key=lambda r: (r['role'], -r['count'])):
        print(' ', r['role'].ljust(16), repr(r['label'])[:56].ljust(58), r['count'])


if __name__ == '__main__':
    main(sys.argv[1])
