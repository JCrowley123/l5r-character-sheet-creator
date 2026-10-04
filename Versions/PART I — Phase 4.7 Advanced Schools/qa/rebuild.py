"""Refresh this release's inline catalogue and verify the recombined build."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

release = Path(__file__).resolve().parents[1]
versions = next(p for p in release.parents if (p / 'BUILD-LEDGER.md').is_file())
tree = versions / 'Part F — Cross-Platform Delivery' / 'PART F — Phase 0 Source Reorganization for Maintainability'
fragment = tree / 'src/sheet/209.999999-feat-advanced-schools.js'
text = fragment.read_bytes().decode('utf-8')
data = json.loads((release / 'data/core-schools.json').read_text(encoding='utf-8'))
replacement = 'const ADVANCED_SCHOOL_LIBRARY = ' + json.dumps(data, ensure_ascii=False, indent=2) + '; // CORE_ADVANCED_SCHOOL_DATA'
text, count = re.subn(r'const ADVANCED_SCHOOL_LIBRARY = .*?; // CORE_ADVANCED_SCHOOL_DATA', lambda _: replacement, text, flags=re.S)
assert count == 1, 'catalogue anchor must occur exactly once'
fragment.write_bytes(text.encode('utf-8'))
manifest = tree / 'build/manifest.json'
source = manifest.read_bytes().decode('utf-8')
raw = b'\n'.join((tree / f['file']).read_bytes() for f in json.loads(source)['fragments'])
digest = hashlib.sha256(raw).hexdigest()
source, count = re.subn(r'("expect_sha256"\s*:\s*")[^"]+', lambda m: m[1] + digest, source)
assert count == 1
manifest.write_bytes(source.encode('utf-8'))
subprocess.run([sys.executable, '-B', str(tree / 'build/recombine.py'), '--verify'], check=True)
