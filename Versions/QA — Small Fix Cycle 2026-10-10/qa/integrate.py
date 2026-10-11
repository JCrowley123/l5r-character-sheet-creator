"""Integrate one approved layer, preserving shared-file line endings and exact restore points."""
from pathlib import Path
import datetime, hashlib, json, re, shutil, subprocess, sys

QA = Path(__file__).resolve().parent
V = QA.parent.parent
P0 = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
STAGES = [
    ('BUGFIX — Printed Sheet Ring Layers', ['59.999985-bugfix-printed-ring-layers.css', '209.999999992-bugfix-printed-ring-layers.js'],
     'BUGFIX PRINTRINGS', 'PRINTRINGS', 'printed-ring-layers-seam', 'PRINTRINGS, PRINTED_RING_LAYERS_ENABLED'),
    ('PART K — Phase 11.1 Export to PDF', ['59.999986-feat-export-pdf.css', '209.999999993-feat-export-pdf.js'],
     'PART K PHASE 11.1', 'PDF111', 'export-pdf-seam', 'PDF111, EXPORT_PDF_ENABLED'),
    ('BUGFIX — Skill Traits', ['209.999999994-bugfix-skill-traits.js'],
     'BUGFIX SKILLTRAITS', 'SKILLTRAITS', 'skill-traits-seam', ''),
]

def read(path): return path.read_bytes().decode('utf-8')
def write(path, text): path.write_bytes(text.encode('utf-8'))
def assembled():
    m = json.loads(read(P0 / 'build/manifest.json'))
    return b'\n'.join((P0 / f['file']).read_bytes() for f in m['fragments'])

def main():
    number = int(sys.argv[1]); folder, files, marker, tag, slug, exports = STAGES[number - 1]
    state_path = QA / 'stages.json'
    states = json.loads(read(state_path)) if state_path.exists() else []
    assert len(states) == number - 1, 'Integrate each layer once, in order'
    before = assembled(); before_sha = hashlib.sha256(before).hexdigest()
    assert (P0 / 'l5r-character-sheet.html').read_bytes() == before
    assert before_sha == (states[-1]['sha'] if states else 'b7e1fc2d7c12e077954f1eb539d734679aad96930ae76fb7e61a813df1c94907')
    manifest_path = P0 / 'build/manifest.json'; manifest = read(manifest_path)
    newline = '\r\n' if '\r\n' in manifest else '\n'
    source = V / folder / 'source'
    for name in files:
        kind = 'css' if name.endswith('.css') else 'sheet'
        rel = 'src/' + kind + '/' + name
        assert not (P0 / rel).exists(), rel
        assert (source / name).is_file(), source / name
        anchor = 'src/css/60-sheet-print.css' if kind == 'css' else 'src/sheet/210-test-seam-and-init.js'
        hits = list(re.finditer(r'(?m)^[ \t]*\{ "file": "' + re.escape(anchor) + '"', manifest))
        assert len(hits) == 1
        entry = '    { "file": ' + json.dumps(rel) + ', "note": ' + json.dumps(marker + ' - ' + folder) + ' },' + newline
        manifest = manifest[:hits[0].start()] + entry + manifest[hits[0].start():]
    seam_path = P0 / 'src/sheet/210-test-seam-and-init.js'; seam = read(seam_path)
    snl = '\r\n' if '\r\n' in seam else '\n'
    snippet_path = source / ('skill-traits-seam.txt' if number == 3 else 'seam.txt')
    if snippet_path.exists(): snippet = read(snippet_path).replace('\r\n', '\n').rstrip('\n')
    else:
        snippet = '\n'.join(['  // ' + marker + ' BEGIN ' + slug,
            "  if (typeof " + tag + " === 'object' && " + tag + ') {',
            '    Object.assign(window.__L5R_TEST__, { ' + exports + ' });',
            '  }', '  // END ' + tag + ' ' + slug])
    anchor = '  // ---------- Init ----------'
    assert seam.count(anchor) == 1 and ('BEGIN ' + slug) not in seam
    seam = seam.replace(anchor, snippet.replace('\n', snl) + snl + anchor)
    for name in files:
        kind = 'css' if name.endswith('.css') else 'sheet'
        shutil.copyfile(source / name, P0 / 'src' / kind / name)
    write(manifest_path, manifest); write(seam_path, seam)
    after = assembled(); digest = hashlib.sha256(after).hexdigest()
    manifest = re.sub(r'("expect_sha256"\s*:\s*")[^"]+', lambda m: m[1] + digest, manifest)
    write(manifest_path, manifest)
    subprocess.run([sys.executable, '-B', str(P0 / 'build/recombine.py'), '--verify'], check=True)
    registry_path = V / 'QA — Removal Chain Registry/removal_chain.py'; registry = read(registry_path)
    rnl = '\r\n' if '\r\n' in registry else '\n'
    first_end = registry.index(rnl + ')', registry.index('CHAIN:'))
    fragment = 'src/sheet/' + next(f for f in files if f.endswith('.js'))
    addition = rnl + '    Release(' + json.dumps(folder, ensure_ascii=False) + ',' + rnl + '            fragment=' + json.dumps(fragment) + '),'
    write(registry_path, registry[:first_end] + addition + registry[first_end:])
    remover_path = V / folder / 'qa/remove-phase.py'
    if remover_path.exists():
        remover = read(remover_path)
        remover = re.sub(r'^PRE_RELEASE_SHA\s*=.*$', 'PRE_RELEASE_SHA = ' + repr(before_sha), remover, flags=re.M)
        remover = re.sub(r'^PRE_RELEASE_BYTES\s*=.*$', 'PRE_RELEASE_BYTES = ' + str(len(before)), remover, flags=re.M)
        write(remover_path, remover)
    states.append({'number':number, 'folder':folder, 'before_sha':before_sha, 'before_bytes':len(before),
        'sha':digest, 'bytes':len(after), 'integrated_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()})
    write(state_path, json.dumps(states, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps(states[-1], ensure_ascii=False))

if __name__ == '__main__': main()
