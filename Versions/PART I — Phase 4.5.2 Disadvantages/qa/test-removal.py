#!/usr/bin/env python3
"""Independent positive/negative tests for the removal tool, using disposable fixtures."""

import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


SPEC = importlib.util.spec_from_file_location("disadv_removal", Path(__file__).with_name("remove-phase.py"))
REMOVAL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REMOVAL)
CORE = "PART I FEATURE 4.52"
PHOBIA = "PART I FEATURE 4.521"


class BlockTests(unittest.TestCase):
    def block(self, body="  add();\r\n", handback=True):
        result = ("// PART G PHASE 3\r\n  before();\r\n"
                  "// PART I FEATURE 4.521 BEGIN phobia-preview\r\n" + body +
                  "// END DISADV45 phobia-preview\r\n")
        if handback:
            result += "// PART G PHASE 3 (continued after DISADV45 phobia-preview)\r\n"
        return result + "  after();"

    def test_owned_cut_restores_all_original_bytes(self):
        actual, removed = REMOVAL.strip_owned_blocks(self.block(), {PHOBIA}, "shared.js")
        self.assertEqual(actual, "// PART G PHASE 3\r\n  before();\r\n  after();")
        self.assertEqual(removed, ["phobia-preview"])

    def test_other_component_untouched(self):
        actual, removed = REMOVAL.strip_owned_blocks(self.block(), {CORE}, "shared.js")
        self.assertEqual(actual, self.block())
        self.assertEqual(removed, [])

    def test_foreign_marker_is_refused(self):
        with self.assertRaisesRegex(REMOVAL.RemovalError, "foreign marker"):
            REMOVAL.strip_owned_blocks(self.block("// PART J PHASE 8\r\n  foreign();\r\n"), {PHOBIA}, "shared.js")

    def test_different_numeric_suffix_is_foreign(self):
        with self.assertRaisesRegex(REMOVAL.RemovalError, "foreign marker"):
            REMOVAL.strip_owned_blocks(self.block("// PART I FEATURE 4.5219\r\n"), {PHOBIA}, "shared.js")

    def test_legacy_marker_is_foreign(self):
        with self.assertRaisesRegex(REMOVAL.RemovalError, "foreign marker"):
            REMOVAL.strip_owned_blocks(self.block("// PART I PHASE 4.5\r\n"), {PHOBIA}, "shared.js")

    def test_missing_end_is_refused(self):
        with self.assertRaisesRegex(REMOVAL.RemovalError, "has no END"):
            REMOVAL.strip_owned_blocks(self.block(handback=False).replace("// END DISADV45 phobia-preview\r\n", ""), {PHOBIA}, "shared.js")

    def test_wrong_handback_is_refused(self):
        with self.assertRaisesRegex(REMOVAL.RemovalError, "does not match"):
            REMOVAL.strip_owned_blocks(self.block().replace("PART G PHASE 3 (continued", "PART J PHASE 8 (continued"), {PHOBIA}, "shared.js")

    def test_absent_handback_is_refused(self):
        with self.assertRaisesRegex(REMOVAL.RemovalError, "hand ownership back"):
            REMOVAL.strip_owned_blocks(self.block(handback=False), {PHOBIA}, "shared.js")

    def test_existing_next_marker_is_valid(self):
        text = self.block(handback=False).replace("  after();", "// PART G PHASE 3\r\n  after();")
        actual, _ = REMOVAL.strip_owned_blocks(text, {PHOBIA}, "shared.js")
        self.assertEqual(actual, "// PART G PHASE 3\r\n  before();\r\n// PART G PHASE 3\r\n  after();")

    def test_orphan_end_is_refused(self):
        with self.assertRaisesRegex(REMOVAL.RemovalError, "orphan END"):
            REMOVAL.strip_owned_blocks("// END DISADV45 lost\n", {CORE}, "shared.js")

    def test_unpaired_selected_marker_is_refused(self):
        with self.assertRaisesRegex(REMOVAL.RemovalError, "outside a paired"):
            REMOVAL.strip_owned_blocks("// PART I FEATURE 4.52\nadd();", {CORE}, "shared.js")

    def test_nested_blocks_are_refused(self):
        with self.assertRaisesRegex(REMOVAL.RemovalError, "nested"):
            REMOVAL.strip_owned_blocks(self.block("// PART I FEATURE 4.521 BEGIN nested\r\n"), {PHOBIA}, "shared.js")

    def test_mismatched_end_is_refused(self):
        with self.assertRaisesRegex(REMOVAL.RemovalError, "mismatched END"):
            REMOVAL.strip_owned_blocks(self.block().replace("END DISADV45 phobia-preview", "END DISADV45 wrong"), {PHOBIA}, "shared.js")


class PlanTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="l5r-removal-test-")
        self.root = Path(self.temp.name)
        self.files = {
            "src/shell/a.html": b"before\r\n",
            "src/sheet/z.js": b"// PART G PHASE 3\nretained();",
        }
        for marker, fragments in REMOVAL.COMPONENTS.values():
            for fragment in fragments:
                self.files[fragment] = ("// " + marker + "\nnew();").encode()
        for relative, raw in self.files.items():
            target = self.root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(raw)
        self.order = ["src/shell/a.html"] + [fragment for _marker, files in REMOVAL.COMPONENTS.values() for fragment in files] + ["src/sheet/z.js"]
        manifest = '{\r\n  "output": "sheet.html",\r\n  "expect_sha256": "' + "0" * 64 + '",\r\n  "fragments": [\r\n'
        manifest += ",\r\n".join('    { "file": "' + fragment + '",\r\n      "note": "fixture" }' for fragment in self.order)
        manifest += "\r\n  ]\r\n}\r\n"
        (self.root / "build").mkdir()
        (self.root / "build/manifest.json").write_bytes(manifest.encode())

    def tearDown(self):
        self.temp.cleanup()

    def snapshot(self):
        return {path.relative_to(self.root).as_posix(): path.read_bytes()
                for path in self.root.rglob("*") if path.is_file()}

    def test_full_plan_matches_independent_preexpansion_bytes(self):
        baseline = b"before\r\n\n// PART G PHASE 3\nretained();"
        expected = hashlib.sha256(baseline).hexdigest()
        before = self.snapshot()
        plan = REMOVAL.plan_removal(self.root, "all", expected)
        self.assertEqual(plan["sha256"], expected)
        self.assertEqual(plan["bytes"], len(baseline))
        self.assertEqual(self.snapshot(), before, "preflight must never mutate")
        manifest = json.loads(plan["changes"]["build/manifest.json"])
        self.assertEqual(manifest["expect_sha256"], expected)
        self.assertEqual([f["file"] for f in manifest["fragments"]], ["src/shell/a.html", "src/sheet/z.js"])

    def test_independent_scope_preserves_every_other_component(self):
        plan = REMOVAL.plan_removal(self.root, "phobia")
        self.assertEqual(plan["deletions"], ["src/css/56-disadv-phobia.css", "src/sheet/209.86-feat-disadv-phobia.js"])
        self.assertEqual(set(plan["changes"]), {"build/manifest.json"})
        remaining = [f["file"] for f in json.loads(plan["changes"]["build/manifest.json"])["fragments"]]
        self.assertEqual(remaining, [f for f in self.order if "209.86" not in f and "56-disadv-phobia" not in f])

    def test_wrong_expected_hash_refuses_before_writes(self):
        before = self.snapshot()
        with self.assertRaisesRegex(REMOVAL.RemovalError, "nothing was changed"):
            REMOVAL.plan_removal(self.root, "all", "f" * 64)
        self.assertEqual(self.snapshot(), before)

    def test_foreign_marker_in_deleted_fragment_is_refused(self):
        path = self.root / "src/sheet/209.86-feat-disadv-phobia.js"
        path.write_bytes(path.read_bytes() + b"\n// PART J PHASE 8\nforeign();")
        before = self.snapshot()
        with self.assertRaisesRegex(REMOVAL.RemovalError, "foreign marker"):
            REMOVAL.plan_removal(self.root, "all")
        self.assertEqual(self.snapshot(), before)

    def test_other_component_marker_inside_individual_deletion_is_refused(self):
        path = self.root / "src/sheet/209.86-feat-disadv-phobia.js"
        path.write_bytes(path.read_bytes() + b"\n// PART I FEATURE 4.523\ngate();")
        with self.assertRaisesRegex(REMOVAL.RemovalError, "foreign marker"):
            REMOVAL.plan_removal(self.root, "phobia")

    def test_duplicate_manifest_fragment_is_refused(self):
        path = self.root / "build/manifest.json"
        text = path.read_text()
        text = text.replace('"src/sheet/z.js"', '"src/sheet/209.86-feat-disadv-phobia.js"')
        path.write_text(text)
        with self.assertRaisesRegex(REMOVAL.RemovalError, "exactly one"):
            REMOVAL.plan_removal(self.root, "all")

    def test_future_unrelated_fragment_preserved(self):
        target = self.root / "src/sheet/z.js"
        target.write_bytes(b"// PART Z PHASE 99\nfuture();")
        plan = REMOVAL.plan_removal(self.root, "all")
        self.assertNotIn("src/sheet/z.js", plan["changes"])
        self.assertNotIn("src/sheet/z.js", plan["deletions"])
        self.assertEqual(plan["sha256"], hashlib.sha256(b"before\r\n\n// PART Z PHASE 99\nfuture();").hexdigest())

    def test_path_escape_is_refused(self):
        with self.assertRaisesRegex(REMOVAL.RemovalError, "unsafe relative"):
            REMOVAL.safe_file(self.root, "../outside.txt")

    def test_full_removal_after_independent_removal_is_supported(self):
        first = REMOVAL.plan_removal(self.root, "phobia")
        for relative, raw in first["changes"].items():
            (self.root / relative).write_bytes(raw)
        for relative in first["deletions"]:
            (self.root / relative).unlink()
        expected = hashlib.sha256(b"before\r\n\n// PART G PHASE 3\nretained();").hexdigest()
        self.assertEqual(REMOVAL.plan_removal(self.root, "all", expected)["sha256"], expected)

    def test_live_source_root_is_refused(self):
        versions = Path(__file__).resolve().parents[2]
        live = versions / "Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability"
        with self.assertRaisesRegex(REMOVAL.RemovalError, "live source"):
            REMOVAL.safe_root(str(live))


if __name__ == "__main__":
    unittest.main(verbosity=2)
