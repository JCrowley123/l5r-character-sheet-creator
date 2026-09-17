#!/usr/bin/env python3
"""Remove Part I Feature 4.5.12 (Seven Fortunes' Curse: Bishamon, D04b) from a COPY of the tree.

    python qa/remove-phase.py COPY
    python qa/remove-phase.py COPY --expect-sha 28e01755...

Surgical deletion, not a snapshot restore: it deletes this release's own two files, their
manifest entries, and only the blocks its own BEGIN/END delimiters enclose.

TWO shared files, and the second one is NEW TERRITORY for a 4.5.x release: 100-dice-engine.js,
which is TRUNK code (Part B's damage maths), not another feature phase's fragment. That is
forced rather than chosen -- rollWeaponDamage() does not go through the pre-roll modifier
pipeline at all, so the Strength contribution can only be reduced where it is computed. Both
blocks there are purely ADDITIVE: no existing line is rewritten, which is what lets this
removal rebuild byte-identical.

NOT touched here, deliberately: this release also corrected ONE check in the Seven Fortunes'
Curse (D04a) harness, which asserted Bishamon is deferred -- true only until this phase
automated it. That file lives under Versions/, not in the Phase 0 tree, and the corrected shape
reads correctly whether or not this phase is present, which is why that shape was chosen.
Removing this phase needs no edit to it. See ROLLBACK.md, "Cross-phase fixture correction".

Everything is validated before a byte is written, and the live Phase 0 tree is refused outright.

Same safety model as the D04a remover, including its FIXED live-tree guard -- which the ten
removers before it still lack. See the comment on that guard below.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

MARKER = "PART I FEATURE 4.5.12"
FRAGMENTS = (
    "src/sheet/209.98-feat-disadv-fortune-bishamon.js",
    "src/css/59.7-disadv-fortune-bishamon.css",
)
SHARED_FILES = (
    "src/sheet/210-test-seam-and-init.js",
    "src/sheet/100-dice-engine.js",
)
PRE_RELEASE_SHA = "28e017553102e860e0212869c80ef4bf90c8abe2127a35ef7b78c3e34dea76d2"
PRE_RELEASE_BYTES = 2649854
# The D04a build this release was added to. Removing this phase restores exactly that.

MARKER_RE = re.compile(r"\b(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+[\d.]+|BUGFIX)\b", re.I)
BEGIN_RE = re.compile(r"\b" + MARKER.replace(".", r"\.") + r"\s+BEGIN\s+([a-z][a-z0-9-]*)\b")
END_RE = re.compile(r"\bEND BISHAMON4512\s+([a-z][a-z0-9-]*)\b")


class RemovalError(ValueError):
    """A changed or unsafe removal target. No best-effort guessing is allowed."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RemovalError(message)


# Newline translation off in both directions: the repository is core.autocrlf false so that
# line endings round-trip byte for byte, and a removal that normalised them would break every
# recorded sha256 restore point. Path.read_text(newline=...) is 3.13+, so open() is used.
def read_exact(path: Path) -> str:
    with open(path, "r", encoding="utf-8", newline="") as handle:
        return handle.read()


def write_exact(path: Path, text: str) -> None:
    with open(path, "w", encoding="utf-8", newline="") as handle:
        handle.write(text)


def marker_of(line: str) -> str | None:
    match = MARKER_RE.search(line)
    return re.sub(r"\s+", " ", match.group(1).upper()) if match else None


def strip_owned_blocks(text: str, label: str) -> tuple[str, list[str]]:
    """Cut every BEGIN/END block this release owns, and nothing else.

    A foreign marker inside one of our blocks is a hard error, not something to
    delete quietly: it would mean this release had taken ownership of another
    phase's code, which is the exact failure the end-of-phase rule exists to catch.
    """
    lines = text.splitlines(keepends=True)
    output: list[str] = []
    removed: list[str] = []
    index = 0
    while index < len(lines):
        line = lines[index]
        start = BEGIN_RE.search(line)
        if not start:
            require(not END_RE.search(line), f"{label}:{index + 1}: orphan END BISHAMON4512")
            output.append(line)
            index += 1
            continue
        slug = start.group(1)
        index += 1
        closed = False
        while index < len(lines):
            current = lines[index]
            end = END_RE.search(current)
            if end:
                require(end.group(1) == slug,
                        f"{label}:{index + 1}: END BISHAMON4512 {end.group(1)} closes BEGIN {slug}")
                closed = True
                index += 1
                break
            found = marker_of(current)
            require(found is None or found == MARKER.upper(),
                    f"{label}:{index + 1}: foreign marker {found} inside {MARKER} block {slug}")
            index += 1
        require(closed, f"{label}: BEGIN {slug} is never closed")
        removed.append(slug)
    return "".join(output), removed


