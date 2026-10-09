#!/usr/bin/env python3
"""Adversarial remover fixtures for BUGFIX — Characters Screen Top Bar. Every write is confined to a
TemporaryDirectory. The live tree is only read: to prove the path guard, and copied to a scratch folder for the
real removal. Adapted from Phase 4.5.34's (Part I) test-removal.py; this fix owns one stylesheet and one switch and
adds no block to any shared source."""

from __future__ import annotations

import hashlib
import importlib.util
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("cl11topbar_removal", Path(__file__).with_name("remove-phase.py"))
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)
SEAM_FILE = "src/sheet/210-test-seam-and-init.js"
THIS_RELEASE = "BUGFIX — Characters Screen Top Bar"
STYLE_FILE, SCRIPT_FILE = R.FRAGMENTS


def _removal_chain():
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


SEAM = "  a();\n  // PART I FEATURE 4.5.34 BEGIN blind-armor-note-seam\n  bl();\n  // END BL4534 blind-armor-note-seam\n  c();\n"
LIST_CSS = "  /* ============ PART K PHASE 11 — CHARACTERS LIST ============ */\n  .cl11-view{overflow-y:auto;}\n  .cl11-panel{max-width:760px;}\n"
SCRIPT = ("  // ============ BUGFIX CL11TOPBAR — THE CHARACTERS SCREEN'S TOP BAR STAYS PUT ============\n"
          "  const CHARACTERS_TOP_BAR_FIX_ENABLED = true;\n"
          "  if(CHARACTERS_TOP_BAR_FIX_ENABLED && document.body) document.body.classList.add('cl11-topbar-fixed');\n")
STYLE = ("  /* ============ BUGFIX CL11TOPBAR — THE CHARACTERS SCREEN'S TOP BAR STAYS PUT ============ */\n"
         "  html body.cl11-topbar-fixed .cl11-view{ overflow:hidden; }\n")


def manifest():
    return "\n".join([
        '{', '  "output": "l5r-character-sheet.html",', '  "expect_sha256": "' + "0" * 64 + '",', '  "fragments": [',
        '    { "file": "src/shell/start.html",   "note": "unrelated spacing stays" },',
        '    { "file": "src/css/59.993-feat-characters-list.css", "note": "Phase 11 styles" },',
        f'    {{ "file": "{STYLE_FILE}",', '      "note": "owned stylesheet" },',
        '    { "file": "src/sheet/209.993-feat-characters-list.js", "note": "Phase 11" },',
        f'    {{ "file": "{SCRIPT_FILE}",', '      "note": "owned switch" },',
        f'    {{ "file": "{SEAM_FILE}", "note": "shared" }}', '  ]', '}', ''])


def write(root, relative, text):
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def fixture(root, script=None, style=None, list_css=None, seam=None):
    write(root, "build/manifest.json", manifest())
    write(root, "src/shell/start.html", "<!doctype html>\n")
    write(root, "src/css/59.993-feat-characters-list.css", LIST_CSS if list_css is None else list_css)
    write(root, STYLE_FILE, STYLE if style is None else style)
    write(root, "src/sheet/209.993-feat-characters-list.js", "  const CL11 = {};\n")
    write(root, SCRIPT_FILE, SCRIPT if script is None else script)
    write(root, SEAM_FILE, SEAM if seam is None else seam)
    write(root, "l5r-character-sheet.html", "old output\n")


def snapshot(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob("*") if p.is_file()}


