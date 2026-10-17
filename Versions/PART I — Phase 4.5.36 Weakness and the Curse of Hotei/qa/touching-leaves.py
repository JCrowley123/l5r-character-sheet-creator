"""Which suite leaves read the surfaces this layer changes (Hotei, Weakness, the traitPick type, the deferred Fortune
notes, the Void card's buttons). Reads leaves.json (flat-suite-runner.js --list); prints index, file and the words hit."""
from pathlib import Path
import json, re, sys
Q = Path(__file__).resolve().parent
d = json.loads((Q / 'leaves.json').read_bytes().decode('utf-8'))
rx = re.compile(sys.argv[1] if len(sys.argv) > 1 else
                r"Hotei|Weakness|traitPick|eff-deferred|note-deferred|void-spend-btn|voidSpendButtons|configTypes|"
                r"isUnknownConfigType|renderVoidPanel|VOID_SPEND_LIBRARY")
hits = []
for i, leaf in enumerate(d['leaves'], 1):
    src = Path(leaf['file']).read_bytes().decode('utf-8', 'replace')
    found = sorted(set(m.group(0) for m in rx.finditer(src)))
    if found:
        hits.append({'index': i, 'file': leaf['file'], 'args': leaf['args'], 'cwd': leaf['cwd'], 'words': found})
(Q / 'touching-leaves.json').write_bytes((json.dumps(hits, indent=1) + '\n').encode('utf-8'))
for h in hits:
    print(h['index'], Path(h['file']).parent.parent.name[:60], Path(h['file']).name, h['words'])
print(len(hits), 'of', len(d['leaves']))
