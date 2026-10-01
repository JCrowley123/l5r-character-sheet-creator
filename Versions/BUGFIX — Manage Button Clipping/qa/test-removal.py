#!/usr/bin/env python3
"""Adversarial remover fixtures. Every write is confined to a TemporaryDirectory. The live tree is
only read: to prove the path guard, and copied to a scratch folder for the real removal.
Adapted from BUGFIX — Import File Picker Filter's; this fix has no shared-file block to test, only its
own two files: the stylesheet and the switch fragment."""

from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import shutil
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("manage_toggle_removal", Path(__file__).with_name("remove-phase.py"))
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)
OTHER_CSS = "src/css/59.997-feat-play-management-modes.css"

# Later work is removed first, newest first, each with its own remover, so the live-tree proof ends
# exactly at this fix's own pre-release build. Which releases count as later comes from the one
# shared list in "QA — Removal Chain Registry", where a new release registers itself once.
THIS_RELEASE = "BUGFIX — Manage Button Clipping"


def _removal_chain():
    """The shared list of later releases, "QA — Removal Chain Registry/removal_chain.py", found by
    walking up from this file rather than by counting parents (so a wrapper folder cannot break it)."""
    import sys
    for directory in Path(__file__).resolve().parents:
        candidate = directory / "QA — Removal Chain Registry" / "removal_chain.py"
        if candidate.is_file():
            spec = importlib.util.spec_from_file_location("removal_chain", candidate)
            module = importlib.util.module_from_spec(spec)
            sys.modules[spec.name] = module
            spec.loader.exec_module(module)
            return module
    raise RuntimeError("QA — Removal Chain Registry/removal_chain.py not found above " + __file__)


def strip_later(copy):
    _removal_chain().strip_later(copy, after=THIS_RELEASE)


OWN_CSS = ("  /* ============ BUGFIX MANAGETOGGLE — ONE WIDTH ============ */\n"
           "  html body.manage-toggle-fixed .titlebar #pm12Toggle.pm12-toggle::after{ content:'Manage'; }\n"
           "  /* ============ END BUGFIX MANAGETOGGLE ============ */\n")
OWN_JS = ("  // ============ BUGFIX MANAGETOGGLE — SWITCH ============\n"
          "  const MANAGE_TOGGLE_FIX_ENABLED = true;\n"
          "  if(MANAGE_TOGGLE_FIX_ENABLED) document.body.classList.add('manage-toggle-fixed');\n"
          "  // ============ END BUGFIX MANAGETOGGLE ============\n")
PHASE12_CSS = ("  /* ============ PART K PHASE 12 — MODES ============ */\n"
               "  .titlebar #pm12Toggle.pm12-toggle{ margin-left:auto; }\n"
               "  /* ============ END PART K PHASE 12 MODES12 ============ */\n")


def manifest():
    return "\n".join([
        '{', '  "output": "l5r-character-sheet.html",', '  "expect_sha256": "' + "0" * 64 + '",', '  "fragments": [',
        '    { "file": "src/shell/start.html",   "note": "unrelated spacing stays" },',
        f'    {{ "file": "{OTHER_CSS}", "note": "Phase 12" }},',
        f'    {{ "file": "{R.FRAGMENTS[0]}",', '      "note": "owned stylesheet" },',
        f'    {{ "file": "{R.FRAGMENTS[1]}",', '      "note": "owned switch" },',
        '    { "file": "src/shell/end.html", "note": "last" }', '  ]', '}', ''])


def write(root, relative, text):
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def fixture(root, other=None, own=None, own_js=None):
    write(root, "build/manifest.json", manifest())
    write(root, "src/shell/start.html", "<!doctype html>\n")
    write(root, "src/shell/end.html", "</html>\n")
    write(root, OTHER_CSS, PHASE12_CSS if other is None else other)
    write(root, R.FRAGMENTS[0], OWN_CSS if own is None else own)
    write(root, R.FRAGMENTS[1], OWN_JS if own_js is None else own_js)
    write(root, "l5r-character-sheet.html", "old output\n")


def snapshot(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob("*") if p.is_file()}


