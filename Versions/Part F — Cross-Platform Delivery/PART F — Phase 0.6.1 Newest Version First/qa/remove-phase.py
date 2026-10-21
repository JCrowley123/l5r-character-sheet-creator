#!/usr/bin/env python3
"""Surgically remove PART F — Phase 0.6.1 Newest Version First from a SCRATCH COPY of the Phase 0.6 folder.

    python qa/remove-phase.py COPY [--dry-run] [--expect-sha SHA256]

COPY is a copy of "PART F — Phase 0.6 Installable Web App". This layer owns no file there: it removes the
newest-first-helper and newest-first blocks in src/sw.js and the newest-first-update-check block in
qa/update-harness.js. Everything is checked before anything is written; the live folder is refused.
The result is byte-identical to both files at main 31be9e5. --expect-sha applies to src/sw.js.
Adapted from BUGFIX — Service Worker Redirected Page's remover.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

BLOCKS = {"src/sw.js": ("newest-first-helper", "newest-first"),
          "qa/update-harness.js": ("newest-first-update-check",),
          "qa/pwa-harness.js": ("online-sections", "offline-sections-check")}
PRE_RELEASE = {"src/sw.js": ("0e75a84d3726ffe1ee6c687ee8264acd84d9771160d815e95ee2921741ba14f2", 11607)}
PRE_RELEASE_COMMIT = "31be9e5"
# Outside the Phase 0.6 folder: the redirect fix's live removal test takes this layer off first.
REDIRECT_FIXTURE = "BUGFIX — Service Worker Redirected Page/qa/test-removal.py"
# Files outside the Phase 0.6 folder this layer holds blocks in, keyed by file name: (path under Versions/, slugs).
FIXTURES = {"test-removal.py": (REDIRECT_FIXTURE, ("later-layers-first",)),
            "sw-redirect-harness.js": ("BUGFIX — Service Worker Redirected Page/qa/sw-redirect-harness.js",
                                       ("sections-expected", "sections-check", "sections-online"))}
MARKER_RE = re.compile(r"\b(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+\d+(?:\.\d+)*|BUGFIX)\b", re.I)
OWN_RE = re.compile(r"\bNEWEST061\b|\bPHASE\s+0\.6\.1\b", re.I)
BEGIN_RE = re.compile(r"^\s*(?://|#) PART F PHASE 0\.6\.1 BEGIN ([a-z][a-z0-9-]*)\s*$")
END_RE = re.compile(r"^\s*(?://|#) END NEWEST061 ([a-z][a-z0-9-]*)\s*$")
SURFACE_RE = re.compile(r"\b(?:NEWEST_FIRST_ENABLED|CHECK_LIMIT_MS|NEW_PAGE_LIMIT_MS|serverBuildId|newerPage)\b")


class RemovalError(ValueError):
    """An unsafe or changed target. Refuse rather than guess."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RemovalError(message)


def live_folder() -> Path:
    # Versions/ is found by walking up to the ledger, never by counting parents.
    for directory in Path(__file__).resolve().parents:
        if (directory / "BUILD-LEDGER.md").is_file() and (directory / "CLAUDE.md").is_file():
            return (directory / "Part F — Cross-Platform Delivery" / "PART F — Phase 0.6 Installable Web App").resolve()
    raise RemovalError("cannot find Versions/ above this file; refusing to run blind")


def is_link(path: Path) -> bool:
    return path.is_symlink() or (hasattr(path, "is_junction") and path.is_junction())


