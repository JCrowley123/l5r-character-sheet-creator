#!/usr/bin/env python3
"""Remove the Disadvantages point release, or one isolated component, from a copy.

    python qa/remove-phase.py COPY --scope all --expect-sha 4355dec4...
    python qa/remove-phase.py COPY --scope phobia

All ownership, paths, fragments, manifest entries and an optional expected rebuild
hash are checked before any write. This is surgical deletion, never a whole-file
snapshot restore. The live Phase 0 source is deliberately refused.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys


PRE_EXPANSION_SHA = "4355dec4b219883bb041e48a02773af3006d762fa6b48f35b9c273d429553481"
PRE_EXPANSION_BYTES = 2428891
COMPONENTS = {
    "core": ("PART I FEATURE 4.52", ("src/sheet/209.85-feat-disadv-config.js", "src/css/55-disadv-config.css")),
    "phobia": ("PART I FEATURE 4.521", ("src/sheet/209.86-feat-disadv-phobia.js", "src/css/56-disadv-phobia.css")),
    "nemesis": ("PART I FEATURE 4.522", ("src/sheet/209.87-feat-disadv-nemesis.js", "src/css/57-disadv-nemesis.css")),
    "gates": ("PART I FEATURE 4.523", ("src/sheet/209.88-feat-disadv-gates.js",)),
}
MARKER_RE = re.compile(r"\b(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+[\d.]+|BUGFIX)\b", re.I)
BEGIN_RE = re.compile(r"\b(PART I FEATURE 4\.52[123]?)\s+BEGIN\s+([a-z][a-z0-9-]*)\b")
END_RE = re.compile(r"\bEND DISADV45\s+([a-z][a-z0-9-]*)\b")
HAND_BACK_RE = re.compile(r"\(continued after DISADV45 ([a-z][a-z0-9-]*)\)")
SOURCE_EXTENSIONS = {".js", ".css", ".html"}


class RemovalError(ValueError):
    """A changed or unsafe removal target; no best-effort guessing is allowed."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RemovalError(message)


def marker_of(line: str) -> str | None:
    match = MARKER_RE.search(line)
    return re.sub(r"\s+", " ", match.group(1).upper()) if match else None


def comment_only(line: str) -> bool:
    stripped = line.strip()
    return (stripped.startswith("//") or
            (stripped.startswith("/*") and stripped.endswith("*/")) or
            (stripped.startswith("<!--") and stripped.endswith("-->")))


def strip_owned_blocks(text: str, markers: set[str], label: str) -> tuple[str, list[str]]:
    """Cut explicit insertions, including an asserted synthetic ownership hand-back.

    Exact numeric tokens distinguish this release from both the existing modal
    phase and its individually removable components. A foreign marker anywhere
    inside an insertion is an error. A hand-back is allowed only on the following
    comment-only line and must match the owner before the insertion.
    """
    lines = text.splitlines(keepends=True)
    output: list[str] = []
    removed: list[str] = []
    seen: set[str] = set()
    owner = None
    index = 0
    while index < len(lines):
        line = lines[index]
        start = BEGIN_RE.search(line)
        if not start:
            require(not END_RE.search(line), f"{label}:{index + 1}: orphan END DISADV45")
            require(not HAND_BACK_RE.search(line), f"{label}:{index + 1}: orphan ownership hand-back")
            found = marker_of(line)
            if found:
                require(found not in markers,
                        f"{label}:{index + 1}: selected marker outside a paired insertion")
                owner = found
            output.append(line)
            index += 1
            continue

        scope, key = start.groups()
        require(comment_only(line), f"{label}:{index + 1}: BEGIN must be on its own comment line")
        require(key not in seen, f"{label}: duplicate insertion identifier {key}")
        seen.add(key)
        stop = index + 1
        while stop < len(lines) and not END_RE.search(lines[stop]):
            require(not BEGIN_RE.search(lines[stop]), f"{label}:{stop + 1}: nested insertion")
            found = marker_of(lines[stop])
            require(found is None or found == scope,
                    f"{label}:{stop + 1}: foreign marker inside {key}: {found}")
            stop += 1
        require(stop < len(lines), f"{label}: insertion {key} has no END")
        end = END_RE.search(lines[stop])
        require(end is not None and end.group(1) == key,
                f"{label}:{stop + 1}: mismatched END for {key}")
        require(comment_only(lines[stop]), f"{label}:{stop + 1}: END must be a comment-only line")
        require(marker_of(lines[stop]) in {None, scope},
                f"{label}:{stop + 1}: foreign marker on insertion END")
        stop += 1

        if stop < len(lines) and HAND_BACK_RE.search(lines[stop]):
            hand_back = HAND_BACK_RE.search(lines[stop])
            require(hand_back is not None and hand_back.group(1) == key,
                    f"{label}:{stop + 1}: wrong hand-back identifier")
            require(comment_only(lines[stop]) and marker_of(lines[stop]) == owner,
                    f"{label}:{stop + 1}: ownership hand-back does not match preceding owner {owner}")
            stop += 1
        elif owner is not None:
            # An existing next marker can resume ownership without adding a line.
            next_nonblank = next((item for item in lines[stop:] if item.strip()), "")
            require(marker_of(next_nonblank) is not None,
                    f"{label}: insertion {key} must explicitly hand ownership back")

        if scope in markers:
            removed.append(key)
        else:
            output.extend(lines[index:stop])
        index = stop
    return "".join(output), removed


