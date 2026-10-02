#!/usr/bin/env python3
"""Our own words: report any run of N or more consecutive words a Technique text shares with the book.

    python qa/own-words-check.py <folder of extracted book text> [N]

The owner's ruling (30 September 2026): sourcebook content goes into the sheet as mechanics in our
own words, never word for word, and extracted PDF text stays in a scratch folder, never in the
repository. So this check takes the book text as an argument. Extract the pages first, for example
(Core Rulebook PDF page = printed + 3; The Great Clans and Secrets of the Empire, printed + 1):

    pdftotext -raw -f 123 -l 125 "<Core Rulebook>.pdf" <scratch>/core-120-122.txt
    pdftotext -raw -f 219 -l 230 "<Core Rulebook>.pdf" <scratch>/core-216-227.txt
    pdftotext -raw -f 167 -l 170 "<The Great Clans>.pdf" <scratch>/tgc-166-169.txt
    pdftotext -raw -f 239 -l 239 "<Secrets of the Empire>.pdf" <scratch>/sote-238.txt

N defaults to 8. Shorter runs are the game's own terms ("spend a Void Point", "equal to your School
Rank"), which a rules text cannot avoid. Exit 1 when any text shares a run of N words.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def fragment() -> Path:
    for directory in HERE.parents:
        if (directory / "BUILD-LEDGER.md").is_file():
            return (directory / "Part F — Cross-Platform Delivery" / "PART F — Phase 0 Source Reorganization for Maintainability"
                    / "src" / "sheet" / "209.999995-feat-school-technique-text.js")
    raise SystemExit("cannot find Versions/ above " + str(HERE))


def entries(text: str):
    row = re.compile(r"^\s+\['((?:[^'\\]|\\.)*)', '((?:[^'\\]|\\.)*)', (\d), '((?:[^'\\]|\\.)*)'\],\s*$", re.M)
    decode = lambda s: re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), s).replace("\\'", "'")
    return [(decode(m.group(1)), decode(m.group(4))) for m in row.finditer(text)]


def words(s: str):
    s = s.lower().replace("’", "'")
    s = re.sub(r"\bf i\b|\bfi (?=[a-z])", "fi", s).replace("fl ", "fl")  # the PDFs split ligatures
    return re.findall(r"[a-z0-9+]+", s)


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 8
    book = []
    for f in sorted(Path(sys.argv[1]).glob("*.txt")):
        book += words(f.read_text(encoding="utf-8", errors="replace"))
    if not book:
        raise SystemExit("no book text found in " + sys.argv[1])
    grams = {tuple(book[i:i + n]) for i in range(len(book) - n + 1)}
    found = entries(fragment().read_text(encoding="utf-8"))
    shared = 0
    for name, text in found:
        w = words(re.sub(r"\([^)]*p\.\d+\)$", "", text))
        hit = next((" ".join(w[i:i + n]) for i in range(len(w) - n + 1) if tuple(w[i:i + n]) in grams), None)
        if hit:
            shared += 1
            print(f"{name}: shares \"{hit}\"")
    print(f"{len(found)} texts; {shared} share a run of {n} or more words with the book")
    return 1 if shared or not found else 0


if __name__ == "__main__":
    sys.exit(main())
