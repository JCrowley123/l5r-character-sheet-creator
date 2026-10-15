"""Second oracle for 14.3b: Secrets of the Empire pp.248-249 'School Index' read with pdfplumber word positions (three
columns per page), against qa/expected-pages.json. Prints names, books and page numbers only; nothing is saved."""
import collections, json, re, sys, unicodedata
from pathlib import Path
import pdfplumber
sys.stdout.reconfigure(encoding='utf-8')
pdf_path, oracle_path = sys.argv[1], sys.argv[2]
oracle = json.loads(Path(oracle_path).read_bytes().decode('utf-8'))
BOOKS = [('core rulebook', 'Core Rulebook'), ('great clans', 'The Great Clans'), ('emerald empire', 'Emerald Empire'),
         ('imperial histories 2', 'Imperial Histories 2'), ('imperial history 2', 'Imperial Histories 2'),
         ('imperial histories', 'Imperial Histories 1'), ('imperial history', 'Imperial Histories 1'),
         ('book of air', 'Book of Air'), ('book of earth', 'Book of Earth'), ('book of fire', 'Book of Fire'),
         ('book of water', 'Book of Water'), ('book of void', 'Book of Void'), ('secrets of the empire', 'Secrets of the Empire'),
         ('strongholds of the empire', 'Strongholds of the Empire'), ('naishou', 'Naishou Province'), ('sword and fan', 'Sword and Fan'),
         ('enemies of the empire', 'Enemies of the Empire'), ('unexpected allies', 'Unexpected Allies 2'), ('second city', 'The Second City')]


def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'[\[(][^\])]*[\])]', ' ', s)
    s = re.sub(r"[’']s\b", '', s)
    words = re.sub(r'[^a-z0-9]+', ' ', s).split()
    words = [w[:-1] if len(w) > 4 and w.endswith('s') else w for w in words if w not in ('the', 'school', 'order', 'of')]
    return ' '.join(words)


def book_of(text):
    t = ' '.join(re.sub(r'[^a-z0-9]+', ' ', text.lower()).split())
    for k, v in BOOKS:
        if k in t:
            return v
    return '?' + t[:40]


entries = collections.defaultdict(list)
with pdfplumber.open(pdf_path) as pdf:
    # 0-based PDF pages 249-250 = printed pp.248-249; column starts read from a histogram of word x-positions.
    for number, starts in ((248, (130, 270, 420)), (249, (30, 170, 320))):
        page = pdf.pages[number]
        words = page.extract_words(keep_blank_chars=False, use_text_flow=False)
        columns = collections.defaultdict(list)
        for w in words:
            columns[max([i for i, s in enumerate(starts) if w['x0'] >= s] or [0])].append(w)
        for c in sorted(columns):
            lines = []
            for w in sorted(columns[c], key=lambda w: (round(w['top']), w['x0'])):
                if lines and abs(lines[-1][0] - w['top']) < 3:
                    lines[-1][1].append(w['text'])
                else:
                    lines.append([w['top'], [w['text']]])
            name = None
            for _, parts in lines:
                seg = ' '.join(parts)
                if re.match(r'^.+\(.+\)$', seg) and not re.search(r'\d\s*$', seg):
                    name = seg
                    continue
                m = re.match(r'^(.*?[A-Za-z].*?)[^A-Za-z0-9]*?(\d{1,3}|N/A)$', seg)
                if name and m:
                    entries[norm(name)].append((name, book_of(m.group(1)), m.group(2)))
                    name = None
                elif name and not re.search(r'\d', seg):
                    name = name + ' ' + seg if not seg.endswith(')') else seg  # wrapped name lines
print('index entries parsed:', sum(len(v) for v in entries.values()))
schools = [r for r in oracle if r['category'] == 'schools']
agree, differ, missing = 0, [], []
for r in schools:
    hits = entries.get(norm(r['name']))
    if not hits:
        missing.append(r['name'])
        continue
    if any(b == r['book'] and p == str(r['page']) for _, b, p in hits):
        agree += 1
    else:
        differ.append((r['name'], r['book'] + ' p.' + str(r['page']), [b + ' ' + p for _, b, p in hits]))
print('oracle Schools:', len(schools), 'agree:', agree, 'differ:', len(differ), 'not in index:', len(missing))
for d in differ:
    print('DIFFER', d)
print('NOT IN INDEX', missing)
for name in missing:
    first = norm(name).split()[0] if norm(name) else ''
    near = [(k, v[0][1] + ' ' + v[0][2]) for k, v in entries.items() if first and first in k.split()]
    print('  NEAR', name, '->', near[:4])
print('UNPARSED-NAME-LINES', sorted(k for k in entries if not entries[k])[:5])