def strip_manifest(text: str, fragments: set[str]) -> str:
    """Remove only each selected short manifest object, preserving every other byte."""
    parsed = json.loads(text)
    for fragment in fragments:
        require(sum(item.get("file") == fragment for item in parsed["fragments"]) == 1,
                f"manifest must contain exactly one {fragment}")
    lines = text.splitlines(keepends=True)
    spans = []
    for fragment in sorted(fragments):
        literal = '"file": "' + fragment + '"'
        starts = [i for i, line in enumerate(lines) if literal in line]
        require(len(starts) == 1, f"manifest entry shape changed: {fragment}")
        start = starts[0]
        require(re.match(r'^\s*\{\s*"file"\s*:', lines[start]) is not None,
                f"manifest entry must start on its own line: {fragment}")
        stop = next((i + 1 for i in range(start, min(start + 5, len(lines)))
                     if re.search(r"\},\s*$", lines[i])), None)
        require(stop is not None, f"manifest entry is not the expected short object: {fragment}")
        item = json.loads("".join(lines[start:stop]).strip().rstrip(","))
        require(item.get("file") == fragment and set(item) <= {"file", "note", "lines"},
                f"unexpected data in manifest object: {fragment}")
        spans.append((start, stop))
    for start, stop in sorted(spans, reverse=True):
        del lines[start:stop]
    result = "".join(lines)
    require([f["file"] for f in json.loads(result)["fragments"]] ==
            [f["file"] for f in parsed["fragments"] if f["file"] not in fragments],
            "manifest removal changed an unrelated fragment or its order")
    return result


def replace_manifest_hash(text: str, digest: str) -> str:
    pattern = re.compile(r'("expect_sha256"\s*:\s*")[0-9a-f]{64}(")')
    require(len(pattern.findall(text)) == 1, "manifest must have one SHA-256 field")
    return pattern.sub(lambda match: match.group(1) + digest + match.group(2), text)


def safe_root(raw: str) -> Path:
    supplied = Path(raw).absolute()
    require(not supplied.is_symlink(), "copy root must not be a symlink")
    root = supplied.resolve(strict=True)
    versions = Path(__file__).resolve().parents[2]
    live = (versions / "Part F — Cross-Platform Delivery" /
            "PART F — Phase 0 Source Reorganization for Maintainability").resolve()
    require(root != live and root not in live.parents and live not in root.parents,
            "the live source tree, its parents and its descendants are not removal targets")
    require((root / "build/manifest.json").is_file() and (root / "src").is_dir(),
            "supply the root of a copied Phase 0 tree")
    return root


def safe_file(root: Path, relative: str) -> Path:
    part = Path(relative)
    require(not part.is_absolute() and ".." not in part.parts, f"unsafe relative path: {relative}")
    target = root / part
    current = root
    for piece in part.parts:
        current /= piece
        require(not current.is_symlink(), f"symlink in target path: {relative}")
    resolved = target.resolve()
    require(resolved.is_relative_to(root), f"target escapes copy: {relative}")
    return target


