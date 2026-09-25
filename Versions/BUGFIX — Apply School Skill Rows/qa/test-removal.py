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

SPEC = importlib.util.spec_from_file_location("school_skill_rows_removal", Path(__file__).with_name("remove-phase.py"))
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)
LOOP_FILE = "src/sheet/080-identity-build-ui.js"
SEAM_FILE = "src/sheet/210-test-seam-and-init.js"
LOOP_SLUGS = ("school-skill-choice-state", "school-skill-choice-token")
SEAM_SLUGS = ("school-skill-rows-seam",)

# Which releases count as later comes from the one shared list in "QA — Removal Chain Registry".
THIS_RELEASE = "BUGFIX — Apply School Skill Rows"


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


def blk(slug, body="  owned();\n"):
    return f"  // BUGFIX SCHOOLSKILLROWS BEGIN {slug}\n{body}  // END SCHOOLSKILLROWS {slug}\n"


# Apply School's loop, shaped as the live one: the trunk lines around the two blocks must survive.
LOOP_TRUNK = ("    const skillGrants = [];\n", "    sc.skills.split(',').forEach(raw=>{\n      if(!token) return;\n",
              "      if(/^any /i.test(token)){ skippedChoices++; return; }\n    });\n")


def loop(extra=""):
    return (LOOP_TRUNK[0] + blk(LOOP_SLUGS[0], "    const reader = null;\n") + LOOP_TRUNK[1]
            + blk(LOOP_SLUGS[1], "      if(reader) return;\n") + LOOP_TRUNK[2] + extra)


LOOP_STRIPPED = "".join(LOOP_TRUNK)
# The Import fix's seam block sits right above ours, as in the live file, and must survive.
EARLIER = "  a();\n  // BUGFIX IMPORTFILTER BEGIN import-filter-seam\n  importFilter();\n  // END IMPORTFILTER import-filter-seam\n"


def seam(extra=""):
    return EARLIER + blk(SEAM_SLUGS[0]) + "  c();\n" + extra


def manifest():
    return "\n".join([
        '{', '  "output": "l5r-character-sheet.html",', '  "expect_sha256": "' + "0" * 64 + '",', '  "fragments": [',
        '    { "file": "src/shell/start.html",   "note": "unrelated spacing stays" },',
        f'    {{ "file": "{LOOP_FILE}", "note": "trunk" }},',
        f'    {{ "file": "{R.FRAGMENTS[0]}",', '      "note": "owned script" },',
        f'    {{ "file": "{SEAM_FILE}", "note": "shared" }}', '  ]', '}', ''])


def write(root, relative, text):
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def fixture(root, looped=None, seamed=None, script=None):
    write(root, "build/manifest.json", manifest())
    write(root, "src/shell/start.html", "<!doctype html>\n")
    write(root, LOOP_FILE, loop() if looped is None else looped)
    write(root, R.FRAGMENTS[0], script if script is not None else
          f"// {R.MARKER} SCHOOLSKILLROWS\nconst SCHOOL_SKILL_ROWS = {{}};\n// END {R.MARKER} SCHOOLSKILLROWS\n")
    write(root, SEAM_FILE, seam() if seamed is None else seamed)
    write(root, "l5r-character-sheet.html", "old output\n")


def snapshot(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob("*") if p.is_file()}


