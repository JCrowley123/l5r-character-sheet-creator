#!/usr/bin/env python3
"""Adversarial remover fixtures for PART I — Phase 4.5.27 Situational Roll Entries. Every
write is confined to a TemporaryDirectory. The live tree is only read: to prove the path guard, and
copied to a scratch folder for the real removal. Adapted from Phase 4.6's (Part I) test-removal.py;
this phase owns one fragment and one seam block, and edits no other shared source."""

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

SPEC = importlib.util.spec_from_file_location("sit4527_removal", Path(__file__).with_name("remove-phase.py"))
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)
SEAM_FILE = "src/sheet/210-test-seam-and-init.js"
SEAM_SLUGS = ("situational-entries-seam",)
THIS_RELEASE = "PART I — Phase 4.5.27 Situational Roll Entries"


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


def blk(slug, body="    owned();\n"):
    return f"  // PART I FEATURE 4.5.27 BEGIN {slug}\n{body}  // END SIT4527 {slug}\n"


# The release built before this one with a seam block (the Minor Clan Defender Paragon fix); its block must survive.
EARLIER = ("  a();\n  // BUGFIX PG47 BEGIN minor-defender-paragon-seam\n  paragon();\n"
           "  // END PG47 minor-defender-paragon-seam\n")


def seam(extra=""):
    return EARLIER + blk(SEAM_SLUGS[0]) + "  c();\n" + extra


TRUNK = "  function advConfigExtendedRollModifiers(c){ return []; }\n  const RD4515 = {register(){ return true; }};\n"
SCRIPT = "  // ========= PART I FEATURE 4.5.27: SITUATIONAL ROLL ENTRIES =========\n  const SITUATIONAL_ENTRIES_ENABLED = true;\n  const SIT4527 = {};\n"


def manifest():
    return "\n".join([
        '{', '  "output": "l5r-character-sheet.html",', '  "expect_sha256": "' + "0" * 64 + '",', '  "fragments": [',
        '    { "file": "src/shell/start.html",   "note": "unrelated spacing stays" },',
        '    { "file": "src/sheet/070-schools-paths-techniques.js", "note": "trunk" },',
        f'    {{ "file": "{R.FRAGMENTS[0]}",', '      "note": "owned script" },',
        f'    {{ "file": "{SEAM_FILE}", "note": "shared" }}', '  ]', '}', ''])


def write(root, relative, text):
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def fixture(root, seamed=None, script=None, trunk=None):
    write(root, "build/manifest.json", manifest())
    write(root, "src/shell/start.html", "<!doctype html>\n")
    write(root, "src/sheet/070-schools-paths-techniques.js", TRUNK if trunk is None else trunk)
    write(root, R.FRAGMENTS[0], SCRIPT if script is None else script)
    write(root, SEAM_FILE, seam() if seamed is None else seamed)
    write(root, "l5r-character-sheet.html", "old output\n")


def snapshot(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob("*") if p.is_file()}


class Blocks(unittest.TestCase):
    def test_block_removed_and_everything_else_kept(self):
        out, slugs = R.strip_owned_blocks(seam(), "f", SEAM_SLUGS)
        self.assertEqual((slugs, out), (list(SEAM_SLUGS), EARLIER + "  c();\n"))

    def test_missing_unknown_or_duplicate_block_refused(self):
        for text in [EARLIER, seam(blk("other")), seam(blk(SEAM_SLUGS[0]))]:
            with self.subTest(text=text[-40:]), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, "f", SEAM_SLUGS)

    def test_orphan_mismatched_unclosed_refused(self):
        tag = "END SIT4527 " + SEAM_SLUGS[0]
        for text in [seam("  // " + tag + "\n"), seam().replace(tag, "END SIT4527 other"),
                     seam().replace("  // " + tag + "\n", "")]:
            with self.subTest(), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, "f", SEAM_SLUGS)

    def test_foreign_marker_inside_block_refused(self):
        for marker in ["PART J PHASE 7", "PART I PHASE 4.8", "Part K Phase 12's gate", "BUGFIX", "PART I PHASE 4.6"]:
            with self.subTest(marker=marker), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(seam().replace("    owned();\n", f"    // {marker}\n", 1), "f", SEAM_SLUGS)

    def test_prefix_neighbours_are_not_owned_markers(self):
        # 4.5.271 and 4.5.28 would be other releases; 4.5.2 is an earlier one.
        for number in ["4.5.271", "4.5.28", "4.5.2"]:
            with self.subTest(number=number):
                later = f"  // PART I FEATURE {number} BEGIN later\n  later();\n  // END LATER later\n"
                out, _ = R.strip_owned_blocks(seam(later), "f", SEAM_SLUGS)
                self.assertTrue(out.endswith(later))

    def test_partial_own_marker_outside_blocks_refused(self):
        for extra in ["  // PART I FEATURE 4.5.27 stray\n", "  // END SIT4527\n"]:
            with self.subTest(extra=extra), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(seam(extra), "f", SEAM_SLUGS)

    def test_crlf_and_no_final_newline_preserved(self):
        text = seam().replace("\n", "\r\n").removesuffix("\r\n")
        out, _ = R.strip_owned_blocks(text, "f", SEAM_SLUGS)
        self.assertEqual(out, EARLIER.replace("\n", "\r\n") + "  c();")


