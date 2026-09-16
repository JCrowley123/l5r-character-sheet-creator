#!/usr/bin/env python3
"""Positive and negative fixtures for Feature 4.53's removal tool.

Every case runs against a disposable in-memory or temporary fixture; none of them
touches the repository. The negative cases matter more than the positive ones: a
remover that quietly does the wrong thing is worse than one that refuses, and the
project has already been bitten once by a marker silently owning another phase's
lines (CLAUDE.md, "Re-verify removability at the END of a phase").

    python3 qa/test-removal.py
"""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("repairs_removal", Path(__file__).with_name("remove-phase.py"))
REMOVAL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REMOVAL)

MARKER = "PART I FEATURE 4.53"


class BlockTests(unittest.TestCase):
    """Cutting exactly the owned span, and nothing on either side of it."""

    def wrap(self, body, slug="repairs-seam", eol="\n"):
        return (f"  before();{eol}"
                f"  // {MARKER} BEGIN {slug}{eol}"
                f"{body}"
                f"  // END REPAIRS453 {slug}{eol}"
                f"  after();")

    def test_owned_block_is_cut_and_neighbours_survive_exactly(self):
        text, removed = REMOVAL.strip_owned_blocks(self.wrap("  added();\n"), "shared.js")
        self.assertEqual(text, "  before();\n  after();")
        self.assertEqual(removed, ["repairs-seam"])

    def test_crlf_line_endings_round_trip_byte_for_byte(self):
        text, _ = REMOVAL.strip_owned_blocks(self.wrap("  added();\r\n", eol="\r\n"), "shared.js")
        self.assertEqual(text, "  before();\r\n  after();")

    def test_two_separate_blocks_in_one_file_are_both_cut(self):
        source = (f"  a();\n  // {MARKER} BEGIN one\n  x();\n  // END REPAIRS453 one\n"
                  f"  b();\n  // {MARKER} BEGIN two\n  y();\n  // END REPAIRS453 two\n  c();")
        text, removed = REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertEqual(text, "  a();\n  b();\n  c();")
        self.assertEqual(removed, ["one", "two"])

    def test_file_with_no_block_is_returned_untouched(self):
        source = "  // PART G PHASE 3\n  untouched();\n"
        text, removed = REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertEqual(text, source)
        self.assertEqual(removed, [])

    def test_another_phases_marker_outside_our_block_is_left_alone(self):
        source = (f"  // PART J PHASE 5\n  theirs();\n"
                  f"  // {MARKER} BEGIN repairs-seam\n  ours();\n  // END REPAIRS453 repairs-seam\n"
                  f"  // PART H PHASE 9\n  alsoTheirs();\n")
        text, _ = REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertEqual(text, "  // PART J PHASE 5\n  theirs();\n  // PART H PHASE 9\n  alsoTheirs();\n")


class RefusalTests(unittest.TestCase):
    """The cases where refusing loudly is the only correct behaviour."""

    def test_foreign_marker_inside_our_block_is_refused(self):
        source = (f"  // {MARKER} BEGIN repairs-seam\n"
                  f"  // PART J PHASE 5\n  someoneElses();\n"
                  f"  // END REPAIRS453 repairs-seam\n")
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertIn("foreign marker", str(caught.exception))

    def test_unclosed_block_is_refused_rather_than_cutting_to_end_of_file(self):
        source = f"  // {MARKER} BEGIN repairs-seam\n  ours();\n  everythingAfter();\n"
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertIn("never closed", str(caught.exception))

    def test_orphan_end_delimiter_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks("  // END REPAIRS453 repairs-seam\n", "shared.js")
        self.assertIn("orphan", str(caught.exception))

    def test_mismatched_slug_is_refused(self):
        source = f"  // {MARKER} BEGIN one\n  ours();\n  // END REPAIRS453 two\n"
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_owned_blocks(source, "shared.js")
        self.assertIn("closes BEGIN", str(caught.exception))


class ManifestTests(unittest.TestCase):
    """The manifest entry must go, and every other entry must keep its exact bytes."""

    def manifest(self, include=True):
        entries = [
            '    { "file": "src/sheet/209.88-feat-disadv-gates.js",\n',
            '      "note": "PART I Feature 4.523 - gates." },\n',
        ]
        if include:
            entries += [
                '    { "file": "src/sheet/209.89-feat-adv-config-repairs.js",\n',
                '      "note": "PART I Feature 4.53 - repairs." },\n',
            ]
        entries += ['   { "file": "src/sheet/210-test-seam-and-init.js",\n',
                    '      "note": "seam" }\n']
        return '{\n  "fragments": [\n' + "".join(entries) + '  ]\n}\n'

    def test_our_entry_is_cut_and_the_rest_is_byte_identical(self):
        stripped = REMOVAL.strip_manifest(self.manifest(include=True))
        self.assertEqual(stripped, self.manifest(include=False))
        self.assertEqual(len(json.loads(stripped)["fragments"]), 2)

    def test_expect_sha_is_pointed_back_at_the_pre_release_build(self):
        source = self.manifest(include=True).replace(
            '{\n  "fragments"', '{\n  "expect_sha256": "deadbeef",\n  "fragments"')
        stripped = REMOVAL.strip_manifest(source)
        self.assertEqual(json.loads(stripped)["expect_sha256"], REMOVAL.PRE_RELEASE_SHA)

    def test_an_already_correct_expect_sha_is_left_alone(self):
        source = self.manifest(include=True).replace(
            '{\n  "fragments"', '{\n  "expect_sha256": "' + REMOVAL.PRE_RELEASE_SHA + '",\n  "fragments"')
        stripped = REMOVAL.strip_manifest(source)
        self.assertEqual(json.loads(stripped)["expect_sha256"], REMOVAL.PRE_RELEASE_SHA)

    def test_a_manifest_without_our_entry_is_refused(self):
        with self.assertRaises(REMOVAL.RemovalError) as caught:
            REMOVAL.strip_manifest(self.manifest(include=False))
        self.assertIn("expected exactly one", str(caught.exception))


class IoTests(unittest.TestCase):
    """Line endings must survive a read/write round trip untranslated."""

    def test_mixed_endings_survive_read_and_write(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.js"
            original = "a();\r\nb();\nc();\r\n"
            REMOVAL.write_exact(path, original)
            self.assertEqual(path.read_bytes(), original.encode("utf-8"))
            self.assertEqual(REMOVAL.read_exact(path), original)


class RecordedTargetTests(unittest.TestCase):
    """The recorded restore point is the one the README and ROLLBACK quote."""

    def test_pre_release_build_is_the_one_this_release_was_added_to(self):
        self.assertEqual(REMOVAL.PRE_RELEASE_SHA,
                         "27b57eff316ee6f34f528e055a8d8adda6bb0d60ed7a951519ec12af35122ff2")
        self.assertEqual(REMOVAL.PRE_RELEASE_BYTES, 2476062)

    def test_every_shared_file_this_release_touches_is_listed(self):
        self.assertEqual(set(REMOVAL.SHARED_FILES), {
            "src/sheet/210-test-seam-and-init.js",
            "src/sheet/209.8-feat-adv-config.js",
        })


if __name__ == "__main__":
    unittest.main(verbosity=2)
