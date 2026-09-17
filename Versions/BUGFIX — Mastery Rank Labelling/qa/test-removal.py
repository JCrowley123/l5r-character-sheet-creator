#!/usr/bin/env python3
"""Fixtures for the Mastery Rank Labelling remover, run without touching any real tree.

    python3 qa/test-removal.py

They exist because the removal proof is a single end-to-end run against a scratch copy: if that
run passes by luck rather than by correctness, nothing else notices. These pin the pieces.

Four are specific to this fix:

  * IT IS THE FIRST BUGFIX FOLDER TO USE THE DELIMITED ADDITIVE MODEL rather than the whole-file
    `originals/` restore the three earlier bugfix folders use. Its marker is the bare word BUGFIX
    plus a slug, and MARKER_RE's alternation captures only "BUGFIX" out of it — never the full
    "BUGFIX MASTERYRANK". `test_own_marker_spellings_are_both_accepted` and
    `test_a_foreign_phase_marker_inside_a_block_is_refused` pin both halves of that: our own
    spelling is accepted, another phase's is still refused.

  * NO IN-BLOCK PROSE MAY NAME ANOTHER BUGFIX. Because the bare word counts as ours, a sentence
    inside one of our blocks mentioning a different bugfix would be silently swallowed instead of
    refused. `test_no_block_contains_marker_shaped_prose` reads the LIVE tree and asserts no line
    inside our blocks says BUGFIX at all beyond the BEGIN line itself — CLAUDE.md's standing
    lesson, enforced rather than remembered.

  * IT CUTS BLOCKS FROM TRUNK CODE (100-dice-engine.js), two of them, one of which declares a
    `const` the other reads. `test_both_trunk_blocks_are_cut` pins that both come out together,
    since removing only one leaves a ReferenceError in Part B's damage maths.

  * THE MANIFEST ENTRY MUST BE THE COMPACT TWO-LINE SHAPE. Feature 4.5.12 reformatted the whole
    manifest with json.dumps() and broke its own removal; the cut here walks lines to the first
    `},` and depends on that shape. `test_the_compact_one_entry_per_two_lines_shape_is_what_the_cut_expects`
    is carried forward from that release, and `test_the_live_manifest_entry_leaves_no_blank_line`
    is new: the first removal attempt here came out ONE BYTE heavy because the inserted entry left
    a trailing blank line the cut could not take with it.

The live-tree guard tests are inherited from the D04a/D04b removers — the only ones whose guard
can fire at all. Kept rather than assumed: this file sits at the same depth in a differently named
folder, so the parents[2] reasoning has to be re-checked here.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location(
    "mastery_removal", Path(__file__).with_name("remove-phase.py"))
REMOVAL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REMOVAL)

MARKER = "BUGFIX MASTERYRANK"
LIVE = (Path(__file__).resolve().parents[2] / "Part F — Cross-Platform Delivery"
        / "PART F — Phase 0 Source Reorganization for Maintainability")


def wrap(body, slug="mastery-label-seam", eol="\n"):
    return (f"  before();{eol}"
            f"  // {MARKER} BEGIN {slug}{eol}"
            f"{body}"
            f"  // END MASTERYRANK {slug}{eol}"
            f"  after();")


class BlockTests(unittest.TestCase):
    def test_a_whole_block_is_cut_and_its_neighbours_are_not(self):
        text = wrap("  owned();\n")
        out, removed = REMOVAL.strip_owned_blocks(text, "fixture")
        self.assertEqual(removed, ["mastery-label-seam"])
        self.assertEqual(out, "  before();\n  after();")

    def test_crlf_line_endings_round_trip(self):
        text = wrap("  owned();\r\n", eol="\r\n")
        out, _ = REMOVAL.strip_owned_blocks(text, "fixture")
        self.assertEqual(out, "  before();\r\n  after();")

    def test_both_trunk_blocks_are_cut(self):
        # The start-index block declares a const the rewrite block reads. Cutting one and not the
        # other would leave a ReferenceError inside getWeaponDamageDice(), which every weapon on
        # the sheet goes through.
        text = (f"  // {MARKER} BEGIN mastery-label-start\n"
                "  const masteryBreakdownStart = breakdown.length;\n"
                "  // END MASTERYRANK mastery-label-start\n"
                "  section4();\n"
                f"  // {MARKER} BEGIN mastery-label-rewrite\n"
                "  rewrite(breakdown, masteryBreakdownStart);\n"
                "  // END MASTERYRANK mastery-label-rewrite\n")
        out, removed = REMOVAL.strip_owned_blocks(text, "fixture")
        self.assertEqual(removed, ["mastery-label-start", "mastery-label-rewrite"])
        self.assertEqual(out, "  section4();\n")
        self.assertNotIn("masteryBreakdownStart", out)

    def test_own_marker_spellings_are_both_accepted(self):
        # MARKER_RE captures the bare "BUGFIX" out of our own BEGIN line; the full spelling must
        # also be tolerated inside a block, or the remover would refuse its own code.
        for mention in ("BUGFIX", MARKER):
            with self.subTest(mention=mention):
                out, removed = REMOVAL.strip_owned_blocks(
                    wrap(f"  // {mention} — our own reference\n  owned();\n"), "fixture")
                self.assertEqual(removed, ["mastery-label-seam"])
                self.assertEqual(out, "  before();\n  after();")

    def test_a_foreign_phase_marker_inside_a_block_is_refused(self):
        text = wrap("  // PART I FEATURE 4.5.12 someone else's line\n  owned();\n")
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(text, "fixture")
        self.assertIn("foreign marker", str(caught.exception))

    def test_an_unclosed_block_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks(f"  // {MARKER} BEGIN mastery-label-seam\n  owned();\n", "fixture")

    def test_an_orphan_end_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks("  // END MASTERYRANK mastery-label-seam\n", "fixture")

    def test_a_mismatched_slug_is_refused(self):
        text = (f"  // {MARKER} BEGIN mastery-label-seam\n"
                "  owned();\n"
                "  // END MASTERYRANK mastery-label-rewrite\n")
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks(text, "fixture")

    def test_a_similarly_named_later_bugfix_does_not_collide(self):
        # The regexes must not treat a future "BUGFIX MASTERYRANKS" (or any longer word) as ours.
        text = ("  // BUGFIX MASTERYRANKS BEGIN something-else\n"
                "  theirs();\n"
                "  // END MASTERYRANKS something-else\n")
        out, removed = REMOVAL.strip_owned_blocks(text, "fixture")
        self.assertEqual(removed, [])
        self.assertEqual(out, text)


class ManifestTests(unittest.TestCase):
    def manifest(self, extra):
        return ('{\n  "expect_sha256": "deadbeef",\n  "fragments": [\n'
                '    { "file": "src/sheet/010-prelude.js",\n      "note": "keep me" },\n'
                + extra +
                '    { "file": "src/sheet/210-test-seam-and-init.js",\n      "note": "keep me too" }\n'
                '  ]\n}\n')

    def test_the_entry_is_cut_and_the_sha_is_restored(self):
        text = self.manifest('    { "file": "src/sheet/209.99-bugfix-mastery-rank-label.js",\n'
                             '      "note": "the fix" },\n')
        out = REMOVAL.strip_manifest(text)
        self.assertNotIn("209.99", out)
        self.assertIn("keep me", out)
        self.assertIn("keep me too", out)
        self.assertEqual(json.loads(out)["expect_sha256"], REMOVAL.PRE_RELEASE_SHA)

    def test_a_missing_entry_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_manifest(self.manifest(""))

    def test_the_compact_one_entry_per_two_lines_shape_is_what_the_cut_expects(self):
        # Carried forward from Feature 4.5.12, which broke its own removal by rewriting the whole
        # manifest with json.dumps(): the expanded four-line-per-entry form left an orphan "{".
        live = json.loads((LIVE / "build" / "manifest.json").read_text(encoding="utf-8"))
        self.assertTrue(any(e.get("file", "").endswith("209.99-bugfix-mastery-rank-label.js")
                            for e in live["fragments"]))
        lines = (LIVE / "build" / "manifest.json").read_text(encoding="utf-8").splitlines()
        hits = [i for i, l in enumerate(lines) if "209.99-bugfix-mastery-rank-label.js" in l]
        self.assertEqual(len(hits), 1)
        self.assertTrue(lines[hits[0]].lstrip().startswith('{ "file"'))
        self.assertTrue(lines[hits[0] + 1].rstrip().endswith("},"))

    def test_the_live_manifest_entry_leaves_no_blank_line(self):
        # The first removal attempt here rebuilt ONE BYTE heavy, because the inserted entry ended
        # "}," followed by a blank line, and the cut stops at the "}," — leaving the blank behind.
        lines = (LIVE / "build" / "manifest.json").read_text(encoding="utf-8").splitlines()
        hit = next(i for i, l in enumerate(lines) if "209.99-bugfix-mastery-rank-label.js" in l)
        self.assertNotEqual(lines[hit + 2].strip(), "",
                            "the entry is followed by a blank line the remover cannot cut")


class LiveTreeTests(unittest.TestCase):
    def test_the_live_tree_is_where_this_remover_thinks_it_is(self):
        # The guard eight earlier Part I removers carry resolves this from parents[3] and therefore
        # points at a path that has never existed. This asserts the fixed parents[2] shape actually
        # locates the tree FROM THIS FOLDER, which is a differently named folder at the same depth.
        self.assertTrue(LIVE.is_dir(), f"live Phase 0 tree not found at {LIVE}")
        self.assertTrue((LIVE / "build" / "manifest.json").is_file())

    def test_no_block_contains_marker_shaped_prose(self):
        # Because the bare word BUGFIX counts as ours, a mention of ANOTHER bugfix inside one of
        # our blocks would be swallowed rather than refused. Nothing but the BEGIN line may say it.
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
            begins = REMOVAL.BEGIN_RE.findall(text)
            ends = REMOVAL.END_RE.findall(text)
            self.assertEqual(begins, ends, f"{relative}: BEGIN/END slugs disagree")


if __name__ == "__main__":
    unittest.main(verbosity=2)