def plan_removal(root: Path, scope: str, expected: str | None = None) -> dict:
    keys = list(COMPONENTS) if scope == "all" else [scope]
    fragments = {fragment for key in keys for fragment in COMPONENTS[key][1]
                 if (root / fragment).exists()}
    require(fragments, f"no {scope} fragment is present")
    markers = {COMPONENTS[key][0] for key in keys}
    changes: dict[str, bytes] = {}
    deletions = sorted(fragments)
    block_report: dict[str, list[str]] = {}
    for fragment in fragments:
        path = safe_file(root, fragment)
        text = path.read_bytes().decode("utf-8")
        allowed = markers
        for number, line in enumerate(text.splitlines(), 1):
            found = marker_of(line)
            require(found is None or found in allowed,
                    f"{fragment}:{number}: foreign marker in a whole-fragment deletion: {found}")
        require(any(marker_of(line) in markers for line in text.splitlines()),
                f"{fragment}: missing its owner marker")

    for path in sorted((root / "src").rglob("*")):
        if not path.is_file() or path.suffix not in SOURCE_EXTENSIONS:
            continue
        relative = path.relative_to(root).as_posix()
        safe_file(root, relative)
        if relative in fragments:
            continue
        raw = path.read_bytes()
        stripped, removed = strip_owned_blocks(raw.decode("utf-8"), markers, relative)
        if removed:
            changes[relative] = stripped.encode("utf-8")
            block_report[relative] = removed

    manifest_path = safe_file(root, "build/manifest.json")
    manifest_text = strip_manifest(manifest_path.read_bytes().decode("utf-8"), fragments)
    manifest = json.loads(manifest_text)
    chunks = []
    for item in manifest["fragments"]:
        relative = item["file"]
        path = safe_file(root, relative)
        require(path.is_file(), f"remaining fragment is absent: {relative}")
        chunks.append(changes.get(relative, path.read_bytes()))
    assembled = b"\n".join(chunks)
    digest = hashlib.sha256(assembled).hexdigest()
    require(expected is None or digest == expected,
            f"projected rebuild hash {digest} does not match expected {expected}; nothing was changed")
    manifest_text = replace_manifest_hash(manifest_text, digest)
    changes["build/manifest.json"] = manifest_text.encode("utf-8")
    return {"changes": changes, "deletions": deletions, "blocks": block_report,
            "sha256": digest, "bytes": len(assembled), "output": manifest["output"]}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("copy", help="a disposable Phase 0 copy; never the live source")
    parser.add_argument("--scope", choices=["all", "core", "phobia", "nemesis", "gates"], default="all")
    parser.add_argument("--expect-sha", help="independent expected hash; checked before all writes")
    parser.add_argument("--dry-run", action="store_true", help="validate and report without changing the copy")
    args = parser.parse_args()
    try:
        root = safe_root(args.copy)
        expected = args.expect_sha
        if expected:
            require(re.fullmatch(r"[0-9a-f]{64}", expected) is not None, "expected hash must be SHA-256")
        plan = plan_removal(root, args.scope, expected)
        print("copy   :", root)
        print("scope  :", args.scope)
        for relative, blocks in plan["blocks"].items():
            print("blocks :", relative, ", ".join(blocks))
        for relative in plan["deletions"]:
            print("remove :", relative)
        print("bytes  :", plan["bytes"])
        print("sha256 :", plan["sha256"])
        print("proof  :", "matches independent expected hash" if expected else "projected hash only; compare with independent baseline")
        if args.dry_run:
            print("DRY RUN: all checks passed; no files changed")
            return 0
        for relative, raw in plan["changes"].items():
            safe_file(root, relative).write_bytes(raw)
        for relative in plan["deletions"]:
            safe_file(root, relative).unlink()
        print("Removal complete. Rebuild this copy, then run the retained phase harnesses.")
        return 0
    except (RemovalError, OSError, UnicodeError, json.JSONDecodeError) as error:
        print("REFUSING:", error, file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
