#!/usr/bin/env python3
"""Adversarial Phase 14.2 remover fixtures, adapted from Skill Traits and 14.1.

All fixture writes stay in temporary trees. The real-tree test only reads the live
tree and removes from a copy. Run `python test-removal.py Blocks Scratch` to run
synthetic fixtures independently of the current production build.
"""

from __future__ import annotations

import hashlib
import importlib.util
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("searchref142_removal", Path(__file__).with_name("remove-phase.py"))
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)
SCRIPT = R.FRAGMENTS[0]
INDEX = "src/sheet/209.99999991-feat-search-index.js"
SEAM = "src/sheet/210-test-seam-and-init.js"
THIS_RELEASE = "PART K — Phase 14.2 Kata and Kiho References"
SOURCE = "// PART K PHASE 14.2\nconst SEARCH_REFERENCES_ENABLED = true;\nconst SEARCHREF142 = {};\n"
EARLIER = "  // PART K PHASE 14.1 BEGIN search-facets-seam\n  earlier();\n  // END FACETS141 search-facets-seam\n"
LATER = "  // PART K PHASE 14.20 BEGIN future\n  SEARCHREF1420.keep();\n  // END FUTURE future\n"


def block(slug, body="  owned();\n"):
    hand_back = " // PART K PHASE 14 (continued)" if slug in R.SOURCE_SLUGS else ""
    return f"  // PART K PHASE 14.2 BEGIN {slug}\n{body}  // END SEARCHREF142 {slug}{hand_back}\n"


def shared(relative):
    return EARLIER + "  between();\n".join(block(slug) for slug in R.SHARED_BLOCKS[relative]) + "  retained();\n"


def retained(relative):
    return EARLIER + "  between();\n" * (len(R.SHARED_BLOCKS[relative]) - 1) + "  retained();\n"


def manifest():
    return "\n".join([
        "{", '  "output": "l5r-character-sheet.html",', '  "expect_sha256": "' + "0" * 64 + '",',
        '  "fragments": [', '    { "file": "src/start.html",   "note": "retained spacing" },',
        '    { "file": "' + SCRIPT + '",', '      "note": "owned script" },',
        '    { "file": "' + INDEX + '", "note": "shared Search index" },',
        '    { "file": "' + SEAM + '" }', '  ]', '}', ''])


def write(root, relative, text):
    target = root / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(text.encode("utf-8"))


def snapshot(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob("*") if p.is_file()}


def fixture(root):
    write(root, "src/start.html", "<!doctype html>\n")
    write(root, SCRIPT, SOURCE)
    for relative in R.SHARED_BLOCKS:
        write(root, relative, shared(relative))
    write(root, "build/manifest.json", manifest())
    write(root, "l5r-character-sheet.html", "old output\n")


