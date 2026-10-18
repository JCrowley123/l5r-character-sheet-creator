"""Writes a synthetic test PDF for the Library's checks. No book text: placeholder words only.

Each page prints its number at the foot (printed = PDF page + offset) unless it is an art page; optional
/PageLabels, outline (--dead-outline: its bookmarks lead nowhere), document title and title lines on chosen pages. --mid-numbers prints the numbers halfway down
the side margin instead (where the owner's books print them); --jpx PAGES fills those pages with a JPEG 2000 picture,
left half JPX_LEFT and right half JPX_RIGHT (Pillow's encoder). --contents JSON prints contents pages in Courier (so page
numbers right-align exactly): {"3": [[line, ...], ...]} is PDF page 3's columns (x 72, 252, 432; 150 wide; or
{"width": W, "cols": [...]}), each line {"t": title, "p": printed page or absent (a line that runs on), "s": size (9),
"i": indent (0), "split": [cuts: the title in kerned pieces], "lead": "dots" | "far" (dots from three letters on) |
"one" (a single dot) | "none" (a gap)}; a line with "x" and "y" is printed there instead (a margin's text), and the
column goes on below its previous line.

  python make-test-pdf.py OUT.pdf --pages 404 --offset -3 --labels r0,D3 --title-line 4="Legend of the Five Rings RPG, 4th Edition"
"""
import argparse, io, json, sys

JPX_LEFT, JPX_RIGHT = (180, 40, 40), (40, 60, 170)


def esc(s):
    return s.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def ranges(spec):
    out = set()
    for part in (spec or '').split(','):
        if part:
            lo, _, hi = part.partition('-')
            out.update(range(int(lo), int(hi or lo) + 1))
    return out


def jpx_image():
    from PIL import Image
    im = Image.new('RGB', (200, 259), JPX_RIGHT)
    im.paste(JPX_LEFT, (0, 0, 100, 259))
    buf = io.BytesIO()
    im.save(buf, 'JPEG2000')
    data = buf.getvalue()
    return (b'<< /Type /XObject /Subtype /Image /Width 200 /Height 259 /ColorSpace /DeviceRGB /BitsPerComponent 8 '
            b'/Filter /JPXDecode /Length %d >>\nstream\n' % len(data) + data + b'\nendstream')