def strip_manifest(text: str) -> str:
    data = json.loads(text)
    before = len(data["fragments"])
    kept = [e for e in data["fragments"] if e.get("file") not in FRAGMENTS]
    require(len(kept) == before - len(FRAGMENTS),
            f"manifest.json: expected exactly {len(FRAGMENTS)} entries for this release, "
            f"found {before - len(kept)}")
    # Line surgery rather than json.dumps, so every unrelated entry keeps its exact bytes.
    lines = text.splitlines(keepends=True)
    output: list[str] = []
    index = 0
    cut = 0
    while index < len(lines):
        if any(fragment in lines[index] for fragment in FRAGMENTS):
            while index < len(lines) and not lines[index].rstrip().endswith("},"):
                index += 1
            require(index < len(lines), "manifest.json: unterminated fragment entry")
            index += 1
            cut += 1
            continue
        output.append(lines[index])
        index += 1
    require(cut == len(FRAGMENTS), f"manifest.json: cut {cut} entries, expected {len(FRAGMENTS)}")
    text = "".join(output)

    # Point expect_sha256 back at the pre-release build, so the rolled-back tree is
    # self-consistent under recombine.py --verify.
    current = json.loads(text).get("expect_sha256")
    if current and current != PRE_RELEASE_SHA:
        text = text.replace(f'"expect_sha256": "{current}"', f'"expect_sha256": "{PRE_RELEASE_SHA}"', 1)
        require(json.loads(text).get("expect_sha256") == PRE_RELEASE_SHA,
                "manifest.json: could not restore expect_sha256")
    return text


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("copy", type=Path, help="a COPY of the Phase 0 tree")
    parser.add_argument("--expect-sha", default=None,
                        help="require the rebuild to hash to this (default: the pre-release build)")
    parser.add_argument("--dry-run", action="store_true", help="validate and report, write nothing")
    arguments = parser.parse_args()

    root = arguments.copy.resolve()
    require(root.is_dir(), f"{root} is not a directory")

    # THE LIVE-TREE GUARD, AND WHY IT IS WRITTEN LIKE THIS.
    #
    # Every earlier Part I remover computes this as parents[3] / "Part F — …". That is WRONG and
    # the guard has never fired: this file is at Versions/PART I — <phase>/qa/remove-phase.py, so
    # parents[2] is Versions/ and parents[3] is the REPOSITORY ROOT — while "Part F — …" lives
    # under Versions/. The path it built therefore never existed, `root != live` was always true,
    # and the refusal was decorative. Found the hard way while building this phase: a run intended
    # as a demonstration of the refusal deleted this release's own two fragments and five blocks
    # out of the live tree instead. Nothing was lost (everything was recoverable) but the guard
    # that was supposed to make that impossible did nothing at all.
    #
    # Fixed here by resolving it from Versions/ (parents[2]) and, more importantly, by not
    # trusting one derived path: the marker file check below refuses ANY directory that is the
    # live tree, however the path was spelled, and refuses to proceed if it cannot identify it.
    versions = Path(__file__).resolve().parents[2]
    live = (versions / "Part F — Cross-Platform Delivery"
            / "PART F — Phase 0 Source Reorganization for Maintainability").resolve()
    require(live.is_dir(),
            f"cannot locate the live Phase 0 tree (looked in {versions}); refusing to run blind")
    require(root != live, f"refusing to edit the live Phase 0 tree at {live}; pass a copy")
    # Belt and braces: a copy made INSIDE the live tree, or the live tree reached by a symlink or a
    # different spelling, would slip past a plain inequality. Compare the real build input instead.
    live_manifest = (live / "build" / "manifest.json").resolve()
    root_manifest = (root / "build" / "manifest.json").resolve()
    require(root_manifest != live_manifest,
            f"refusing to edit the live Phase 0 tree (reached as {root}); pass a copy")

    for relative in FRAGMENTS:
        require((root / relative).is_file(),
                f"missing {relative} -- is this release present in {root}?")

    planned: list[tuple[Path, str, list[str]]] = []
    for relative in SHARED_FILES:
        target = root / relative
        require(target.is_file(), f"missing {relative}")
        stripped, removed = strip_owned_blocks(read_exact(target), relative)
        require(removed, f"{relative}: no {MARKER} block found; nothing to remove")
        planned.append((target, stripped, removed))

    manifest_path = root / "build" / "manifest.json"
    require(manifest_path.is_file(), "missing build/manifest.json")
    manifest_stripped = strip_manifest(read_exact(manifest_path))

    for target, _, removed in planned:
        print(f"  {target.relative_to(root)}: {', '.join(removed)}")
    for relative in FRAGMENTS:
        print(f"  {relative}: whole file")
    print(f"  build/manifest.json: {len(FRAGMENTS)} entries + expect_sha256")

    if arguments.dry_run:
        print("dry run -- nothing written")
        return 0

    for target, stripped, _ in planned:
        write_exact(target, stripped)
    write_exact(manifest_path, manifest_stripped)
    for relative in FRAGMENTS:
        (root / relative).unlink()

    for path in sorted(root.glob("src/**/*")):
        if path.suffix in {".js", ".css", ".html"} and MARKER.lower() in path.read_text(
                encoding="utf-8", errors="ignore").lower():
            raise RemovalError(f"{path.relative_to(root)} still mentions {MARKER} after removal")

    rebuilt = root / "l5r-character-sheet.html"
    if rebuilt.exists():
        rebuilt.unlink()
    subprocess.run([sys.executable, str(root / "build" / "recombine.py")], check=True,
                   capture_output=True)
    digest = hashlib.sha256(rebuilt.read_bytes()).hexdigest()
    size = rebuilt.stat().st_size
    print(f"rebuilt: {size} bytes, sha256 {digest}")

    expected = arguments.expect_sha or PRE_RELEASE_SHA
    require(digest == expected,
            f"rebuild is {digest} ({size} bytes); expected {expected} ({PRE_RELEASE_BYTES} bytes)")
    print("rebuild matches the recorded pre-release build exactly")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except RemovalError as error:
        print(f"REFUSED: {error}", file=sys.stderr)
        sys.exit(2)