class Blocks(unittest.TestCase):
    def test_both_index_blocks_and_seam_preserve_surrounding_bytes(self):
        for relative, slugs in R.SHARED_BLOCKS.items():
            with self.subTest(relative=relative):
                self.assertEqual(R.strip_owned_blocks(shared(relative), relative, slugs),
                                 (retained(relative), list(slugs)))

    def test_missing_each_block_refused(self):
        for relative, slugs in R.SHARED_BLOCKS.items():
            for slug in slugs:
                with self.subTest(slug=slug), self.assertRaises(R.RemovalError):
                    R.strip_owned_blocks(shared(relative).replace(block(slug), ""), relative, slugs)

    def test_duplicate_each_block_refused(self):
        for relative, slugs in R.SHARED_BLOCKS.items():
            for slug in slugs:
                with self.subTest(slug=slug), self.assertRaises(R.RemovalError):
                    R.strip_owned_blocks(shared(relative) + block(slug), relative, slugs)

    def test_unknown_nested_or_mismatched_blocks_refused(self):
        for relative, slugs in R.SHARED_BLOCKS.items():
            slug = slugs[0]
            original = shared(relative)
            bad = [original + block("unknown"),
                   original.replace("  owned();\n", block(slug), 1),
                   original.replace("END SEARCHREF142 " + slug, "END SEARCHREF142 wrong", 1)]
            for text in bad:
                with self.subTest(relative=relative, text=text), self.assertRaises(R.RemovalError):
                    R.strip_owned_blocks(text, relative, slugs)

    def test_orphan_unclosed_or_partial_markers_refused(self):
        for relative, slugs in R.SHARED_BLOCKS.items():
            slug = slugs[0]
            original = shared(relative)
            end = block(slug).splitlines(keepends=True)[-1]
            bad = [original + end, original.replace(end, "", 1),
                   original + "// PART K PHASE 14.2 stray\n", original + "// END SEARCHREF142\n",
                   original.replace("BEGIN " + slug, "begin " + slug, 1)]
            for text in bad:
                with self.subTest(relative=relative, text=text), self.assertRaises(R.RemovalError):
                    R.strip_owned_blocks(text, relative, slugs)

    def test_foreign_markers_in_every_block_refused(self):
        for relative, slugs in R.SHARED_BLOCKS.items():
            for slug in slugs:
                for marker in ["BUGFIX OTHER", "PART J PHASE 7", "Part K Phase 14.20's future feature", "PART K PHASE 14.2"]:
                    text = shared(relative).replace(block(slug), block(slug, "  // " + marker + "\n"))
                    with self.subTest(slug=slug, marker=marker), self.assertRaises(R.RemovalError):
                        R.strip_owned_blocks(text, relative, slugs)

    def test_numeric_neighbours_and_later_feature_kept(self):
        for relative, slugs in R.SHARED_BLOCKS.items():
            for number in ["14", "14.1", "14.20", "14.2.1", "14.3"]:
                future = LATER.replace("14.20", number)
                with self.subTest(relative=relative, number=number):
                    output, _ = R.strip_owned_blocks(shared(relative) + future, relative, slugs)
                    self.assertEqual(output, retained(relative) + future)

    def test_crlf_unicode_and_no_final_newline_kept(self):
        for relative, slugs in R.SHARED_BLOCKS.items():
            text = ("// 雪・氷\n" + shared(relative)).replace("\n", "\r\n").removesuffix("\r\n")
            with self.subTest(relative=relative):
                output, _ = R.strip_owned_blocks(text, relative, slugs)
                expected = ("// 雪・氷\n" + retained(relative)).replace("\n", "\r\n").removesuffix("\r\n")
                self.assertEqual(output.encode("utf-8"), expected.encode("utf-8"))

    def test_exact_source_ownership_hand_back_accepted_and_required(self):
        output, found = R.strip_owned_blocks(shared(INDEX), INDEX, R.SOURCE_SLUGS)
        self.assertEqual((output, found), (retained(INDEX), list(R.SOURCE_SLUGS)))
        for slug in R.SOURCE_SLUGS:
            text = shared(INDEX).replace("END SEARCHREF142 " + slug + " // PART K PHASE 14 (continued)",
                                         "END SEARCHREF142 " + slug)
            with self.subTest(slug=slug), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, INDEX, R.SOURCE_SLUGS)

    def test_source_hand_back_rejects_foreign_or_unspecified_suffixes(self):
        for slug in R.SOURCE_SLUGS:
            for suffix in [" // PART K PHASE 15 (continued)", " // PART K PHASE 14.20 (continued)",
                           " // BUGFIX OTHER", " // PART K PHASE 14", " // PART K PHASE 14 (continued) extra"]:
                text = shared(INDEX).replace("END SEARCHREF142 " + slug + " // PART K PHASE 14 (continued)",
                                             "END SEARCHREF142 " + slug + suffix)
                with self.subTest(slug=slug, suffix=suffix), self.assertRaises(R.RemovalError):
                    R.strip_owned_blocks(text, INDEX, R.SOURCE_SLUGS)

    def test_seam_cannot_claim_source_ownership_hand_back(self):
        text = shared(SEAM).replace("END SEARCHREF142 search-references-seam",
                                    "END SEARCHREF142 search-references-seam // PART K PHASE 14 (continued)")
        with self.assertRaises(R.RemovalError):
            R.strip_owned_blocks(text, SEAM, R.SHARED_BLOCKS[SEAM])