class Scratch(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="l5r-cl11topbar-fixture-")
        self.root = Path(self.temp.name) / "tree"
        self.root.mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def assertRefusedUnchanged(self):
        before = snapshot(self.root)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root)
        self.assertEqual(snapshot(self.root), before)

    def test_removes_both_files_and_manifest_entries_only(self):
        fixture(self.root)
        R.remove(self.root)
        files = snapshot(self.root)
        self.assertNotIn(SCRIPT_FILE, files)
        self.assertNotIn(STYLE_FILE, files)
        self.assertEqual(files[SEAM_FILE].decode(), SEAM)
        self.assertEqual(files["src/css/59.993-feat-characters-list.css"].decode(), LIST_CSS)
        text = files["build/manifest.json"].decode()
        self.assertIn('"file": "src/shell/start.html",   "note": "unrelated spacing stays"', text)
        self.assertNotIn("characters-top-bar", text)
        self.assertIn('"file": "src/css/59.993-feat-characters-list.css", "note": "Phase 11 styles"', text)

    def test_dry_run_and_failed_expect_write_nothing(self):
        fixture(self.root)
        before = snapshot(self.root)
        R.remove(self.root, dry_run=True)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, expect_sha="0" * 64)
        self.assertEqual(snapshot(self.root), before)

    def test_surface_left_in_a_retained_file_refused(self):
        for extra in ["  if (CHARACTERS_TOP_BAR_FIX_ENABLED) go();\n", "  document.body.classList.contains('cl11-topbar-fixed');\n"]:
            with self.subTest(extra=extra):
                fixture(self.root, seam=SEAM + extra)
                self.assertRefusedUnchanged()
        fixture(self.root, list_css=LIST_CSS + "  body.cl11-topbar-fixed .x{}\n")
        self.assertRefusedUnchanged()

    def test_phase_11_classes_are_not_its_surface(self):
        # The fix styles Phase 11's (Part K) classes; finding them in Phase 11's own files is not a leak.
        fixture(self.root, seam=SEAM + "  document.querySelector('.cl11-view .cl11-panel .cl11-nav');\n")
        R.remove(self.root)
        self.assertNotIn(STYLE_FILE, snapshot(self.root))

    def test_foreign_marker_in_owned_files_refused(self):
        for marker in ["PART J PHASE 8", "PART K PHASE 11", "PART I FEATURE 4.5.34", "Part K Phase 14 swallowed"]:
            with self.subTest(marker=marker, file="script"):
                fixture(self.root, script="// BUGFIX CL11TOPBAR\n// " + marker + "\n")
                self.assertRefusedUnchanged()
            with self.subTest(marker=marker, file="style"):
                fixture(self.root, style="/* BUGFIX CL11TOPBAR */\n/* " + marker + " */\n")
                self.assertRefusedUnchanged()

    def test_missing_owned_marker_refused_before_writes(self):
        fixture(self.root, script="// BUGFIX\nconst CHARACTERS_TOP_BAR_FIX_ENABLED = true;\n")
        self.assertRefusedUnchanged()
        fixture(self.root, style=".cl11-view{overflow:hidden;}\n")
        self.assertRefusedUnchanged()

    def test_other_bugfix_markers_elsewhere_are_kept(self):
        # Another fix's own long-form marker in a retained file is not this fix's.
        fixture(self.root, seam=SEAM + "  // BUGFIX MANAGETOGGLE note\n")
        R.remove(self.root)
        self.assertIn("BUGFIX MANAGETOGGLE", snapshot(self.root)[SEAM_FILE].decode())

    def test_later_source_and_manifest_entry_survive(self):
        fixture(self.root)
        base = R.remove(self.root, dry_run=True)
        future = "src/sheet/future.js"
        write(self.root, future, "// PART Z PHASE 1\nconst future = true;\n")
        text = manifest().replace('  "fragments": [', '  "fragments": [\n    { "file": "' + future + '" },', 1)
        write(self.root, "build/manifest.json", text)
        result = R.remove(self.root)
        self.assertNotEqual(result["rebuild_sha256"], base["rebuild_sha256"])
        self.assertIn(future, R.read_exact(self.root / "build/manifest.json"))

    def test_output_escape_refused_before_writes(self):
        fixture(self.root)
        write(self.root, "build/manifest.json", manifest().replace('"l5r-character-sheet.html"', '"../outside.html"'))
        self.assertRefusedUnchanged()

    def test_hard_link_to_live_source_refused_before_writes(self):
        fixture(self.root)
        target = self.root / SEAM_FILE
        target.unlink()
        try:
            os.link(R.live_tree() / SEAM_FILE, target)
        except OSError:
            self.skipTest("hard links not permitted here")
        self.assertRefusedUnchanged()

    def test_live_tree_and_its_parent_refused(self):
        for target in [R.live_tree(), R.live_tree().parent, R.live_tree() / "src"]:
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
        with tempfile.TemporaryDirectory(prefix="l5r-cl11topbar-live-") as work:
            copy = Path(work) / "phase0"
            shutil.copytree(R.live_tree(), copy, ignore=shutil.ignore_patterns("l5r-character-sheet.html", "dist"))
            before = snapshot(R.live_tree())
            strip_later(copy)
            result = R.remove(copy, expect_sha=R.PRE_RELEASE_SHA)
            self.assertEqual((result["rebuild_sha256"], result["rebuild_bytes"]), (R.PRE_RELEASE_SHA, R.PRE_RELEASE_BYTES))
            built = subprocess.run([sys.executable, str(copy / "build/recombine.py"), "--verify"],
                                   cwd=copy, capture_output=True, text=True, encoding="utf-8")
            self.assertEqual(built.returncode, 0, built.stdout + built.stderr)
            output = (copy / "l5r-character-sheet.html").read_bytes()
            self.assertEqual(hashlib.sha256(output).hexdigest(), R.PRE_RELEASE_SHA)
            self.assertEqual(len(output), R.PRE_RELEASE_BYTES)
            self.assertEqual(snapshot(R.live_tree()), before)

    def test_characters_screen_and_search_untouched_by_removal(self):
        # Removing the fix leaves Phase 11's and Phase 14's (Part K) scripts and stylesheets exactly as they are.
        kept = ["src/sheet/209.993-feat-characters-list.js", "src/css/59.993-feat-characters-list.css",
                "src/sheet/209.99999992-feat-search-page.js", "src/css/59.99996-feat-search.css"]
        with tempfile.TemporaryDirectory(prefix="l5r-cl11topbar-kept-") as work:
            copy = Path(work) / "phase0"
            shutil.copytree(R.live_tree(), copy, ignore=shutil.ignore_patterns("l5r-character-sheet.html", "dist"))
            strip_later(copy)
            before = {k: (copy / k).read_bytes() for k in kept}
            R.remove(copy)
            self.assertEqual({k: (copy / k).read_bytes() for k in kept}, before)


if __name__ == "__main__":
    unittest.main(verbosity=2)
