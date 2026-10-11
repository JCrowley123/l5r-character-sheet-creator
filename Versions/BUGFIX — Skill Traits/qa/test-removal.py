"""Adversarial removal fixtures, adapted from 14.1. All writes stay in temporary trees."""
from pathlib import Path
import hashlib
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location('skilltraits_removal', Path(__file__).with_name('remove-phase.py'))
R = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(R)
SCRIPT = R.FRAGMENTS[0]
SEAM = 'src/sheet/210-test-seam-and-init.js'
SLUG = 'skill-traits-seam'
EARLIER = '  // PART K PHASE 14.1 BEGIN search-facets-seam\n  earlier();\n  // END FACETS141 search-facets-seam\n'
OWNED = '  // BUGFIX SKILLTRAITS BEGIN skill-traits-seam\n  own();\n  // END SKILLTRAITS skill-traits-seam\n'
SOURCE = '  // BUGFIX SKILLTRAITS\n  const SKILL_TRAITS_FIX_ENABLED = true;\n  const SKILL_TRAITS = {};\n'

def write(root, path, text):
    file = root / path
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_bytes(text.encode('utf-8'))

def snapshot(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob('*') if p.is_file()}

def fixture(root):
    write(root, 'src/start.html', '<!doctype html>\n')
    write(root, SCRIPT, SOURCE)
    write(root, SEAM, EARLIER + OWNED + '  retained();\n')
    write(root, 'build/manifest.json', '\n'.join([
        '{', '  "output": "l5r-character-sheet.html",', '  "expect_sha256": "' + '0'*64 + '",',
        '  "fragments": [', '    { "file": "src/start.html", "note": "retained spacing" },',
        '    { "file": "' + SCRIPT + '", "note": "owned" },',
        '    { "file": "' + SEAM + '" }', '  ]', '}', '']))
    write(root, 'l5r-character-sheet.html', 'old output')

class Blocks(unittest.TestCase):
    def test_only_owned_bytes_removed(self):
        self.assertEqual(R.strip_owned_blocks(EARLIER+OWNED+'after', 'test', (SLUG,)), (EARLIER+'after',[SLUG]))

    def test_bad_blocks_refused(self):
        for text in [EARLIER, OWNED+OWNED, OWNED.replace('END SKILLTRAITS skill-traits-seam','END SKILLTRAITS other'),
                     OWNED.replace('  // END SKILLTRAITS skill-traits-seam\n',''),
                     OWNED+'// END SKILLTRAITS stray\n', OWNED+'// BUGFIX SKILLTRAITS stray\n',
                     OWNED.replace('  own();','  // BUGFIX OTHER'), OWNED.replace('  own();','  // PART J PHASE 7')]:
            with self.subTest(text=text), self.assertRaises(R.RemovalError):
                R.strip_owned_blocks(text, 'test', (SLUG,))

    def test_line_endings_preserved(self):
        text=(EARLIER+OWNED+'after').replace('\n','\r\n')
        self.assertEqual(R.strip_owned_blocks(text,'test',(SLUG,))[0],EARLIER.replace('\n','\r\n')+'after')

    def test_neighbouring_bugfix_kept(self):
        extra='// BUGFIX SKILLTRAITSOTHER BEGIN x\nkeep();\n// END OTHER x\n'
        self.assertEqual(R.strip_owned_blocks(OWNED+extra,'test',(SLUG,))[0],extra)

