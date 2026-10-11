"""Check deployment source bytes as Git will deliver them, independent of checkout line endings."""
from pathlib import Path
import hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[3]
PREFIX='Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/'
def blob(name):return subprocess.check_output(['git','show','HEAD:'+PREFIX+name],cwd=ROOT)
m=json.loads(blob('build/manifest.json'))
assembled=b'\n'.join(blob(f['file']) for f in m['fragments'])
assert assembled==blob('l5r-character-sheet.html')
assert hashlib.sha256(assembled).hexdigest()==m['expect_sha256']
assert assembled==(ROOT/PREFIX/'l5r-character-sheet.html').read_bytes()
print('Committed source, manifest, recombined output and tested checkout match:',len(assembled),m['expect_sha256'])
