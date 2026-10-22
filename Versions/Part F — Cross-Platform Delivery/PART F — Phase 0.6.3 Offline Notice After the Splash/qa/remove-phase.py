#!/usr/bin/env python3
"""Surgically remove PART F — Phase 0.6.3 Offline Notice After the Splash from a SCRATCH COPY of the Phase 0.6 folder.

    python qa/remove-phase.py COPY [--dry-run] [--expect-sha SHA256]

COPY is a copy of "PART F — Phase 0.6 Installable Web App". This layer owns no file there: it removes the
notice-after-splash-helper and notice-after-splash blocks in src/head-pwa.html. Everything is checked before anything
is written; the live folder is refused. The result is byte-identical to head-pwa.html at main b54c13b.
Adapted from Phase 0.6.1's remover.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

BLOCKS = {"src/head-pwa.html": ("notice-after-splash-helper", "notice-after-splash")}
PRE_RELEASE = {"src/head-pwa.html": ("db49de8b94ed93f30242c7d1cd5f1a595c86eaf4713b130ee41027ed324a6be4", 5649)}
PRE_RELEASE_COMMIT = "b54c13b"
MARKER_RE = re.compile(r"\b(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+\d+(?:\.\d+)*|BUGFIX)\b", re.I)
OWN_RE = re.compile(r"\bNOTICE063\b|\bPHASE\s+0\.6\.3\b", re.I)
BEGIN_RE = re.compile(r"^\s*// PART F PHASE 0\.6\.3 BEGIN ([a-z][a-z0-9-]*)\s*$")
END_RE = re.compile(r"^\s*// END NOTICE063 ([a-z][a-z0-9-]*)\s*$")
SURFACE_RE = re.compile(r"\b(?:NOTICE_AFTER_SPLASH_ENABLED|noticeHeld|holdForSplash)\b")


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
            require(active is not None, f"{label}:{number}: orphan END NOTICE063")
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


def remove(candidate: Path, *, dry_run: bool = False, expect_sha: str | None = None):
    root = validate_root(candidate)
    planned, report = {}, {}
    for relative, slugs in BLOCKS.items():
        text, removed = strip_owned_blocks((root / relative).read_bytes().decode("utf-8"), relative, slugs)
        raw = text.encode("utf-8")
        planned[relative] = raw
        report[relative] = {"blocks": removed, "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
    head_sha = report["src/head-pwa.html"]["sha256"]
    require(expect_sha is None or head_sha == expect_sha, f"planned head-pwa.html {head_sha} does not match required {expect_sha}; nothing written")
    if not dry_run:
        for relative, raw in planned.items():
            (root / relative).write_bytes(raw)
    return {"root": str(root), "dry_run": dry_run, "edited": list(BLOCKS), "files": report,
            "head_matches_pre_release": head_sha == PRE_RELEASE["src/head-pwa.html"][0]}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("copy", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--expect-sha", help="optional exact head-pwa.html requirement, checked BEFORE writing")
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