class Scratch(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='l5r-skilltraits-fixture-')
        self.root=Path(self.temp.name)/'tree';self.root.mkdir();fixture(self.root)

    def tearDown(self): self.temp.cleanup()

    def assertRefused(self):
        before=snapshot(self.root)
        with self.assertRaises(R.RemovalError): R.remove(self.root)
        self.assertEqual(snapshot(self.root),before)

    def test_surgical_removal(self):
        R.remove(self.root)
        self.assertFalse((self.root/SCRIPT).exists())
        self.assertEqual((self.root/SEAM).read_text(),EARLIER+'  retained();\n')
        self.assertIn('"note": "retained spacing"',(self.root/'build/manifest.json').read_text())
        self.assertEqual((self.root/'l5r-character-sheet.html').read_text(),'old output')

    def test_dry_run_and_wrong_hash_are_inert(self):
        before=snapshot(self.root);R.remove(self.root,dry_run=True)
        with self.assertRaises(R.RemovalError):R.remove(self.root,expect_sha='0'*64)
        self.assertEqual(snapshot(self.root),before)

    def test_missing_fragment_refused(self):
        (self.root/SCRIPT).unlink();self.assertRefused()

    def test_missing_or_foreign_marker_refused(self):
        for text in ['const SKILL_TRAITS = {};',SOURCE+'// BUGFIX OTHER\n',SOURCE+'// PART J PHASE 7\n']:
            write(self.root,SCRIPT,text);self.assertRefused()

    def test_surfaces_refused_even_outside_manifest(self):
        for surface in ['SKILL_TRAITS_FIX_ENABLED','SKILL_TRAITS_UI','SKILL_TRAITS','st10-craft-note']:
            write(self.root,'src/extra.js',surface);self.assertRefused()

    def test_dependency_names_are_retained(self):
        write(self.root,'src/extra.js','SCHOOL_SKILL_ROWS.fillTrait(); SEARCH14.invalidate();')
        R.remove(self.root)
        self.assertEqual((self.root/'src/extra.js').read_text(),'SCHOOL_SKILL_ROWS.fillTrait(); SEARCH14.invalidate();')

    def test_missing_block_refused(self):
        write(self.root,SEAM,EARLIER);self.assertRefused()

    def test_missing_duplicate_manifest_entries_refused(self):
        p=self.root/'build/manifest.json';original=p.read_text()
        for text in [original.replace(SCRIPT,'src/missing.js'), original.replace('    { "file": "'+SCRIPT+'", "note": "owned" },',
                     '    { "file": "'+SCRIPT+'" },\n    { "file": "'+SCRIPT+'" },')]:
            write(self.root,'build/manifest.json',text);self.assertRefused()

    def test_output_escape_refused(self):
        p=self.root/'build/manifest.json';write(self.root,'build/manifest.json',p.read_text().replace('"l5r-character-sheet.html"','"../escape.html"'));self.assertRefused()

    def test_live_paths_refused(self):
        for p in [R.live_tree(),R.live_tree().parent,R.live_tree()/'src']:
            with self.subTest(path=p),self.assertRaises(R.RemovalError):R.remove(p,dry_run=True)

    def test_hard_link_refused(self):
        p=self.root/SEAM;p.unlink()
        try:os.link(R.live_tree()/SEAM,p)
        except OSError:self.skipTest('Hard links unavailable')
        self.assertRefused()

    def test_symlink_root_refused(self):
        link=Path(self.temp.name)/'link'
        try:os.symlink(self.root,link,target_is_directory=True)
        except OSError:self.skipTest('Windows symlinks unavailable')
        with self.assertRaises(R.RemovalError):R.remove(link,dry_run=True)

class LiveTree(unittest.TestCase):
    def test_exact_predecessor_and_dependency_sources_unchanged(self):
        versions=next(p for p in Path(__file__).parents if (p/'BUILD-LEDGER.md').is_file())
        spec=importlib.util.spec_from_file_location('removal_chain',versions/'QA — Removal Chain Registry/removal_chain.py')
        chain=importlib.util.module_from_spec(spec);sys.modules[spec.name]=chain;spec.loader.exec_module(chain)
        with tempfile.TemporaryDirectory(prefix='l5r-skilltraits-live-') as tmp:
            tree=Path(tmp)/'tree';shutil.copytree(R.live_tree(),tree)
            chain.strip_later(tree,after='BUGFIX — Skill Traits')
            keep=['src/sheet/209.9995-bugfix-school-skill-rows.js','src/sheet/020-lib-skills-advantages.js',
                  'src/sheet/209.99999991-feat-search-index.js','src/sheet/090-table-rows-weapons.js']
            before={p:(tree/p).read_bytes() for p in keep}
            result=R.remove(tree,expect_sha=R.PRE_RELEASE_SHA)
            self.assertEqual((result['rebuild_sha256'],result['rebuild_bytes']),(R.PRE_RELEASE_SHA,R.PRE_RELEASE_BYTES))
            self.assertEqual({p:(tree/p).read_bytes() for p in keep},before)
            proc=subprocess.run([sys.executable,str(tree/'build/recombine.py'),'--verify'],capture_output=True)
            self.assertEqual(proc.returncode,0,proc.stderr)
            self.assertEqual(hashlib.sha256((tree/'l5r-character-sheet.html').read_bytes()).hexdigest(),R.PRE_RELEASE_SHA)

if __name__=='__main__':unittest.main(verbosity=2)
