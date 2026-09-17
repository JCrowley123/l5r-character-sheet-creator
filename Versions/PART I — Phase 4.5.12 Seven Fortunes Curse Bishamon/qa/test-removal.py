#!/usr/bin/env python3
"""Fixtures for Feature 4.5.12's remover, run without touching any real tree.

    python3 qa/test-removal.py

They exist because the removal proof is a single end-to-end run against a scratch copy: if that
run passes by luck rather than by correctness, nothing else notices. These pin the pieces.

Three of them are specific to this release:

  * Its shared files include TRUNK code (100-dice-engine.js), not just another phase's fragment,
    and it puts TWO blocks in that one file. `test_both_trunk_blocks_are_cut` pins that both come
    out and that the Part B/C code between them is untouched.

  * The blocks sit next to Part B and Part C FEATURE markers rather than PART I ones, so
    `test_neighbouring_part_c_marker_is_not_swallowed` checks the foreign-marker refusal against
    the markers this release is actually adjacent to.

  * The live-tree guard tests are inherited from the D04a remover, which is the only earlier one
    whose guard can fire at all. They are kept, not assumed: this file is one directory deeper in
    the same shape, so the same parents[2] reasoning has to hold here too.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("bishamon_removal", Path(__file__).with_name("remove-phase.py"))
REMOVAL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REMOVAL)

MARKER = "PART I FEATURE 4.5.12"


class BlockTests(unittest.TestCase):
    def wrap(self, body, slug="bishamon-seam", eol="\n"):
        return (f"  before();{eol}"
                f"  // {MARKER} BEGIN {slug}{eol}"
                f"{body}"
                f"  // END BISHAMON4512 {slug}{eol}"
                f"  after();")

    def test_owned_block_is_cut_and_neighbours_survive_exactly(self):
        text, removed = REMOVAL.strip_owned_blocks(self.wrap("  added();\n"), "shared.js")
        self.assertEqual(removed, ["bishamon-seam"])
        self.assertEqual(text, "  before();\n  after();")

    def test_crlf_line_endings_round_trip(self):
        # core.autocrlf is false in this repository precisely so bytes round-trip; a remover that
        # normalised them would break every recorded sha256 restore point.
        text, removed = REMOVAL.strip_owned_blocks(
            self.wrap("  added();\r\n", eol="\r\n"), "shared.js")
        self.assertEqual(removed, ["bishamon-seam"])
        self.assertEqual(text, "  before();\r\n  after();")

    def test_both_trunk_blocks_are_cut_and_the_code_between_survives(self):
        # This release's two blocks in 100-dice-engine.js sit ~270 lines apart with Part B's
        # mastery maths and Part C's orchestration between them. Both come out; that does not.
        text = (
            f"  // {MARKER} BEGIN damage-strength\n"
            "  strength_hook();\n"
            f"  // END BISHAMON4512 damage-strength\n"
            "  // 4. Structured mastery, behind the Phase 4 shadow-comparison guard.\n"
            "  mastery();\n"
            f"  // {MARKER} BEGIN damage-roll-note\n"
            "  note_hook();\n"
            f"  // END BISHAMON4512 damage-roll-note\n"
            "  tail();\n"
        )
        stripped, removed = REMOVAL.strip_owned_blocks(text, "100-dice-engine.js")
        self.assertEqual(removed, ["damage-strength", "damage-roll-note"])
        self.assertIn("mastery();", stripped)
        self.assertIn("Structured mastery", stripped)
        self.assertNotIn("strength_hook", stripped)
        self.assertNotIn("note_hook", stripped)
        self.assertNotIn("BISHAMON4512", stripped)

    def test_the_previous_releases_blocks_do_not_collide(self):
        # D04a's blocks must survive this remover untouched, and vice versa. Both markers are
        # dotted and share a prefix up to the final digit, which is exactly when a regex gets this
        # wrong.
        text = (
            "  keep_a();\n"
            "  // PART I FEATURE 4.5.11 BEGIN fortune-seam\n"
            "  fortune();\n"
            "  // END FORTUNE4511 fortune-seam\n"
            f"  // {MARKER} BEGIN bishamon-seam\n"
            "  bishamon();\n"
            "  // END BISHAMON4512 bishamon-seam\n"
            "  keep_b();\n"
        )
        stripped, removed = REMOVAL.strip_owned_blocks(text, "shared.js")
        self.assertEqual(removed, ["bishamon-seam"])
        self.assertIn("fortune();", stripped)
        self.assertIn("PART I FEATURE 4.5.11 BEGIN fortune-seam", stripped)
        self.assertNotIn("bishamon();", stripped)

    def test_a_4_51_marker_is_not_mistaken_for_this_one(self):
        # '.' must be escaped in the BEGIN regex: unescaped, "4.5.12" would also match "4x5x12".
        text = ("  // PART I FEATURE 4.51 BEGIN something\n"
                "  other();\n"
                "  // END SOMETHING451 something\n")
        stripped, removed = REMOVAL.strip_owned_blocks(text, "shared.js")
        self.assertEqual(removed, [])
        self.assertEqual(stripped, text)

    def test_neighbouring_part_c_marker_is_not_swallowed(self):
        # The roll-note block sits directly above PART C FEATURE 6's arrow decorator. A block that
        # failed to close before it would take Part C's code with it.
        text = (f"  // {MARKER} BEGIN damage-roll-note\n"
                "  note_hook();\n"
                "  // END BISHAMON4512 damage-roll-note\n"
                "  // PART C FEATURE 6 - name the arrow this roll used, then release it.\n"
                "  attachArrowDamageBreakdown(ctx, dmg, result);\n")
        stripped, removed = REMOVAL.strip_owned_blocks(text, "100-dice-engine.js")
        self.assertEqual(removed, ["damage-roll-note"])
        self.assertIn("attachArrowDamageBreakdown", stripped)
        self.assertIn("PART C FEATURE 6", stripped)

    def test_foreign_marker_inside_our_block_is_refused(self):
        # Would mean this release had taken ownership of another phase's code.
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks(
                self.wrap("  // PART C FEATURE 6 - not ours\n  added();\n"), "shared.js")

    def test_mismatched_slug_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks(
                f"  // {MARKER} BEGIN bishamon-seam\n  x();\n  // END BISHAMON4512 damage-strength\n",
                "shared.js")

    def test_unclosed_block_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks(f"  // {MARKER} BEGIN bishamon-seam\n  x();\n", "shared.js")

    def test_orphan_end_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks("  // END BISHAMON4512 bishamon-seam\n", "shared.js")


class ManifestTests(unittest.TestCase):
    def manifest(self, extra=""):
        return (
            '{\n'
            '  "expect_sha256": "deadbeef",\n'
            '  "fragments": [\n'
            '    { "file": "src/css/59.6-disadv-fortune.css",\n'
            '      "note": "the previous release" },\n'
            '    { "file": "src/css/59.7-disadv-fortune-bishamon.css",\n'
            '      "note": "this release" },\n'
            '    { "file": "src/sheet/209.98-feat-disadv-fortune-bishamon.js",\n'
            '      "note": "this release" },\n'
            f'{extra}'
            '    { "file": "src/sheet/210-test-seam-and-init.js",\n'
            '      "note": "the seam" }\n'
            '  ]\n'
            '}\n')

    def test_both_entries_are_cut_and_sha_restored(self):
        out = REMOVAL.strip_manifest(self.manifest())
        data = json.loads(out)
        files = [e["file"] for e in data["fragments"]]
        self.assertEqual(files,
                         ["src/css/59.6-disadv-fortune.css", "src/sheet/210-test-seam-and-init.js"])
        self.assertEqual(data["expect_sha256"], REMOVAL.PRE_RELEASE_SHA)
        # The previous release's entry keeps its exact bytes.
        self.assertIn('    { "file": "src/css/59.6-disadv-fortune.css",\n'
                      '      "note": "the previous release" },\n', out)

    def test_a_missing_entry_is_refused(self):
        broken = self.manifest().replace(
            '    { "file": "src/sheet/209.98-feat-disadv-fortune-bishamon.js",\n'
            '      "note": "this release" },\n', '')
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_manifest(broken)

    def test_the_compact_one_entry_per_two_lines_shape_is_what_the_cut_expects(self):
        # The live manifest is hand-maintained in a compact form: '{ "file": ...' on one line and
        # '"note": ... },' on the next. A json.dumps() rewrite expands every entry to four lines
        # and this line surgery then leaves an orphan '{'. That really happened while building
        # this release -- the manifest was rewritten wholesale, producing a 465-line diff where
        # four lines were wanted, and this remover was what caught it.
        live = (Path(REMOVAL.__file__).resolve().parents[2] / "Part F — Cross-Platform Delivery"
                / "PART F — Phase 0 Source Reorganization for Maintainability"
                / "build" / "manifest.json")
        text = live.read_text(encoding="utf-8")
        for fragment in REMOVAL.FRAGMENTS:
            self.assertIn(f'{{ "file": "{fragment}",\n', text,
                          f"{fragment} is not in the compact shape strip_manifest() expects")


class LiveTreeGuardTests(unittest.TestCase):
    """Inherited from the D04a remover -- the only earlier one whose guard can fire at all."""

    def test_versions_is_two_levels_up_from_qa_not_three(self):
        # qa/ -> <phase folder> -> Versions. parents[3] is the repository root, which is what the
        # pre-D04a removers used and why their guard could never match.
        qa = Path(REMOVAL.__file__).resolve().parent
        self.assertEqual(qa.parents[1].name, "Versions")
        self.assertNotEqual(qa.parents[2].name, "Versions")

    def test_the_live_phase_0_tree_is_where_the_guard_now_looks(self):
        versions = Path(REMOVAL.__file__).resolve().parents[2]
        live = (versions / "Part F — Cross-Platform Delivery"
                / "PART F — Phase 0 Source Reorganization for Maintainability")
        self.assertTrue(live.is_dir(),
                        f"the guard resolves the live tree to {live}, which must exist")
        self.assertTrue((live / "build" / "manifest.json").is_file())

    def test_manifest_identity_distinguishes_a_real_copy(self):
        # A copy has its own manifest path, so the identity comparison lets it through.
        with tempfile.TemporaryDirectory() as tmp:
            copy = Path(tmp) / "copy"
            (copy / "build").mkdir(parents=True)
            (copy / "build" / "manifest.json").write_text("{}", encoding="utf-8")
            versions = Path(REMOVAL.__file__).resolve().parents[2]
            live_manifest = (versions / "Part F — Cross-Platform Delivery"
                             / "PART F — Phase 0 Source Reorganization for Maintainability"
                             / "build" / "manifest.json").resolve()
            self.assertNotEqual((copy / "build" / "manifest.json").resolve(), live_manifest)


if __name__ == "__main__":
    unittest.main(verbosity=2)
