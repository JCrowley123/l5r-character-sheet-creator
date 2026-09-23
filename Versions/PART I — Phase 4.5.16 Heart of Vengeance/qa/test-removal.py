#!/usr/bin/env python3
"""Adversarial remover fixtures. Every write is confined to a TemporaryDirectory.

The live tree is read only to verify the path guard. No remover is ever invoked
against it. Whole-build byte/harness parity is measured by verify-variants.py.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("heart_vengeance_removal", Path(__file__).with_name("remove-phase.py"))
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)
SLUG = "heart-vengeance-seam"
SHARED = "src/sheet/210-test-seam-and-init.js"


def block(body="  owned();\n", slug=SLUG, eol="\n"):
    return (f"  before();{eol}  // {R.MARKER} BEGIN {slug}{eol}"
            f"{body}  // END HV4516 {slug}{eol}  after();{eol}")


def manifest(eol="\n"):
    return eol.join([
        '{', '  "output": "l5r-character-sheet.html",',
        '  "expect_sha256": "' + "0" * 64 + '",', '  "fragments": [',
        '    { "file": "src/shell/start.html", "note": "unrelated spacing stays" },',
        f'    {{ "file": "{R.FRAGMENTS[0]}",', '      "note": "owned script" },',
        f'    {{ "file": "{R.FRAGMENTS[1]}", "note": "owned CSS" }},',
        f'    {{ "file": "{SHARED}", "note": "shared" }}', '  ]', '}', ''])


def write(root, relative, text):
    path = root / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def fixture(root, eol="\n"):
    write(root, "build/manifest.json", manifest(eol))
    write(root, "src/shell/start.html", "<!doctype html>" + eol)
    write(root, R.FRAGMENTS[0], f"// {R.MARKER} heart of vengeance{eol}const HV4516 = {{}};{eol}")
    write(root, R.FRAGMENTS[1], f"/* {R.MARKER} styles */{eol}.hv4516-badge {{ color: red; }}{eol}")
    write(root, SHARED, block(eol=eol, body="  owned();" + eol))
    write(root, "l5r-character-sheet.html", "prior generated output" + eol)


def snapshot(root):
    return {path.relative_to(root).as_posix(): path.read_bytes()
            for path in root.rglob("*") if path.is_file()}


class BlockFixtures(unittest.TestCase):
    def test_exact_owned_block_removed_only(self):
        result, slugs = R.strip_owned_blocks(block(), "fixture")
        self.assertEqual(slugs, [SLUG])
        self.assertEqual(result, "  before();\n  after();\n")

    def test_crlf_bytes_outside_block_preserved(self):
        result, _ = R.strip_owned_blocks(block(eol="\r\n", body="  owned();\r\n"), "fixture")
        self.assertEqual(result, "  before();\r\n  after();\r\n")

    def test_missing_block_refused(self):
        with self.assertRaises(R.RemovalError):
            R.strip_owned_blocks("  untouched();\n", "fixture")

    def test_duplicate_block_refused(self):
        with self.assertRaisesRegex(R.RemovalError, "duplicate"):
            R.strip_owned_blocks(block() + block(), "fixture")

    def test_unknown_slug_refused(self):
        with self.assertRaisesRegex(R.RemovalError, "unexpected"):
            R.strip_owned_blocks(block(slug="other-seam"), "fixture")

    def test_mismatched_slug_refused(self):
        with self.assertRaisesRegex(R.RemovalError, "mismatched"):
            R.strip_owned_blocks(block().replace("END HV4516 " + SLUG, "END HV4516 wrong"), "fixture")

    def test_orphan_end_refused(self):
        with self.assertRaisesRegex(R.RemovalError, "orphan"):
            R.strip_owned_blocks("// END HV4516 heart-vengeance-seam\n", "fixture")

    def test_missing_end_refused(self):
        with self.assertRaisesRegex(R.RemovalError, "unclosed"):
            R.strip_owned_blocks(block().replace("  // END HV4516 " + SLUG + "\n", ""), "fixture")

    def test_partial_marker_refused(self):
        for source in [block().replace("BEGIN", "BEG"), block().replace("END HV4516", "END HV451"),
                       block().replace("// PART I", "/* PART I"), block().replace(SLUG, SLUG + " extra")]:
            with self.subTest(source=source), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(source, "fixture")

    def test_partial_end_inside_block_refused(self):
        for partial in ["// END HV4516", "// end hv4516 wrong", "/* END HV4516 wrong */"]:
            with self.subTest(partial=partial), self.assertRaisesRegex(R.RemovalError, "END marker"):
                R.strip_owned_blocks(block(partial + "\n"), "fixture")

    def test_foreign_phase_inside_refused(self):
        for marker in ["PART I FEATURE 4.5.15", "PART J PHASE 8", "Part G Phase 3's preview", "BUGFIX"]:
            with self.subTest(marker=marker), self.assertRaisesRegex(R.RemovalError, "marker"):
                R.strip_owned_blocks(block("  // " + marker + " prose\n"), "fixture")

    def test_nested_own_marker_refused(self):
        with self.assertRaisesRegex(R.RemovalError, "nested"):
            R.strip_owned_blocks(block(block()), "fixture")

    def test_same_release_marker_prose_inside_refused(self):
        with self.assertRaisesRegex(R.RemovalError, "marker"):
            R.strip_owned_blocks(block("  // " + R.MARKER + " repeated header\n"), "fixture")

    def test_later_phases_outside_block_preserved(self):
        later = "// PART I FEATURE 4.5.160 later phase\nkeepLater();\n// PART I FEATURE 4.5.1 earlier\n// BUGFIX other fix\n"
        result, _ = R.strip_owned_blocks(later + block() + later, "fixture")
        self.assertEqual(result, later + "  before();\n  after();\n" + later)


class ManifestFixtures(unittest.TestCase):
    def test_compact_and_multiline_entries_removed_without_reformat(self):
        text = manifest()
        result = R.strip_manifest(text)
        self.assertNotIn("owned script", result)
        self.assertNotIn("owned CSS", result)
        self.assertIn('    { "file": "src/shell/start.html", "note": "unrelated spacing stays" },\n', result)
        self.assertEqual(json.loads(result)["expect_sha256"], R.PRE_RELEASE_SHA)

    def test_crlf_manifest_preserved(self):
        result = R.strip_manifest(manifest("\r\n"))
        self.assertNotIn("\n", result.replace("\r\n", ""))

    def test_missing_entry_refused(self):
        with self.assertRaisesRegex(R.RemovalError, "missing owned"):
            R.strip_manifest(manifest().replace(R.FRAGMENTS[0], "some-other.js"))

    def test_duplicate_entry_refused(self):
        with self.assertRaisesRegex(R.RemovalError, "duplicate fragment"):
            R.strip_manifest(manifest().replace(R.FRAGMENTS[1], R.FRAGMENTS[0]))

    def test_duplicate_json_keys_refused(self):
        with self.assertRaisesRegex(R.RemovalError, "duplicate key"):
            R.strip_manifest(manifest().replace('"fragments": [', '"output": "evil", "fragments": ['))

    def test_owned_path_in_unrelated_note_not_cut(self):
        text = manifest().replace("unrelated spacing stays", R.FRAGMENTS[0])
        result = R.strip_manifest(text)
        self.assertIn('"note": "' + R.FRAGMENTS[0] + '"', result)

    def test_unexpected_entry_layout_refused(self):
        text = manifest().replace(f'{{ "file": "{R.FRAGMENTS[0]}"', f'{{ "note": "first", "file": "{R.FRAGMENTS[0]}"')
        with self.assertRaises(R.RemovalError):
            R.strip_manifest(text)

    def test_preserves_later_feature_entry(self):
        extra = '    { "file": "src/sheet/999-later.js", "note": "later" },\n'
        text = manifest().replace('    { "file": "' + SHARED, extra + '    { "file": "' + SHARED)
        self.assertIn(extra, R.strip_manifest(text))


class ScratchFixtures(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="l5r-hv-removal-fixture-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "tree"
        self.root.mkdir()
        fixture(self.root)

    def refuse_unchanged(self, expect_sha=None):
        before = snapshot(self.root)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, expect_sha=expect_sha)
        self.assertEqual(snapshot(self.root), before, "preflight refusal must write/delete nothing")

    def test_success_only_changes_declared_files(self):
        before = snapshot(self.root)
        result = R.remove(self.root)
        after = snapshot(self.root)
        self.assertEqual(set(before) - set(after), set(R.FRAGMENTS))
        changed = {key for key in after if after[key] != before[key]}
        self.assertEqual(changed, {SHARED, "build/manifest.json"})
        self.assertEqual(after[SHARED], b"  before();\n  after();\n")
        expected = b"<!doctype html>\n\n  before();\n  after();\n"
        self.assertEqual(result["rebuild_sha256"], hashlib.sha256(expected).hexdigest())
        self.assertEqual(json.loads(after["build/manifest.json"])["expect_sha256"], result["rebuild_sha256"])

    def test_dry_run_writes_nothing(self):
        before = snapshot(self.root)
        result = R.remove(self.root, dry_run=True)
        self.assertTrue(result["dry_run"])
        self.assertEqual(snapshot(self.root), before)

    def test_optional_hash_mismatch_refuses_before_writes(self):
        self.refuse_unchanged("f" * 64)

    def test_optional_correct_hash_allows_removal(self):
        digest = R.remove(self.root, dry_run=True)["rebuild_sha256"]
        self.assertEqual(R.remove(self.root, expect_sha=digest)["rebuild_sha256"], digest)

    def test_missing_fragment_refuses_before_writes(self):
        (self.root / R.FRAGMENTS[1]).unlink()
        self.refuse_unchanged()

    def test_missing_shared_block_refuses_before_writes(self):
        write(self.root, SHARED, "nothing to remove\n")
        self.refuse_unchanged()

    def test_duplicate_shared_block_refuses_before_writes(self):
        write(self.root, SHARED, block() + block())
        self.refuse_unchanged()

    def test_foreign_marker_in_owned_file_refuses_before_writes(self):
        for marker in ["PART J PHASE 8", "BUGFIX"]:
            with self.subTest(marker=marker):
                write(self.root, R.FRAGMENTS[1], f"/* {R.MARKER} */\n/* {marker} even prose */\n")
                self.refuse_unchanged()

    def test_missing_manifest_entry_refuses_before_writes(self):
        write(self.root, "build/manifest.json", manifest().replace(R.FRAGMENTS[1], "not-ours.css"))
        self.refuse_unchanged()

    def test_foreign_marker_in_shared_block_refuses_before_writes(self):
        write(self.root, SHARED, block("// Part J Phase 8's thing\n"))
        self.refuse_unchanged()

    def test_unmanifested_leak_refuses_before_writes(self):
        for token in ["HV4516", "ADV_HEART_VENGEANCE_ENABLED", "hv4516-badge", "hv4516Faction", "factionPick"]:
            with self.subTest(token=token):
                write(self.root, "src/sheet/unmanifested.js", f"// leaked {token}\n")
                self.refuse_unchanged()

    def test_later_feature_survives_and_hash_is_not_forced_to_baseline(self):
        write(self.root, SHARED, block() + "// PART I FEATURE 4.5.99\nfuture();\n")
        result = R.remove(self.root)
        self.assertIn(b"future();", (self.root / SHARED).read_bytes())
        self.assertNotEqual(result["rebuild_sha256"], R.PRE_RELEASE_SHA)

    def test_traversal_source_refuses_before_writes(self):
        write(self.root, "build/manifest.json", manifest().replace("src/shell/start.html", "../outside.html"))
        self.refuse_unchanged()

    def test_traversal_output_refuses_before_writes(self):
        write(self.root, "build/manifest.json", manifest().replace("l5r-character-sheet.html", "../outside.html"))
        self.refuse_unchanged()

    def test_symlink_manifest_refused_without_following_for_write(self):
        target = Path(self.temp.name) / "outside-manifest.json"
        target.write_bytes(manifest().encode())
        destination = self.root / "build/manifest.json"
        destination.unlink()
        try:
            destination.symlink_to(target)
        except (OSError, NotImplementedError) as error:
            self.skipTest(f"symlink creation unavailable: {error}")
        self.refuse_unchanged()
        self.assertEqual(target.read_bytes(), manifest().encode())

    def test_symlink_source_refused(self):
        target = Path(self.temp.name) / "outside-source.js"
        target.write_bytes(b"outside source")
        destination = self.root / R.FRAGMENTS[0]
        destination.unlink()
        try:
            destination.symlink_to(target)
        except (OSError, NotImplementedError) as error:
            self.skipTest(f"symlink creation unavailable: {error}")
        self.refuse_unchanged()
        self.assertEqual(target.read_bytes(), b"outside source")

    def test_hardlinked_live_manifest_refused_using_mock_live_tree(self):
        # A synthetic live tree proves hard-link detection without touching the real tree.
        fake_live = Path(self.temp.name) / "fake-live"
        fake_live.mkdir()
        fixture(fake_live)
        target = self.root / "build/manifest.json"
        target.unlink()
        os.link(fake_live / "build/manifest.json", target)
        before = snapshot(fake_live)
        with patch.object(R, "live_tree", return_value=fake_live):
            self.refuse_unchanged()
        self.assertEqual(snapshot(fake_live), before)

    def test_manifest_symbolic_link_guard_portable_fixture(self):
        # Windows without SeCreateSymbolicLinkPrivilege cannot create an actual symlink.
        # Exercise the exact link guard regardless, retaining the OS fixtures above.
        original = R.is_link
        destination = self.root / "build/manifest.json"
        with patch.object(R, "is_link", side_effect=lambda path: path == destination or original(path)):
            self.refuse_unchanged()

    def test_source_directory_junction_guard_portable_fixture(self):
        original = R.is_link
        destination = self.root / "src/sheet"
        with patch.object(R, "is_link", side_effect=lambda path: path == destination or original(path)):
            self.refuse_unchanged()

    def test_scratch_root_symbolic_link_guard_portable_fixture(self):
        original = R.is_link
        with patch.object(R, "is_link", side_effect=lambda path: path == self.root or original(path)):
            self.refuse_unchanged()


class ReadOnlyGuardFixtures(unittest.TestCase):
    def test_live_location_resolves_from_versions(self):
        live = R.live_tree()
        self.assertTrue(live.is_dir())
        self.assertTrue((live / "build/manifest.json").is_file())
        self.assertEqual(live.parents[1], Path(__file__).resolve().parents[2])

    def test_live_ancestor_and_descendant_rejected_read_only(self):
        live = R.live_tree()
        for candidate in [live, live.parent, live.parents[1], live / "scratch-never-created"]:
            with self.subTest(candidate=candidate), self.assertRaisesRegex(R.RemovalError, "ancestor/descendant"):
                R.validate_root(candidate)

    def test_missing_live_tree_refuses_blind_operation(self):
        with tempfile.TemporaryDirectory(prefix="l5r-hv-guard-") as directory:
            with patch.object(R, "live_tree", return_value=Path(directory) / "missing"):
                with self.assertRaisesRegex(R.RemovalError, "run blind"):
                    R.validate_root(Path(directory))


if __name__ == "__main__":
    unittest.main(verbosity=2)
