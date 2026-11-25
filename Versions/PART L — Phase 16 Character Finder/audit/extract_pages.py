"""Step 3 of the rating audit, on the owner's laptop: extract the printed pages of every School in book-worklist.json
from the owner's own PDFs into a SCRATCH folder OUTSIDE the repository.

    python extract_pages.py                      # books from %USERPROFILE%\\OneDrive\\Documents\\L5R 4th edition books
    python extract_pages.py --books "D:\\books" --out "C:\\Temp\\l5r-audit-book-text"

Project rule (owner, 30 September 2026): extract PDF text only to a scratch folder; never save or commit it. This script
refuses an output folder inside the repository. Delete the folder when the audit is finished.

Uses poppler's pdftotext (ships with Git for Windows) if it can find it, otherwise pypdf, as the Sourcebook Index did.
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
DEFAULT_BOOKS = os.environ.get('L5R_BOOKS') or os.path.join(os.path.expanduser('~'), 'OneDrive', 'Documents', 'L5R 4th edition books')
DEFAULT_OUT = os.path.join(tempfile.gettempdir(), 'l5r-audit-book-text')

def find_pdftotext():
    for c in [shutil.which('pdftotext'), r'C:\Program Files\Git\mingw64\bin\pdftotext.exe', '/mingw64/bin/pdftotext']:
        if c and os.path.exists(c): return c
    return None

def page_text(pdf, page, tool):
    """Text of one PDF page (1-based)."""
    if tool:
        r = subprocess.run([tool, '-layout', '-f', str(page), '-l', str(page), pdf, '-'], capture_output=True)
        return r.stdout.decode('utf-8', 'replace')
    from pypdf import PdfReader
    reader = page_text.cache.get(pdf) or page_text.cache.setdefault(pdf, PdfReader(pdf))
    return reader.pages[page - 1].extract_text() or ''
page_text.cache = {}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--books', default=DEFAULT_BOOKS)
    ap.add_argument('--out', default=DEFAULT_OUT)
    a = ap.parse_args()
    out = os.path.abspath(a.out)
    if os.path.commonpath([out, REPO]) == REPO:
        sys.exit('Refusing: %s is inside the repository. Book text must stay outside it.' % out)
    if not os.path.isdir(a.books):
        sys.exit('Books folder not found: %s' % a.books)
    os.makedirs(out, exist_ok=True)
    tool = find_pdftotext()
    work = json.load(open(os.path.join(HERE, 'book-worklist.json'), encoding='utf-8'))
    done = 0
    for item in work:
        p = item['pages']
        if not p: print('no page for', item['name']); continue
        pdf = os.path.join(a.books, p['file'])
        if not os.path.exists(pdf): print('missing book', p['file']); continue
        parts = []
        for k, pdf_page in enumerate(p['pdf_pages']):
            parts.append('===== %s p.%d (PDF %d) =====\n%s' % (p['book'], p['printed_page'] + k, pdf_page, page_text(pdf, pdf_page, tool)))
        safe = re.sub(r'[^\w\- ]', '', item['name']).strip()
        open(os.path.join(out, safe + '.txt'), 'w', encoding='utf-8').write('\n'.join(parts))
        done += 1
    print('%d Schools extracted to %s using %s. Never commit this folder; delete it when the audit is done.' % (done, out, tool or 'pypdf'))

if __name__ == '__main__':
    main()
