"""Build the sourcebook page map: where each topic the remaining phases need lives.

Reads the owner's own sourcebook PDFs (never committed; see the repository's .gitignore) and
writes three files beside this script:

  INDEX.md     topic -> book -> page, for the phases still to build
  OUTLINES.md  every book's own bookmarks, with printed and PDF page numbers
  index.json   the same data, for later phases' scripts

Page numbers, headings and short entry names only. No rules text is written anywhere: the owner
ruled on 30 September 2026 that sourcebook content goes into this project in our own words, with
page references. The extracted text lives in a temporary folder that is deleted on exit.

Needs pypdf (bookmarks) and poppler's pdftotext (text; ships with Git for Windows as
/mingw64/bin/pdftotext). Run from any directory:

  python build_index.py [--books DIR] [--out DIR] [--check]

--check re-verifies the known page references and exits non-zero if any fails, without writing.
"""

import argparse
import json
import logging
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
import warnings
from collections import Counter

logging.disable(logging.CRITICAL)
warnings.filterwarnings("ignore")

try:
    import pypdf
    from pypdf import PdfReader
except ImportError:  # pragma: no cover - reported, not handled
    sys.exit("pypdf is required: python -m pip install pypdf")

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_BOOKS = os.environ.get(
    "L5R_BOOKS", os.path.join(os.path.expanduser("~"), "OneDrive", "Documents", "L5R 4th edition books"))

# Longest string this index may hold. A heading or entry name is short; anything longer would be
# rules text, which the ruling keeps out. Enforced before anything is written.
MAX_STRING = 100

CLASS_TAG = r"\[(?:BUSHI|SHUGENJA|COURTIER|MONK|ARTISAN|NINJA|MERCHANT|SCOUT|BUSHI/COURTIER|MONK/COURTIER)\]"

# key, phases it serves, what it is, heading pattern, whole-page pattern or a list of patterns that
# must all match (optional), entry pattern (optional, applied to heading lines and bookmarks;
# group 1 is the entry's name).
PATH_HEAD = r"^(?:NEW\s+)?(?:[\w'/-]+\s+)?PATH\s*:\s*(.+)$"
ADVANCED_HEAD = r"^(?:NEW\s+|[\w'/-]+\s+)?ADVANCED(?:\s+SCHOOL)?\s*:\s*(.+)$"
BASIC_HEAD = r"^(?:NEW\s+|LOST\s+)?(?:BASIC\s+)?SCHOOL\s*:\s*(.+)$"

TOPICS = [
    ("ancestors", "4.8", "Ancestors",
     r"\bancestors?\b", r"\bancestors?\b", r"^(?:[\w/' -]+\s)?ANCESTOR\s*:\s*(.+)$"),
    ("alternate-paths", "4.6", "Alternate Paths",
     PATH_HEAD + r"|\balternate paths?\b", r"\bReplaces\s*:", PATH_HEAD),
    ("advanced-schools", "4.7", "Advanced Schools",
     ADVANCED_HEAD + r"|\badvanced schools?\b", r"\badvanced schools?\b", ADVANCED_HEAD),
    ("schools", "9, 6, 4.7", "New and basic School headings",
     BASIC_HEAD + r"|\bSCHOOL(?:\s*" + CLASS_TAG + r")?\s*$", None, BASIC_HEAD),
    ("kata", "6", "Kata",
     r"\bkata\b", r"\bkata\b", None),
    ("kiho", "6", "Kiho",
     r"\bkiho\b", r"\bkiho\b", None),
    ("technique-void", "6, Hotei", "Technique pages that mention Void Points",
     None, [r"Technique Rank\s*:|\bRANK [1-5]\s*:", r"\bVoid Points?\b"], None),
    ("hotei", "4.5 (D04b)", "Hotei",
     r"\bhotei\b", r"\bHotei\b", None),
    ("seven-fortunes", "backlog", "Seven Fortunes' Blessing and Curse",
     r"seven fortunes", r"Seven Fortunes.?\s*(?:Blessing|Curse)", None),
    ("weakness", "4.5 (D06)", "Weakness (Disadvantage)",
     r"^WEAKNESS\b|\bweakness\s*\(", None, None),
    ("spell-memorisation", "backlog", "Memorising spells",
     r"\bmemori[sz]", r"\bmemori[sz]", None),
]

