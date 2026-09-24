#!/usr/bin/env python3
"""Adversarial remover fixtures. Every write is confined to a TemporaryDirectory; the live tree is
only read, to prove the path guard. Whole-build byte parity is measured separately (see README)."""

from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("safari_tab_removal", Path(__file__).with_name("remove-phase.py"))
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)
SHARED = "src/layer/10-carousel.js"


def blk(slug, body="  owned();\n"):
    return f"  // BUGFIX SAFARITAB BEGIN {slug}\n{body}  // END SAFARITAB {slug}\n"


def carousel(extra=""):
    return "  before();\n" + blk("probe-switch") + "  middle();\n" + blk("hidden-page-probe") + "  after();\n" + extra


def manifest():
    return "\n".join(['{', '  "output": "l5r-character-sheet.html",', '  "expect_sha256": "' + "0" * 64 + '",',
                      '  "fragments": [', '    { "file": "src/shell/start.html", "note": "start" },',
                      f'    {{ "file": "{SHARED}", "note": "carousel" }}', '  ]', '}', ''])


def fixture(root, text=None):
    for rel, body in [("build/manifest.json", manifest()), ("src/shell/start.html", "<!doctype html>\n"),
                      (SHARED, carousel() if text is None else text), ("l5r-character-sheet.html", "old\n")]:
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(body.encode("utf-8"))


def snapshot(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob("*") if p.is_file()}


class Blocks(unittest.TestCase):
    def test_both_blocks_removed_only(self):
        out, slugs = R.strip_owned_blocks(carousel(), "f", ("probe-switch", "hidden-page-probe"))
        self.assertEqual(sorted(slugs), ["hidden-page-probe", "probe-switch"])
        self.assertEqual(out, "  before();\n  middle();\n  after();\n")

    def test_missing_one_block_refused(self):
        with self.assertRaises(R.RemovalError):
            R.strip_owned_blocks("  before();\n" + blk("probe-switch"), "f", ("probe-switch", "hidden-page-probe"))

    def test_unknown_or_duplicate_slug_refused(self):
        for text in [carousel() + blk("other"), carousel() + blk("probe-switch")]:
            with self.subTest(text=text[-60:]), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, "f", ("probe-switch", "hidden-page-probe"))

    def test_foreign_marker_inside_refused(self):
        for marker in ["PART I FEATURE 4.5.24", "PART H PHASE 2", "BUGFIX other"]:
            with self.subTest(marker=marker), self.assertRaisesRegex(R.RemovalError, "marker"):
                R.strip_owned_blocks(carousel().replace("  owned();\n", "  // " + marker + "\n", 1), "f",
                                     ("probe-switch", "hidden-page-probe"))

    def test_unclosed_and_orphan_refused(self):
        for text in [carousel().replace("  // END SAFARITAB probe-switch\n", ""), "// END SAFARITAB probe-switch\n"]:
            with self.subTest(text=text[:40]), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, "f", ("probe-switch", "hidden-page-probe"))

    def test_other_phases_outside_blocks_kept(self):
        later = "// PART H PHASE 2 later\nkeep();\n// BUGFIX other fix\n"
        out, _ = R.strip_owned_blocks(later + carousel() + later, "f", ("probe-switch", "hidden-page-probe"))
        self.assertEqual(out, later + "  before();\n  middle();\n  after();\n" + later)


class Scratch(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="l5r-safaritab-fixture-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "tree"
        self.root.mkdir()
        fixture(self.root)

    def refuse_unchanged(self):
        before = snapshot(self.root)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root)
        self.assertEqual(snapshot(self.root), before)

    def test_success_changes_only_carousel_and_manifest(self):
        before = snapshot(self.root)
        result = R.remove(self.root)
        after = snapshot(self.root)
        self.assertEqual({k for k in after if after[k] != before[k]}, {SHARED, "build/manifest.json"})
        expected = b"<!doctype html>\n\n  before();\n  middle();\n  after();\n"
        self.assertEqual(result["rebuild_sha256"], hashlib.sha256(expected).hexdigest())
        self.assertEqual(json.loads(after["build/manifest.json"])["expect_sha256"], result["rebuild_sha256"])

    def test_dry_run_writes_nothing(self):
        before = snapshot(self.root)
        R.remove(self.root, dry_run=True)
        self.assertEqual(snapshot(self.root), before)

    def test_hash_mismatch_refuses_before_writes(self):
        before = snapshot(self.root)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, expect_sha="f" * 64)
        self.assertEqual(snapshot(self.root), before)

    def test_missing_block_refuses_before_writes(self):
        fixture(self.root, "  before();\n" + blk("probe-switch"))
        self.refuse_unchanged()

    def test_leaked_switch_elsewhere_refuses(self):
        (self.root / "src/sheet").mkdir(parents=True, exist_ok=True)
        (self.root / "src/sheet/leak.js").write_text("if(SAFARI_TAB_PROBE_ENABLED){}\n")
        self.refuse_unchanged()

    def test_scratch_root_link_guard(self):
        original = R.is_link
        with patch.object(R, "is_link", side_effect=lambda p: p == self.root or original(p)):
            self.refuse_unchanged()


class Guard(unittest.TestCase):
    def test_live_tree_and_relatives_refused(self):
        live = R.live_tree()
        self.assertTrue((live / "build/manifest.json").is_file())
        for candidate in [live, live.parent, live / "never-created"]:
            with self.subTest(candidate=candidate), self.assertRaisesRegex(R.RemovalError, "ancestor/descendant"):
                R.validate_root(candidate)


if __name__ == "__main__":
    unittest.main(verbosity=1)