class Blocks(unittest.TestCase):
    def test_loop_blocks_removed_and_nothing_else(self):
        out, slugs = R.strip_owned_blocks(loop(), "f", LOOP_SLUGS)
        self.assertEqual(sorted(slugs), sorted(LOOP_SLUGS))
        self.assertEqual(out, LOOP_STRIPPED)

    def test_seam_block_removed_and_the_import_block_kept(self):
        out, slugs = R.strip_owned_blocks(seam(), "f", SEAM_SLUGS)
        self.assertEqual(slugs, list(SEAM_SLUGS))
        self.assertEqual(out, EARLIER + "  c();\n")

    def test_missing_block_refused(self):
        with self.assertRaises(R.RemovalError):
            R.strip_owned_blocks(LOOP_TRUNK[0] + blk(LOOP_SLUGS[0]), "f", LOOP_SLUGS)

    def test_unknown_or_duplicate_slug_refused(self):
        for text in [loop(blk("other")), loop(blk(LOOP_SLUGS[0]))]:
            with self.subTest(text=text[-40:]), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, "f", LOOP_SLUGS)

    def test_orphan_mismatched_unclosed_refused(self):
        tag = "END SCHOOLSKILLROWS " + SEAM_SLUGS[0]
        for text in [seam("  // " + tag + "\n"), seam().replace(tag, "END SCHOOLSKILLROWS other"),
                     seam().replace("  // " + tag + "\n", "")]:
            with self.subTest(), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, "f", SEAM_SLUGS)

    def test_foreign_marker_inside_block_refused(self):
        for marker in ["BUGFIX IMPORTFILTER", "PART K PHASE 11.2.4", "Part G Phase 3's preview", "PART I FEATURE 4.5.23"]:
            with self.subTest(marker=marker), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(loop().replace("      if(reader) return;\n", f"      // {marker}\n", 1), "f", LOOP_SLUGS)

    def test_later_block_is_not_ours(self):
        later = "  // PART K PHASE 12 BEGIN later\n  later();\n  // END LATER12 later\n"
        out, _ = R.strip_owned_blocks(seam(later), "f", SEAM_SLUGS)
        self.assertTrue(out.endswith(later))

    def test_partial_own_marker_outside_blocks_refused(self):
        for extra in ["  // BUGFIX SCHOOLSKILLROWS stray\n", "  // END SCHOOLSKILLROWS\n"]:
            with self.subTest(extra=extra), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(loop(extra), "f", LOOP_SLUGS)


class Scratch(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="l5r-ssr-fixture-")
        self.root = Path(self.temp.name) / "tree"
        self.root.mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def test_removes_fragment_blocks_and_manifest_entry_only(self):
        fixture(self.root)
        R.remove(self.root)
        files = snapshot(self.root)
        self.assertNotIn(R.FRAGMENTS[0], files)
        self.assertEqual(files[LOOP_FILE].decode(), LOOP_STRIPPED)
        self.assertEqual(files[SEAM_FILE].decode(), EARLIER + "  c();\n")
        text = files["build/manifest.json"].decode()
        self.assertIn('"file": "src/shell/start.html",   "note": "unrelated spacing stays"', text)
        self.assertNotIn("school-skill-rows", text)

    def test_dry_run_and_failed_expect_write_nothing(self):
        fixture(self.root)
        before = snapshot(self.root)
        R.remove(self.root, dry_run=True)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, expect_sha="0" * 64)
        self.assertEqual(snapshot(self.root), before)

    def test_surface_left_in_a_retained_file_refused(self):
        for looped in [loop("    if (SCHOOL_SKILL_ROWS) go();\n"), loop("    schoolSkillRowsReader();\n")]:
            with self.subTest(looped=looped[-30:]):
                fixture(self.root, looped=looped)
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
        with tempfile.TemporaryDirectory(prefix="l5r-ssr-live-") as work:
            copy = Path(work) / "phase0"
            shutil.copytree(R.live_tree(), copy, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))
            before = snapshot(R.live_tree())
            strip_later(copy)
            result = R.remove(copy, expect_sha=R.PRE_RELEASE_SHA)
            self.assertEqual((result["rebuild_sha256"], result["rebuild_bytes"]), (R.PRE_RELEASE_SHA, R.PRE_RELEASE_BYTES))
            self.assertEqual(snapshot(R.live_tree()), before)

    def test_live_blocks_hold_no_foreign_marker(self):
        for relative, slugs in ((LOOP_FILE, LOOP_SLUGS), (SEAM_FILE, SEAM_SLUGS)):
            with self.subTest(relative=relative):
                text = (R.live_tree() / relative).read_text(encoding="utf-8")
                _, found = R.strip_owned_blocks(text, relative, slugs)
                self.assertEqual(sorted(found), sorted(slugs))


if __name__ == "__main__":
    unittest.main(verbosity=2)
