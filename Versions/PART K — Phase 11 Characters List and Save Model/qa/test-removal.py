#!/usr/bin/env python3
"""Adversarial remover fixtures. Every write is confined to a TemporaryDirectory. The live tree is
only read: to prove the path guard, and copied to a scratch folder for the real removal."""

from __future__ import annotations

import hashlib
import importlib.util
import os
from pathlib import Path
import shutil
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("characters_list_removal", Path(__file__).with_name("remove-phase.py"))
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)
SHARED = "src/sheet/210-test-seam-and-init.js"
SLUGS = ("characters-seam", "characters-init")


# Later Part K stages depend on this one, and this phase's remover rightly refuses while any is
# present. So the live-tree proof removes them first, newest first, each with its own remover, the
# documented removal order. Each removal is byte-identical to the build before it, so the chain
# ends exactly at this phase's own pre-release build.
LATER_STAGES = (
    ("PART K — Phase 11.2.3 Wizard Starting Spells", "src/sheet/209.997-feat-wizard-starting-spells.js"),
    ("PART K — Phase 11.2.2 Wizard Free Choices Spells and Kiho", "src/sheet/209.996-feat-wizard-free-choices.js"),
    ("PART K — Phase 11.2.1 Wizard Skills and Advantages", "src/sheet/209.995-feat-wizard-skills-advantages.js"),
    ("PART K — Phase 11.2 Creation Wizard", "src/sheet/209.994-feat-creation-wizard.js"),
)


def strip_later(copy):
    import subprocess
    import sys
    versions = Path(__file__).resolve().parents[2]
    for folder, fragment in LATER_STAGES:
        if (copy / fragment).is_file():
            subprocess.run([sys.executable, str(versions / folder / "qa" / "remove-phase.py"), str(copy)],
                           check=True, capture_output=True)


def blk(slug, body="  owned();\n"):
    return f"  // PART K PHASE 11 BEGIN {slug}\n{body}  // END CHARLIST11 {slug}\n"


def seam(extra=""):
    return "  a();\n" + blk(SLUGS[0]) + "  b();\n" + blk(SLUGS[1]) + "  c();\n" + extra


def manifest():
    return "\n".join([
        '{', '  "output": "l5r-character-sheet.html",', '  "expect_sha256": "' + "0" * 64 + '",', '  "fragments": [',
        '    { "file": "src/shell/start.html",   "note": "unrelated spacing stays" },',
        f'    {{ "file": "{R.FRAGMENTS[1]}",', '      "note": "owned CSS" },',
        f'    {{ "file": "{R.FRAGMENTS[0]}",', '      "note": "owned script" },',
        f'    {{ "file": "{SHARED}", "note": "shared" }}', '  ]', '}', ''])


def write(root, relative, text):
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def fixture(root, shared=None, script=None):
    write(root, "build/manifest.json", manifest())
    write(root, "src/shell/start.html", "<!doctype html>\n")
    write(root, R.FRAGMENTS[0], script if script is not None else f"// {R.MARKER} characters\nconst CL11 = {{}};\n// END {R.MARKER}\n")
    write(root, R.FRAGMENTS[1], f"/* {R.MARKER} styles */\n.cl11-view {{ color: red; }}\n")
    write(root, SHARED, seam() if shared is None else shared)
    write(root, "l5r-character-sheet.html", "old output\n")


def snapshot(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob("*") if p.is_file()}