class Scratch(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="l5r-managetoggle-fixture-")
        self.root = Path(self.temp.name) / "tree"
        self.root.mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def test_removes_both_files_and_their_manifest_entries_only(self):
        fixture(self.root)
        before = snapshot(self.root)
        R.remove(self.root)
        files = snapshot(self.root)
        self.assertNotIn(R.FRAGMENTS[0], files)
        self.assertNotIn(R.FRAGMENTS[1], files)
        self.assertEqual(files[OTHER_CSS], before[OTHER_CSS])
        manifest_text = files["build/manifest.json"].decode()
        self.assertIn('"file": "src/shell/start.html",   "note": "unrelated spacing stays"', manifest_text)
        self.assertIn(OTHER_CSS, manifest_text)
        self.assertNotIn("59.9998", manifest_text)
        self.assertNotIn("209.99999", manifest_text)
        self.assertNotIn("0" * 64, manifest_text)

    def test_dry_run_and_failed_expect_write_nothing(self):
        fixture(self.root)
        before = snapshot(self.root)
        R.remove(self.root, dry_run=True)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, expect_sha="0" * 64)
        self.assertEqual(snapshot(self.root), before)

    def test_surface_left_in_a_retained_file_refused(self):
        for extra in ["  .titlebar #pm12Toggle.pm12-toggle::after{ content:'Done'; }\n",
                      "  body.manage-toggle-fixed .x{}\n", "  /* MANAGE_TOGGLE_FIX_ENABLED */\n"]:
            with self.subTest(extra=extra):
                fixture(self.root, other=PHASE12_CSS + extra)
                before = snapshot(self.root)
                with self.assertRaises(R.RemovalError):
                    R.remove(self.root)
                self.assertEqual(snapshot(self.root), before)

    def test_own_marker_left_in_a_retained_file_refused(self):
        fixture(self.root, other=PHASE12_CSS + "  /* BUGFIX MANAGETOGGLE stray */\n")
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, dry_run=True)

    def test_foreign_marker_in_owned_file_refused(self):
        for marker in ["PART K PHASE 12.8", "Part G Phase 3's preview", "PART I FEATURE 4.5.23"]:
            with self.subTest(marker=marker), self.assertRaises(R.RemovalError):
                fixture(self.root, own=OWN_CSS + f"  /* {marker} */\n  .x{{}}\n")
                R.remove(self.root, dry_run=True)

    def test_owned_file_without_its_own_marker_refused(self):
        for kwargs in [{"own": "  /* BUGFIX SOMETHINGELSE */\n  .titlebar #pm12Toggle.pm12-toggle::after{}\n"},
                       {"own_js": "  // BUGFIX SOMETHINGELSE\n  const MANAGE_TOGGLE_FIX_ENABLED = true;\n"}]:
            with self.subTest(kwargs=list(kwargs)), self.assertRaises(R.RemovalError):
                fixture(self.root, **kwargs)
                R.remove(self.root, dry_run=True)

    def test_missing_manifest_entry_refused(self):
        fixture(self.root)
        text = (self.root / "build/manifest.json").read_text(encoding="utf-8")
        text = text.replace(f'    {{ "file": "{R.FRAGMENTS[0]}",\n      "note": "owned stylesheet" }},\n', "")
        (self.root / "build/manifest.json").write_text(text, encoding="utf-8")
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, dry_run=True)

    def test_live_tree_and_its_parent_refused(self):
        for target in [R.live_tree(), R.live_tree().parent]:
            with self.subTest(target=target), self.assertRaises(R.RemovalError):
                R.remove(target, dry_run=True)

    def test_symlinked_root_refused(self):
        fixture(self.root)
        link = Path(self.temp.name) / "link"
        try:
            os.symlink(self.root, link, target_is_directory=True)
        except OSError:
            self.skipTest("symlinks not permitted here")
        with self.assertRaises(R.RemovalError):
            R.remove(link, dry_run=True)


class LiveTree(unittest.TestCase):
    """Copies the live tree to a scratch folder; never writes to the live tree."""

    def test_live_tree_removes_to_the_pre_release_build(self):
        with tempfile.TemporaryDirectory(prefix="l5r-managetoggle-live-") as work:
            copy = Path(work) / "phase0"
            shutil.copytree(R.live_tree(), copy, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
            before = snapshot(R.live_tree())
            strip_later(copy)
            result = R.remove(copy, expect_sha=R.PRE_RELEASE_SHA)
            self.assertEqual((result["rebuild_sha256"], result["rebuild_bytes"]), (R.PRE_RELEASE_SHA, R.PRE_RELEASE_BYTES))
            self.assertEqual(snapshot(R.live_tree()), before)

    def test_live_files_hold_only_their_own_marker(self):
        for relative in R.FRAGMENTS:
            with self.subTest(relative):
                text = (R.live_tree() / relative).read_text(encoding="utf-8")
                names = [name for line in text.splitlines() for name in R.marker_names(line)]
                self.assertTrue(names and all(name == R.MARKER for name in names))
                self.assertEqual(len(R.OWN_RE.findall(text)), 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)
