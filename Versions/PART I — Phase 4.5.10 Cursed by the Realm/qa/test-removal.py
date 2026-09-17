#!/usr/bin/env python3
"""Positive and negative fixtures for Feature 4.5.10's removal tool.

Disposable fixtures only; nothing here touches the repository. The refusal cases
matter more than the positive ones: a remover that quietly does the wrong thing is
worse than one that stops.

    python3 qa/test-removal.py

Two fixtures exist for risks specific to THIS release:

  - test_the_dotted_marker_does_not_collide_with_the_compressed_ones. This is the first phase
    to use a DOTTED marker (PART I FEATURE 4.5.10) alongside seven compressed ones (4.53 ...
    4.59). "4.5.10" and "4.51" are different markers that a sloppy prefix match would confuse,
    and there is no 4.51 today to catch it by accident — so the fixture supplies one.

  - test_all_four_preview_blocks_are_cut. This release is the first 4.5.x to edit a fragment
    outside the seam, and it puts FOUR blocks in Phase 3's roll preview. A remover that found
    only the first would leave three dead guarded calls behind and still rebuild "successfully"
    against a wrong hash.
"""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("realm_removal", Path(__file__).with_name("remove-phase.py"))
REMOVAL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REMOVAL)

MARKER = "PART I FEATURE 4.5.10"


class BlockTests(unittest.TestCase):
    def wrap(self, body, slug="realm-seam", eol="\n"):
        return (f"  before();{eol}"
                f"  // {MARKER} BEGIN {slug}{eol}"
                f"{body}"
                f"  // END REALM4510 {slug}{eol}"
                f"  after();")

    def test_owned_block_is_cut_and_neighbours_survive_exactly(self):
        text, removed = REMOVAL.strip_owned_blocks(self.wrap("  added();\n"), "shared.js")
        self.assertEqual(text, "  before();\n  after();")
        self.assertEqual(removed, ["realm-seam"])

    def test_crlf_line_endings_round_trip_byte_for_byte(self):
        text, _ = REMOVAL.strip_owned_blocks(self.wrap("  added();\r\n", eol="\r\n"), "shared.js")
        self.assertEqual(text, "  before();\r\n  after();")

    def test_file_with_no_block_is_returned_untouched(self):
        source = "  // PART I FEATURE 4.53\n  untouched();\n"
        text, removed = REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertEqual(text, source)
        self.assertEqual(removed, [])

    def test_all_four_preview_blocks_are_cut(self):
        source = "".join(
            f"  // {MARKER} BEGIN {slug}\n  ours();\n  // END REALM4510 {slug}\n"
            for slug in ("preview-start", "preview-cancel", "preview-html", "preview-toggle"))
        text, removed = REMOVAL.strip_owned_blocks("  keep();\n" + source, "preview.js")
        self.assertEqual(text, "  keep();\n")
        self.assertEqual(removed, ["preview-start", "preview-cancel", "preview-html", "preview-toggle"])

    def test_the_sibling_release_marker_is_left_alone(self):
        # "PART I FEATURE 4.5" is a prefix of EIGHT markers now, and 4.59's doubt-seam sits directly
        # above this one in the real seam file. A remover matching on a prefix rather than on the
        # exact marker would eat its neighbours on the way past.
        source = ("  // PART I FEATURE 4.53 BEGIN repairs-seam\n  a();\n"
                  "  // END REPAIRS453 repairs-seam\n"
                  "  // PART I FEATURE 4.57 BEGIN unlucky-seam\n  e();\n"
                  "  // END UNLUCKY457 unlucky-seam\n"
                  "  // PART I FEATURE 4.58 BEGIN dependant-wrath-seam\n  f();\n"
                  "  // END AGREED458 dependant-wrath-seam\n"
                  "  // PART I FEATURE 4.59 BEGIN doubt-seam\n  g();\n"
                  "  // END DOUBT459 doubt-seam\n"
                  f"  // {MARKER} BEGIN realm-seam\n  ours();\n"
                  "  // END REALM4510 realm-seam\n")
        text, removed = REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertEqual(text, "  // PART I FEATURE 4.53 BEGIN repairs-seam\n  a();\n"
                               "  // END REPAIRS453 repairs-seam\n"
                               "  // PART I FEATURE 4.57 BEGIN unlucky-seam\n  e();\n"
                               "  // END UNLUCKY457 unlucky-seam\n"
                               "  // PART I FEATURE 4.58 BEGIN dependant-wrath-seam\n  f();\n"
                               "  // END AGREED458 dependant-wrath-seam\n"
                               "  // PART I FEATURE 4.59 BEGIN doubt-seam\n  g();\n"
                               "  // END DOUBT459 doubt-seam\n")
        self.assertEqual(removed, ["realm-seam"])

    def test_the_dotted_marker_does_not_collide_with_the_compressed_ones(self):
        # There is no 4.51 in the tree today, which is exactly why this fixture invents one: the
        # dotted scheme is only unambiguous if the matcher is anchored, and nothing else would
        # catch a regression here until some future phase actually took that number.
        source = ("  // PART I FEATURE 4.51 BEGIN other-seam\n  theirs();\n"
                  "  // END OTHER451 other-seam\n"
                  f"  // {MARKER} BEGIN realm-seam\n  ours();\n"
                  "  // END REALM4510 realm-seam\n")
        text, removed = REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertEqual(text, "  // PART I FEATURE 4.51 BEGIN other-seam\n  theirs();\n"
                               "  // END OTHER451 other-seam\n")
        self.assertEqual(removed, ["realm-seam"])


