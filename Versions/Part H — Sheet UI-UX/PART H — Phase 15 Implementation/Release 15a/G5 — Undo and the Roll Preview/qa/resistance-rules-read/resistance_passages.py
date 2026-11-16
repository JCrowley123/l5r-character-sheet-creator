"""Resistance rules read: a stable, numbered list of the passages in the owner's sourcebooks that mention resisting something.

Never saves text from the books: extraction goes to a temporary folder that is deleted on exit, and passages are printed
to stdout only (the owner's ruling of 30 September 2026: rules content goes into the project in our own words, never verbatim).

  python resistance_passages.py --list                         counts and passage-number ranges per book, no text
  python resistance_passages.py --batch FROM TO [--stem]       print passages FROM..TO (numbers are global and stable)
  python resistance_passages.py --book SUBSTRING [--stem] [--from N]   print one book's passages, starting at number N
  --stem keeps only passages containing "resist"; --maxchars N stops after about N characters and prints NEXT #n.

Passage rule (do not change it, or the numbers move): in each book, in sorted file-name order, a line is a hit when it
contains "resist", or names an effect (fear, poison, disease, taint, intimidat*, temptation, possess*, immun*, contested)
with roll, TN, +XkY, raise, bonus or penalty within one line either side. A passage is a hit with three lines of context
either side; overlapping passages are merged. Its page is the page of its first hit line.
Books: %USERPROFILE%/OneDrive/Documents/L5R 4th edition books, or the folder in L5R_BOOKS. Needs poppler's pdftotext."""
import argparse, json, os, re, shutil, subprocess, tempfile

BOOKS = os.environ.get('L5R_BOOKS') or os.path.join(os.environ['USERPROFILE'], 'OneDrive', 'Documents', 'L5R 4th edition books')
EXE = shutil.which('pdftotext') or r'C:\Program Files\Git\mingw64\bin\pdftotext.exe'
STEM = re.compile(r'resist', re.I)
EFFECT = re.compile(r'\b(fear|poison|disease|taint|intimidat\w*|temptation|possess\w*|immun\w*|contested)\b', re.I)
MECH = re.compile(r'(\broll\b|\bTN\b|\+\s?\dk\d|\braises?\b|\bbonus\b|\bpenalty\b)', re.I)
PAD = 3


def offsets():
    """printed page = PDF page + offset, from the Sourcebook Index's index.json where a book can be matched by file name."""
    out, p = {}, os.path.dirname(os.path.abspath(__file__))
    for _ in range(8):
        p = os.path.dirname(p)
        cand = os.path.join(p, 'SOURCEBOOK INDEX — Page Map', 'index.json')
        if os.path.isfile(cand):
            def walk(o):
                if isinstance(o, dict):
                    if isinstance(o.get('printed_offset'), int):
                        for k in ('file', 'pdf_file', 'filename', 'path', 'pdf'):
                            if isinstance(o.get(k), str):
                                out[os.path.basename(o[k]).lower()] = o['printed_offset']
                    for v in o.values():
                        walk(v)
                elif isinstance(o, list):
                    for v in o:
                        walk(v)
            try:
                walk(json.load(open(cand, encoding='utf-8')))
            except Exception:
                pass
            break
    return out


def build():
    files = sorted(f for f in os.listdir(BOOKS) if f.lower().endswith('.pdf'))
    off, books, n = offsets(), [], 0
    tmp = tempfile.mkdtemp(prefix='l5r-resist-')
    try:
        for f in files:
            out = os.path.join(tmp, 'b.txt')
            subprocess.run([EXE, '-enc', 'UTF-8', os.path.join(BOOKS, f), out], check=True, capture_output=True)
            text = open(out, encoding='utf-8', errors='replace').read()
            os.remove(out)
            lines, page_of = [], []
            for pi, page in enumerate(text.split('\f'), 1):
                for line in page.split('\n'):
                    lines.append(line)
                    page_of.append(pi)

            def hit(i):
                if STEM.search(lines[i]):
                    return True
                if not EFFECT.search(lines[i]):
                    return False
                return bool(MECH.search(' '.join(lines[max(0, i - 1):i + 2])))

            spans = []
            for i in range(len(lines)):
                if hit(i):
                    a, b = max(0, i - PAD), min(len(lines), i + PAD + 1)
                    if spans and a <= spans[-1][1]:
                        spans[-1][1] = b
                    else:
                        spans.append([a, b, i])
            first, items = n + 1, []
            for a, b, i in spans:
                n += 1
                items.append((n, page_of[i], re.sub(r'\s+', ' ', ' '.join(lines[a:b])).strip()))
            books.append({'file': f, 'pages': page_of[-1] if page_of else 0, 'offset': off.get(f.lower()),
                          'first': first, 'last': n, 'items': items})
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    return books


def show(pairs, maxchars, stem):
    used = 0
    for book, (num, pdfp, body) in pairs:
        if stem and not STEM.search(body):
            continue
        pg = f'p{pdfp + book["offset"]}' if isinstance(book['offset'], int) else f'pdf{pdfp}'
        s = f'#{num} {pg}: {body}'
        if used and used + len(s) > maxchars:
            print(f'NEXT #{num}')
            return
        print(s)
        used += len(s) + 1
    print('END OF RANGE')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--batch', nargs=2, type=int)
    ap.add_argument('--book')
    ap.add_argument('--stem', action='store_true')
    ap.add_argument('--from', dest='start', type=int, default=0)
    ap.add_argument('--maxchars', type=int, default=26000)
    a = ap.parse_args()
    books = build()
    if a.list:
        for i, b in enumerate(books, 1):
            stem = sum(1 for it in b['items'] if STEM.search(it[2]))
            print(f'{i:>2} {b["file"][:46]:<46} pages {b["pages"]:>4} offset {b["offset"]!s:>5} passages #{b["first"]}-#{b["last"]} ({len(b["items"])}, {stem} with "resist")')
        print('total passages', books[-1]['last'] if books else 0)
    if a.batch:
        lo, hi = a.batch
        show([(b, it) for b in books for it in b['items'] if lo <= it[0] <= hi], a.maxchars, a.stem)
    elif a.book:
        chosen = [b for b in books if a.book.lower() in b['file'].lower()] or [max(books, key=lambda b: b['pages'])]
        print('BOOK', chosen[0]['file'])
        show([(chosen[0], it) for it in chosen[0]['items'] if it[0] >= a.start], a.maxchars, a.stem)


if __name__ == '__main__':
    main()
