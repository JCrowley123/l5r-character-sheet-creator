#!/usr/bin/env python3
"""Surgically remove BUGFIX — Service Worker Redirected Page from a SCRATCH COPY of the
Phase 0.6 folder.

    python qa/remove-phase.py COPY [--dry-run] [--expect-sha SHA256]

COPY is a copy of "PART F — Phase 0.6 Installable Web App". This fix owns no file of its own:
only the redirect-helper, activate-clean and serve-clean blocks in src/sw.js are removed. The
whole operation is checked before anything is written. The live Phase 0.6 folder is refused.
With every later change absent, the result is byte-identical to sw.js at commit 9b465b5.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

SW = "src/sw.js"
SLUGS = ("redirect-helper", "activate-clean", "serve-clean")
PRE_RELEASE_SHA = "c260644d045b889cbfe993e5dda2df7b9b251b55cf3a6e06b9e6164e8f80a06e"
PRE_RELEASE_BYTES = 10013
PRE_RELEASE_COMMIT = "9b465b5"
MARKER_RE = re.compile(r"\b(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+\d+(?:\.\d+)*|BUGFIX)\b", re.I)
OWN_RE = re.compile(r"\bSWREDIRECT\b", re.I)
BEGIN_RE = re.compile(r"^\s*// BUGFIX SWREDIRECT BEGIN ([a-z][a-z0-9-]*)\s*$")
END_RE = re.compile(r"^\s*// END SWREDIRECT ([a-z][a-z0-9-]*)\s*$")
SURFACE_RE = re.compile(r"\bSW_REDIRECT_FIX_ENABLED\b|\bservable\s*\(")


class RemovalError(ValueError):
    """An unsafe or changed target. Refuse rather than guess."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RemovalError(message)


def live_folder() -> Path:
    # This file is Versions/<bugfix>/qa/remove-phase.py: parents[2] is Versions.
    return (Path(__file__).resolve().parents[2] / "Part F — Cross-Platform Delivery"
            / "PART F — Phase 0.6 Installable Web App").resolve()


def is_link(path: Path) -> bool:
    return path.is_symlink() or (hasattr(path, "is_junction") and path.is_junction())


def validate_root(candidate: Path) -> Path:
    live = live_folder()
    require(live.is_dir() and (live / SW).is_file(), "cannot identify the live Phase 0.6 folder; refusing to run blind")
    require(not is_link(candidate.absolute()), "scratch root must not be a symbolic link or junction")
    root = candidate.resolve()
    require(not (root == live or root in live.parents or live in root.parents),
            "refusing the live Phase 0.6 folder or any ancestor/descendant; pass an external scratch copy")
    require(root.is_dir(), f"scratch copy is not a directory: {root}")
    target = root / SW
    require(target.is_file(), f"missing {SW}")
    require(not is_link(target) and not is_link(target.parent), f"symbolic link/junction in {SW}")
    require(not target.samefile(live / SW), "scratch sw.js aliases the live file")
    return root


def strip_owned_blocks(text: str, label: str = SW, expected: tuple[str, ...] = SLUGS) -> tuple[str, list[str]]:
    output, removed, active = [], [], None
    for number, line in enumerate(text.splitlines(keepends=True), 1):
        bare = line.rstrip("\r\n")
        begin, end = BEGIN_RE.fullmatch(bare), END_RE.fullmatch(bare)
        if begin:
            slug = begin.group(1)
            require(active is None, f"{label}:{number}: nested BEGIN")
            require(slug in expected and slug not in removed, f"{label}:{number}: unexpected or duplicate block {slug}")
            active = slug
            continue
        if end:
            require(active is not None, f"{label}:{number}: orphan END SWREDIRECT")
            require(end.group(1) == active, f"{label}:{number}: mismatched END slug")
            removed.append(active)
            active = None
            continue
        if active:
            # Marker-shaped prose counts: a line inside an owned block naming any marker is refused,
            # so another fix's line can never be swallowed.
            require(not MARKER_RE.search(line), f"{label}:{number}: foreign or nested marker inside owned block")
        else:
            require(not OWN_RE.search(line), f"{label}:{number}: partial or unrecognised owned marker")
            require(not SURFACE_RE.search(line), f"{label}:{number}: the fix's surface outside its blocks")
            output.append(line)
    require(active is None, f"{label}: unclosed owned block {active}")
    require(sorted(removed) == sorted(expected), f"{label}: missing expected blocks {expected}")
    return "".join(output), removed


def remove(candidate: Path, *, dry_run: bool = False, expect_sha: str | None = None):
    root = validate_root(candidate)
    target = root / SW
    text, removed = strip_owned_blocks(target.read_bytes().decode("utf-8"))
    raw = text.encode("utf-8")
    digest = hashlib.sha256(raw).hexdigest()
    require(expect_sha is None or digest == expect_sha,
            f"planned sw.js {digest} does not match required {expect_sha}; nothing written")
    if not dry_run:
        target.write_bytes(raw)
    return {"root": str(root), "dry_run": dry_run, "edited": [SW], "blocks": removed,
            "sw_sha256": digest, "sw_bytes": len(raw),
            "matches_pre_release": digest == PRE_RELEASE_SHA}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("copy", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--expect-sha", help="optional exact result requirement, checked BEFORE writing")
    args = parser.parse_args()
    try:
        print(json.dumps(remove(args.copy, dry_run=args.dry_run, expect_sha=args.expect_sha), indent=2))
        print("Nothing written." if args.dry_run else "Surgical removal complete.")
        return 0
    except (RemovalError, OSError, UnicodeError) as error:
        print(f"REFUSED: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