class Scratch(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="l5r-searchref142-fixture-")
        self.root = Path(self.temp.name) / "tree"
        self.root.mkdir()
        fixture(self.root)

    def tearDown(self):
        self.temp.cleanup()

    def assertRefusedUnchanged(self):
        before = snapshot(self.root)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root)
        self.assertEqual(snapshot(self.root), before)

    def test_surgical_removal_and_exact_manifest_preservation(self):
        before = snapshot(self.root)
        result = R.remove(self.root)
        expected = dict(before)
        del expected[SCRIPT]
        for relative in R.SHARED_BLOCKS:
            expected[relative] = retained(relative).encode("utf-8")
        raw = b"\n".join(expected[p] for p in ["src/start.html", INDEX, SEAM])
        sha = hashlib.sha256(raw).hexdigest()
        manifest_text = manifest().replace('    { "file": "' + SCRIPT + '",\n      "note": "owned script" },\n', "")
        expected["build/manifest.json"] = manifest_text.replace("0" * 64, sha).encode("utf-8")
        self.assertEqual(snapshot(self.root), expected)
        self.assertEqual((result["rebuild_sha256"], result["rebuild_bytes"]), (sha, len(raw)))

    def test_crlf_manifest_and_shared_files_keep_their_bytes(self):
        for relative in ["build/manifest.json", *R.SHARED_FILES]:
            write(self.root, relative, R.read_exact(self.root / relative).replace("\n", "\r\n"))
        result = R.remove(self.root)
        for relative in R.SHARED_FILES:
            self.assertEqual((self.root / relative).read_bytes(), retained(relative).replace("\n", "\r\n").encode())
        expected = manifest().replace('    { "file": "' + SCRIPT + '",\n      "note": "owned script" },\n', "")
        expected = expected.replace("0" * 64, result["rebuild_sha256"]).replace("\n", "\r\n").encode()
        self.assertEqual((self.root / "build/manifest.json").read_bytes(), expected)

    def test_dry_run_and_wrong_hash_are_inert(self):
        before = snapshot(self.root)
        R.remove(self.root, dry_run=True)
        self.assertEqual(snapshot(self.root), before)
        with self.assertRaises(R.RemovalError):
            R.remove(self.root, expect_sha="0" * 64)
        self.assertEqual(snapshot(self.root), before)

    def test_matching_hash_allows_removal(self):
        preview = R.remove(self.root, dry_run=True)
        result = R.remove(self.root, expect_sha=preview["rebuild_sha256"])
        self.assertEqual(result["rebuild_sha256"], preview["rebuild_sha256"])

    def test_missing_owned_or_shared_file_refused(self):
        for relative in [SCRIPT, *R.SHARED_FILES]:
            fixture(self.root)
            (self.root / relative).unlink()
            with self.subTest(relative=relative):
                self.assertRefusedUnchanged()

    def test_missing_or_foreign_source_marker_refused(self):
        for text in ["const SEARCHREF142 = {};\n", SOURCE + "// BUGFIX OTHER\n",
                     SOURCE + "// PART J PHASE 7\n", SOURCE + "// PART K PHASE 14.20\n",
                     SOURCE.replace("14.2", "14.20")]:
            write(self.root, SCRIPT, text)
            with self.subTest(text=text):
                self.assertRefusedUnchanged()

    def test_each_bad_shared_file_refuses_before_any_write(self):
        for relative, slugs in R.SHARED_BLOCKS.items():
            for slug in slugs:
                fixture(self.root)
                write(self.root, relative, shared(relative).replace(block(slug), ""))
                with self.subTest(slug=slug):
                    self.assertRefusedUnchanged()

    def test_owned_surfaces_and_markers_outside_manifest_refused(self):
        for extension in ["js", "css", "html"]:
            path = "src/extra." + extension
            for surface in ["SEARCH_REFERENCES_ENABLED", "SEARCHREF142", "PART K PHASE 14.2", "END SEARCHREF142"]:
                write(self.root, path, surface)
                with self.subTest(extension=extension, surface=surface):
                    self.assertRefusedUnchanged()
            (self.root / path).unlink()

    def test_owned_surfaces_outside_each_shared_block_refused(self):
        for relative in R.SHARED_BLOCKS:
            for surface in ["SEARCH_REFERENCES_ENABLED", "SEARCHREF142"]:
                fixture(self.root)
                write(self.root, relative, shared(relative) + surface)
                with self.subTest(relative=relative, surface=surface):
                    self.assertRefusedUnchanged()

    def test_dependency_names_retained(self):
        text = "SEARCH14.invalidate(); SEARCHPAGE14.render(); FACETS141.refresh(); KATA.render(); KIHO.render();"
        write(self.root, "src/dependencies.js", text)
        R.remove(self.root)
        self.assertEqual((self.root / "src/dependencies.js").read_bytes(), text.encode())

    def test_later_source_blocks_and_manifest_entry_survive(self):
        baseline = R.remove(self.root, dry_run=True)
        future = "src/sheet/future.js"
        write(self.root, future, "// PART K PHASE 14.20\nconst SEARCHREF1420 = {};\n")
        for relative in R.SHARED_BLOCKS:
            write(self.root, relative, shared(relative) + LATER)
        text = manifest().replace('  "fragments": [', '  "fragments": [\n    { "file": "' + future + '" },', 1)
        write(self.root, "build/manifest.json", text)
        future_bytes = (self.root / future).read_bytes()
        result = R.remove(self.root)
        self.assertNotEqual(result["rebuild_sha256"], baseline["rebuild_sha256"])
        self.assertEqual((self.root / future).read_bytes(), future_bytes)
        for relative in R.SHARED_BLOCKS:
            self.assertEqual((self.root / relative).read_bytes(), (retained(relative) + LATER).encode())
        self.assertIn('    { "file": "' + future + '" },', R.read_exact(self.root / "build/manifest.json"))

    def test_missing_duplicate_or_reformatted_manifest_entry_refused(self):
        original = manifest()
        owned = '    { "file": "' + SCRIPT + '",\n      "note": "owned script" },'
        bad = [original.replace(SCRIPT, "src/missing.js"), original.replace(owned, owned + "\n" + owned),
               original.replace(owned, '    { "note": "owned script", "file": "' + SCRIPT + '" },')]
        for text in bad:
            write(self.root, "build/manifest.json", text)
            with self.subTest(text=text):
                self.assertRefusedUnchanged()

    def test_invalid_json_duplicate_keys_and_missing_hash_refused(self):
        for text in ["{", manifest().replace('"output":', '"output": "duplicate", "output":', 1),
                     manifest().replace('"expect_sha256"', '"unrelated"')]:
            write(self.root, "build/manifest.json", text)
            with self.subTest(text=text):
                self.assertRefusedUnchanged()

    def test_output_and_manifest_source_path_escapes_refused(self):
        for text in [manifest().replace('"l5r-character-sheet.html"', '"../escape.html"'),
                     manifest().replace('"src/start.html"', '"../outside.js"'),
                     manifest().replace('"src/start.html"', '"C:/outside.js"')]:
            write(self.root, "build/manifest.json", text)
            with self.subTest(text=text):
                self.assertRefusedUnchanged()

    def test_live_root_ancestor_and_descendant_refused(self):
        for target in [R.live_tree(), R.live_tree().parent, R.live_tree() / "src"]:
            with self.subTest(target=target), self.assertRaises(R.RemovalError):
                R.remove(target, dry_run=True)

    def test_hard_linked_shared_file_refused(self):
        for relative in R.SHARED_BLOCKS:
            fixture(self.root)
            target = self.root / relative
            backup = Path(self.temp.name) / "linked-source.js"
            backup.write_bytes(target.read_bytes())
            target.unlink()
            try:
                os.link(backup, target)
            except OSError:
                self.skipTest("hard links unavailable")
            with self.subTest(relative=relative):
                self.assertRefusedUnchanged()
            target.unlink()
            backup.unlink()

    def test_symlinked_root_refused(self):
        link = Path(self.temp.name) / "link"
        try:
            os.symlink(self.root, link, target_is_directory=True)
        except OSError:
            self.skipTest("Windows symlinks unavailable")
        with self.assertRaises(R.RemovalError):
            R.remove(link, dry_run=True)

    def test_symlinked_shared_file_refused(self):
        target = self.root / INDEX
        external = Path(self.temp.name) / "external.js"
        external.write_bytes(target.read_bytes())
        target.unlink()
        try:
            os.symlink(external, target)
        except OSError:
            self.skipTest("Windows symlinks unavailable")
        self.assertRefusedUnchanged()


