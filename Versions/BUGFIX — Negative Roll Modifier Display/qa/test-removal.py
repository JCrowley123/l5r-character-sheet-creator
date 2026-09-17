#!/usr/bin/env python3
"""Fixtures for the Negative Roll Modifier Display remover, run without touching any real tree.

    python3 qa/test-removal.py

They exist because the removal proof is a single end-to-end run against a scratch copy: if that
run passes by luck rather than by correctness, nothing else notices.

WHAT IS DIFFERENT HERE, AND WHY MOST OF THESE ARE NEW. The Mastery Rank Labelling bugfix was purely
ADDITIVE, so its remover only ever had to CUT. This one REWRITES two trunk expressions, so its
remover has to cut AND PUT BACK, from verbatim text it carries in RESTORE. That is a second thing
to get wrong, and these pin it:

  * test_a_rewritten_block_is_restored_not_just_cut -- the whole point. Cutting alone would leave
    the roll modal with no notation and no keep-note at all.
  * test_every_restore_key_must_be_reached -- a RESTORE entry that no block claims means the live
    tree has drifted from what this remover was written against. A rebuild that still hashed
    correctly after that would be luck.
  * test_the_live_blocks_carry_the_trunks_own_expression -- reads the LIVE tree and asserts each
    block still contains, as its guarded fallback, exactly the text RESTORE will put back. This is
    what makes the restore text verifiable rather than a copy that can silently rot.
  * test_a_stale_marker_name_is_caught -- carried forward from a real mistake made building this:
    the remover was first written with the previous bugfix's END marker still in its regex, and
    its own orphan-END guard refused to run rather than mis-cutting the file. That guard is worth
    a fixture.

The live-tree guard tests are inherited from the D04a/D04b removers, the only ones whose guard can
fire at all, and re-checked here because this folder sits at the same depth under a different name.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import unittest

SPEC = importlib.util.spec_from_file_location(
    "negmod_removal", Path(__file__).with_name("remove-phase.py"))
REMOVAL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REMOVAL)

MARKER = "BUGFIX NEGMOD"
LIVE = (Path(__file__).resolve().parents[2] / "Part F — Cross-Platform Delivery"
        / "PART F — Phase 0 Source Reorganization for Maintainability")


def wrap(body, slug="negmod-seam", eol="\n"):
    return (f"  before();{eol}"
            f"  // {MARKER} BEGIN {slug}{eol}"
            f"{body}"
            f"  // END NEGMOD {slug}{eol}"
            f"  after();")


class BlockTests(unittest.TestCase):
    def test_a_block_with_no_restore_entry_is_cut_outright(self):
        out, removed = REMOVAL.strip_owned_blocks(wrap("  owned();\n"), "fixture")
        self.assertEqual(removed, ["negmod-seam"])
        self.assertEqual(out, "  before();\n  after();")

    def test_a_rewritten_block_is_restored_not_just_cut(self):
        # "keep-note" is a REWRITE, so its block must come out and the trunk's own line go back in.
        out, removed = REMOVAL.strip_owned_blocks(wrap("  whatever();\n", slug="keep-note"), "fixture")
        self.assertEqual(removed, ["keep-note"])
        self.assertIn("` + ${currentRollBonus} bonus`", out)
        self.assertNotIn("whatever();", out)
        self.assertEqual(out, "  before();\n" + REMOVAL.RESTORE["keep-note"] + "  after();")

    def test_both_rewritten_blocks_have_restore_text(self):
        self.assertEqual(sorted(REMOVAL.RESTORE), ["keep-note", "notation"])
        for slug, text in REMOVAL.RESTORE.items():
            self.assertTrue(text.endswith("\n"), f"{slug}: restore text must be whole lines")

    def test_crlf_line_endings_round_trip(self):
        out, _ = REMOVAL.strip_owned_blocks(wrap("  owned();\r\n", eol="\r\n"), "fixture")
        self.assertEqual(out, "  before();\r\n  after();")

    def test_a_foreign_phase_marker_inside_a_block_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(wrap("  // PART I FEATURE 4.5.12 theirs\n"), "fixture")
        self.assertIn("foreign marker", str(caught.exception))

    def test_a_stale_marker_name_is_caught(self):
        # The mistake actually made while building this: the remover carried the PREVIOUS bugfix's
        # END marker, so this file's own END lines read as orphans. It refused rather than
        # mis-cutting, which is the behaviour worth pinning.
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks("  // END NEGMOD negmod-seam\n", "fixture")
        self.assertIn("orphan END NEGMOD", str(caught.exception))

    def test_an_unclosed_block_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks(f"  // {MARKER} BEGIN negmod-seam\n  owned();\n", "fixture")

    def test_a_mismatched_slug_is_refused(self):
        text = (f"  // {MARKER} BEGIN notation\n  owned();\n  // END NEGMOD keep-note\n")
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks(text, "fixture")

    def test_own_marker_spellings_are_both_accepted(self):
        # MARKER_RE captures the bare word "BUGFIX" out of this fix's own BEGIN lines, never the
        # full "BUGFIX NEGMOD", so both must count as ours or the remover refuses its own code.
        for mention in ("BUGFIX", MARKER):
            with self.subTest(mention=mention):
                out, removed = REMOVAL.strip_owned_blocks(
                    wrap(f"  // {mention} our own reference\n"), "fixture")
                self.assertEqual(removed, ["negmod-seam"])


class LiveTreeTests(unittest.TestCase):
    def test_the_live_tree_is_where_this_remover_thinks_it_is(self):
        self.assertTrue(LIVE.is_dir(), f"live Phase 0 tree not found at {LIVE}")
        self.assertTrue((LIVE / "build" / "manifest.json").is_file())

    def test_the_live_blocks_carry_the_trunks_own_expression(self):
        # Each block keeps the trunk's original expression as its guarded fallback. That is what
        # makes the RESTORE text above verifiable rather than a copy that can rot: the exact text
        # the remover will put back is present in the live file right now.
        text = (LIVE / "src/sheet/100-dice-engine.js").read_text(encoding="utf-8")
        for slug, restored in REMOVAL.RESTORE.items():
            expression = restored.strip()
            expression = expression[expression.index("=") + 1:].strip().rstrip(";")
            # The fallback is the tail of the original expression, after the "?" branch.
            tail = expression.split("?")[-1].split(":")[-1].strip()
            self.assertIn(tail, text, f"{slug}: the trunk fallback {tail!r} is not in the live file")

    def test_every_restore_key_must_be_reached(self):
        text = (LIVE / "src/sheet/100-dice-engine.js").read_text(encoding="utf-8")
        found = set(REMOVAL.BEGIN_RE.findall(text))
        self.assertEqual(found, set(REMOVAL.RESTORE),
                         "the rewritten blocks in the live file and RESTORE disagree")

    def test_no_block_contains_marker_shaped_prose(self):
        # The bare word BUGFIX counts as ours, so a mention of ANOTHER bugfix inside one of our
        # blocks would be swallowed rather than refused. CLAUDE.md's standing lesson, enforced.
        for relative in REMOVAL.SHARED_FILES:
            text = (LIVE / relative).read_text(encoding="utf-8")
            inside = False
            for number, line in enumerate(text.splitlines(), 1):
                if REMOVAL.BEGIN_RE.search(line):
                    inside = True
                    continue
                if REMOVAL.END_RE.search(line):
                    inside = False
                    continue
                if inside:
                    self.assertNotIn("BUGFIX", line.upper(),
                                     f"{relative}:{number} names a bugfix inside a block")

    def test_every_owned_block_in_the_live_tree_is_balanced(self):
        for relative in REMOVAL.SHARED_FILES:
            text = (LIVE / relative).read_text(encoding="utf-8")
            self.assertEqual(REMOVAL.BEGIN_RE.findall(text), REMOVAL.END_RE.findall(text),
                             f"{relative}: BEGIN/END slugs disagree")

    def test_the_live_manifest_entry_leaves_no_blank_line(self):
        # Carried forward: the Mastery Rank Labelling fix rebuilt ONE BYTE heavy because its
        # inserted manifest entry was followed by a blank line the cut could not take with it.
        lines = (LIVE / "build" / "manifest.json").read_text(encoding="utf-8").splitlines()
        hit = next(i for i, l in enumerate(lines) if "209.991-bugfix-negative-roll-modifier.js" in l)
        self.assertTrue(lines[hit].lstrip().startswith('{ "file"'))
        self.assertTrue(lines[hit + 1].rstrip().endswith("},"))
        self.assertNotEqual(lines[hit + 2].strip(), "",
                            "the entry is followed by a blank line the remover cannot cut")


class ManifestTests(unittest.TestCase):
    def manifest(self, extra):
        return ('{\n  "expect_sha256": "deadbeef",\n  "fragments": [\n'
                '    { "file": "src/sheet/010-prelude.js",\n      "note": "keep me" },\n'
                + extra +
                '    { "file": "src/sheet/210-test-seam-and-init.js",\n      "note": "keep me too" }\n'
                '  ]\n}\n')

    def test_the_entry_is_cut_and_the_sha_is_restored(self):
        text = self.manifest('    { "file": "src/sheet/209.991-bugfix-negative-roll-modifier.js",\n'
                             '      "note": "the fix" },\n')
        out = REMOVAL.strip_manifest(text)
        self.assertNotIn("209.991", out)
        self.assertIn("keep me", out)
        self.assertIn("keep me too", out)
        self.assertEqual(json.loads(out)["expect_sha256"], REMOVAL.PRE_RELEASE_SHA)

    def test_a_missing_entry_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_manifest(self.manifest(""))


if __name__ == "__main__":
    unittest.main(verbosity=2)