# Known page references already cited in the sheet's own source, with a word that must appear on
# that printed page. They prove the printed-page offsets, and are re-run by --check.
KNOWN_REFS = [
    ("Core Rulebook", 118, r"\bKitsu\b", "209.997-feat-wizard-starting-spells.js, Kitsu Shugenja's Spells line"),
    ("Book of Void", 192, r"\bUncentered\b", "Uncentered [Spiritual], Book of Void p.192"),
    ("Strongholds of the Empire", 93, r"Dark Path", "070-schools-paths-techniques.js, Dark Path Sohei"),
    ("Secrets of the Empire", 243, r"Silent Ones", "070-schools-paths-techniques.js, The Silent Ones"),
    ("Naishou Province", 7, r"Naishou Citizen", "A08 Naishou Citizen, Naishou Province p.7"),
    ("The Great Clans", 199, r"Void Versatility", "209.9297-feat-adv-void-versatility.js, A14"),
]


def short_title(filename):
    t = os.path.splitext(filename)[0]
    t = re.sub(r"\s*L5R-4e$", "", t)
    t = re.sub(r"^Legend of the Five Rings\s+", "", t)
    t = re.sub(r"\s+Legend of the Five Rings$", "", t)
    t = re.sub(r"^Book \d+ The ", "", t)
    t = re.sub(r"^Rpg Core Rulebook.*$", "Core Rulebook", t)
    return t.strip()


def norm(s):
    s = unicodedata.normalize("NFKC", s)
    s = s.replace("\u2019", "'").replace("\u2018", "'")
    return re.sub(r"\s+", " ", s).strip()


def find_pdftotext():
    exe = shutil.which("pdftotext")
    if exe:
        return exe
    for guess in (r"C:\Program Files\Git\mingw64\bin\pdftotext.exe",):
        if os.path.exists(guess):
            return guess
    sys.exit("pdftotext not found (poppler; ships with Git for Windows as mingw64/bin/pdftotext)")


def tool_version(exe):
    r = subprocess.run([exe, "-v"], capture_output=True, text=True)
    m = re.search(r"pdftotext version (\S+)", (r.stdout or "") + (r.stderr or ""))
    return m.group(1) if m else "unknown"


def extract_pages(exe, pdf, tmp, n):
    out = os.path.join(tmp, "book.txt")
    subprocess.run([exe, "-enc", "UTF-8", pdf, out], check=True, capture_output=True)
    with open(out, encoding="utf-8", errors="replace") as fh:
        pages = fh.read().split("\f")
    os.remove(out)
    pages = pages[:n] + [""] * max(0, n - len(pages))
    return [norm_page(p) for p in pages]


def norm_page(p):
    return unicodedata.normalize("NFKC", p).replace("\u2019", "'").replace("\u2018", "'")


def printed_offset(pages):
    """printed page = PDF page + offset. Chosen as the offset whose printed number appears as a
    standalone number on the most pages; the agreement count is kept so a weak vote is visible."""
    toks = [set(re.findall(r"(?<![\w.,/-])(\d{1,3})(?![\w/-])", p)) for p in pages]
    votes = []
    for off in range(-15, 6):
        hits = sum(1 for i, t in enumerate(toks) if i + 1 + off > 0 and str(i + 1 + off) in t)
        votes.append((hits, -abs(off), off))
    votes.sort(reverse=True)
    return votes[0][2], votes[0][0]


def outline_entries(reader):
    """The book's bookmarks that point at a page, and how many point nowhere (a broken bookmark
    has a title but a null target, as all of Naishou Province's do)."""
    entries, broken = [], [0]

    def walk(items, depth):
        for x in items:
            if isinstance(x, list):
                walk(x, depth + 1)
                continue
            try:
                page = reader.get_destination_page_number(x) + 1
            except Exception:
                page = None
            title = norm(getattr(x, "title", "") or "")
            if title and page:
                entries.append({"t": title[:MAX_STRING], "d": depth, "p": page})
            elif title:
                broken[0] += 1

    try:
        walk(reader.outline, 0)
    except Exception:
        pass
    return entries, broken[0]


