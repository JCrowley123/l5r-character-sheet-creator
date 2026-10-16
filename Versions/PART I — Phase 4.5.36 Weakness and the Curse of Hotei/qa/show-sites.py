"""Print numbered context around the consumer sites named on the command line as file:line[:before:after]."""
from pathlib import Path
import sys

Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file())
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability/src'
out = []
for spec in sys.argv[1:]:
    parts = spec.split(':')
    name, line = parts[0], int(parts[1])
    before = int(parts[2]) if len(parts) > 2 else 3
    after = int(parts[3]) if len(parts) > 3 else 3
    f = next(p for p in P.rglob(name))
    lines = f.read_bytes().decode('utf-8').splitlines()
    out.append(f'--- {name}:{line}')
    for n in range(max(1, line - before), min(len(lines), line + after) + 1):
        out.append(f'{n}: {lines[n-1][:190]}')
sys.stdout.buffer.write(('\n'.join(out) + '\n').encode('utf-8'))
