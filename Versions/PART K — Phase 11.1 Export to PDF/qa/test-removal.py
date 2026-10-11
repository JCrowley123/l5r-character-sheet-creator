"""Scratch-only adversarial removal proofs; the working source is read, never removed."""
from pathlib import Path
import importlib.util,json,hashlib,shutil,sys,tempfile,unittest,os
HERE=Path(__file__).resolve().parent
SPEC=importlib.util.spec_from_file_location('owned_remover',HERE/'remove-phase.py')
R=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(R)
THIS_RELEASE='PART K — Phase 11.1 Export to PDF'
MARKER='PART K PHASE 11.1'
OBJECT='PDF111'
SLUG='export-pdf-seam'
CLASS='pdf111-enabled'
SEAM='src/sheet/210-test-seam-and-init.js'
def block(body='  owned();\n'):
 return f'  // {MARKER} BEGIN {SLUG}\n'+body+f'  // END {OBJECT} {SLUG}\n'
def write(root,rel,text):
 p=root/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(text.encode())
def snapshot(root):return {str(p.relative_to(root)):p.read_bytes() for p in root.rglob('*') if p.is_file()}
def fixture(root):
 fragments=['src/shell/start.html',R.FRAGMENTS[1],R.FRAGMENTS[0],SEAM]
 text='{\n  "output": "l5r-character-sheet.html",\n  "expect_sha256": "'+'0'*64+'",\n  "fragments": [\n'+',\n'.join('    { "file": '+json.dumps(x)+' }' for x in fragments)+'\n  ]\n}\n'
 write(root,'build/manifest.json',text);write(root,fragments[0],'<!doctype html>\n')
 for rel in R.FRAGMENTS:write(root,rel,(HERE.parent/'source'/Path(rel).name).read_text(encoding='utf-8'))
 write(root,SEAM,'  earlier();\n'+block()+'  // PART Z PHASE 99\n  later();\n')
class Removal(unittest.TestCase):
 def setUp(self):self.temp=tempfile.TemporaryDirectory(prefix='l5r-owned-removal-');self.root=Path(self.temp.name)/'tree';fixture(self.root)
 def tearDown(self):self.temp.cleanup()
 def refused(self):
  before=snapshot(self.root)
  with self.assertRaises(R.RemovalError):R.remove(self.root)
  self.assertEqual(snapshot(self.root),before)
 def test_owned_only(self):
  original=(self.root/'src/shell/start.html').read_bytes();result=R.remove(self.root)
  self.assertEqual((self.root/'src/shell/start.html').read_bytes(),original)
  self.assertEqual((self.root/SEAM).read_text(),'  earlier();\n  // PART Z PHASE 99\n  later();\n')
  self.assertTrue(all(not (self.root/f).exists() for f in R.FRAGMENTS))
  self.assertEqual(json.loads((self.root/'build/manifest.json').read_text())['expect_sha256'],result['rebuild_sha256'])
 def test_dry_run(self):
  before=snapshot(self.root);R.remove(self.root,dry_run=True);self.assertEqual(snapshot(self.root),before)
 def test_wrong_hash_refuses_before_writing(self):
  before=snapshot(self.root)
  with self.assertRaises(R.RemovalError):R.remove(self.root,expect_sha='0'*64)
  self.assertEqual(snapshot(self.root),before)
 def test_foreign_marker_in_block(self):write(self.root,SEAM,block('// PART Z PHASE 99\n'));self.refused()
 def test_foreign_marker_in_fragment(self):
  p=self.root/R.FRAGMENTS[0];p.write_bytes(p.read_bytes()+b'// PART Z PHASE 99\n');self.refused()
 def test_missing_block(self):write(self.root,SEAM,'earlier();\n');self.refused()
 def test_unclosed_block(self):write(self.root,SEAM,block().replace('// END '+OBJECT,'// WRONG END '+OBJECT));self.refused()
 def test_duplicate_block(self):write(self.root,SEAM,block()+block());self.refused()
 def test_retained_surface(self):write(self.root,'src/shell/later.js','const leak='+OBJECT+';\n');self.refused()
 def test_retained_class(self):write(self.root,'src/shell/later.css','.'+CLASS+'{color:red;}\n');self.refused()
 def test_future_source_survives(self):
  write(self.root,'src/sheet/future.js','// PART Z PHASE 99\nfuture();\n');R.remove(self.root)
  self.assertEqual((self.root/'src/sheet/future.js').read_text(),'// PART Z PHASE 99\nfuture();\n')
 def test_live_parent_and_descendant_refused(self):
  for path in [R.live_tree(),R.live_tree().parent,R.live_tree()/'src']:
   with self.subTest(path=path),self.assertRaises(R.RemovalError):R.remove(path,dry_run=True)
 def test_output_escape(self):
  p=self.root/'build/manifest.json';p.write_text(p.read_text().replace('l5r-character-sheet.html','../escape.html'));self.refused()
 def test_hardlink(self):
  p=self.root/SEAM;p.unlink()
  try:os.link(R.live_tree()/SEAM,p)
  except OSError:self.skipTest('hardlinks unavailable')
  self.refused()
 def test_symlink(self):
  p=Path(self.temp.name)/'link'
  try:os.symlink(self.root,p,target_is_directory=True)
  except OSError:self.skipTest('symlinks unavailable')
  with self.assertRaises(R.RemovalError):R.remove(p,dry_run=True)
class Live(unittest.TestCase):
 def test_exact_restore(self):
  v=next(p for p in HERE.parents if (p/'BUILD-LEDGER.md').is_file())
  spec=importlib.util.spec_from_file_location('removal_chain',v/'QA — Removal Chain Registry/removal_chain.py')
  chain=importlib.util.module_from_spec(spec);sys.modules[spec.name]=chain;spec.loader.exec_module(chain)
  before=snapshot(R.live_tree())
  with tempfile.TemporaryDirectory(prefix='l5r-actual-removal-') as temp:
   root=Path(temp)/'phase0';shutil.copytree(R.live_tree(),root,ignore=shutil.ignore_patterns('l5r-character-sheet.html','__pycache__'))
   chain.strip_later(root,after=THIS_RELEASE)
   result=R.remove(root,expect_sha=R.PRE_RELEASE_SHA)
   self.assertEqual((result['rebuild_sha256'],result['rebuild_bytes']),(R.PRE_RELEASE_SHA,R.PRE_RELEASE_BYTES))
  self.assertEqual(snapshot(R.live_tree()),before)
if __name__=='__main__':unittest.main(verbosity=2)