SMALL_WORDS = {"a", "an", "and", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with", "vs"}


def heading_lines(page_text):
    """Short lines with no closing punctuation that are either mostly upper case or in Title Case:
    headings, not prose. A trailing page number (a running footer run into the line) is dropped."""
    found = []
    for raw in page_text.splitlines():
        line = re.sub(r"\s+\d{1,3}$", "", norm(raw))
        letters = [c for c in line if c.isalpha()]
        if not (3 <= len(line) <= 70) or len(letters) < 4:
            continue
        if line.endswith((".", ",", ";")) or re.search(r"\.\s?\.\s?\.", line):  # prose, or a contents-page leader
            continue
        upper =sum(1 for c in letters if c.isupper()) / len(letters) >= 0.8
        words = re.findall(r"[A-Za-z][A-Za-z']*", line)
        title = (line[0].isupper() and len(words) <= 8
                 and all(w[0].isupper() for w in words if w.lower() not in SMALL_WORDS))
        if upper or title:
            found.append(line)
    return found


def nice_name(s):
    """Title Case for an entry name read from an upper-case heading: "BISHAMON'S CHOSEN [SHUGENJA]"
    becomes "Bishamon's Chosen [Shugenja]"."""
    s = norm(s).strip(" :-")
    out = []
    for i, w in enumerate(s.split(" ")):
        low = w.lower()
        if i and low in SMALL_WORDS:
            out.append(low)
        else:
            out.append(re.sub(r"[A-Za-z]", lambda m: m.group(0).upper(), low, count=1))
    return " ".join(out)[:MAX_STRING]


def entry_key(name):
    """What makes two headings the same entry: the name without its [Class] or (Class) tag."""
    return re.sub(r"[^a-z0-9]", "", re.sub(r"[\[(].*?[\])]", "", name.lower()))


def page_ranges(pages):
    pages = sorted(set(pages))
    out, start, prev = [], None, None
    for p in pages:
        if start is None:
            start = prev = p
        elif p == prev + 1:
            prev = p
        else:
            out.append((start, prev))
            start = prev = p
    if start is not None:
        out.append((start, prev))
    return ", ".join(str(a) if a == b else f"{a}\u2013{b}" for a, b in out)


def build(books_dir, pdftotext):
    files = sorted(f for f in os.listdir(books_dir) if f.lower().endswith(".pdf"))
    books, texts = [], {}
    with tempfile.TemporaryDirectory(prefix="l5r-index-") as tmp:
        for f in files:
            path = os.path.join(books_dir, f)
            reader = PdfReader(path)
            n = len(reader.pages)
            if n < 20:  # the blank character sheet, not a sourcebook
                continue
            pages = extract_pages(pdftotext, path, tmp, n)
            offset, agree = printed_offset(pages)
            try:
                labels = list(reader.page_labels)
            except Exception:
                labels = []
            label_offsets = Counter(int(l) - (i + 1) for i, l in enumerate(labels) if l.isdigit())
            label_offset = label_offsets.most_common(1)[0][0] if label_offsets else None
            outline, broken = outline_entries(reader)
            title = short_title(f)
            books.append({
                "file": f, "title": title, "pages": n,
                "printed_offset": offset, "offset_agreement": f"{agree}/{n}",
                "page_labels_match_print": label_offset == offset,
                "outline_entries": len(outline), "outline_broken": broken,
                "outline_depth": (max(e["d"] for e in outline) + 1) if outline else 0,
                "outline": outline,
            })
            texts[title] = pages
    return books, texts


def topic_index(books, texts, lines_by_book):
    topics = []
    for key, phases, label, head_re, page_re, entry_re in TOPICS:
        hre = re.compile(head_re, re.I) if head_re else None
        rules = page_re if isinstance(page_re, list) else ([page_re] if page_re else [])
        pre = [re.compile(r, re.I) for r in rules]
        ere = re.compile(entry_re, re.I) if entry_re else None
        per_book = []
        for b in books:
            off, pages = b["printed_offset"], texts[b["title"]]
            seen, heads, entries = set(), [], []
            if hre:
                for e in b["outline"]:
                    if hre.search(e["t"]) and (e["t"], e["p"]) not in seen:
                        seen.add((e["t"], e["p"]))
                        heads.append({"t": e["t"], "pdf": e["p"], "printed": e["p"] + off, "from": "bookmark"})
                for i, page_lines in enumerate(lines_by_book[b["title"]]):
                    for line in page_lines:
                        if hre.search(line) and not any(line.upper() == s[0].upper() and i + 1 == s[1] for s in seen):
                            seen.add((line, i + 1))
                            heads.append({"t": line[:MAX_STRING], "pdf": i + 1, "printed": i + 1 + off, "from": "text"})
            heads.sort(key=lambda h: (h["pdf"], h["from"] != "bookmark", h["t"]))
            if ere:
                by_key = {}
                for h in heads:
                    m = ere.search(h["t"])
                    if not m or not m.group(1).strip():
                        continue
                    name = nice_name(m.group(1))
                    ek = entry_key(name)
                    if not ek:
                        continue
                    if ek not in by_key:
                        by_key[ek] = {"name": name, "pdf": h["pdf"], "printed": h["printed"]}
                    elif len(name) > len(by_key[ek]["name"]):
                        by_key[ek]["name"] = name  # keep the variant carrying its [Class] tag
                entries = sorted(by_key.values(), key=lambda e: (e["pdf"], e["name"]))
            hit_pages = [i + 1 for i, p in enumerate(pages) if pre and all(r.search(p) for r in pre)]
            if heads or hit_pages:
                per_book.append({
                    "book": b["title"], "headings": heads, "entries": entries,
                    "pages_pdf": hit_pages, "pages_printed": [p + off for p in hit_pages],
                })
        topics.append({"key": key, "phases": phases, "label": label,
                       "page_rule": " AND ".join(rules), "books": per_book})
    return topics


SHEET_SRC = os.path.join(HERE, os.pardir, "Part F — Cross-Platform Delivery",
                         "PART F — Phase 0 Source Reorganization for Maintainability", "src", "sheet")


def js_string(s):
    return re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), s).replace("\\'", "'")


