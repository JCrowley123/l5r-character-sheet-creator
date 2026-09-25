#!/usr/bin/env python3
"""The one shared list of releases whose removal fixtures strip later work first.

A release's live removal fixture copies the live Phase 0 tree to a scratch folder and removes the
release from it, expecting the rebuild to hash to that release's own restore point. Anything built
AFTER the release sits in the same tree, so it has to come off first: newest first, each by its own
remover. Until 25 September 2026 every fixture carried its own hand-kept list of those later
releases (LATER_STAGES / LATER_FIXES), and every new release had to be added to every earlier list
-- 14 files in 8 folders by the Import File Picker Filter fix. A list that was missed failed
silently: Phase 11's live fixture failed from 11.2 until 11.2.3 and nobody noticed.

Now a new release adds ONE entry to CHAIN below, at the end, and every earlier fixture picks it up.

    strip_later(tree, after="<this release's folder name>")

removes, newest first, every release in CHAIN built after `after` that is still present in `tree`.
A folder that is not in CHAIN is an error, never an empty list, so a release that forgets to
register itself fails its own fixture loudly.

Stdlib only. Never touches the live tree itself: each release's own remover already refuses it.
"""

from __future__ import annotations

import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Release:
    """One release in build order.

    folder       -- the release's own folder name under Versions/ (it may sit inside a wrapper).
    fragment     -- a Phase 0 source file the release adds; present while that file exists.
    absent_text  -- (Phase 0 source file, text) for a release with no fragment of its own; present
                    while the file LACKS the text (the text the release deleted).
    """
    folder: str
    fragment: str | None = None
    absent_text: tuple[str, str] | None = None

    @property
    def kind(self) -> str:
        return "fragment" if self.fragment else "text"


# In the order the releases were BUILT (oldest first). Add a new release at the END.
CHAIN: tuple[Release, ...] = (
    Release("PART K — Phase 11 Characters List and Save Model",
            fragment="src/sheet/209.993-feat-characters-list.js"),
    Release("PART K — Phase 11.2 Creation Wizard",
            fragment="src/sheet/209.994-feat-creation-wizard.js"),
    Release("PART K — Phase 11.2.1 Wizard Skills and Advantages",
            fragment="src/sheet/209.995-feat-wizard-skills-advantages.js"),
    Release("PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho",
            fragment="src/sheet/209.996-feat-wizard-free-choices.js"),
    Release("PART K — Phase 11.2.3 Wizard Starting Spells",
            fragment="src/sheet/209.997-feat-wizard-starting-spells.js"),
    Release("BUGFIX — Kitsune Shugenja Listed Under Mantis",
            absent_text=("src/sheet/060-lib-schools.js", "Kitsune Shugenja [Mantis]")),
    Release("PART K — Phase 11.2.4 Wizard Starting Spells for Every School",
            fragment="src/sheet/209.998-feat-wizard-starting-spells-all.js"),
    Release("BUGFIX — Import File Picker Filter",
            fragment="src/sheet/209.999-bugfix-import-file-filter.js"),
    Release("BUGFIX — Apply School Skill Rows",
            fragment="src/sheet/209.9995-bugfix-school-skill-rows.js"),
    Release("PART K — Phase 12 Play and Management Modes",
            fragment="src/sheet/209.9996-feat-play-management-modes.js"),
)


class ChainError(Exception):
    pass


def versions_dir() -> Path:
    """Versions/, found by walking up to the folder holding the ledger -- never by counting
    parents, so a wrapper folder added later does not move it."""
    for directory in Path(__file__).resolve().parents:
        if (directory / "BUILD-LEDGER.md").is_file() and (directory / "CLAUDE.md").is_file():
            return directory
    raise ChainError("cannot find Versions/ (no BUILD-LEDGER.md and CLAUDE.md above this file)")


def release_dir(folder: str) -> Path:
    """A release's folder, directly under Versions/ or one wrapper level down."""
    root = versions_dir()
    found = [p for p in [root / folder, *root.glob(f"*/{folder}")] if p.is_dir()]
    if len(found) != 1:
        raise ChainError(f"expected exactly one folder named {folder!r} under Versions/, found {len(found)}")
    return found[0]


def index_of(folder: str) -> int:
    names = [r.folder for r in CHAIN]
    if folder not in names:
        raise ChainError(f"{folder!r} is not in the removal chain; add it to CHAIN in {Path(__file__).name}")
    return names.index(folder)


def later_than(folder: str) -> tuple[Release, ...]:
    """Every release built after `folder`, oldest first."""
    return CHAIN[index_of(folder) + 1:]


def is_present(release: Release, tree: Path) -> bool:
    if release.fragment:
        return (tree / release.fragment).is_file()
    source, text = release.absent_text
    return text not in (tree / source).read_text(encoding="utf-8")


def strip_later(tree: Path, after: str, *, fixes: bool = True) -> list[str]:
    """Remove every release built after `after` from the scratch copy `tree`, newest first, each by
    its own qa/remove-phase.py. With fixes=False only releases that add a fragment are removed
    (a text-only fix such as the Kitsune removal is left applied). Returns the folders removed."""
    removed = []
    for release in reversed(later_than(after)):
        if release.kind == "text" and not fixes:
            continue
        if is_present(release, tree):
            remover = release_dir(release.folder) / "qa" / "remove-phase.py"
            subprocess.run([sys.executable, str(remover), str(tree)], check=True, capture_output=True)
            removed.append(release.folder)
    return removed


if __name__ == "__main__":
    for number, release in enumerate(CHAIN, 1):
        marker = release.fragment or f"{release.absent_text[0]} lacks {release.absent_text[1]!r}"
        print(f"{number:2d}. {release.folder}\n    {marker}")
