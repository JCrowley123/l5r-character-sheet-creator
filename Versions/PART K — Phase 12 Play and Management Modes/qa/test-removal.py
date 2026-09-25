#!/usr/bin/env python3
"""Adversarial remover fixtures. Every write is confined to a TemporaryDirectory. The live tree is
only read: to prove the path guard, and copied to a scratch folder for the real removal."""

from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import shutil
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("modes12_removal", Path(__file__).with_name("remove-phase.py"))
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)
SEAM_FILE = "src/sheet/210-test-seam-and-init.js"
SEAM_SLUGS = ("modes-seam",)

# Which releases count as later comes from the one shared list in "QA — Removal Chain Registry".
THIS_RELEASE = "PART K — Phase 12 Play and Management Modes"


def _removal_chain():
    """The shared list of later releases, found by walking up from this file."""
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


def blk(slug, body="  owned();\n"):
    return f"  // PART K PHASE 12 BEGIN {slug}\n{body}  // END MODES12 {slug}\n"


# The Apply School fix's seam block sits right above ours, as in the live file, and must survive.
EARLIER = ("  a();\n  // BUGFIX SCHOOLSKILLROWS BEGIN school-skill-rows-seam\n  schoolSkillRows();\n"
           "  // END SCHOOLSKILLROWS school-skill-rows-seam\n")


def seam(extra=""):
    return EARLIER + blk(SEAM_SLUGS[0]) + "  c();\n" + extra


def manifest():
    return "\n".join([
        '{', '  "output": "l5r-character-sheet.html",', '  "expect_sha256": "' + "0" * 64 + '",', '  "fragments": [',
        '    { "file": "src/shell/start.html",   "note": "unrelated spacing stays" },',
        f'    {{ "file": "{R.FRAGMENTS[1]}",', '      "note": "owned style" },',
        f'    {{ "file": "{R.FRAGMENTS[0]}",', '      "note": "owned script" },',
        f'    {{ "file": "{SEAM_FILE}", "note": "shared" }}', '  ]', '}', ''])


def write(root, relative, text):
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def fixture(root, seamed=None, script=None):
    write(root, "build/manifest.json", manifest())
    write(root, "src/shell/start.html", "<!doctype html>\n")
    write(root, R.FRAGMENTS[0], script if script is not None else "// PART K PHASE 12\nconst MODES12 = {};\n")
    write(root, R.FRAGMENTS[1], "/* PART K PHASE 12 */\n#pm12Toggle{}\n")
    write(root, SEAM_FILE, seam() if seamed is None else seamed)
    write(root, "l5r-character-sheet.html", "old output\n")


def snapshot(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob("*") if p.is_file()}


class Blocks(unittest.TestCase):
    def test_seam_block_removed_and_the_earlier_block_kept(self):
        out, slugs = R.strip_owned_blocks(seam(), "f", SEAM_SLUGS)
        self.assertEqual(slugs, list(SEAM_SLUGS))
        self.assertEqual(out, EARLIER + "  c();\n")

    def test_missing_block_refused(self):
        with self.assertRaises(R.RemovalError):
            R.strip_owned_blocks(EARLIER, "f", SEAM_SLUGS)

    def test_unknown_or_duplicate_slug_refused(self):
        for text in [seam(blk("other")), seam(blk(SEAM_SLUGS[0]))]:
            with self.subTest(text=text[-40:]), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, "f", SEAM_SLUGS)

    def test_orphan_mismatched_unclosed_refused(self):
        tag = "END MODES12 " + SEAM_SLUGS[0]
        for text in [seam("  // " + tag + "\n"), seam().replace(tag, "END MODES12 other"),
                     seam().replace("  // " + tag + "\n", "")]:
            with self.subTest(), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, "f", SEAM_SLUGS)

    def test_foreign_marker_inside_block_refused(self):
        for marker in ["BUGFIX SCHOOLSKILLROWS", "PART K PHASE 11.2.4", "Part G Phase 3's preview", "PART K PHASE 12.1"]:
            with self.subTest(marker=marker), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(seam().replace("  owned();\n", f"  // {marker}\n", 1), "f", SEAM_SLUGS)

    def test_a_later_part_block_is_not_ours(self):
        later = "  // PART K PHASE 12.1 BEGIN later\n  later();\n  // END MODES121 later\n"
        out, _ = R.strip_owned_blocks(seam(later), "f", SEAM_SLUGS)
        self.assertTrue(out.endswith(later))

    def test_partial_own_marker_outside_blocks_refused(self):
        for extra in ["  // PART K PHASE 12 stray\n", "  // END MODES12\n"]:
            with self.subTest(extra=extra), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(seam(extra), "f", SEAM_SLUGS)


class Scratch(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="l5r-pm12-fixture-")
        self.root = Path(self.temp.name) / "tree"
        self.root.mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def test_removes_fragments_block_and_manifest_entries_only(self):
        fixture(self.root)
        R.remove(self.root)
        files = snapshot(self.root)
        for fragment in R.FRAGMENTS:
            self.assertNotIn(fragment, files)
        self.assertEqual(files[SEAM_FILE].decode(), EARLIER + "  c();\n")
        text = files["build/manifest.json"].decode()
        self.assertIn('"file": "src/shell/start.html",   "note": "unrelated spacing stays"', text)
        self.assertNotIn("play-management", text)

    def test_dry_run_and_failed_expect_write_nothing(self):
        fixture(self.root)
        before = snapshot(self.root)
        R.remove(self.root, dry_run=True)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, expect_sha="0" * 64)
        self.assertEqual(snapshot(self.root), before)

    def test_surface_left_in_a_retained_file_refused(self):
        for extra in ["  if (MODES12) go();\n", "  document.getElementById('pm12Toggle');\n"]:
            with self.subTest(extra=extra):
                fixture(self.root, seamed=seam(extra))
                before = snapshot(self.root)
                with self.assertRaises(R.RemovalError):
                    R.remove(self.root)
                self.assertEqual(snapshot(self.root), before)

    def test_foreign_marker_in_owned_fragment_refused(self):
        fixture(self.root, script="// PART K PHASE 12\n// PART H PHASE 9 swallowed\n")
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
        with tempfile.TemporaryDirectory(prefix="l5r-pm12-live-") as work:
            copy = Path(work) / "phase0"
            shutil.copytree(R.live_tree(), copy, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
            before = snapshot(R.live_tree())
            strip_later(copy)
            result = R.remove(copy, expect_sha=R.PRE_RELEASE_SHA)
            self.assertEqual((result["rebuild_sha256"], result["rebuild_bytes"]), (R.PRE_RELEASE_SHA, R.PRE_RELEASE_BYTES))
            self.assertEqual(snapshot(R.live_tree()), before)

    def test_live_blocks_hold_no_foreign_marker(self):
        text = (R.live_tree() / SEAM_FILE).read_text(encoding="utf-8")
        _, found = R.strip_owned_blocks(text, SEAM_FILE, SEAM_SLUGS)
        self.assertEqual(found, list(SEAM_SLUGS))


if __name__ == "__main__":
    unittest.main(verbosity=2)