class Scratch(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="l5r-sit4527-fixture-")
        self.root = Path(self.temp.name) / "tree"
        self.root.mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def assertRefusedUnchanged(self):
        before = snapshot(self.root)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root)
        self.assertEqual(snapshot(self.root), before)

    def test_removes_fragment_block_and_manifest_entry_only(self):
        fixture(self.root)
        R.remove(self.root)
        files = snapshot(self.root)
        self.assertNotIn(R.FRAGMENTS[0], files)
        self.assertEqual(files[SEAM_FILE].decode(), EARLIER + "  c();\n")
        self.assertEqual(files["src/sheet/070-schools-paths-techniques.js"].decode(), TRUNK)
        text = files["build/manifest.json"].decode()
        self.assertIn('"file": "src/shell/start.html",   "note": "unrelated spacing stays"', text)
        self.assertNotIn("209.9999994-feat-situational-entries", text)

    def test_dry_run_and_failed_expect_write_nothing(self):
        fixture(self.root)
        before = snapshot(self.root)
        R.remove(self.root, dry_run=True)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, expect_sha="0" * 64)
        self.assertEqual(snapshot(self.root), before)

    def test_surface_left_in_a_retained_file_refused(self):
        for extra in ["  if (SIT4527) go();\n", "  const on = SITUATIONAL_ENTRIES_ENABLED;\n", "  sit4527Unresolved();\n"]:
            with self.subTest(extra=extra):
                fixture(self.root, seamed=seam(extra))
                self.assertRefusedUnchanged()
        fixture(self.root, trunk=TRUNK + "  const x = SIT4527;\n")
        self.assertRefusedUnchanged()

    def test_trunk_names_it_rebinds_are_not_its_surface(self):
        # advConfigExtendedRollModifiers and RD4515 belong to others; finding them is not a leak.
        fixture(self.root, trunk=TRUNK + "  advConfigExtendedRollModifiers = function(){ return []; };\n  RD4515.register(\'x\', {});\n")
        R.remove(self.root)
        self.assertNotIn(R.FRAGMENTS[0], snapshot(self.root))

    def test_the_seam_block_missing_refused(self):
        fixture(self.root, seamed=EARLIER + "  c();\n")
        self.assertRefusedUnchanged()

    def test_foreign_marker_in_owned_fragment_refused(self):
        for marker in ["PART H PHASE 9", "BUGFIX", "PART J PHASE 7", "Part K Phase 12 swallowed"]:
            with self.subTest(marker=marker):
                fixture(self.root, script="// PART I FEATURE 4.5.27\n// " + marker + "\n")
                self.assertRefusedUnchanged()

    def test_missing_owned_marker_refused_before_writes(self):
        fixture(self.root, script="const SIT4527 = {};\n")
        self.assertRefusedUnchanged()

    def test_later_source_and_manifest_entry_survive(self):
        fixture(self.root)
        base = R.remove(self.root, dry_run=True)
        future = "src/sheet/future.js"
        write(self.root, future, "// BUGFIX FUTUREZERO\nconst future = true;\n")
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
        with tempfile.TemporaryDirectory(prefix="l5r-sit4527-live-") as work:
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

    def test_live_block_holds_no_foreign_marker(self):
        text = (R.live_tree() / SEAM_FILE).read_text(encoding="utf-8")
        _, found = R.strip_owned_blocks(text, SEAM_FILE, SEAM_SLUGS)
        self.assertEqual(found, list(SEAM_SLUGS))


if __name__ == "__main__":
    unittest.main(verbosity=2)
