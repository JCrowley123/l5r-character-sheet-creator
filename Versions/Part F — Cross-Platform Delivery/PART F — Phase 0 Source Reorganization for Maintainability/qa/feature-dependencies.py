#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Who else in the source tree depends on one removable feature?

CLAUDE.md ("Every feature must be surgically removable") requires that a
feature phase can be deleted by removing its own fragment plus the blocks
carrying its own comment marker in the shared files -- and that anything
which does NOT fit that description is declared as a real dependency before
the feature ships, not discovered halfway through a removal.

This answers the question mechanically. Given a phase's own fragment and its
marker, it collects every top-level name that fragment declares, finds every
reference to those names elsewhere in src/, and attributes each reference to
whichever phase marker is in effect at that point in the file.

    python3 qa/feature-dependencies.py src/sheet/207-feat-clan-theming.js "PART H PHASE 9"

Add markup IDs, CSS classes or custom properties -- which are not JS
declarations, so they cannot be found automatically -- with --also:

    python3 qa/feature-dependencies.py src/sheet/205-feat-ui-foundations.js "PART H PHASE 1" \
      --also scrollTopBtn scroll-top-btn

Exit status is 0 when every reference sits inside a block this phase's own
marker owns (i.e. surgical removal already deletes all of them), and 1 when
any reference is attributed to another phase or to no marker at all. A
non-zero exit is not automatically a bug -- a genuine, declared dependency
also lands here -- it means removal of this feature is a compound operation
and the referencing feature has to be dealt with too.

Run from the Phase 0 folder. Reads only. Never writes. Stdlib only.
"""

import io
import os
import re
import sys

SEARCH_DIRS = ("src",)
SEARCH_EXTS = (".js", ".css", ".html")

# Top-level declarations inside a sheet fragment. Every src/sheet/*.js fragment
# is a piece of one IIFE indented two spaces (see CLAUDE.md), so anchoring on
# that indentation keeps this to the fragment's own exported surface and skips
# names declared inside a function body.
DECL_RE = re.compile(
    r"^  (?:function\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=)",
    re.M,
)

# A phase marker as written throughout this tree: "PART H PHASE 9",
# "PART C FEATURE 4", or a "BUGFIX (...)" / "BUGFIX:" note.
MARKER_RE = re.compile(r"(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+[\d.]+|BUGFIX)", re.I)


def read(path):
    with io.open(path, "r", encoding="utf-8", newline="") as fh:
        return fh.read()


def declared_names(fragment_text):
    names = set()
    for m in DECL_RE.finditer(fragment_text):
        names.add(m.group(1) or m.group(2))
    return names


def source_files(root, skip_abs):
    out = []
    for d in SEARCH_DIRS:
        for dirpath, _dirnames, filenames in os.walk(os.path.join(root, d)):
            for fn in filenames:
                if not fn.endswith(SEARCH_EXTS):
                    continue
                p = os.path.join(dirpath, fn)
                if os.path.abspath(p) != skip_abs:
                    out.append(p)
    return sorted(out)


def scan(path, names):
    """Yield (lineno, line, owning_marker, lines_since_marker) for each hit."""
    text = read(path)
    word = re.compile(r"\b(" + "|".join(re.escape(n) for n in sorted(names)) + r")\b")
    owner, owner_line = None, 0
    for i, line in enumerate(text.splitlines(), 1):
        m = MARKER_RE.search(line)
        if m:
            owner, owner_line = m.group(1).upper(), i
        if word.search(line):
            yield i, line.strip(), owner, (i - owner_line if owner else None)


def main():
    args = [a for a in sys.argv[1:]]
    if "--also" in args:
        cut = args.index("--also")
        extra, args = args[cut + 1:], args[:cut]
    else:
        extra = []
    if len(args) != 2:
        sys.stderr.write(
            "usage: feature-dependencies.py <fragment.js> <MARKER> [--also SYM ...]\n"
        )
        return 2

    fragment, marker = args[0], args[1].upper()
    root = os.getcwd()
    names = declared_names(read(fragment)) | set(extra)
    if not names:
        sys.stderr.write("no top-level declarations found in %s\n" % fragment)
        return 2

    print("fragment : %s" % fragment)
    print("marker   : %s" % marker)
    print("surface  : %d name(s) -- %s\n" % (len(names), ", ".join(sorted(names))))

    outside = []
    for path in source_files(root, os.path.abspath(fragment)):
        hits = list(scan(path, names))
        if not hits:
            continue
        rel = os.path.relpath(path, root)
        print(rel)
        for lineno, line, owner, dist in hits:
            owned = owner is not None and owner.startswith(marker)
            tag = "  own " if owned else ">>NOT "
            where = "%s +%s" % (owner, dist) if owner else "no marker above"
            print("  %s %5d  [%s]  %s" % (tag, lineno, where, line[:96]))
            if not owned:
                outside.append((rel, lineno, where))
        print("")

    if outside:
        print("%d reference(s) NOT owned by %s:" % (len(outside), marker))
        for rel, lineno, where in outside:
            print("  %s:%d  (%s)" % (rel, lineno, where))
        print(
            "\nEach one is either a block that needs this phase's marker added, or a real\n"
            "dependency -- declare it in both phases' ROLLBACK.md before shipping."
        )
        return 1

    print("every reference is inside a block %s owns -- surgical removal covers all of them." % marker)
    return 0


if __name__ == "__main__":
    sys.exit(main())
