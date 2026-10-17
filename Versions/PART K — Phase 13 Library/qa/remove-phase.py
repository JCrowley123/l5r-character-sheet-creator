#!/usr/bin/env python3
"""Surgical removal of PART K — Phase 13 Library.
Refuses live trees and unsafe paths. Removes this layer's script, stylesheet and boundary fragments, the verbatim PDF.js
files and their licences (checked by SHA-256: vendor files cannot carry a marker), their manifest entries and its one
marked block (the seam), preserving all surrounding bytes. Adapted from Phase 4.5.36's remover (constants, plus VENDOR)."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

# ---- This release ----
MARKER = "PART K PHASE 13"
TAG = "LIB13"
FRAGMENTS = ("src/sheet/209.99999999991-feat-library.js", "src/sheet/209.99999999992-feat-library-page.js",
             "src/css/59.9999892-feat-library.css", "src/vendor/13-library-vendor-open.html",
             "src/vendor/13-library-vendor-worker.html", "src/vendor/13-library-vendor-jpx.html",
             "src/vendor/13-library-vendor-nowasm.html", "src/vendor/13-library-vendor-close.html")
# Verbatim third-party files (in the manifest) and their licences (not in it), pinned by SHA-256.
VENDOR = {"src/vendor/pdfjs-6.4.299-pdf.min.mjs": "bccc24ea711db8e44503629519904a5292d73b9daaa214bbe7cdcc282b0f4259",
          "src/vendor/pdfjs-6.4.299-pdf.worker.min.mjs": "145d2dd3ab0c86151011dba95acfa2d5336e2accd59388ea43dbee0efddaaec6",
          "src/vendor/pdfjs-6.4.299-openjpeg.wasm.b64": "7fb1fc8d27f169d39579c074066282a84c6db7ac33736d4ff7e3eb2a500c2f17",
          "src/vendor/pdfjs-6.4.299-openjpeg_nowasm_fallback.js": "9047b34b6bc142d85e4b0aa1b08b0b9baad4c6f8b7ac87641b9e8f90eb6fd23e"}
LICENSES = {"src/vendor/licenses/PDFJS-LICENSE": "0d542e0c8804e39aa7f37eb00da5a762149dc682d7829451287e11b938e94594",
            "src/vendor/licenses/LICENSE_OPENJPEG": "a6af136f3e15038a666b61f376612a07d9a4e48cb7c01adbf3e33b3f14ab49b6",
            "src/vendor/licenses/LICENSE_PDFJS_OPENJPEG": "717fc62da03292dbb4dd0c8280bd4ce7bb8550dcf31d772bc93455fb50313425"}
IN_MANIFEST = FRAGMENTS + tuple(VENDOR)
OWNED_DIRS = ("src/vendor/licenses", "src/vendor")
SHARED_BLOCKS = {"src/sheet/210-test-seam-and-init.js": ("library-seam",)}
HANDBACK = {}
SURFACE_RE = re.compile(r"\b(?:LIBRARY_ENABLED|LIBRARY_PAGE_ENABLED|LIB13|LIBPAGE13|lib13\w*)\b|\bl13-")
OWN_RE = re.compile(r"\bPART\s+K\s+PHASE\s+13(?![.\d])", re.I)
PRE_RELEASE_SHA = "f39a31cbe31e9e8ad923f557275e1d613920fe98868a67ccc74cdd342fd3fec0"
PRE_RELEASE_BYTES = 3935889
# ---- Common ----
MARKER_RE = re.compile(r"\b(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+\d+(?:\.\d+)*|BUGFIX(?:\s+[A-Z][A-Z0-9]*)?)\b", re.I)
BEGIN_RE = re.compile(r"^\s*(?://|/\*) " + re.escape(MARKER) + r" BEGIN ([a-z][a-z0-9-]*)\s*(?:\*/)?\s*$")
END_RE = re.compile(r"^[ \t]*(?://|/\*) END " + TAG + r" ([a-z][a-z0-9-]*)( // .+?| \*/ /\* .+? \*/)?[ \t]*(?:\*/)?[ \t]*$")
OWN_END_RE = re.compile(r"\bEND\s+" + TAG + r"\b", re.I)


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
    # Versions/ is found by walking up to the ledger, never by counting parents.
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
    require(target.resolve() != root and root in target.resolve().parents, f"path escapes scratch copy: {relative}")
    for part in [target, *target.parents]:
        if part == root:
            break
        require(not is_link(part), f"symbolic link/junction in scratch path: {relative}")
    require(not must_exist or target.is_file(), f"missing {relative}")
    if target.is_file():
        require(target.stat().st_nlink == 1, f"scratch file is hard-linked elsewhere: {relative}")
        live_target = live_tree() / relative_path
        if live_target.is_file():
            require(not target.samefile(live_target), f"scratch file aliases the live file: {relative}")
    return target


def marker_names(line: str) -> list[str]:
    return [re.sub(r"\s+", " ", hit.group(1).upper()) for hit in MARKER_RE.finditer(line)]


def strip_owned_blocks(text: str, label: str, expected: tuple[str, ...]) -> str:
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
            require(active is not None, f"{label}:{number}: orphan END {TAG}")
            require(end.group(1) == active, f"{label}:{number}: mismatched END slug")
            require((end.group(2) or "") == HANDBACK.get(active, ""),
                    f"{label}:{number}: END line hand-back does not match the declared one")
            removed.append(active)
            active = None
            continue
        require(not OWN_END_RE.search(line), f"{label}:{number}: partial or unrecognised END marker")
        if active:
            # No line inside an owned block may name any marker, so a foreign block is refused, never swallowed.
            require(not marker_names(line), f"{label}:{number}: foreign or nested marker inside owned block")
        else:
            require(not OWN_RE.search(line), f"{label}:{number}: partial or unrecognised owned marker")
            output.append(line)
    require(active is None, f"{label}: unclosed owned block {active}")
    require(sorted(removed) == sorted(expected), f"{label}: missing expected blocks {expected}")
    return "".join(output)


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
    require(all(isinstance(p, str) for p in paths), "manifest.json: invalid fragment file")
    require(len(paths) == len(set(paths)), "manifest.json: duplicate fragment entries")
    return data


def strip_manifest(text: str, resulting_sha: str) -> str:
    data = parse_manifest(text)
    paths = [entry["file"] for entry in data["fragments"]]
    require(all(paths.count(fragment) == 1 for fragment in IN_MANIFEST), "manifest.json: missing owned entry")
    decoder = json.JSONDecoder(object_pairs_hook=no_duplicate_keys)
    spans = []
    for fragment in IN_MANIFEST:
        pattern = re.compile(r'^([ \t]*)\{[ \t]*"file"[ \t]*:[ \t]*' + re.escape(json.dumps(fragment)), re.M)
        matches = list(pattern.finditer(text))
        require(len(matches) == 1, f"manifest.json: ambiguous/non-compact entry {fragment}")
        match = matches[0]
        entry, end = decoder.raw_decode(text, match.start() + len(match.group(1)))
        require(entry in data["fragments"] and entry["file"] == fragment, "manifest.json: entry mismatch")
        tail = re.match(r"[ \t]*,[ \t]*(?:\r?\n|$)", text[end:])
        require(tail is not None, f"manifest.json: owned entry must occupy complete comma-terminated lines: {fragment}")
        spans.append((match.start(), end + tail.end()))
    result = text
    for start, end in sorted(spans, reverse=True):
        result = result[:start] + result[end:]
    hash_pattern = re.compile(r'("expect_sha256"\s*:\s*")[^"]*(")')
    require(len(hash_pattern.findall(result)) == 1, "manifest.json: expected one expect_sha256")
    result = hash_pattern.sub(lambda m: m.group(1) + resulting_sha + m.group(2), result)
    expected = dict(data, fragments=[e for e in data["fragments"] if e["file"] not in IN_MANIFEST], expect_sha256=resulting_sha)
    require(parse_manifest(result) == expected, "manifest.json: surgery changed unrelated content")
    return result


def prepare(candidate: Path, expect_sha: str | None = None):
    root = validate_root(candidate)
    manifest_text = read_exact(safe_path(root, "build/manifest.json"))
    manifest = parse_manifest(manifest_text)
    for relative in FRAGMENTS:
        names = marker_names(read_exact(safe_path(root, relative)))
        require(MARKER in names and all(name == MARKER for name in names),
                f"{relative}: missing own marker or foreign marker in owned fragment")
    for relative, sha in {**VENDOR, **LICENSES}.items():
        require(hashlib.sha256(safe_path(root, relative).read_bytes()).hexdigest() == sha,
                f"{relative}: not the pinned verbatim file")
    changes = {relative: strip_owned_blocks(read_exact(safe_path(root, relative)), relative, slugs)
               for relative, slugs in SHARED_BLOCKS.items()}
    remaining = parse_manifest(strip_manifest(manifest_text, PRE_RELEASE_SHA))
    chunks = [changes.get(e["file"], read_exact(safe_path(root, e["file"]))).encode("utf-8") for e in remaining["fragments"]]
    # Scan every retained source, including any not currently in the manifest: no hidden leaks.
    for path in (root / "src").rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(root).as_posix()
        safe_path(root, relative)
        if relative in FRAGMENTS or relative in VENDOR or relative in LICENSES or path.suffix not in {".js", ".css", ".html"}:
            continue
        text = changes.get(relative, read_exact(path))
        require(not OWN_RE.search(text) and not SURFACE_RE.search(text),
                f"retained source contains owned marker/surface: {relative}")
    require(isinstance(manifest.get("output"), str), "manifest.json: missing output path")
    safe_path(root, manifest["output"], must_exist=False)
    raw = b"\n".join(chunks)
    digest = hashlib.sha256(raw).hexdigest()
    require(expect_sha is None or digest == expect_sha, f"planned rebuild {digest} does not match required {expect_sha}; nothing written")
    changes["build/manifest.json"] = strip_manifest(manifest_text, digest)
    return root, changes, digest, len(raw)


def remove(candidate: Path, *, dry_run: bool = False, expect_sha: str | None = None):
    root, changes, digest, size = prepare(candidate, expect_sha)
    if not dry_run:
        for relative, text in changes.items():
            write_exact(root / relative, text)
        for relative in (*FRAGMENTS, *VENDOR, *LICENSES):
            (root / relative).unlink()
        for relative in OWNED_DIRS:
            folder = root / relative
            if folder.is_dir() and not any(folder.iterdir()):
                folder.rmdir()
    return {"root": str(root), "dry_run": dry_run, "removed": [*FRAGMENTS, *VENDOR, *LICENSES], "edited": list(changes),
            "rebuild_sha256": digest, "rebuild_bytes": size}


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
