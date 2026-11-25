#!/usr/bin/env python3
"""B18 stage 1: the static half of the inventory. Read-only.

Walks src/ (the sheet's fragments, markup, shell and layer files, not the vendor libraries) and lists every place that
creates a button or button-like control, with the label, aria-label and title when they are written as literals.
A text search is not enough on its own, because many labels are built at runtime; the live read (scan.cjs) is the
authority, and merge.py matches the two. This list also catches controls the live read cannot reach.

Usage: python static_scan.py <output.json>
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = HERE
while not os.path.exists(os.path.join(ROOT, 'build.py')):
    ROOT = os.path.dirname(ROOT)
SRC = os.path.join(ROOT, 'Versions', 'Part F — Cross-Platform Delivery',
                   'PART F — Phase 0 Source Reorganization for Maintainability', 'src')

TAG = re.compile(r'<(button|summary)\b([^>]*)>(.*?)</\1>', re.S | re.I)
OPEN = re.compile(r'<(button|summary)\b([^>]*)$', re.I)
ATTR = {
    'id': re.compile(r'\bid\s*=\s*"([^"]*)"|\bid\s*=\s*\'([^\']*)\''),
    'class': re.compile(r'\bclass\s*=\s*"([^"]*)"|\bclass\s*=\s*\'([^\']*)\''),
    'aria': re.compile(r'\baria-label\s*=\s*"([^"]*)"|\baria-label\s*=\s*\'([^\']*)\''),
    'title': re.compile(r'\btitle\s*=\s*"([^"]*)"|\btitle\s*=\s*\'([^\']*)\''),
}
CREATE = re.compile(r"createElement\(\s*['\"](button|summary|a)['\"]\s*\)")
EL = re.compile(r"""\bel\(\s*['"](button|summary)['"]\s*,\s*(['"])(.*?)\2\s*(?:,\s*(['"])(.*?)\4)?""")
# Helper calls such as button('Reset session', 'title', fn) or api.button('Use', ...) or xBtn(...)
HELPER = re.compile(r"""\b(?:api\.)?(button|btn|mkBtn|makeBtn|makeButton|barButton|moreButton|refileButton|stepBtn|xBtn)\(\s*(['"])((?:\\.|(?!\2).)*)\2(?:\s*,\s*(['"])((?:\\.|(?!\4).)*)\4)?""")
ROLE = re.compile(r"role\s*=\s*\"button\"|setAttribute\(\s*'role'\s*,\s*'button'\s*\)")
SETTEXT = re.compile(r"\.(textContent|innerText)\s*=\s*(['\"`])((?:\\.|(?!\2).)*)\2")
SETARIA = re.compile(r"setAttribute\(\s*'aria-label'\s*,\s*(['\"`])((?:\\.|(?!\1).)*)\1")
SETTITLE = re.compile(r"\.title\s*=\s*(['\"`])((?:\\.|(?!\1).)*)\1|setAttribute\(\s*'title'\s*,\s*(['\"`])((?:\\.|(?!\3).)*)\3")
SETCLS = re.compile(r"\.className\s*=\s*(['\"`])((?:\\.|(?!\1).)*)\1|classList\.add\(\s*(['\"])((?:\\.|(?!\3).)*)\3")
SETID = re.compile(r"\.id\s*=\s*(['\"`])((?:\\.|(?!\1).)*)\1")


def first(m):
    if not m:
        return ''
    return next((g for g in m.groups() if g), '')


def attrs(chunk):
    return {k: first(rx.search(chunk)) for k, rx in ATTR.items()}


def strip_tags(s):
    s = re.sub(r'<[^>]+>', '', s)
    return re.sub(r'\s+', ' ', s).strip()


def main(out):
    items = []
    files = []
    for dp, dn, fn in os.walk(SRC):
        dn[:] = [d for d in dn if d != 'vendor']
        for f in sorted(fn):
            if f.endswith('.js') or f.endswith('.html'):
                files.append(os.path.join(dp, f))
    for path in sorted(files):
        rel = os.path.relpath(path, SRC).replace('\\', '/')
        with open(path, encoding='utf-8', errors='replace') as fh:
            lines = fh.read().split('\n')
        for i, line in enumerate(lines):
            n = i + 1
            for m in TAG.finditer(line):
                a = attrs(m.group(2))
                items.append(dict(file=rel, line=n, how='html-literal', tag=m.group(1).lower(), id=a['id'], cls=a['class'],
                                  label=strip_tags(m.group(3)), aria=a['aria'], title=a['title'], text=line.strip()[:160]))
            else_open = OPEN.search(line)
            if else_open and not TAG.search(line):
                chunk = ' '.join(lines[i:i + 4])
                a = attrs(chunk[chunk.lower().find('<' + else_open.group(1).lower()):][:600])
                lab = ''
                mm = re.search(r'>([^<]*)', chunk[chunk.lower().find('<' + else_open.group(1).lower()):])
                if mm:
                    lab = strip_tags(mm.group(1))
                items.append(dict(file=rel, line=n, how='html-multiline', tag=else_open.group(1).lower(), id=a['id'], cls=a['class'],
                                  label=lab, aria=a['aria'], title=a['title'], text=line.strip()[:160]))
            if CREATE.search(line):
                window = '\n'.join(lines[i:i + 10])
                lab = first(SETTEXT.search(window)) if SETTEXT.search(window) else ''
                if SETTEXT.search(window):
                    lab = SETTEXT.search(window).group(3)
                items.append(dict(file=rel, line=n, how='createElement', tag=CREATE.search(line).group(1), id=(SETID.search(window).group(2) if SETID.search(window) else ''),
                                  cls=(first(SETCLS.search(window)) if SETCLS.search(window) else ''), label=lab,
                                  aria=(SETARIA.search(window).group(2) if SETARIA.search(window) else ''),
                                  title=(first(SETTITLE.search(window)) if SETTITLE.search(window) else ''), text=line.strip()[:160]))
            for m in EL.finditer(line):
                items.append(dict(file=rel, line=n, how='el-helper', tag=m.group(1), id='', cls=m.group(3), label=m.group(5) or '', aria='', title='', text=line.strip()[:160]))
            for m in HELPER.finditer(line):
                if re.match(r'\s*(const|let|var|function)\b', line) and 'function' in line[:m.start()+20]:
                    continue
                # button(cls, text) in the Library and Search pages takes the class first and the label second.
                if re.match(r'^(l13|s14|s141|cw|cl11)[\w -]*$', m.group(3)):
                    items.append(dict(file=rel, line=n, how='helper-call', tag='button', id='', cls=m.group(3), label=m.group(5) or '', aria='', title='', text=line.strip()[:160]))
                else:
                    items.append(dict(file=rel, line=n, how='helper-call', tag='button', id='', cls='', label=m.group(3), aria='', title=m.group(5) or '', text=line.strip()[:160]))
            if ROLE.search(line):
                items.append(dict(file=rel, line=n, how='role-button', tag='role', id='', cls='', label='', aria='', title='', text=line.strip()[:160]))
    json.dump(dict(root_sha_note='static text scan of src/, vendor excluded', files=len(files), items=items), open(out, 'w', encoding='utf-8', newline='\n'),
              ensure_ascii=False, indent=0)
    from collections import Counter
    print('files', len(files), 'candidates', len(items), dict(Counter(i['how'] for i in items)))


if __name__ == '__main__':
    main(sys.argv[1])