def sheet_library():
    """The sheet's own School and technique names, read (never written) from the live source, so the
    cross-reference follows the library as it changes."""
    with open(os.path.join(SHEET_SRC, "060-lib-schools.js"), encoding="utf-8") as fh:
        lib = fh.read()
    with open(os.path.join(SHEET_SRC, "070-schools-paths-techniques.js"), encoding="utf-8") as fh:
        paths = fh.read()
    schools, techs = [], []
    body = lib[lib.index("const SCHOOL_LIBRARY"):]
    starts = list(re.finditer(r"\bname:'((?:[^'\\]|\\.)*)'", body))
    for k, m in enumerate(starts):
        school = js_string(m.group(1))
        schools.append(school)
        entry = body[m.end():starts[k + 1].start() if k + 1 < len(starts) else len(body)]
        t = re.search(r"\btech:\[(.*?)\]", entry, re.S)  # some entries span several lines
        for tm in re.finditer(r"'((?:[^'\\]|\\.)*)'", t.group(1) if t else ""):
            techs.append((js_string(tm.group(1)), school))
    block = paths[paths.index("const TECH_DESCRIPTIONS"):]
    block = block[:block.index("\n  };")]
    described = {js_string(m.group(2)) for m in re.finditer(r"^\s*(['\"])((?:(?!\1).|\\.)*)\1\s*:", block, re.M)}
    seen, unique = set(), []
    for name, school in techs:
        if name not in seen:
            seen.add(name)
            unique.append({"name": name, "school": school, "described": name in described})
    return schools, unique


def match_key(name):
    s = re.sub(r"[\[(].*?[\])]", "", norm(name)).upper()
    s = re.sub(r"^THE\s+", "", s.strip())
    return re.sub(r"[^A-Z0-9' ]", " ", s).split()


def crossref(books, lines_by_book, names, prefer=None, limit=6):
    """name -> headings (bookmarks and heading lines) that contain it as whole words."""
    index = []
    for b in books:
        off = b["printed_offset"]
        for e in b["outline"]:
            index.append((b["title"], e["p"], off, e["t"], "bookmark"))
        for i, page_lines in enumerate(lines_by_book[b["title"]]):
            for line in page_lines:
                index.append((b["title"], i + 1, off, line, "text"))
    prepared = [(bt, p, off, t, src, " " + " ".join(re.sub(r"[^A-Z0-9' ]", " ", t.upper()).split()) + " ")
                for bt, p, off, t, src in index]
    out = {}
    for name in names:
        words = match_key(name)
        if not words:
            continue
        needle = " " + " ".join(words) + " "
        hits, seen = [], set()
        for bt, p, off, t, src, hay in prepared:
            if needle in hay and (bt, p) not in seen:
                seen.add((bt, p))
                rank = 0 if prefer and re.search(prefer, t, re.I) else 1
                hits.append((rank, bt, p, off, t, src))
        hits.sort(key=lambda h: (h[0], h[1] != "Core Rulebook", h[1], h[2]))
        out[name] = [{"book": bt, "pdf": p, "printed": p + off, "t": t[:MAX_STRING], "from": src}
                     for _, bt, p, off, t, src in hits[:limit]]
    return out


