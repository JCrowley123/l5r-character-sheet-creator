#!/usr/bin/env python3
"""Mutation checks for Phase 7 (Part J), first release. All mutations occur in temporary copies.

    python qa/verify-variants.py [--discover]

A normal run pins every expected failing assertion of each deliberately broken variant against
qa/expected-failures.json, and separately runs boundary builds that must be fully green: this part
removed and its switch off (both --absent), Phase 4.5.2 switched off (--no-d45: the chain ends at
format 2), and Phase 11's Characters list switched off (--no-list). --discover prints an oracle
candidate for review; it never updates the oracle. The removed build's SHA is pinned independently
of the live build. Adapted from Phase 12.8's (Part K) verify-variants.py.
"""
from __future__ import annotations
import hashlib, importlib.util, json, re, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent


def versions_dir() -> Path:
    for directory in HERE.parents:
        if (directory / 'BUILD-LEDGER.md').is_file() and (directory / 'CLAUDE.md').is_file():
            return directory
    raise SystemExit('cannot find Versions/ above ' + str(HERE))


VERSIONS = versions_dir()
LIVE = VERSIONS / 'Part F — Cross-Platform Delivery' / 'PART F — Phase 0 Source Reorganization for Maintainability'
FRAGMENT = 'src/sheet/209.99997-feat-save-format.js'
HARNESS = HERE / 'save-format-harness.js'
NODE = shutil.which('node') or r'C:\Program Files\nodejs\node.exe'
BASELINE = '23df67a7cd16b86802cc22967ea5af5fe586fdaccfa504ac79a7b28067734896'
THIS_RELEASE = 'PART J — Phase 7 Save Format and Migration'


def removal_chain():
    location = VERSIONS / 'QA — Removal Chain Registry' / 'removal_chain.py'
    spec = importlib.util.spec_from_file_location('removal_chain', location)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def edit(old, new, count=1, target=FRAGMENT):
    def apply(tree):
        p = tree / target
        s = p.read_bytes().decode('utf-8')
        assert s.count(old) == count, (target, old, s.count(old), count)
        p.write_bytes(s.replace(old, new).encode('utf-8'))
    return apply


def removed(tree):
    subprocess.run([sys.executable, str(HERE / 'remove-phase.py'), str(tree)], check=True, capture_output=True)


SWITCH_OFF = edit('const SAVE_FORMAT_ENABLED = true;', 'const SAVE_FORMAT_ENABLED = false;')

# name: mutation. Each disables exactly one piece of the part.
VARIANTS = {
    'part removed': removed,
    'master switch off': SWITCH_OFF,
    'Import and copy not converted': edit(
        "      if(typeof key === 'string' && key.indexOf('l5r-char:') === 0) value = VersionManager.upgradeText(value);\n", ''),
    'export not converted': edit('return sf7PreviousExport.call(this, VersionManager.upgrade(data));',
                                 'return sf7PreviousExport.call(this, data);'),
    'names lose accents again': edit(r"/[^\p{L}\p{M}\p{N}\-_]+/gu", r"/[^a-z0-9\-_]+/gi"),
    'no NFC': edit(".normalize('NFC')", ''),
    'Phase 4.5.2 step skipped': edit('      return D45.migrate(data);\n', '      return data;\n'),
    'newer saves treated as older': edit("return v < c ? 'old' : v === c ? 'current' : 'newer';",
                                         "return v < c ? 'old' : v === c ? 'current' : 'old';"),
    'no stamp from the chain': edit('      data.schemaVersion = Math.max(inner, VersionManager.current());\n', ''),
    'load not handed the inner format': edit('      if(handed.schemaVersion > inner) handed.schemaVersion = inner;\n', ''),
    'share-sheet name not fixed': edit('      CL11.fileName = function(data){ return VersionManager.fileName(data); };\n', ''),
    'trunk download left to the trunk': edit('    VersionManager.download(data);\n    return true;\n', '    return false;\n'),
}
BOUNDARIES = {
    'part removed': (removed, '--absent'),
    'master switch off': (SWITCH_OFF, '--absent'),
    'Phase 4.5.2 switched off': (edit('const DISADV_CONFIG_ENABLED = true;', 'const DISADV_CONFIG_ENABLED = false;',
                                      target='src/sheet/209.85-feat-disadv-config.js'), '--no-d45'),
    'Characters list switched off': (edit('const CHARACTERS_LIST_ENABLED = true;', 'const CHARACTERS_LIST_ENABLED = false;',
                                          target='src/sheet/209.993-feat-characters-list.js'), '--no-list'),
}


def build(tree):
    subprocess.run([sys.executable, str(tree / 'build/recombine.py')], check=True, capture_output=True)


def run(tree, *args):
    p = subprocess.run([NODE, str(HARNESS), str(tree / 'l5r-character-sheet.html'), *args], capture_output=True,
                       text=True, encoding='utf-8', errors='replace', timeout=900)
    return p.returncode, p.stdout + p.stderr


def copy(work, name):
    tree = work / re.sub(r'\W+', '-', name)
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns('l5r-character-sheet.html', 'dist', '__pycache__'))
    removal_chain().strip_later(tree, after=THIS_RELEASE)
    return tree


def main():
    discover = '--discover' in sys.argv
    wanted = {} if discover else json.loads((HERE / 'expected-failures.json').read_text(encoding='utf-8'))
    found, bad = {}, 0
    with tempfile.TemporaryDirectory(prefix='l5r-sf7-mutations-') as scratch:
        work = Path(scratch)
        for name, mutate in VARIANTS.items():
            tree = copy(work, 'variant ' + name); mutate(tree); build(tree)
            if name == 'part removed':
                actual = hashlib.sha256((tree / 'l5r-character-sheet.html').read_bytes()).hexdigest()
                assert actual == BASELINE, (actual, BASELINE)
            rc, out = run(tree)
            failures = sorted(set(re.findall(r'^FAIL (\S+)', out, re.M)))
            count = re.search(r'\d+/\d+ checks passed', out)
            assert count, (name, out[-3000:])
            found[name] = {'failures': failures, 'count': count[0]}
            # A variant that turns nothing red proves nothing; that is a failure even in discovery.
            good = rc != 0 and bool(failures) and (discover or found[name] == wanted.get(name))
            bad += not good
            print(('DISCOVER' if discover and good else 'OK' if good else 'BAD') + ' ' + name + ': ' + count[0] + '; '
                  + str(len(failures)) + ' failing assertions', flush=True)
            if not good and not discover:
                print('Expected:', wanted.get(name), '\nActual:', found[name], flush=True)
        for name, (mutate, flag) in BOUNDARIES.items():
            tree = copy(work, 'boundary ' + name); mutate(tree); build(tree)
            rc, out = run(tree, flag)
            count = re.search(r'(\d+)/(\d+) checks passed', out)
            good = rc == 0 and bool(count) and count[1] == count[2] and int(count[2]) > 0
            bad += not good
            print(('OK' if good else 'BAD') + ' boundary ' + name + ' (' + flag + '): ' + (count[0] if count else 'no count'), flush=True)
            if not good:
                print('\n'.join(line for line in out.splitlines() if line.startswith('FAIL') or 'Error' in line)[:3000], flush=True)
    if discover:
        print('ORACLE_JSON ' + json.dumps(found, sort_keys=True))
    print('VARIANTS ' + ('all as expected' if not bad else str(bad) + ' NOT as expected'))
    return int(bool(bad))


if __name__ == '__main__':
    sys.exit(main())
