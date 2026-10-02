#!/usr/bin/env python3
"""Surgical removal of BUGFIX — Rank 0 Skill Rolls Explode. Refuses live trees and unsafe paths.
Removes only this fragment, its manifest entry and owned blocks; restores the original
pipeline expression for the dice-pool replacement, preserving all surrounding bytes."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

MARKER = "BUGFIX"
FRAGMENTS = (
    "src/sheet/209.999997-bugfix-rank-zero.js",
)
SHARED_BLOCKS = {"src/sheet/210-test-seam-and-init.js": ("rank-zero-seam",)}
SHARED_FILES = tuple(SHARED_BLOCKS)
PRE_RELEASE_SHA = '319f4f48b81b132b696fdf0bfcf330e2ce9fb2faa6d45b5b6fb03c0556c80f7c'
PRE_RELEASE_BYTES = 3479860
PRE_RELEASE_COMMIT = "6e6da0b"
MARKER_RE = re.compile(r"\b(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+\d+(?:\.\d+)*|BUGFIX)\b", re.I)
OWN_RE = re.compile('\\bBUGFIX\\s+RANKZERO(?![\\w.])', re.I)
BEGIN_RE = re.compile('^\\s*// BUGFIX\\s+RANKZERO BEGIN ([a-z][a-z0-9-]*)\\s*$')
END_RE = re.compile(r"^\s*// END RANKZERO ([a-z][a-z0-9-]*)\s*$")
OWN_END_RE = re.compile(r"\bEND\s+RANKZERO\b", re.I)
# The phase's whole surface: its switch, its API object and the names it declares. It rebinds
# refreshAdvConfigControl, makeEntry, collectData, applyData, MODES12.set and CW112.finish; those names belong to others.
SURFACE_RE = re.compile('\\b(?:RANKZERO|RANKZERO_ENABLED|rankzero[A-Z][A-Za-z]*)\\b')


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
    # Versions/ is found by walking up to the ledger, never by counting parents, so a Part I
    # wrapper folder added later does not move it.
    for directory in Path(__file__).resolve().parents:
        if (directory / "BUILD-LEDGER.md").is_file() and (directory / "CLAUDE.md").is_file():
            return (directory / "Part F — Cross-Platform Delivery"
                    / "PART F — Phase 0 Source Reorganization for Maintainability").resolve()
    raise RemovalError("cannot find Versions/ above this file; refusing to run blind")


def is_link(path: Path) -> bool:
    return path.is_symlink() or (hasattr(path, "is_junction") and path.is_junction())


def validate_root(candidate: Path) -> Path:
    live = live_tree()
    require(live.is_dir() and (live / "build/manifest.json").is_file(),
            "cannot identify the live Phase 0 tree; refusing to run blind")
    require(not is_link(candidate.absolute()), "scratch root must not be a symbolic link or junction")
    root = candidate.resolve()
    require(not (root == live or root in live.parents or live in root.parents),
            "refusing the live Phase 0 tree or any ancestor/descendant; pass an external scratch copy")
    require(root.is_dir(), f"scratch copy is not a directory: {root}")
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
    if target.is_file():
        # A hard link is the same file under another name, so writing the scratch copy would write
        # whatever it is linked to -- possibly a live source under a different name.
        require(target.stat().st_nlink == 1, f"scratch file is hard-linked elsewhere: {relative}")
        live_target = live_tree() / relative_path
        if live_target.is_file():
            require(not target.samefile(live_target), f"scratch file aliases the live file: {relative}")
    return target


def marker_names(line: str) -> list[str]:
    return [re.sub(r"\s+", " ", hit.group(1).upper()) for hit in MARKER_RE.finditer(line)]


def strip_owned_blocks(text: str, label: str,
                       expected: tuple[str, ...] = ("rank-zero-seam",)) -> tuple[str, list[str]]:
    output, removed = [], []
    lines = text.splitlines(keepends=True)
    active = None
    for number, line in enumerate(lines, 1):
        begin, end = BEGIN_RE.fullmatch(line.rstrip("\r\n")), END_RE.fullmatch(line.rstrip("\r\n"))
        if begin:
            slug = begin.group(1)
            require(active is None, f"{label}:{number}: nested BEGIN")
            require(slug in expected and slug not in removed,
                    f"{label}:{number}: unexpected or duplicate block {slug}")
            active = slug
            continue
        if end:
            require(active is not None, f"{label}:{number}: orphan END RANKZERO")
            require(end.group(1) == active, f"{label}:{number}: mismatched END slug")
            removed.append(active)
            active = None
            continue
        require(not OWN_END_RE.search(line), f"{label}:{number}: partial or unrecognised END marker")
        # Marker-shaped prose counts too: no line inside an owned block may name any marker, so a
        # line mentioning another bugfix is refused rather than swallowed.
        if active:
            require(not marker_names(line), f"{label}:{number}: foreign or nested marker inside owned block")
        else:
            require(not OWN_RE.search(line),
                    f"{label}:{number}: partial or unrecognised owned marker")
            output.append(line)
    require(active is None, f"{label}: unclosed owned block {active}")
    require(sorted(removed) == sorted(expected), f"{label}: missing expected blocks {expected}")
    return "".join(output), removed


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
        require(all(not re.search(r'\bBUGFIX\b', line, re.I) or OWN_RE.search(line)
                    for line in text.splitlines()), f"{relative}: foreign bugfix marker")
        require(MARKER in names and all(name == MARKER for name in names) and OWN_RE.search(text),
                f"{relative}: missing own marker or foreign marker in owned fragment")
    changes = {}
    for relative, slugs in SHARED_BLOCKS.items():
        changes[relative], _ = strip_owned_blocks(read_exact(safe_path(root, relative)), relative, slugs)
    stripped_manifest = strip_manifest(manifest_text)
    remaining = parse_manifest(stripped_manifest)
    chunks = []
    for entry in remaining["fragments"]:
        relative = entry["file"]
        path = safe_path(root, relative)
        text = changes.get(relative, read_exact(path))
        chunks.append(text.encode("utf-8"))
    # Scan every retained source, including any not currently in the manifest: no hidden leaks.
    for path in (root / "src").rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(root).as_posix()
        safe_path(root, relative)
        if relative in FRAGMENTS or path.suffix not in {".js", ".css", ".html"}:
            continue
        text = changes.get(relative, read_exact(path))
        require(not OWN_RE.search(text) and not SURFACE_RE.search(text),
                f"retained source contains owned marker/surface: {relative}")
    output = manifest.get("output")
    require(isinstance(output, str), "manifest.json: missing output path")
    safe_path(root, output, must_exist=False)
    raw = b"\n".join(chunks)
    digest = hashlib.sha256(raw).hexdigest()
    require(expect_sha is None or digest == expect_sha,
            f"planned rebuild {digest} does not match required {expect_sha}; nothing written")
    changes["build/manifest.json"] = strip_manifest(manifest_text, digest)
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