def check_refs(books, texts):
    results = []
    by_title = {b["title"]: b for b in books}
    for title, printed, word, where in KNOWN_REFS:
        b = by_title.get(title)
        if not b:
            results.append((False, f"{title} p.{printed}: book not found"))
            continue
        pdf = printed - b["printed_offset"]
        ok = 1 <= pdf <= b["pages"] and re.search(word, texts[title][pdf - 1], re.I) is not None
        results.append((ok, f"{title} p.{printed} = PDF {pdf}: '{word}' {'found' if ok else 'NOT found'} ({where})"))
    return results


def assert_no_long_strings(obj, path="index"):
    if isinstance(obj, dict):
        for k, v in obj.items():
            assert_no_long_strings(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            assert_no_long_strings(v, f"{path}[{i}]")
    elif (isinstance(obj, str) and len(obj) > MAX_STRING
          and not path.endswith((".page_rule", ".check")) and not path.startswith("index.versions")):
        raise SystemExit(f"refusing to write: {path} is {len(obj)} characters (limit {MAX_STRING})")


def pg(printed, pdf):
    return f"p. {printed} (PDF {pdf})"


def write_markdown(out_dir, books, topics, checks, versions, sheet):
    L = []
    L.append("# Sourcebook index: where each topic lives")
    L.append("")
    L.append("Generated by `build_index.py` from the owner's own PDFs. **Page numbers and headings only**:")
    L.append("rules content goes into this project in our own words with page references (owner's ruling,")
    L.append("30 September 2026). Page numbers are the **printed** page, with the PDF page in brackets.")
    L.append("Everything here is found automatically: treat it as a map for reading, not as a checked list.")
    L.append("")
    L.append(f"Tools: pypdf {versions['pypdf']}, pdftotext {versions['pdftotext']}.")
    L.append("")
    L.append("## Books")
    L.append("")
    L.append("| Book | Pages | Printed page = PDF page | Offset agreement | Bookmarks (depth) | PDF page labels match print |")
    L.append("|---|---:|---|---:|---:|---|")
    for b in books:
        off = b["printed_offset"]
        rule = "same" if off == 0 else (f"PDF \u2212 {-off}" if off < 0 else f"PDF + {off}")
        marks = f"{b['outline_entries']} ({b['outline_depth']})"
        if b["outline_broken"]:
            marks += f"; {b['outline_broken']} point nowhere"
        L.append(f"| {b['title']} | {b['pages']} | {rule} | {b['offset_agreement']} | "
                 f"{marks} | {'yes' if b['page_labels_match_print'] else 'no'} |")
    L.append("")
    L.append("**Offset agreement** is how many pages carry their computed printed number as a standalone")
    L.append("number; art pages and full-page tables have none, so a figure well below the page count is")
    L.append("normal. **PDF page labels** are what a PDF reader shows as the page number; where they do")
    L.append("not match the print, cite the printed page, never the reader's label.")
    L.append("")
    L.append("### Known references re-checked")
    L.append("")
    for ok, msg in checks:
        L.append(f"- {'PASS' if ok else 'FAIL'}: {msg}")
    L.append("")
    for t in topics:
        L.append(f"## {t['label']} \u2014 Phase {t['phases']}")
        L.append("")
        if not t["books"]:
            L.append("Not found in any book.")
            L.append("")
            continue
        if t["page_rule"]:
            L.append(f"*Pages that match:* `{t['page_rule']}`")
            L.append("")
        for bk in t["books"]:
            L.append(f"### {bk['book']}")
            L.append("")
            if bk["entries"]:
                L.append(f"Entries ({len(bk['entries'])}): " + "; ".join(
                    f"{e['name']} {pg(e['printed'], e['pdf'])}" for e in bk["entries"]))
                L.append("")
            heads = [h for h in bk["headings"] if not bk["entries"] or h["from"] == "bookmark"]
            if heads:
                shown = heads[:60]
                L.append("Headings: " + "; ".join(
                    f"{h['t']} {pg(h['printed'], h['pdf'])}{'' if h['from'] == 'bookmark' else '*'}" for h in shown)
                    + (f"; \u2026 and {len(heads) - 60} more in index.json" if len(heads) > 60 else ""))
                L.append("")
            if bk["pages_printed"]:
                L.append(f"Pages ({len(bk['pages_printed'])}): {page_ranges(bk['pages_printed'])}")
                L.append("")
        L.append("")

    def where(found, n=3):
        if not found:
            return "not found"
        return "; ".join(f"{f['book']} {pg(f['printed'], f['pdf'])}{'' if f['from'] == 'bookmark' else '*'}"
                         for f in found[:n])

    L.append("## The sheet's Schools — Phase 9 (flavour text), 4.7")
    L.append("")
    L.append("Each School in the sheet's library, matched against book headings. The first hit is usually")
    L.append("the School's own entry; later hits may be mentions in other entries.")
    L.append("")
    L.append("| School (sheet) | Found at |")
    L.append("|---|---|")
    for s in sheet["schools"]:
        L.append(f"| {s['name']} | {where(s['found'])} |")
    missing = sum(1 for s in sheet["schools"] if not s["found"])
    L.append("")
    L.append(f"{len(sheet['schools'])} Schools; {len(sheet['schools']) - missing} found, {missing} not found by heading.")
    L.append("")
    undescribed = [t for t in sheet["techniques"] if not t["described"]]
    L.append("## Techniques with no description in the sheet — Phase 6, Hotei")
    L.append("")
    L.append(f"The sheet names {len(sheet['techniques'])} School techniques; {len(undescribed)} have no")
    L.append("description (the rest are paraphrases, and all of them lack a Void-cost field). Where each of")
    L.append("the undescribed ones is written up:")
    L.append("")
    L.append("| Technique | School (sheet) | Found at |")
    L.append("|---|---|---|")
    for t in undescribed:
        L.append(f"| {t['name']} | {t['school']} | {where(t['found'], 2)} |")
    found_all = sum(1 for t in sheet["techniques"] if t["found"])
    L.append("")
    L.append(f"All {len(sheet['techniques'])} techniques, described or not: {found_all} found by heading;"
             " each one's hits are in index.json.")
    L.append("")
    L.append("\\* found as a heading line in the text rather than in the book's bookmarks.")
    L.append("")
    with open(os.path.join(out_dir, "INDEX.md"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(L))

    O = ["# Sourcebook bookmarks", "",
         "Each book's own bookmarks (its PDF outline), with the printed page and the PDF page. Some books",
         "have few or none that work; for those, INDEX.md falls back to heading lines found in the text.", ""]
    for b in books:
        O.append(f"## {b['title']}")
        O.append("")
        if not b["outline"]:
            O.append(f"No bookmarks that point to a page ({b['outline_broken']} point nowhere)."
                     if b["outline_broken"] else "No bookmarks.")
            O.append("")
            continue
        for e in b["outline"]:
            O.append(f"{'  ' * e['d']}- {e['t']} \u2014 {pg(e['p'] + b['printed_offset'], e['p'])}")
        O.append("")
    with open(os.path.join(out_dir, "OUTLINES.md"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(O))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--books", default=DEFAULT_BOOKS)
    ap.add_argument("--out", default=HERE)
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    if not os.path.isdir(args.books):
        sys.exit(f"books folder not found: {args.books}")
    exe = find_pdftotext()
    books, texts = build(args.books, exe)
    checks = check_refs(books, texts)
    for ok, msg in checks:
        print(("PASS " if ok else "FAIL ") + msg)
    if args.check:
        sys.exit(0 if all(ok for ok, _ in checks) else 1)
    lines_by_book = {b["title"]: [heading_lines(p) for p in texts[b["title"]]] for b in books}
    topics = topic_index(books, texts, lines_by_book)
    schools, techs = sheet_library()
    school_hits = crossref(books, lines_by_book, schools, prefer=r"SCHOOL|" + CLASS_TAG)
    tech_hits = crossref(books, lines_by_book, [t["name"] for t in techs], prefer=r"\bRANK\b")
    sheet = {
        "schools": [{"name": s, "found": school_hits.get(s, [])} for s in schools],
        "techniques": [dict(t, found=tech_hits.get(t["name"], [])) for t in techs],
    }
    versions = {"pypdf": pypdf.__version__, "pdftotext": tool_version(exe)}
    data = {"note": "Page numbers and headings only; no rules text. See README.md.",
            "versions": versions, "books": books, "topics": topics, "sheet": sheet,
            "known_refs": [{"ok": ok, "check": msg} for ok, msg in checks]}
    assert_no_long_strings(data)
    with open(os.path.join(args.out, "index.json"), "w", encoding="utf-8", newline="\n") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    write_markdown(args.out, books, topics, checks, versions, sheet)
    print(f"{len(books)} books; {sum(len(t['books']) for t in topics)} topic/book entries written to {args.out}")
    sys.exit(0 if all(ok for ok, _ in checks) else 1)


if __name__ == "__main__":
    main()
