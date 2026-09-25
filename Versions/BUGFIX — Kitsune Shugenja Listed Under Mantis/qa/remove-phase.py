#!/usr/bin/env python3
"""Undo the Kitsune Shugenja [Mantis] removal in a SCRATCH COPY of the Phase 0 tree.

    python qa/remove-phase.py COPY [--dry-run] [--expect-sha SHA256]

The fix deleted one line from src/sheet/060-lib-schools.js. Removing the fix puts that line back,
first in the Minor Clan School library's Mantis list, where it was. Nothing else is touched. The
manifest's expect_sha256 is recalculated from the resulting fragments; --expect-sha makes the
whole operation refuse, before any write, unless the rebuild hashes to exactly that. Rebuild the
copy with its build/recombine.py afterwards. The live tree is refused.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

LIBRARY = "src/sheet/060-lib-schools.js"
LINE = ("      {name:'Kitsune Shugenja [Mantis]', benefit:'Stamina', skills:'Calligraphy, Defense, Hunting, "
        "Medicine (Herbalism), Meditation, Spellcraft, any one High or Bugei skill', honor:4.5, outfit:'Robes, "
        "Wakizashi, Knife, Scroll Satchel, Traveling Pack, 3 koku', tech:['Essence of Chikushudo'], shugenja:true, "
        "affinity:'Earth', deficiency:'Air'},\n")
ANCHOR_RE = re.compile(r"^    'Mantis': \[\n", re.M)
NEXT = "      {name:'Mantis Brawler [Bushi]',"
PRE_FIX_SHA = "72ea88b789701faa2523b9097b06805d0c5051b0850aaab926e60617a9df8668"
PRE_FIX_BYTES = 3042795
PRE_FIX_COMMIT = "bbd7624"


class RemovalError(ValueError):
    """An unsafe or changed target. Refuse rather than guess."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RemovalError(message)


def read_exact(path: Path) -> str:
    return path.read_bytes().decode("utf-8")


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
    require(not relative_path.is_absolute() and ".." not in relative_path.parts, f"unsafe relative path: {relative}")
    target = root / relative_path
    require(root in target.resolve().parents, f"path escapes scratch copy: {relative}")
    for part in [target, *target.parents]:
        if part == root:
            break
        require(not is_link(part), f"symbolic link/junction in scratch path: {relative}")
    require(not must_exist or target.is_file(), f"missing {relative}")
    live_target = live_tree() / relative_path
    if target.exists() and live_target.is_file():
        require(not target.samefile(live_target), f"scratch file aliases the live file: {relative}")
    return target


def restore_line(text: str) -> str:
    require("Kitsune Shugenja [Mantis]" not in text, f"{LIBRARY}: the School is already present")
    start = text.find("const MINOR_CLAN_SCHOOL_LIBRARY = {")
    require(start >= 0, f"{LIBRARY}: MINOR_CLAN_SCHOOL_LIBRARY not found")
    end = text.find("\n  const ", start + 1)
    require(end > start, f"{LIBRARY}: end of MINOR_CLAN_SCHOOL_LIBRARY not found")
    anchors = list(ANCHOR_RE.finditer(text))
    require(len(anchors) == 1, f"{LIBRARY}: expected exactly one Mantis School list, found {len(anchors)}")
    at = anchors[0].end()
    require(start < at < end, f"{LIBRARY}: the Mantis list is not inside MINOR_CLAN_SCHOOL_LIBRARY")
    require(text.startswith(NEXT, at), f"{LIBRARY}: the Mantis list no longer starts with Mantis Brawler [Bushi]; it has changed")
    return text[:at] + LINE + text[at:]


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
    require(all(isinstance(p, str) for p in paths) and len(paths) == len(set(paths)), "manifest.json: bad fragment list")
    require(LIBRARY in paths, f"manifest.json: {LIBRARY} is not in the build")
    return data


def with_hash(text: str, digest: str) -> str:
    data = parse_manifest(text)
    pattern = re.compile(r'("expect_sha256"\s*:\s*")[^"]*(")')
    require(len(pattern.findall(text)) == 1, "manifest.json: expected one expect_sha256")
    result = pattern.sub(lambda m: m.group(1) + digest + m.group(2), text)
    require(parse_manifest(result) == dict(data, expect_sha256=digest), "manifest.json: surgery changed unrelated content")
    return result


def prepare(candidate: Path, expect_sha: str | None = None):
    root = validate_root(candidate)
    manifest_text = read_exact(safe_path(root, "build/manifest.json"))
    manifest = parse_manifest(manifest_text)
    library = restore_line(read_exact(safe_path(root, LIBRARY)))
    chunks = []
    for entry in manifest["fragments"]:
        relative = entry["file"]
        text = library if relative == LIBRARY else read_exact(safe_path(root, relative))
        chunks.append(text.encode("utf-8"))
    safe_path(root, manifest["output"], must_exist=False)
    raw = b"\n".join(chunks)
    digest = hashlib.sha256(raw).hexdigest()
    require(expect_sha is None or digest == expect_sha,
            f"planned rebuild {digest} does not match required {expect_sha}; nothing written")
    return root, {LIBRARY: library, "build/manifest.json": with_hash(manifest_text, digest)}, digest, len(raw)


def remove(candidate: Path, *, dry_run: bool = False, expect_sha: str | None = None):
    root, changes, digest, size = prepare(candidate, expect_sha)
    if not dry_run:
        for relative, text in changes.items():
            (root / relative).write_bytes(text.encode("utf-8"))
    return {"root": str(root), "dry_run": dry_run, "edited": list(changes), "rebuild_sha256": digest, "rebuild_bytes": size}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("copy", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--expect-sha", help="optional exact rebuild requirement, checked BEFORE all writes")
    args = parser.parse_args()
    try:
        print(json.dumps(remove(args.copy, dry_run=args.dry_run, expect_sha=args.expect_sha), indent=2))
        print("Nothing written." if args.dry_run else "Fix removed: the School is back. Rebuild this scratch copy next.")
        return 0
    except (RemovalError, OSError, UnicodeError) as error:
        print(f"REFUSED: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
