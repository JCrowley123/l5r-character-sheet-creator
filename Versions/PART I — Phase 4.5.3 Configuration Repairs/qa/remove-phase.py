#!/usr/bin/env python3
"""Remove Part I Feature 4.53 (Configuration Repairs) from a COPY of the Phase 0 tree.

    python qa/remove-phase.py COPY
    python qa/remove-phase.py COPY --expect-sha 27b57eff...

This is surgical deletion, not a whole-file snapshot restore: it deletes this
release's own fragment, its manifest entry, and only the blocks its own BEGIN/END
delimiters enclose. Everything is validated before a single byte is written, and
the live Phase 0 source tree is deliberately refused so a mistyped path cannot
damage the working copy.

The design follows Phase 4.5.2's remover deliberately. Explicit BEGIN/END
delimiters are used in preference to "this marker owns everything until the next
one", because that weaker rule is what let Phase 4 silently take ownership of four
of Phase 3's CSS rules -- see CLAUDE.md, "Re-verify removability at the END of a
phase".
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

MARKER = "PART I FEATURE 4.53"
FRAGMENT = "src/sheet/209.89-feat-adv-config-repairs.js"
SHARED_FILES = (
    "src/sheet/210-test-seam-and-init.js",
    "src/sheet/209.8-feat-adv-config.js",
)
# The build this release was added on top of, and the build its removal must reproduce.
PRE_RELEASE_SHA = "27b57eff316ee6f34f528e055a8d8adda6bb0d60ed7a951519ec12af35122ff2"
PRE_RELEASE_BYTES = 2476062

MARKER_RE = re.compile(r"\b(PART\s+[A-Z]+\s+(?:PHASE|FEATURE)\s+[\d.]+|BUGFIX)\b", re.I)
BEGIN_RE = re.compile(r"\b" + MARKER.replace(".", r"\.") + r"\s+BEGIN\s+([a-z][a-z0-9-]*)\b")
END_RE = re.compile(r"\bEND REPAIRS453\s+([a-z][a-z0-9-]*)\b")


class RemovalError(ValueError):
    """A changed or unsafe removal target. No best-effort guessing is allowed."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RemovalError(message)


