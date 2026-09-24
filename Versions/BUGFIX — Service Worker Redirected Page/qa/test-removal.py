#!/usr/bin/env python3
"""Adversarial remover fixtures. Every write is confined to a TemporaryDirectory; the live folder is
only read, to prove the path guard and that the live sw.js is removable."""

from __future__ import annotations

import hashlib
import importlib.util
import os
from pathlib import Path
import shutil
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("sw_redirect_removal", Path(__file__).with_name("remove-phase.py"))
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)


def blk(slug, body="  owned();\n"):
    return f"  // BUGFIX SWREDIRECT BEGIN {slug}\n{body}  // END SWREDIRECT {slug}\n"


def worker(extra=""):
    return ("a();\n" + blk("redirect-helper") + "b();\n" + blk("activate-clean") + "c();\n"
            + blk("serve-clean") + "d();\n" + extra)


def fixture(root: Path, text: str | None = None) -> Path:
    path = root / R.SW
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes((worker() if text is None else text).encode("utf-8"))
    return path


class Blocks(unittest.TestCase):
    def test_three_blocks_removed_only(self):
        out, slugs = R.strip_owned_blocks(worker())
        self.assertEqual(sorted(slugs), sorted(R.SLUGS))
        self.assertEqual(out, "a();\nb();\nc();\nd();\n")

    def test_missing_block_refused(self):
        with self.assertRaises(R.RemovalError):
            R.strip_owned_blocks("a();\n" + blk("redirect-helper") + blk("activate-clean"))

    def test_unknown_or_duplicate_slug_refused(self):
        for text in [worker(blk("other")), worker(blk("serve-clean"))]:
            with self.subTest(text=text[-50:]), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text)

    def test_unclosed_orphan_and_mismatched_refused(self):
        bad = [worker().replace("  // END SWREDIRECT serve-clean\n", ""),
               worker("  // END SWREDIRECT serve-clean\n"),
               worker().replace("END SWREDIRECT serve-clean", "END SWREDIRECT activate-clean")]
        for text in bad:
            with self.subTest(), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text)

    def test_foreign_marker_inside_block_refused(self):
        text = worker().replace("  owned();\n", "  // see BUGFIX OTHER\n", 1)
        with self.assertRaises(R.RemovalError):
            R.strip_owned_blocks(text)

    def test_surface_outside_blocks_refused(self):
        for extra in ["if (SW_REDIRECT_FIX_ENABLED) x();\n", "return servable(r);\n", "// SWREDIRECT\n"]:
            with self.subTest(extra=extra), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(worker(extra))


class Paths(unittest.TestCase):
    def test_live_folder_and_its_parent_refused(self):
        for target in [R.live_folder(), R.live_folder().parent]:
            with self.subTest(target=target), self.assertRaises(R.RemovalError):
                R.remove(target, dry_run=True)

    def test_symlinked_root_refused(self):
        with tempfile.TemporaryDirectory() as work:
            real = Path(work) / "real"
            fixture(real)
            link = Path(work) / "link"
            try:
                os.symlink(real, link, target_is_directory=True)
            except OSError:
                self.skipTest("symlinks not permitted here")
            with self.assertRaises(R.RemovalError):
                R.remove(link, dry_run=True)

    def test_symlink_to_live_sw_refused(self):
        with tempfile.TemporaryDirectory() as work:
            root = Path(work) / "copy"
            (root / "src").mkdir(parents=True)
            try:
                os.symlink(R.live_folder() / R.SW, root / R.SW)
            except OSError:
                self.skipTest("symlinks not permitted here")
            with self.assertRaises(R.RemovalError):
                R.remove(root, dry_run=True)

    def test_dry_run_and_failed_expect_write_nothing(self):
        with tempfile.TemporaryDirectory() as work:
            root = Path(work) / "copy"
            path = fixture(root)
            before = path.read_bytes()
            R.remove(root, dry_run=True)
            with self.assertRaises(R.RemovalError):
                R.remove(root, expect_sha="0" * 64)
            self.assertEqual(path.read_bytes(), before)


class LiveTree(unittest.TestCase):
    """Reads the live folder, writes only to a scratch copy of it."""

    def test_live_sw_removes_to_the_pre_release_bytes(self):
        with tempfile.TemporaryDirectory() as work:
            copy = Path(work) / "phase06"
            shutil.copytree(R.live_folder(), copy)
            result = R.remove(copy, expect_sha=R.PRE_RELEASE_SHA)
            data = (copy / R.SW).read_bytes()
            self.assertEqual(hashlib.sha256(data).hexdigest(), R.PRE_RELEASE_SHA)
            self.assertEqual(len(data), R.PRE_RELEASE_BYTES)
            self.assertTrue(result["matches_pre_release"])

    def test_live_blocks_hold_no_foreign_marker(self):
        text = (R.live_folder() / R.SW).read_text(encoding="utf-8")
        _, slugs = R.strip_owned_blocks(text)
        self.assertEqual(sorted(slugs), sorted(R.SLUGS))

    def test_live_folder_untouched_by_this_suite(self):
        live = R.live_folder() / R.SW
        before = live.read_bytes()
        with tempfile.TemporaryDirectory() as work:
            copy = Path(work) / "phase06"
            shutil.copytree(R.live_folder(), copy)
            R.remove(copy)
        self.assertEqual(live.read_bytes(), before)


if __name__ == "__main__":
    unittest.main(verbosity=2)