class LiveTree(unittest.TestCase):
    def test_exact_predecessor_and_dependency_sources_unchanged(self):
        versions = next(p for p in Path(__file__).resolve().parents if (p / "BUILD-LEDGER.md").is_file())
        spec = importlib.util.spec_from_file_location("removal_chain", versions / "QA — Removal Chain Registry/removal_chain.py")
        chain = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = chain
        spec.loader.exec_module(chain)
        before_live = snapshot(R.live_tree())
        with tempfile.TemporaryDirectory(prefix="l5r-searchref142-live-") as work:
            tree = Path(work) / "tree"
            shutil.copytree(R.live_tree(), tree, ignore=shutil.ignore_patterns("l5r-character-sheet.html", "dist"))
            chain.strip_later(tree, after=THIS_RELEASE)
            keep = ["src/sheet/209.99999992-feat-search-page.js", "src/sheet/209.99999999-feat-search-facets.js",
                    "src/sheet/209.999999991-feat-search-facet-page.js", "src/sheet/209.999999994-bugfix-skill-traits.js"]
            before = {p: (tree / p).read_bytes() for p in keep}
            result = R.remove(tree, expect_sha=R.PRE_RELEASE_SHA)
            self.assertEqual((result["rebuild_sha256"], result["rebuild_bytes"]), (R.PRE_RELEASE_SHA, R.PRE_RELEASE_BYTES))
            self.assertEqual({p: (tree / p).read_bytes() for p in keep}, before)
            built = subprocess.run([sys.executable, str(tree / "build/recombine.py"), "--verify"], cwd=tree,
                                   capture_output=True, text=True, encoding="utf-8")
            self.assertEqual(built.returncode, 0, built.stdout + built.stderr)
            raw = (tree / "l5r-character-sheet.html").read_bytes()
            self.assertEqual((hashlib.sha256(raw).hexdigest(), len(raw)), (R.PRE_RELEASE_SHA, R.PRE_RELEASE_BYTES))
        self.assertEqual(snapshot(R.live_tree()), before_live)


if __name__ == "__main__":
    unittest.main(verbosity=2)