class RefusalTests(unittest.TestCase):
    def test_foreign_marker_inside_our_block_is_refused(self):
        source = (f"  // {MARKER} BEGIN realm-seam\n  // PART J PHASE 5\n  theirs();\n"
                  "  // END REALM4510 realm-seam\n")
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertIn("foreign marker", str(caught.exception))

    def test_phase_3s_own_marker_inside_our_preview_block_is_refused(self):
        # The realistic version of the check above: this release's blocks sit INSIDE Phase 3's
        # fragment, a few lines from Phase 4.5's Kharmic Tie hooks. Swallowing one of those is the
        # specific accident this file exists to make impossible.
        source = (f"  // {MARKER} BEGIN preview-html\n"
                  "  // PART I PHASE 4.5 - Kharmic Tie's own hook\n  theirs();\n"
                  "  // END REALM4510 preview-html\n")
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(source, "208-feat-roll-preview.js")
        self.assertIn("foreign marker", str(caught.exception))

    def test_unclosed_block_is_refused_rather_than_cutting_to_end_of_file(self):
        source = f"  // {MARKER} BEGIN realm-seam\n  ours();\n  everythingAfter();\n"
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertIn("never closed", str(caught.exception))

    def test_orphan_end_delimiter_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks("  // END REALM4510 realm-seam\n", "shared.js")
        self.assertIn("orphan", str(caught.exception))

    def test_mismatched_slug_is_refused(self):
        source = f"  // {MARKER} BEGIN one\n  ours();\n  // END REALM4510 two\n"
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertIn("closes BEGIN", str(caught.exception))


class ManifestTests(unittest.TestCase):
    """Both files must go — a release with a JS half and a CSS half can leave either behind."""

    def manifest(self, js=True, css=True, sha="deadbeef"):
        entries = ['    { "file": "src/css/59.4-disadv-doubt.css",\n',
                   '      "note": "4.59" },\n']
        if css:
            entries += ['    { "file": "src/css/59.5-disadv-realm.css",\n',
                        '      "note": "4.5.10 css" },\n']
        entries += ['    { "file": "src/sheet/209.95-feat-disadv-doubt.js",\n',
                    '      "note": "4.59" },\n']
        if js:
            entries += ['    { "file": "src/sheet/209.96-feat-disadv-realm.js",\n',
                        '      "note": "4.5.10 js" },\n']
        entries += ['   { "file": "src/sheet/210-test-seam-and-init.js",\n', '      "note": "seam" }\n']
        return ('{\n  "expect_sha256": "' + sha + '",\n  "fragments": [\n'
                + "".join(entries) + '  ]\n}\n')

    def test_both_entries_are_cut_and_the_rest_is_byte_identical(self):
        stripped = REMOVAL.strip_manifest(self.manifest())
        self.assertEqual(stripped, self.manifest(js=False, css=False, sha=REMOVAL.PRE_RELEASE_SHA))
        files = [e["file"] for e in json.loads(stripped)["fragments"]]
        self.assertNotIn("src/sheet/209.96-feat-disadv-realm.js", files)
        self.assertNotIn("src/css/59.5-disadv-realm.css", files)
        # The neighbouring release's entries must survive untouched.
        self.assertIn("src/sheet/209.95-feat-disadv-doubt.js", files)
        self.assertIn("src/css/59.4-disadv-doubt.css", files)

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
                         "a8c63d61a9cd7fed740792ddd38781280b577941dc3947a07f45b2ae009d2abe")
        self.assertEqual(REMOVAL.PRE_RELEASE_BYTES, 2585131)

    def test_both_halves_of_this_release_are_listed_for_deletion(self):
        self.assertEqual(set(REMOVAL.FRAGMENTS), {
            "src/sheet/209.96-feat-disadv-realm.js",
            "src/css/59.5-disadv-realm.css",
        })

    def test_both_shared_files_are_listed(self):
        # Phase 3's preview is the one a future edit is most likely to forget, because every
        # previous 4.5.x release touched the seam and nothing else.
        self.assertEqual(set(REMOVAL.SHARED_FILES), {
            "src/sheet/210-test-seam-and-init.js",
            "src/sheet/208-feat-roll-preview.js",
        })


if __name__ == "__main__":
    unittest.main(verbosity=2)
