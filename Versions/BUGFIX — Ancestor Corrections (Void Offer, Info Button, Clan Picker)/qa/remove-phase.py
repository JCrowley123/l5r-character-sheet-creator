#!/usr/bin/env python3
"""Surgically remove BUGFIX — Ancestor Corrections (Void Offer, Info Button, Clan Picker) from a
SCRATCH COPY of the Phase 0 tree.

    python qa/remove-phase.py COPY [--dry-run] [--expect-sha SHA256]

Preflights the complete operation before writing. Only the fix's own two files (the stylesheet and
the fragment) and their manifest entries are removed: the fix adds no block to any shared file, so
there is nothing else to cut. The Void offers, the Ancestor's info button and the Ancestor list then
behave as they did before the fix. Later work is preserved; the resulting manifest hash is
calculated from the remaining fragments rather than forced to an old baseline. Rebuild the copy
with its build/recombine.py afterwards. No snapshot restore or live-tree edit exists. Adapted from
BUGFIX — Multiple Schools Keep Earlier Techniques' remover, itself adapted from BUGFIX — Manage
Button Clipping's.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

MARKER = "BUGFIX"  # MARKER_RE captures the bare word; the long form is BUGFIX ANCFIX
FRAGMENTS = (
    "src/css/59.9999-bugfix-ancestor-info.css",
    "src/sheet/209.999992-bugfix-ancestor-corrections.js",
)
PRE_RELEASE_SHA = "7daf6aec5558807f81aa4f0b436df4c2332ddd4624eea4e52e85aa044ee68677"
PRE_RELEASE_BYTES = 3260361
PRE_RELEASE_COMMIT = "66bff1b"
MARKER_RE = re.compile(r"\b(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+\d+(?:\.\d+)*|BUGFIX)\b", re.I)
OWN_RE = re.compile(r"\bBUGFIX\s+ANCFIX\b", re.I)
# The fix's whole surface: its three switches, the names it declares and the class it adds. It
# rebinds Phase 3's (Part G) voidKeyWouldMatter() and calls Phase 4.8's (Part I) renderAncestorCard(),
# which belong to those phases and are not part of this surface.
SURFACE_RE = re.compile(r"\b(?:ANCFIX_VOID_OFFER_ENABLED|ANCFIX_INFO_ICON_ENABLED|ANCFIX_CLAN_PICKER_ENABLED|"
                        r"ancfixPreviewWouldMatter|ancfixVoidModCount)\b|ancfix-info")


class RemovalError(ValueError):
    """An unsafe or changed target. Refuse rather than guess."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RemovalError(message)


def read_exact(path: Path) -> str:
    return path.read_bytes().decode("utf-8")


def write_exact(path: Path, text: str) -> None:
    path.write_bytes(text.encode("utf-8"))


def live_tree() -> Path:
    # This file is Versions/<fix>/qa/remove-phase.py: parents[2], NOT [3], is Versions.
    return (Path(__file__).resolve().parents[2] / "Part F — Cross-Platform Delivery"
            / "PART F — Phase 0 Source Reorganization for Maintainability").resolve()


def is_link(path: Path) -> bool:
    return path.is_symlink() or (hasattr(path, "is_junction") and path.is_junction())


def validate_root(candidate: Path) -> Path:
    live = live_tree()
    require(live.is_dir() and (live / "build/manifest.json").is_file(),
            "cannot identify the live Phase 0 tree; refusing to run blind")
    root = candidate.resolve()
    require(not (root == live or root in live.parents or live in root.parents),
            "refusing the live Phase 0 tree or any ancestor/descendant; pass an external scratch copy")
    require(root.is_dir(), f"scratch copy is not a directory: {root}")
    require(not is_link(candidate.absolute()), "scratch root must not be a symbolic link or junction")
    return root


def safe_path(root: Path, relative: str, *, must_exist: bool = True) -> Path:
    relative_path = Path(relative)
    require(not relative_path.is_absolute() and not relative_path.drive and ".." not in relative_path.parts,
            f"unsafe relative path: {relative}")
    target = root / relative_path
    require(target.resolve() != root and root in target.resolve().parents,
            f"path escapes scratch copy: {relative}")
    for part in [target, *target.parents]:
        if part == root:
            break
        require(not is_link(part), f"symbolic link/junction in scratch path: {relative}")
    require(not must_exist or target.is_file(), f"missing {relative}")
    live_target = live_tree() / relative_path
    if target.exists() and live_target.is_file():
        require(not target.samefile(live_target), f"scratch file aliases the live file: {relative}")
    return target


def marker_names(line: str) -> list[str]:
    return [re.sub(r"\s+", " ", hit.group(1).upper()) for hit in MARKER_RE.finditer(line)]


def no_duplicate_keys(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, f"manifest.json: duplicate key {key}")
        result[key] = value
    return result


