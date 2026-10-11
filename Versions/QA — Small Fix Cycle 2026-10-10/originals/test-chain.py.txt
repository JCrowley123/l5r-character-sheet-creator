#!/usr/bin/env python3
"""Checks on the shared removal chain. Stdlib only; never writes to the live tree.

    python3 qa/test-chain.py
"""

from __future__ import annotations

import importlib.util
import json
import re
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("removal_chain", HERE.parent / "removal_chain.py")
C = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = C
SPEC.loader.exec_module(C)

VERSIONS = C.versions_dir()
LIVE = VERSIONS / "Part F — Cross-Platform Delivery" / "PART F — Phase 0 Source Reorganization for Maintainability"
CONSUMER_RE = re.compile(r'^THIS_RELEASE = "([^"]+)"$', re.M)


def snapshot(root: Path) -> dict:
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob("*") if p.is_file()}


def consumers() -> dict[Path, str]:
    found = {}
    for path in VERSIONS.rglob("*.py"):
        if HERE.parent in path.parents:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        if "_removal_chain()" in text:
            match = CONSUMER_RE.search(text)
            found[path] = match.group(1) if match else ""
    return found


class Registry(unittest.TestCase):
    def test_folders_exist_once_with_a_remover(self):
        for release in C.CHAIN:
            with self.subTest(release.folder):
                self.assertTrue((C.release_dir(release.folder) / "qa" / "remove-phase.py").is_file())

    def test_names_unique_and_one_marker_each(self):
        names = [r.folder for r in C.CHAIN]
        self.assertEqual(len(names), len(set(names)))
        for release in C.CHAIN:
            self.assertEqual(bool(release.fragment), not release.absent_text, release.folder)

    def test_every_release_is_present_in_the_live_tree(self):
        for release in C.CHAIN:
            with self.subTest(release.folder):
                self.assertTrue(C.is_present(release, LIVE))

    def test_fragments_follow_the_manifest_order(self):
        order = [f["file"] for f in json.loads((LIVE / "build/manifest.json").read_text(encoding="utf-8"))["fragments"]]
        chain = [r.fragment for r in C.CHAIN if r.fragment]
        for fragment in chain:
            self.assertIn(fragment, order)
        self.assertEqual([order.index(f) for f in chain], sorted(order.index(f) for f in chain))

    def test_no_unregistered_sheet_fragment_after_the_chain_starts(self):
        # A new release that forgot to register itself adds a src/sheet/209.* fragment after the
        # chain's first one without a CHAIN entry. That is the mistake this registry exists to stop.
        order = [f["file"] for f in json.loads((LIVE / "build/manifest.json").read_text(encoding="utf-8"))["fragments"]]
        first = order.index(C.CHAIN[0].fragment)
        chain = {r.fragment for r in C.CHAIN if r.fragment}
        stray = [f for f in order[first:] if f.startswith("src/sheet/209.") and f not in chain]
        self.assertEqual(stray, [])

    def test_unknown_folder_is_an_error_not_an_empty_list(self):
        with self.assertRaises(C.ChainError):
            C.later_than("PART Z — Phase 99 Never Built")

    def test_later_than_is_strictly_after(self):
        self.assertEqual(C.later_than(C.CHAIN[-1].folder), ())
        self.assertEqual(len(C.later_than(C.CHAIN[0].folder)), len(C.CHAIN) - 1)


class Consumers(unittest.TestCase):
    def test_every_consumer_names_a_registered_release_that_is_its_own_folder(self):
        found = consumers()
        self.assertGreaterEqual(len(found), 14)
        for path, folder in found.items():
            with self.subTest(str(path.relative_to(VERSIONS))):
                self.assertIn(folder, [r.folder for r in C.CHAIN])
                self.assertEqual(path.parents[1].name, folder)

    def test_no_hand_kept_list_is_left(self):
        for path in VERSIONS.rglob("*.py"):
            if HERE.parent in path.parents:
                continue
            text = path.read_text(encoding="utf-8", errors="replace")
            with self.subTest(str(path.relative_to(VERSIONS))):
                self.assertNotRegex(text, r"(?m)^LATER_(STAGES|FIXES)\s*=")


class LiveTree(unittest.TestCase):
    """Copies the live tree to a scratch folder; never writes to the live tree."""

    def run_strip(self, fixes):
        with tempfile.TemporaryDirectory(prefix="l5r-chain-") as work:
            copy = Path(work) / "phase0"
            shutil.copytree(LIVE, copy, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
            before = snapshot(LIVE)
            removed = C.strip_later(copy, after=C.CHAIN[0].folder, fixes=fixes)
            present = [r.folder for r in C.CHAIN[1:] if C.is_present(r, copy)]
            self.assertEqual(snapshot(LIVE), before)
            return removed, present

    def test_strips_every_later_release_newest_first(self):
        removed, present = self.run_strip(True)
        self.assertEqual(removed, [r.folder for r in reversed(C.CHAIN[1:])])
        self.assertEqual(present, [])

    def test_fixes_false_leaves_text_fixes_applied(self):
        removed, present = self.run_strip(False)
        self.assertEqual(present, [r.folder for r in C.CHAIN[1:] if r.kind == "text"])
        self.assertTrue(all(C.CHAIN[[x.folder for x in C.CHAIN].index(f)].kind == "fragment" for f in removed))


if __name__ == "__main__":
    unittest.main(verbosity=2)