class Blocks(unittest.TestCase):
    def test_both_blocks_removed_and_nothing_else(self):
        out, slugs = R.strip_owned_blocks(seam(), "f")
        self.assertEqual(sorted(slugs), sorted(SLUGS))
        self.assertEqual(out, "  a();\n  b();\n  c();\n")

    def test_missing_block_refused(self):
        with self.assertRaises(R.RemovalError):
            R.strip_owned_blocks("  a();\n" + blk(SLUGS[0]), "f")

    def test_unknown_or_duplicate_slug_refused(self):
        for text in [seam(blk("other")), seam(blk(SLUGS[1]))]:
            with self.subTest(text=text[-40:]), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, "f")

    def test_orphan_mismatched_unclosed_refused(self):
        for text in [seam("  // END CHARLIST11 characters-init\n"),
                     seam().replace("END CHARLIST11 characters-init", "END CHARLIST11 characters-seam"),
                     seam().replace("  // END CHARLIST11 characters-init\n", "")]:
            with self.subTest(), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, "f")

    def test_foreign_marker_inside_block_refused(self):
        for marker in ["PART I FEATURE 4.5.23", "BUGFIX", "Part G Phase 3's preview", "PART K PHASE 11.1"]:
            with self.subTest(marker=marker), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(seam().replace("  owned();\n", f"  // {marker}\n", 1), "f")

    def test_later_point_release_block_is_not_ours(self):
        # A future Phase 11.1 or 11.2 block must survive untouched, and must not be mistaken for ours.
        later = "  // PART K PHASE 11.1 BEGIN pdf\n  pdf();\n  // END PDF111 pdf\n"
        out, _ = R.strip_owned_blocks(seam(later), "f")
        self.assertTrue(out.endswith(later))

    def test_partial_own_marker_outside_blocks_refused(self):
        for extra in ["  // PART K PHASE 11 stray\n", "  // END CHARLIST11\n"]:
            with self.subTest(extra=extra), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(seam(extra), "f")


class Scratch(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="l5r-cl11-fixture-")
        self.root = Path(self.temp.name) / "tree"
        self.root.mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def test_removes_fragments_blocks_and_manifest_entries_only(self):
        fixture(self.root)
        R.remove(self.root)
        files = snapshot(self.root)
        self.assertNotIn(R.FRAGMENTS[0], files)
        self.assertNotIn(R.FRAGMENTS[1], files)
        self.assertEqual(files[SHARED].decode(), "  a();\n  b();\n  c();\n")
        manifest_text = files["build/manifest.json"].decode()
        self.assertIn('"file": "src/shell/start.html",   "note": "unrelated spacing stays"', manifest_text)
        self.assertNotIn("cl11", manifest_text.replace("59.993", ""))
        self.assertNotIn("characters-list", manifest_text)

    def test_dry_run_and_failed_expect_write_nothing(self):
        fixture(self.root)
        before = snapshot(self.root)
        R.remove(self.root, dry_run=True)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, expect_sha="0" * 64)
        self.assertEqual(snapshot(self.root), before)

    def test_surface_left_in_a_retained_file_refused(self):
        fixture(self.root, shared=seam("  if (typeof initCharactersList === 'function') initCharactersList();\n"))
        before = snapshot(self.root)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root)
        self.assertEqual(snapshot(self.root), before)

    def test_foreign_marker_in_owned_fragment_refused(self):
        fixture(self.root, script=f"// {R.MARKER}\n// PART H PHASE 9 swallowed\n")
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
        with tempfile.TemporaryDirectory(prefix="l5r-cl11-live-") as work:
            copy = Path(work) / "phase0"
            shutil.copytree(R.live_tree(), copy, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
            before = snapshot(R.live_tree())
            strip_later(copy)
            result = R.remove(copy, expect_sha=R.PRE_RELEASE_SHA)
            self.assertEqual((result["rebuild_sha256"], result["rebuild_bytes"]), (R.PRE_RELEASE_SHA, R.PRE_RELEASE_BYTES))
            self.assertEqual(snapshot(R.live_tree()), before)

    def test_live_blocks_hold_no_foreign_marker(self):
        text = (R.live_tree() / SHARED).read_text(encoding="utf-8")
        _, slugs = R.strip_owned_blocks(text, SHARED, SLUGS)
        self.assertEqual(sorted(slugs), sorted(SLUGS))


if __name__ == "__main__":
    unittest.main(verbosity=2)