def parse_manifest(text: str):
    try:
        data = json.loads(text, object_pairs_hook=no_duplicate_keys)
    except json.JSONDecodeError as error:
        raise RemovalError(f"manifest.json: invalid JSON: {error}") from error
    require(isinstance(data, dict) and isinstance(data.get("fragments"), list), "manifest.json: missing fragments")
    paths = [item.get("file") if isinstance(item, dict) else None for item in data["fragments"]]
    require(all(isinstance(path, str) for path in paths), "manifest.json: invalid fragment file")
    require(len(paths) == len(set(paths)), "manifest.json: duplicate fragment entries")
    return data


def strip_manifest(text: str, resulting_sha: str = PRE_RELEASE_SHA) -> str:
    data = parse_manifest(text)
    paths = [entry["file"] for entry in data["fragments"]]
    require(all(paths.count(fragment) == 1 for fragment in FRAGMENTS), "manifest.json: missing owned entry")
    decoder = json.JSONDecoder(object_pairs_hook=no_duplicate_keys)
    spans = []
    for fragment in FRAGMENTS:
        pattern = re.compile(r'^([ \t]*)\{[ \t]*"file"[ \t]*:[ \t]*' + re.escape(json.dumps(fragment)), re.M)
        matches = list(pattern.finditer(text))
        require(len(matches) == 1, f"manifest.json: ambiguous/non-compact entry {fragment}")
        match = matches[0]
        start = match.start() + len(match.group(1))
        entry, end = decoder.raw_decode(text, start)
        require(entry in data["fragments"] and entry["file"] == fragment, "manifest.json: entry mismatch")
        tail = re.match(r"[ \t]*,[ \t]*(?:\r?\n|$)", text[end:])
        require(tail is not None, f"manifest.json: owned entry must occupy complete comma-terminated lines: {fragment}")
        spans.append((match.start(), end + tail.end()))
    result = text
    for start, end in sorted(spans, reverse=True):
        result = result[:start] + result[end:]
    hash_pattern = re.compile(r'("expect_sha256"\s*:\s*")[^"]*(")')
    require(len(hash_pattern.findall(result)) == 1, "manifest.json: expected one expect_sha256")
    result = hash_pattern.sub(lambda match: match.group(1) + resulting_sha + match.group(2), result)
    expected = dict(data, fragments=[entry for entry in data["fragments"] if entry["file"] not in FRAGMENTS],
                    expect_sha256=resulting_sha)
    require(parse_manifest(result) == expected, "manifest.json: surgery changed unrelated content")
    return result


def prepare(candidate: Path, expect_sha: str | None = None):
    root = validate_root(candidate)
    manifest_path = safe_path(root, "build/manifest.json")
    manifest_text = read_exact(manifest_path)
    manifest = parse_manifest(manifest_text)
    for relative in FRAGMENTS:
        text = read_exact(safe_path(root, relative))
        names = marker_names(text)
        require(MARKER in names and all(name == MARKER for name in names) and OWN_RE.search(text),
                f"{relative}: missing own marker or foreign marker in owned file")
    stripped_manifest = strip_manifest(manifest_text)
    remaining = parse_manifest(stripped_manifest)
    chunks = []
    for entry in remaining["fragments"]:
        chunks.append(read_exact(safe_path(root, entry["file"])).encode("utf-8"))
    # Scan every retained source, including any not currently in the manifest: no hidden leaks.
    for path in (root / "src").rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(root).as_posix()
        safe_path(root, relative)
        if relative in FRAGMENTS or path.suffix not in {".js", ".css", ".html"}:
            continue
        text = read_exact(path)
        require(not OWN_RE.search(text) and not SURFACE_RE.search(text),
                f"retained source contains owned marker/surface: {relative}")
    output = manifest.get("output")
    require(isinstance(output, str), "manifest.json: missing output path")
    safe_path(root, output, must_exist=False)
    raw = b"\n".join(chunks)
    digest = hashlib.sha256(raw).hexdigest()
    require(expect_sha is None or digest == expect_sha,
            f"planned rebuild {digest} does not match required {expect_sha}; nothing written")
    changes = {"build/manifest.json": strip_manifest(manifest_text, digest)}
    return root, changes, digest, len(raw)


def remove(candidate: Path, *, dry_run: bool = False, expect_sha: str | None = None):
    root, changes, digest, size = prepare(candidate, expect_sha)
    if not dry_run:
        for relative, text in changes.items():
            write_exact(root / relative, text)
        for relative in FRAGMENTS:
            (root / relative).unlink()
    return {"root": str(root), "dry_run": dry_run, "removed": list(FRAGMENTS),
            "edited": list(changes), "rebuild_sha256": digest, "rebuild_bytes": size}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("copy", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--expect-sha", help="optional exact rebuild requirement, checked BEFORE all writes")
    args = parser.parse_args()
    try:
        print(json.dumps(remove(args.copy, dry_run=args.dry_run, expect_sha=args.expect_sha), indent=2))
        print("Nothing written." if args.dry_run else "Surgical removal complete. Rebuild this scratch copy next.")
        return 0
    except (RemovalError, OSError, UnicodeError) as error:
        print(f"REFUSED: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
