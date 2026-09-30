#!/usr/bin/env python3
"""Mutation checks for Phase 12.7 (Part K). All mutations occur in temporary copies.

    python qa/verify-variants.py [--discover]

A normal run pins every expected failing assertion of each deliberately broken variant against
qa/expected-failures.json, and separately runs three boundary builds that must be fully green with
the harness's --absent expectations (Combat always shown): this part removed, its switch off, and
Phase 12's parent switch off. --discover prints an oracle candidate for review; it never updates the
oracle. The removed build's SHA is pinned independently of the live build.
"""
from __future__ import annotations
import hashlib, importlib.util, json, re, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
LIVE = HERE.parents[1] / 'Part F — Cross-Platform Delivery' / 'PART F — Phase 0 Source Reorganization for Maintainability'
FRAGMENT = 'src/sheet/209.99995-feat-modes-combat.js'
STYLE = 'src/css/59.9995-feat-modes-combat.css'
PARENT = 'src/sheet/209.9996-feat-play-management-modes.js'
HARNESS = HERE / 'combat-harness.js'
NODE = shutil.which('node') or r'C:\Program Files\nodejs\node.exe'
BASELINE = '2c8a426f85d00d1637a9ec48453ac01b3600b5193494aae342f3b5113e3c4fc6'
THIS_RELEASE = 'PART K — Phase 12.7 Play Mode Combat'


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


def both(*mutations):
    def apply(tree):
        for m in mutations:
            m(tree)
    return apply


def removed(tree):
    subprocess.run([sys.executable, str(HERE / 'remove-phase.py'), str(tree)], check=True, capture_output=True)


def no_css(tree):
    (tree / STYLE).write_bytes(b'  /* stylesheet deliberately omitted for mutation test */\n')


SWITCH_OFF = edit('const MODES127_ENABLED = true;', 'const MODES127_ENABLED = false;')
PARENT_OFF = edit('const MODES12_ENABLED = true;', 'const MODES12_ENABLED = false;', target=PARENT)

# name: (mutation, harness flags). Each disables exactly one piece of the part.
VARIANTS = {
    'part removed': (removed, ()),
    'master switch off': (SWITCH_OFF, ()),
    'no immediate refresh': (edit("      if(carousel && typeof carousel.refreshVisibility === 'function') carousel.refreshVisibility();\n", ''), ()),
    'no move to the next tab': (edit("        if(next) moved = !!carousel.goToTab(next.getAttribute('data-tab-label'));\n", ''), ()),
    'glide not stopped': (edit('        if(track) track.scrollLeft = track.scrollLeft;\n', ''), ()),
    'no print stylesheet': (no_css, ()),
    'print rule never activated': (edit("      document.body.classList.add('pm127-enabled');\n", ''), ()),
    'shown in the wrong mode': (edit('      const show = MODES12.isPlay();', '      const show = !MODES12.isPlay();'), ()),
    'no parent guard, parent off': (both(edit("      if(typeof MODES12_ENABLED === 'undefined' || !MODES12_ENABLED ||\n         typeof MODES12",
                                                "      if(typeof MODES12"), PARENT_OFF), ('--absent',)),
}
BOUNDARIES = {
    'part removed': removed,
    'master switch off': SWITCH_OFF,
    'parent switch off': PARENT_OFF,
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
    with tempfile.TemporaryDirectory(prefix='l5r-pm127-mutations-') as scratch:
        work = Path(scratch)
        for name, (mutate, flags) in VARIANTS.items():
            tree = copy(work, 'variant ' + name); mutate(tree); build(tree)
            if name == 'part removed':
                actual = hashlib.sha256((tree / 'l5r-character-sheet.html').read_bytes()).hexdigest()
                assert actual == BASELINE, (actual, BASELINE)
            rc, out = run(tree, *flags)
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
        for name, mutate in BOUNDARIES.items():
            tree = copy(work, 'boundary ' + name); mutate(tree); build(tree)
            rc, out = run(tree, '--absent')
            count = re.search(r'(\d+)/(\d+) checks passed', out)
            good = rc == 0 and bool(count) and count[1] == count[2] and int(count[2]) > 0
            bad += not good
            print(('OK' if good else 'BAD') + ' boundary ' + name + ' (--absent): ' + (count[0] if count else 'no count'), flush=True)
            if not good:
                print('\n'.join(line for line in out.splitlines() if line.startswith('FAIL'))[:3000], flush=True)
    if discover:
        print('ORACLE_JSON ' + json.dumps(found, sort_keys=True))
    print('VARIANTS ' + ('all as expected' if not bad else str(bad) + ' NOT as expected'))
    return int(bool(bad))


if __name__ == '__main__':
    sys.exit(main())
