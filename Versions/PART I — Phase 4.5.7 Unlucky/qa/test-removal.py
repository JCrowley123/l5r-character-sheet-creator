#!/usr/bin/env python3
"""Positive and negative fixtures for Feature 4.57's removal tool.

Disposable fixtures only; nothing here touches the repository. The refusal cases
matter more than the positive ones: a remover that quietly does the wrong thing is
worse than one that stops.

    python3 qa/test-removal.py
"""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("ux_removal", Path(__file__).with_name("remove-phase.py"))
REMOVAL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REMOVAL)

MARKER = "PART I FEATURE 4.57"


class BlockTests(unittest.TestCase):
    def wrap(self, body, slug="unlucky-seam", eol="\n"):
        return (f"  before();{eol}"
                f"  // {MARKER} BEGIN {slug}{eol}"
                f"{body}"
                f"  // END UNLUCKY457 {slug}{eol}"
                f"  after();")

    def test_owned_block_is_cut_and_neighbours_survive_exactly(self):
        text, removed = REMOVAL.strip_owned_blocks(self.wrap("  added();\n"), "shared.js")
        self.assertEqual(text, "  before();\n  after();")
        self.assertEqual(removed, ["unlucky-seam"])

    def test_crlf_line_endings_round_trip_byte_for_byte(self):
        text, _ = REMOVAL.strip_owned_blocks(self.wrap("  added();\r\n", eol="\r\n"), "shared.js")
        self.assertEqual(text, "  before();\r\n  after();")

    def test_file_with_no_block_is_returned_untouched(self):
        source = "  // PART I FEATURE 4.53\n  untouched();\n"
        text, removed = REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertEqual(text, source)
        self.assertEqual(removed, [])

    def test_the_sibling_release_marker_is_left_alone(self):
        # "PART I FEATURE 4.5" is now a prefix of FIVE markers, and 4.56's rank-entries-seam sits
        # directly above this one in the real seam file. A remover matching on a prefix rather than
        # on the exact marker would eat its neighbours on the way past, so the fixture carries the
        # whole run rather than just the nearest one.
        source = ("  // PART I FEATURE 4.53 BEGIN repairs-seam\n  a();\n"
                  "  // END REPAIRS453 repairs-seam\n"
                  "  // PART I FEATURE 4.54 BEGIN ux-seam\n  b();\n"
                  "  // END UX454 ux-seam\n"
                  "  // PART I FEATURE 4.55 BEGIN eligibility-seam\n  c();\n"
                  "  // END GATES455 eligibility-seam\n"
                  "  // PART I FEATURE 4.56 BEGIN rank-entries-seam\n  d();\n"
                  "  // END RANKS456 rank-entries-seam\n"
                  f"  // {MARKER} BEGIN unlucky-seam\n  ours();\n"
                  "  // END UNLUCKY457 unlucky-seam\n")
        text, removed = REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertEqual(text, "  // PART I FEATURE 4.53 BEGIN repairs-seam\n  a();\n"
                               "  // END REPAIRS453 repairs-seam\n"
                               "  // PART I FEATURE 4.54 BEGIN ux-seam\n  b();\n"
                               "  // END UX454 ux-seam\n"
                               "  // PART I FEATURE 4.55 BEGIN eligibility-seam\n  c();\n"
                               "  // END GATES455 eligibility-seam\n"
                               "  // PART I FEATURE 4.56 BEGIN rank-entries-seam\n  d();\n"
                               "  // END RANKS456 rank-entries-seam\n")
        self.assertEqual(removed, ["unlucky-seam"])


