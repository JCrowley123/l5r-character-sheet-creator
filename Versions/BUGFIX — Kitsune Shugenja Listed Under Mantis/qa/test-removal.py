#!/usr/bin/env python3
"""Adversarial fixtures for the fix's remover (which puts the School back). Every write is confined
to a TemporaryDirectory. The live tree is only read: to prove the path guard, and copied to a
scratch folder for the real removal."""

from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("kitsune_mantis_removal", HERE / "remove-phase.py")
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)
BRAWLER = "      {name:'Mantis Brawler [Bushi]', benefit:'Agility'},\n"
# Later work that is built on top of this fix, removed first (newest first, each by its own
# remover) so the live copy can reach the pre-fix build exactly.
LATER_STAGES = (
    ("BUGFIX — Import File Picker Filter", "src/sheet/209.999-bugfix-import-file-filter.js"),
    ("PART K — Phase 11.2.4 Wizard Starting Spells for Every School", "src/sheet/209.998-feat-wizard-starting-spells-all.js"),)


def library(mantis=BRAWLER, extra=""):
    return ("  const SCHOOL_LIBRARY = {\n    'Crab': [\n      {name:'Hida Bushi'},\n    ],\n  };\n"
            "  const MINOR_CLAN_SCHOOL_LIBRARY = {\n    'Fox': [\n      {name:'Kitsune Shugenja'},\n    ],\n"
            "    'Mantis': [\n" + mantis + "      {name:'Moshi Shugenja'},\n    ],\n" + extra + "  };\n"
            "  const MONK_OUTFIT = 'Bo';\n")


def manifest():
    return "\n".join(['{', '  "output": "l5r-character-sheet.html",', '  "expect_sha256": "' + "0" * 64 + '",',
                      '  "fragments": [', '    { "file": "src/shell/start.html",   "note": "unrelated spacing stays" },',
                      f'    {{ "file": "{R.LIBRARY}", "note": "library" }}', '  ]', '}', ''])


def write(root, relative, text):
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def fixture(root, lib=None):
    write(root, "build/manifest.json", manifest())
    write(root, "src/shell/start.html", "<!doctype html>\n")
    write(root, R.LIBRARY, library() if lib is None else lib)


def snapshot(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob("*") if p.is_file()}


class Library(unittest.TestCase):
    def test_line_goes_back_first_in_the_mantis_list(self):
        self.assertEqual(R.restore_line(library()), library(R.LINE + BRAWLER))

    def test_refused_when_already_present(self):
        with self.assertRaises(R.RemovalError):
            R.restore_line(library(R.LINE + BRAWLER))

    def test_refused_when_the_mantis_list_changed(self):
        for text in [library(mantis="      {name:'Moshi Shugenja'},\n"), library().replace("    'Mantis': [\n", "    'Mantis':[\n"),
                     library(extra="    'Mantis': [\n" + BRAWLER + "    ],\n")]:
            with self.subTest(text=text[-120:]), self.assertRaises(R.RemovalError):
                R.restore_line(text)

    def test_refused_when_mantis_is_not_a_minor_clan_list(self):
        moved = library().replace("  const MINOR_CLAN_SCHOOL_LIBRARY = {\n", "  const OTHER = {};\n  const MINOR_CLAN_SCHOOL_LIBRARY_X = {\n")
        with self.assertRaises(R.RemovalError):
            R.restore_line(moved)


class Scratch(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="l5r-km-fixture-")
        self.root = Path(self.temp.name) / "tree"
        self.root.mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def test_restores_the_line_and_the_hash_only(self):
        fixture(self.root)
        result = R.remove(self.root)
        files = snapshot(self.root)
        self.assertEqual(files[R.LIBRARY].decode(), library(R.LINE + BRAWLER))
        self.assertEqual(files["src/shell/start.html"].decode(), "<!doctype html>\n")
        text = files["build/manifest.json"].decode()
        self.assertEqual(text, manifest().replace("0" * 64, result["rebuild_sha256"]))

    def test_dry_run_and_failed_expect_write_nothing(self):
        fixture(self.root)
        before = snapshot(self.root)
        R.remove(self.root, dry_run=True)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, expect_sha="0" * 64)
        self.assertEqual(snapshot(self.root), before)

    def test_second_run_refused_and_writes_nothing(self):
        fixture(self.root)
        R.remove(self.root)
        before = snapshot(self.root)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root)
        self.assertEqual(snapshot(self.root), before)

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

    def test_live_tree_removes_to_the_pre_fix_build(self):
        with tempfile.TemporaryDirectory(prefix="l5r-km-live-") as work:
            copy = Path(work) / "phase0"
            shutil.copytree(R.live_tree(), copy, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
            before = snapshot(R.live_tree())
            for folder, fragment in LATER_STAGES:
                if (copy / fragment).is_file():
                    subprocess.run([sys.executable, str(HERE.parents[1] / folder / "qa" / "remove-phase.py"), str(copy)],
                                   check=True, capture_output=True)
            result = R.remove(copy, expect_sha=R.PRE_FIX_SHA)
            self.assertEqual((result["rebuild_sha256"], result["rebuild_bytes"]), (R.PRE_FIX_SHA, R.PRE_FIX_BYTES))
            self.assertEqual(snapshot(R.live_tree()), before)


if __name__ == "__main__":
    unittest.main(verbosity=2)