def validate_root(candidate: Path) -> Path:
    live = live_folder()
    require(live.is_dir() and all((live / f).is_file() for f in BLOCKS), "cannot identify the live Phase 0.6 folder; refusing to run blind")
    require(not is_link(candidate.absolute()), "scratch root must not be a symbolic link or junction")
    root = candidate.resolve()
    require(not (root == live or root in live.parents or live in root.parents),
            "refusing the live Phase 0.6 folder or any ancestor/descendant; pass an external scratch copy")
    require(root.is_dir(), f"scratch copy is not a directory: {root}")
    for relative in BLOCKS:
        target = root / relative
        require(target.is_file(), f"missing {relative}")
        require(not is_link(target) and not is_link(target.parent), f"symbolic link/junction in {relative}")
        require(not target.samefile(live / relative), f"scratch {relative} aliases the live file")
    return root


def strip_owned_blocks(text: str, label: str, expected: tuple[str, ...]) -> tuple[str, list[str]]:
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
            require(active is not None, f"{label}:{number}: orphan END NEWEST061")
            require(end.group(1) == active, f"{label}:{number}: mismatched END slug")
            removed.append(active)
            active = None
            continue
        if active:
            # A line inside an owned block naming any marker is refused, so another layer's line is never swallowed.
            require(not MARKER_RE.search(line), f"{label}:{number}: foreign or nested marker inside owned block")
        else:
            require(not OWN_RE.search(line), f"{label}:{number}: partial or unrecognised owned marker")
            require(not SURFACE_RE.search(line), f"{label}:{number}: the layer's surface outside its blocks")
            output.append(line)
    require(active is None, f"{label}: unclosed owned block {active}")
    require(sorted(removed) == sorted(expected), f"{label}: missing expected blocks {expected}")
    return "".join(output), removed


def remove(candidate: Path, *, dry_run: bool = False, expect_sha: str | None = None, fixture=None):
    """fixture: a scratch copy (or a list of them) of the FIXTURES files, named as them, stripped of this layer too."""
    root = validate_root(candidate)
    planned, report = {}, {}
    for relative, slugs in BLOCKS.items():
        text, removed = strip_owned_blocks((root / relative).read_bytes().decode("utf-8"), relative, slugs)
        raw = text.encode("utf-8")
        planned[relative] = raw
        report[relative] = {"blocks": removed, "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
    sw_sha = report["src/sw.js"]["sha256"]
    require(expect_sha is None or sw_sha == expect_sha, f"planned sw.js {sw_sha} does not match required {expect_sha}; nothing written")
    extra = {}
    for one in ([] if fixture is None else fixture if isinstance(fixture, (list, tuple)) else [fixture]):
        one = Path(one)
        require(one.name in FIXTURES, f"not a file this layer holds blocks in: {one.name}")
        relative, slugs = FIXTURES[one.name]
        require(one.is_file() and not is_link(one), f"missing or linked fixture copy: {one}")
        require(not one.samefile(live_folder().parents[1] / relative), "refusing the live redirect-fix fixture; pass a scratch copy")
        text, removed = strip_owned_blocks(one.read_bytes().decode("utf-8"), relative, slugs)
        extra[one] = text.encode("utf-8")
        report[relative] = {"blocks": removed, "sha256": hashlib.sha256(extra[one]).hexdigest(), "bytes": len(extra[one])}
    if not dry_run:
        for relative, raw in planned.items():
            (root / relative).write_bytes(raw)
        for path, raw in extra.items():
            path.write_bytes(raw)
    return {"root": str(root), "dry_run": dry_run, "edited": list(BLOCKS), "files": report,
            "sw_matches_pre_release": sw_sha == PRE_RELEASE["src/sw.js"][0]}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("copy", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--expect-sha", help="optional exact sw.js requirement, checked BEFORE writing")
    parser.add_argument("--fixture", type=Path, action="append", help="a scratch copy of a FIXTURES file (repeatable)")
    args = parser.parse_args()
    try:
        print(json.dumps(remove(args.copy, dry_run=args.dry_run, expect_sha=args.expect_sha, fixture=args.fixture), indent=2))
        print("Nothing written." if args.dry_run else "Surgical removal complete.")
        return 0
    except (RemovalError, OSError, UnicodeError) as error:
        print(f"REFUSED: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