class RefusalTests(unittest.TestCase):
    def test_foreign_marker_inside_our_block_is_refused(self):
        source = (f"  // {MARKER} BEGIN unlucky-seam\n  // PART J PHASE 5\n  theirs();\n"
                  "  // END UNLUCKY457 unlucky-seam\n")
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertIn("foreign marker", str(caught.exception))

    def test_unclosed_block_is_refused_rather_than_cutting_to_end_of_file(self):
        source = f"  // {MARKER} BEGIN unlucky-seam\n  ours();\n  everythingAfter();\n"
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertIn("never closed", str(caught.exception))

    def test_orphan_end_delimiter_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks("  // END UNLUCKY457 unlucky-seam\n", "shared.js")
        self.assertIn("orphan", str(caught.exception))

    def test_mismatched_slug_is_refused(self):
        source = f"  // {MARKER} BEGIN one\n  ours();\n  // END UNLUCKY457 two\n"
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertIn("closes BEGIN", str(caught.exception))


class ManifestTests(unittest.TestCase):
    """Both files must go — a release with a JS half and a CSS half can leave either behind."""

    def manifest(self, js=True, css=True, sha="deadbeef"):
        entries = ['    { "file": "src/css/57-disadv-nemesis.css",\n',
                   '      "note": "4.522" },\n']
        if css:
            entries += ['    { "file": "src/css/59.2-disadv-unlucky.css",\n',
                        '      "note": "4.55 css" },\n']
        entries += ['    { "file": "src/sheet/209.89-feat-adv-config-repairs.js",\n',
                    '      "note": "4.53" },\n']
        if js:
            entries += ['    { "file": "src/sheet/209.93-feat-disadv-unlucky.js",\n',
                        '      "note": "4.55 js" },\n']
        entries += ['   { "file": "src/sheet/210-test-seam-and-init.js",\n', '      "note": "seam" }\n']
        return ('{\n  "expect_sha256": "' + sha + '",\n  "fragments": [\n'
                + "".join(entries) + '  ]\n}\n')

    def test_both_entries_are_cut_and_the_rest_is_byte_identical(self):
        stripped = REMOVAL.strip_manifest(self.manifest())
        self.assertEqual(stripped, self.manifest(js=False, css=False, sha=REMOVAL.PRE_RELEASE_SHA))
        files = [e["file"] for e in json.loads(stripped)["fragments"]]
        self.assertNotIn("src/sheet/209.93-feat-disadv-unlucky.js", files)
        self.assertNotIn("src/css/59.2-disadv-unlucky.css", files)

    def test_expect_sha_is_pointed_back_at_the_pre_release_build(self):
        stripped = REMOVAL.strip_manifest(self.manifest())
        self.assertEqual(json.loads(stripped)["expect_sha256"], REMOVAL.PRE_RELEASE_SHA)

    def test_a_manifest_missing_the_css_half_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_manifest(self.manifest(css=False))
        self.assertIn("expected exactly 2", str(caught.exception))

    def test_a_manifest_missing_the_js_half_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError):
            REMOVAL.strip_manifest(self.manifest(js=False))


class IoTests(unittest.TestCase):
    def test_mixed_endings_survive_read_and_write(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.js"
            original = "a();\r\nb();\nc();\r\n"
            REMOVAL.write_exact(path, original)
            self.assertEqual(path.read_bytes(), original.encode("utf-8"))
            self.assertEqual(REMOVAL.read_exact(path), original)


class RecordedTargetTests(unittest.TestCase):
    def test_pre_release_build_is_the_one_this_release_was_added_to(self):
        self.assertEqual(REMOVAL.PRE_RELEASE_SHA,
                         "5a47ab73eb955fa03edddf9d16c90a4d9a0c6d90c1e679d0665320f963225ca6")
        self.assertEqual(REMOVAL.PRE_RELEASE_BYTES, 2546662)

    def test_both_halves_of_this_release_are_listed_for_deletion(self):
        self.assertEqual(set(REMOVAL.FRAGMENTS), {
            "src/sheet/209.93-feat-disadv-unlucky.js",
            "src/css/59.2-disadv-unlucky.css",
        })

    def test_the_only_shared_file_touched_is_the_seam(self):
        self.assertEqual(set(REMOVAL.SHARED_FILES), {"src/sheet/210-test-seam-and-init.js"})


if __name__ == "__main__":
    unittest.main(verbosity=2)
