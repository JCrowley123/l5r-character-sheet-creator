#!/usr/bin/env python3
"""Positive and negative fixtures for Feature 4.5.11's removal tool.

Disposable fixtures only; nothing here touches the repository. The refusal cases
matter more than the positive ones: a remover that quietly does the wrong thing is
worse than one that stops.

    python3 qa/test-removal.py

Three fixtures exist for risks specific to THIS release:

  - test_two_dotted_markers_do_not_collide. Feature 4.5.10 introduced the dotted marker and
    proved it against an invented 4.51. There are now TWO live dotted markers one digit apart,
    4.5.10 and 4.5.11, so the collision is no longer hypothetical: a prefix match, or a regex
    that treats '.' as "any character", would have this release's remover eat the previous
    release's blocks. Both are supplied here and the remover must cut exactly its own.

  - test_all_four_preview_blocks_are_cut. Like 4.5.10, this release puts FOUR blocks in Phase 3's
    roll preview. A remover that found only the first would leave three dead guarded calls behind
    and still rebuild "successfully" against a wrong hash.

  - test_live_tree_is_refused_by_manifest_identity. THE ONE THAT EARNED ITS PLACE THE HARD WAY.
    Every earlier Part I remover computed the live tree as parents[3] / "Part F — …", which
    resolves to the REPOSITORY ROOT / "Part F — …" — a path that does not exist, because that
    folder lives under Versions/. The guard therefore never fired in any of them, and a run
    intended to demonstrate the refusal instead deleted this release's own files out of the live
    tree while building it. Nothing was lost, but the safety net was decorative. This release
    resolves the path from Versions/ AND compares the resolved build/manifest.json, so a copy
    reached by a different spelling or a symlink is refused too. See ROLLBACK.md.
"""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("fortune_removal", Path(__file__).with_name("remove-phase.py"))
REMOVAL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REMOVAL)

MARKER = "PART I FEATURE 4.5.11"


class BlockTests(unittest.TestCase):
    def wrap(self, body, slug="fortune-seam", eol="\n"):
        return (f"  before();{eol}"
                f"  // {MARKER} BEGIN {slug}{eol}"
                f"{body}"
                f"  // END FORTUNE4511 {slug}{eol}"
                f"  after();")

    def test_owned_block_is_cut_and_neighbours_survive_exactly(self):
        text, removed = REMOVAL.strip_owned_blocks(self.wrap("  added();\n"), "shared.js")
        self.assertEqual(removed, ["fortune-seam"])
        self.assertEqual(text, "  before();\n  after();")

    def test_crlf_line_endings_round_trip(self):
        # core.autocrlf is false in this repository precisely so bytes round-trip; a remover that
        # normalised them would break every recorded sha256 restore point.
        text, removed = REMOVAL.strip_owned_blocks(
            self.wrap("  added();\r\n", eol="\r\n"), "shared.js")
        self.assertEqual(removed, ["fortune-seam"])
        self.assertEqual(text, "  before();\r\n  after();")

    def test_two_dotted_markers_do_not_collide(self):
        # 4.5.10's block must survive this remover untouched, and vice versa.
        text = (
            "  keep_a();\n"
            "  // PART I FEATURE 4.5.10 BEGIN preview-start\n"
            "  realm();\n"
            "  // END REALM4510 preview-start\n"
            "  // PART I FEATURE 4.5.11 BEGIN preview-start\n"
            "  fortune();\n"
            "  // END FORTUNE4511 preview-start\n"
            "  keep_b();\n"
        )
        stripped, removed = REMOVAL.strip_owned_blocks(text, "shared.js")
        self.assertEqual(removed, ["preview-start"])
        self.assertIn("realm();", stripped)
        self.assertIn("PART I FEATURE 4.5.10 BEGIN preview-start", stripped)
        self.assertNotIn("fortune();", stripped)
        self.assertNotIn("FORTUNE4511", stripped)

    def test_a_4_51_marker_is_not_mistaken_for_this_one(self):
        # '.' must be escaped in the BEGIN regex: unescaped, "4.5.11" would also match "4x5x11".
        text = ("  // PART I FEATURE 4.51 BEGIN something\n"
                "  other();\n"
                "  // END SOMETHING451 something\n")
        stripped, removed = REMOVAL.strip_owned_blocks(text, "shared.js")
        self.assertEqual(removed, [])
        self.assertEqual(stripped, text)

    def test_all_four_preview_blocks_are_cut(self):
        text = "".join(
            f"  // {MARKER} BEGIN {slug}\n  body_{slug}();\n  // END FORTUNE4511 {slug}\n"
            for slug in ("preview-start", "preview-cancel", "preview-html", "preview-toggle"))
        stripped, removed = REMOVAL.strip_owned_blocks("  head();\n" + text + "  tail();", "preview.js")
        self.assertEqual(removed,
                         ["preview-start", "preview-cancel", "preview-html", "preview-toggle"])
        self.assertEqual(stripped, "  head();\n  tail();")

    def test_foreign_marker_inside_our_block_is_refused(self):
        # Would mean this release had taken ownership of another phase's code.
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks(
                self.wrap("  // PART G PHASE 3 - not ours\n  added();\n"), "shared.js")

    def test_mismatched_slug_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks(
                f"  // {MARKER} BEGIN fortune-seam\n  x();\n  // END FORTUNE4511 preview-html\n",
                "shared.js")

    def test_unclosed_block_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks(f"  // {MARKER} BEGIN fortune-seam\n  x();\n", "shared.js")

    def test_orphan_end_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_owned_blocks("  // END FORTUNE4511 fortune-seam\n", "shared.js")


class ManifestTests(unittest.TestCase):
    def manifest(self, extra=""):
        return (
            '{\n'
            '  "expect_sha256": "deadbeef",\n'
            '  "fragments": [\n'
            '    { "file": "src/css/59.5-disadv-realm.css",\n'
            '      "note": "the previous release" },\n'
            '    { "file": "src/css/59.6-disadv-fortune.css",\n'
            '      "note": "this release" },\n'
            '    { "file": "src/sheet/209.97-feat-disadv-fortune.js",\n'
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
                         ["src/css/59.5-disadv-realm.css", "src/sheet/210-test-seam-and-init.js"])
        self.assertEqual(data["expect_sha256"], REMOVAL.PRE_RELEASE_SHA)
        # The neighbouring release's entry keeps its exact bytes.
        self.assertIn('    { "file": "src/css/59.5-disadv-realm.css",\n'
                      '      "note": "the previous release" },\n', out)

    def test_a_missing_entry_is_refused(self):
        broken = self.manifest().replace(
            '    { "file": "src/sheet/209.97-feat-disadv-fortune.js",\n'
            '      "note": "this release" },\n', '')
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_manifest(broken)


class LiveTreeGuardTests(unittest.TestCase):
    """The guard that was decorative in every earlier Part I remover. See this file's docstring."""

    def test_versions_is_two_levels_up_from_qa_not_three(self):
        # qa/ -> <phase folder> -> Versions. parents[3] is the repository root, which is what the
        # earlier removers used and why their guard could never match.
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
