#!/usr/bin/env python3
"""Surgically remove PART K Phase 11.2.4 (Wizard Starting Spells for Every School) from a SCRATCH
COPY of the Phase 0 tree.

    python qa/remove-phase.py COPY [--dry-run] [--expect-sha SHA256]

Preflights the complete operation before writing. Only the owned fragment, its manifest line, and
the wizard5-seam block in 210-test-seam-and-init.js are removed. Phases 11.2 to 11.2.3 stay; every
School but Kitsu goes back to 11.2.2's generic Spells step. Later features are preserved; the resulting manifest hash is calculated from the
remaining fragments rather than forcing an old baseline. Rebuild the copy with its
build/recombine.py afterwards. No snapshot restore or live-tree edit exists.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

MARKER = "PART K PHASE 11.2.4"
FRAGMENTS = (
    "src/sheet/209.998-feat-wizard-starting-spells-all.js",
)
SHARED_BLOCKS = {"src/sheet/210-test-seam-and-init.js": ("wizard5-seam",)}
SHARED_FILES = tuple(SHARED_BLOCKS)
PRE_RELEASE_SHA = "63b51115800d8788a6d3392ef3af9fca988020ed8ba8cc5954c5d05ec9b6517b"
PRE_RELEASE_BYTES = 3042451
PRE_RELEASE_COMMIT = "90d3452"
MARKER_RE = re.compile(r"\b(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+\d+(?:\.\d+)*|BUGFIX)\b", re.I)
# (?![.\d]) so a later 11.2.4.x marker is never mistaken for this one; the earlier 11.2.x markers
# cannot match either, because this pattern needs the ".2.4".
OWN_RE = re.compile(r"\bPART\s+K\s+PHASE\s+11\.2\.4(?![.\d])", re.I)
BEGIN_RE = re.compile(r"^\s*// PART K PHASE 11\.2\.4 BEGIN ([a-z][a-z0-9-]*)\s*$")
END_RE = re.compile(r"^\s*// END WIZARD1124 ([a-z][a-z0-9-]*)\s*$")
OWN_END_RE = re.compile(r"\bEND\s+WIZARD1124\b", re.I)
SURFACE_RE = re.compile(r"\b(?:WIZARD_STARTING_SPELLS_ALL_ENABLED|STARTING_SPELLS_EVERY_SCHOOL|YOGO_TREATED_AS_WARDS|CW1124|cw1124[A-Za-z0-9_-]*)\b")


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
    # This file is Versions/<phase>/qa/remove-phase.py: parents[2], NOT [3], is Versions.
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


def strip_owned_blocks(text: str, label: str,
                       expected: tuple[str, ...] = ("wizard5-seam",)) -> tuple[str, list[str]]:
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
            require(active is not None, f"{label}:{number}: orphan END WIZARD1124")
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
        require(MARKER in names and all(name == MARKER for name in names),
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