# Read and write with newline translation OFF in both directions. This repository is
# configured core.autocrlf false precisely so line endings round-trip byte for byte, and a
# removal that silently normalised them would break every recorded sha256 restore point.
# Path.read_text(newline=...) is 3.13+, so the plain open() form is used instead.
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

    A foreign phase's marker appearing anywhere INSIDE one of our blocks is a hard
    error rather than something to delete quietly: it would mean this release had
    taken ownership of another phase's code, which is precisely the failure the
    end-of-phase re-verification rule exists to catch.
    """
    lines = text.splitlines(keepends=True)
    output: list[str] = []
    removed: list[str] = []
    index = 0
    while index < len(lines):
        line = lines[index]
        start = BEGIN_RE.search(line)
        if not start:
            require(not END_RE.search(line), f"{label}:{index + 1}: orphan END REPAIRS453")
            output.append(line)
            index += 1
            continue
        slug = start.group(1)
        index += 1
        body: list[str] = []
        closed = False
        while index < len(lines):
            current = lines[index]
            end = END_RE.search(current)
            if end:
                require(end.group(1) == slug,
                        f"{label}:{index + 1}: END REPAIRS453 {end.group(1)} closes BEGIN {slug}")
                closed = True
                index += 1
                break
            found = marker_of(current)
            require(found is None or found == MARKER.upper(),
                    f"{label}:{index + 1}: foreign marker {found} inside {MARKER} block {slug}")
            body.append(current)
            index += 1
        require(closed, f"{label}: BEGIN {slug} is never closed")
        removed.append(slug)
    return "".join(output), removed


def strip_manifest(text: str) -> str:
    data = json.loads(text)
    before = len(data["fragments"])
    kept = [entry for entry in data["fragments"] if entry.get("file") != FRAGMENT]
    require(len(kept) == before - 1,
            f"manifest.json: expected exactly one {FRAGMENT} entry, found {before - len(kept)}")
    # Rewritten by line surgery rather than json.dumps, so every unrelated entry keeps its
    # original spacing and the removal can still be byte-identical.
    lines = text.splitlines(keepends=True)
    output: list[str] = []
    index = 0
    cut = 0
    while index < len(lines):
        if FRAGMENT in lines[index]:
            start = index
            while index < len(lines) and not lines[index].rstrip().endswith("},"):
                index += 1
            require(index < len(lines), "manifest.json: unterminated fragment entry")
            index += 1
            cut += 1
            del start
            continue
        output.append(lines[index])
        index += 1
    require(cut == 1, f"manifest.json: cut {cut} entries, expected 1")
    text = "".join(output)

    # Point expect_sha256 back at the pre-release build too. Without this the rolled-back tree is
    # self-inconsistent: recombine.py --verify would compare the restored output against the hash
    # of the build this release produced and report a failure that is not one. The manifest is not
    # part of the build output, so this does not affect the byte-identity check on the HTML.
    current = json.loads(text).get("expect_sha256")
    if current and current != PRE_RELEASE_SHA:
        text = text.replace(f'"expect_sha256": "{current}"', f'"expect_sha256": "{PRE_RELEASE_SHA}"', 1)
        require(json.loads(text).get("expect_sha256") == PRE_RELEASE_SHA,
                "manifest.json: could not restore expect_sha256")
    return text


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("copy", type=Path, help="a COPY of the Phase 0 tree")
    parser.add_argument("--expect-sha", default=None,
                        help="require the rebuilt output to hash to this (default: the recorded pre-release build)")
    parser.add_argument("--dry-run", action="store_true", help="validate and report, write nothing")
    arguments = parser.parse_args()

    root = arguments.copy.resolve()
    require(root.is_dir(), f"{root} is not a directory")

    # Refuse the live tree. Resolved on both sides so a symlink or a relative path cannot
    # sneak past the comparison.
    live = (Path(__file__).resolve().parents[3] / "Part F — Cross-Platform Delivery"
            / "PART F — Phase 0 Source Reorganization for Maintainability").resolve()
    require(root != live, f"refusing to edit the live Phase 0 tree at {live}; pass a copy")

    fragment = root / FRAGMENT
    require(fragment.is_file(), f"missing {FRAGMENT} -- is this release present in {root}?")

    planned: list[tuple[Path, str, list[str]]] = []
    for relative in SHARED_FILES:
        target = root / relative
        require(target.is_file(), f"missing {relative}")
        original = read_exact(target)
        stripped, removed = strip_owned_blocks(original, relative)
        require(removed, f"{relative}: no {MARKER} block found; nothing to remove")
        planned.append((target, stripped, removed))

    manifest_path = root / "build" / "manifest.json"
    require(manifest_path.is_file(), "missing build/manifest.json")
    manifest_stripped = strip_manifest(read_exact(manifest_path))

    for target, _, removed in planned:
        print(f"  {target.relative_to(root)}: {', '.join(removed)}")
    print(f"  {FRAGMENT}: whole fragment")
    print("  build/manifest.json: 1 entry")

    if arguments.dry_run:
        print("dry run -- nothing written")
        return 0

    for target, stripped, _ in planned:
        write_exact(target, stripped)
    write_exact(manifest_path, manifest_stripped)
    fragment.unlink()

    # No marker of this release may survive anywhere in the tree's sources.
    for path in sorted(root.glob("src/**/*")):
        if path.suffix in {".js", ".css", ".html"} and MARKER.lower() in path.read_text(
                encoding="utf-8", errors="ignore").lower():
            raise RemovalError(f"{path.relative_to(root)} still mentions {MARKER} after removal")

    rebuilt = root / "l5r-character-sheet.html"
    if rebuilt.exists():
        rebuilt.unlink()
    import subprocess
    subprocess.run([sys.executable, str(root / "build" / "recombine.py")], check=True,
                   capture_output=True)
    digest = hashlib.sha256(rebuilt.read_bytes()).hexdigest()
    size = rebuilt.stat().st_size
    print(f"rebuilt: {size} bytes, sha256 {digest}")

    expected = arguments.expect_sha or PRE_RELEASE_SHA
    if expected:
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
