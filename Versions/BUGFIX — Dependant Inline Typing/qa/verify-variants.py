#!/usr/bin/env python3
"""Mutation checks for BUGFIX — Dependant Inline Typing. All mutations occur in temporary copies.

    python qa/verify-variants.py [--discover]

A normal run pins every expected failing assertion of each deliberately broken variant against
qa/expected-failures.json, and separately runs three boundary builds that must stay fully green
under the harness's own boundary flags: the Dependant provider switched off (--provider-absent),
and the Play/Management parent or its Advantages part switched off (--mode-off). --discover prints
an oracle candidate for review; it never updates the oracle. The removed build's SHA is pinned
independently of the live build.
"""
from __future__ import annotations
import hashlib, importlib.util, json, re, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
LIVE = HERE.parents[1] / 'Part F — Cross-Platform Delivery' / 'PART F — Phase 0 Source Reorganization for Maintainability'
FRAGMENT = 'src/sheet/209.99994-bugfix-dependant-typing.js'
HARNESS = HERE / 'dependant-typing-harness.js'
NODE = shutil.which('node') or r'C:\Program Files\nodejs\node.exe'
BASELINE = '4f8509e68a05054b2c813575f77750c4598a9b4295d18faf266ecc10de06413a'
THIS_RELEASE = 'BUGFIX — Dependant Inline Typing'


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


# Each variant disables exactly one piece of the fix. Renaming an event to one that never fires
# removes a listener without disturbing the code around it.
VARIANTS = {
    'fix removed': removed,
    'master switch off': edit('const DEPENDANT_TYPING_ENABLED = true;', 'const DEPENDANT_TYPING_ENABLED = false;'),
    'keystrokes not saved': edit("input.addEventListener('input',", "input.addEventListener('deptype-never',"),
    'focused row rebuilt': edit("focused && focused.matches('.dep458-input') && div.contains(focused) &&", 'false &&'),
    'commit rebuilds mid-focus': edit("wrap.addEventListener('change',", "wrap.addEventListener('deptype-never',"),
    'no repaint after leaving': edit("input.addEventListener('blur',", "input.addEventListener('deptype-never',"),
    'no repaint after commit': edit('          e.stopPropagation();\n          repaintSoon();', '          e.stopPropagation();'),
    'repaint while focus stays': edit('if(div.isConnected && !row.contains(document.activeElement))', 'if(div.isConnected)'),
}
BOUNDARIES = {
    'provider off': (edit('const DISADV_DEPENDANT_WRATH_ENABLED = true;', 'const DISADV_DEPENDANT_WRATH_ENABLED = false;',
                          target='src/sheet/209.94-feat-disadv-dependant-wrath.js'), '--provider-absent'),
    'mode parent off': (edit('const MODES12_ENABLED = true;', 'const MODES12_ENABLED = false;',
                             target='src/sheet/209.9996-feat-play-management-modes.js'), '--mode-off'),
    'mode advantages part off': (edit('const MODES125_ENABLED = true;', 'const MODES125_ENABLED = false;',
                                      target='src/sheet/209.99993-feat-modes-advantages.js'), '--mode-off'),
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
    with tempfile.TemporaryDirectory(prefix='l5r-deptype-mutations-') as scratch:
        work = Path(scratch)
        for name, mutate in VARIANTS.items():
            tree = copy(work, name); mutate(tree); build(tree)
            if name == 'fix removed':
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
            tree = copy(work, name); mutate(tree); build(tree)
            rc, out = run(tree, flag)
            count = re.search(r'(\d+)/(\d+) checks passed', out)
            good = rc == 0 and bool(count) and count[1] == count[2] and int(count[2]) > 0
            bad += not good
            print(('OK' if good else 'BAD') + ' boundary ' + name + ' (' + flag + '): '
                  + (count[0] if count else 'no count'), flush=True)
            if not good:
                print('\n'.join(line for line in out.splitlines() if line.startswith('FAIL'))[:3000], flush=True)
    if discover:
        print('ORACLE_JSON ' + json.dumps(found, sort_keys=True))
    print('VARIANTS ' + ('all as expected' if not bad else str(bad) + ' NOT as expected'))
    return int(bool(bad))


if __name__ == '__main__':
    sys.exit(main())
