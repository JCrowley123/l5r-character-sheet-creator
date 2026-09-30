#!/usr/bin/env python3
"""Mutation checks for Phase 12.8 (Part K). All mutations occur in temporary copies.

    python qa/verify-variants.py [--discover]

A normal run pins every expected failing assertion of each deliberately broken variant against
qa/expected-failures.json, and separately runs boundary builds that must be fully green: this part
removed, its switch off, and the Characters list switched off (all with --absent: the old row
untouched), and Phase 12's parent switch off (with --modes-off: header replaced, no Play mode).
--discover prints an oracle candidate for review; it never updates the oracle. The removed build's
SHA is pinned independently of the live build.
"""
from __future__ import annotations
import hashlib, importlib.util, json, re, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
LIVE = HERE.parents[1] / 'Part F — Cross-Platform Delivery' / 'PART F — Phase 0 Source Reorganization for Maintainability'
FRAGMENT = 'src/sheet/209.99996-feat-modes-toolbar.js'
STYLE = 'src/css/59.9996-feat-modes-toolbar.css'
HARNESS = HERE / 'toolbar-harness.js'
NODE = shutil.which('node') or r'C:\Program Files\nodejs\node.exe'
BASELINE = '47fdb778d72b6febe3a4767a80a94cf1e308eaa25f9316d1cabdd195fc6c6d83'
THIS_RELEASE = 'PART K — Phase 12.8 Play Mode Toolbar'


def removal_chain():
    location = HERE.parents[1] / 'QA — Removal Chain Registry' / 'removal_chain.py'
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


def cut_block(start, end, target=STYLE):
    """Remove the text from `start` up to and including `end` (both must occur once)."""
    def apply(tree):
        p = tree / target
        s = p.read_bytes().decode('utf-8')
        assert s.count(start) == 1 and s.count(end) >= 1, (target, start, end)
        i = s.index(start); j = s.index(end, i) + len(end)
        p.write_bytes((s[:i] + s[j:]).encode('utf-8'))
    return apply


SWITCH_OFF = edit('const MODES128_ENABLED = true;', 'const MODES128_ENABLED = false;')

# name: mutation. Each disables exactly one piece of the part.
VARIANTS = {
    'part removed': removed,
    'master switch off': SWITCH_OFF,
    'menu left inside the header': edit('      document.body.appendChild(menu);\n', '      wrap.appendChild(menu);\n'),
    'Save As not a Management action': edit("      if(typeof MODES12 === 'object' && MODES12 && typeof MODES12.register === 'function') MODES12.register('#btnSaveAs');\n", ''),
    'menu stays open after a choice': edit("      menu.addEventListener('click', function(){ self.close(); });\n", ''),
    'no close on an outside tap': edit("      document.addEventListener('click', function(e){", "      document.addEventListener('pm128-never', function(e){"),
    'no close on Escape': edit("      document.addEventListener('keydown', function(e){", "      document.addEventListener('pm128-never', function(e){"),
    'old row still shown': edit('  html body.pm128-enabled .car-toolbar-rail{ display:none !important; }\n', '', target=STYLE),
    'no phone sizing': cut_block('  /* On a phone the name takes its own line', '  }\n'),
    'header actions printed': edit("      bar.className = 'pm128-actions print-hide';", "      bar.className = 'pm128-actions';"),
}
BOUNDARIES = {
    'part removed': (removed, '--absent'),
    'master switch off': (SWITCH_OFF, '--absent'),
    'Characters list switched off': (edit('const CHARACTERS_LIST_ENABLED = true;', 'const CHARACTERS_LIST_ENABLED = false;',
                                          target='src/sheet/209.993-feat-characters-list.js'), '--absent'),
    'Phase 12 modes switched off': (edit('const MODES12_ENABLED = true;', 'const MODES12_ENABLED = false;',
                                         target='src/sheet/209.9996-feat-play-management-modes.js'), '--modes-off'),
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
    with tempfile.TemporaryDirectory(prefix='l5r-pm128-mutations-') as scratch:
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
                print('\n'.join(line for line in out.splitlines() if line.startswith('FAIL'))[:3000], flush=True)
    if discover:
        print('ORACLE_JSON ' + json.dumps(found, sort_keys=True))
    print('VARIANTS ' + ('all as expected' if not bad else str(bad) + ' NOT as expected'))
    return int(bool(bad))


if __name__ == '__main__':
    sys.exit(main())