def contents_ops(spec):
    ops = []
    width, cols = (spec['width'], spec['cols']) if isinstance(spec, dict) else (150, spec)
    for k, col in enumerate(cols):
        x0 = 72 + (width + 30) * k
        edge, y = x0 + width, 640.0
        for ln in col:
            s = ln.get('s', 9)
            if 'x' in ln:
                ops.append(f'BT /F2 {s} Tf {ln["x"]} {ln["y"]} Td ({esc(ln["t"])}) Tj ET')
                continue
            cw, t, x = 0.6 * s, ln['t'], x0 + ln.get('i', 0)
            # Pieces kerned together in one TJ, as books set "W" "ooden": PDF.js keeps them as separate items.
            cuts = [0] + ln.get('split', []) + [len(t)]
            pieces = ' 300 '.join(f'({esc(t[c0:c1])})' for c0, c1 in zip(cuts, cuts[1:]))
            ops.append(f'BT /F2 {s} Tf {x:.2f} {y:.2f} Td [{pieces}] TJ ET')
            if ln.get('p') is not None:
                num = str(ln['p'])
                nx, end, lead = edge - cw * len(num), x + cw * len(t), ln.get('lead', 'dots')
                if lead in ('dots', 'far'):
                    start = end + cw * (3 if lead == 'far' else 1)
                    n = int((nx - start) // (2 * cw))
                    ops.append(f'BT /F2 {s} Tf {start:.2f} {y:.2f} Td ({". " * n}) Tj ET')
                elif lead == 'one':
                    ops.append(f'BT /F2 {s} Tf {nx - 2 * cw:.2f} {y:.2f} Td (.) Tj ET')
                ops.append(f'BT /F2 {s} Tf {nx:.2f} {y:.2f} Td ({num}) Tj ET')
            y -= s * 1.35
    return ops


def build(a):
    objs = {}  # number -> bytes
    n = a.pages
    title_lines = {}
    for tl in a.title_line or []:
        k, v = tl.split('=', 1)
        title_lines.setdefault(int(k), []).append(v)
    art = ranges(a.art)
    jpx = ranges(a.jpx)
    font, image = 3, 4
    objs[font] = b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    contents = {int(k): v for k, v in json.loads(a.contents).items()} if a.contents else {}
    mono = 5
    if contents:
        objs[mono] = b'<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>'
    if jpx:
        objs[image] = jpx_image()
    first_page = 10
    kids = []
    for i in range(1, n + 1):
        pobj, cobj = first_page + 2 * (i - 1), first_page + 2 * (i - 1) + 1
        kids.append(pobj)
        ops = ['q 612 0 0 792 0 0 cm /Im1 Do Q'] if i in jpx else []
        y = 720
        for line in title_lines.get(i, []):
            ops.append(f'BT /F1 22 Tf 72 {y} Td ({esc(line)}) Tj ET')
            y -= 34
        if i not in art:
            ops.append(f'BT /F1 11 Tf 72 {y - 20} Td (Placeholder text, roll 3k2 against TN 15, page body.) Tj ET')
            printed = i + a.offset
            if printed >= 1 and not a.no_numbers:
                ops.append(f'BT /F1 10 Tf {540 if i % 2 else 60} {392 if a.mid_numbers else 30} Td ({printed}) Tj ET')
        if i in contents:
            ops += contents_ops(contents[i])
        stream = '\n'.join(ops).encode('latin-1')
        objs[cobj] = b'<< /Length %d >>\nstream\n' % len(stream) + stream + b'\nendstream'
        objs[pobj] = (f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents {cobj} 0 R '
                      f'/Resources << /Font << /F1 {font} 0 R{f" /F2 {mono} 0 R" if contents else ""} >>{f" /XObject << /Im1 {image} 0 R >>" if i in jpx else ""} >> >>').encode()
    objs[2] = f'<< /Type /Pages /Kids [{" ".join(f"{k} 0 R" for k in kids)}] /Count {n} >>'.encode()
    nxt = first_page + 2 * n
    cat = '<< /Type /Catalog /Pages 2 0 R'
    if a.labels:
        nums = []
        for part in a.labels.split(','):
            style, start = part[0], int(part[1:])
            nums.append(f'{start} << /S /{style} >>')
        cat += f' /PageLabels << /Nums [{" ".join(nums)}] >>'
    if a.outline:
        # outline spec: "Title@pdfpage>Child@p>>Grandchild@p;Next top@p" ('>' count = depth)
        items = []
        for spec in a.outline.split(';'):
            depth = len(spec) - len(spec.lstrip('>'))
            t, _, p = spec.lstrip('>').rpartition('@')
            items.append({'t': t, 'p': int(p), 'd': depth, 'kids': []})
        root = {'kids': [], 'd': -1}
        stack = [root]
        for it in items:
            while stack[-1]['d'] >= it['d']:
                stack.pop()
            stack[-1]['kids'].append(it)
            stack.append(it)
        oroot = nxt; nxt += 1

        def number(node):
            nonlocal nxt
            for k in node['kids']:
                k['o'] = nxt; nxt += 1
                number(k)
        number(root)

        def emit(node, parent):
            ks = node['kids']
            for j, k in enumerate(ks):
                d = f'<< /Title ({esc(k["t"])}) /Parent {parent} 0 R'
                if not a.dead_outline: d += f' /Dest [{first_page + 2 * (k["p"] - 1)} 0 R /Fit]'
                if j > 0: d += f' /Prev {ks[j-1]["o"]} 0 R'
                if j < len(ks) - 1: d += f' /Next {ks[j+1]["o"]} 0 R'
                if k['kids']:
                    d += f' /First {k["kids"][0]["o"]} 0 R /Last {k["kids"][-1]["o"]} 0 R /Count {len(k["kids"])}'
                objs[k['o']] = (d + ' >>').encode('latin-1')
                emit(k, k['o'])
        emit(root, oroot)
        objs[oroot] = (f'<< /Type /Outlines /First {root["kids"][0]["o"]} 0 R /Last {root["kids"][-1]["o"]} 0 R '
                       f'/Count {len(root["kids"])} >>').encode()
        cat += f' /Outlines {oroot} 0 R'
    objs[1] = (cat + ' >>').encode()
    info = None
    if a.info_title is not None:
        info = nxt; nxt += 1
        objs[info] = f'<< /Title ({esc(a.info_title)}) >>'.encode('latin-1')
    out = bytearray(b'%PDF-1.7\n%\xe2\xe3\xcf\xd3\n')
    size = max(objs) + 1
    offsets = [0] * size
    for k in sorted(objs):
        offsets[k] = len(out)
        out += b'%d 0 obj\n' % k + objs[k] + b'\nendobj\n'
    xref = len(out)
    out += b'xref\n0 %d\n' % size
    for k in range(size):
        out += (b'%010d 00000 n \n' % offsets[k]) if k in objs else b'0000000000 65535 f \n'
    out += f'trailer\n<< /Size {size} /Root 1 0 R{f" /Info {info} 0 R" if info else ""} >>\nstartxref\n{xref}\n%%EOF\n'.encode()
    return bytes(out)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--pages', type=int, default=20)
    ap.add_argument('--offset', type=int, default=-1)
    ap.add_argument('--labels', default='')
    ap.add_argument('--title-line', action='append')
    ap.add_argument('--art', default='')
    ap.add_argument('--outline', default='')
    ap.add_argument('--dead-outline', action='store_true')
    ap.add_argument('--info-title')
    ap.add_argument('--no-numbers', action='store_true')
    ap.add_argument('--mid-numbers', action='store_true')
    ap.add_argument('--jpx', default='')
    ap.add_argument('--contents', default='')
    a = ap.parse_args()
    data = build(a)
    with open(a.out, 'wb') as f:
        f.write(data)
    sys.stdout.write(f'{a.out}: {len(data)} bytes, {a.pages} pages\n')
