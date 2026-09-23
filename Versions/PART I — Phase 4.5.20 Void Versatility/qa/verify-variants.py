#!/usr/bin/env python3
"""Scratch-only build, structural parity, mutation and byte-identical rollback proof.

Pass --node <node executable>. Browser runtimes are supplied by environment, exactly as
for current-suite-runner.js. Every modified build stays in a TemporaryDirectory.
"""
from pathlib import Path
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
PHASE = REPO / 'Versions/Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
BASE = '46b15b41a199f2f227f39dd83b1a5ab49155bc67'
BASE_SHA = '2b69794dcd3bf9d70b8a1676a4f9cb734cf1f4b0ecf7d40b0396d0bae8ef0c3e'
RETAINED = (1756, 1756)
BASE_PREV = 'fe20e753756d8623c5a8f86de63ee341d9595476'
JS = 'src/sheet/209.9297-feat-adv-void-versatility.js'
CSS = 'src/css/59.96-adv-void-versatility.css'
MUTATIONS = {
    'no-ring-debit': (b"      document.getElementById('spell_used_' + plan.ring.key).value = now.used + 1;\n", b""),
    'debits-void-too': (b"      renderSpellPips(plan.ring.key);\n",
                        b"      renderSpellPips(plan.ring.key);\n      document.getElementById('spell_used_void').value = (parseInt(document.getElementById('spell_used_void').value || '0', 10) || 0) + 1;\n"),
    'casts-as-ring-element': (b"performSpellCastRoll('void', 'Void', spellName, mastery, keywords);", b"performSpellCastRoll(plan.ring.key, plan.ring.name, spellName, mastery, keywords);"),
    'x-pays-with-ring': (b"return r === 'ok' ? 'ring' : r === 'cancel' ? 'ordinary' : null;", b"return r === 'cancel' ? 'ordinary' : 'ring';"),
    'affinity-not-checked': (b"if(profile.affinity !== 'Void'){", b"if(false){"),
    'uncentered-ignored': (b"if(uncentered) return", b"if(false) return"),
    'void-ring-accepted': (b"return !!api.ring(config.ring);", b"return !!config.ring;"),
    'non-void-spells-too': (b"if(!api.enabled() || elementKey !== 'void') return null;", b"if(!api.enabled() || elementKey === 'universal') return null;"),
    'asks-when-ring-empty': (b"      if(ringSlots.free <= 0) return null;\n", b""),
    'no-diagnostic-lift': (b"registerCastingDiagnostic('void-versatility', 80, VV4520.diagnostic);", b"registerCastingDiagnostic('void-versatility', 80, function(){ return null; });"),
    'no-picker-gate': (b"if(VV4520.is(name) && R455.enabled()){", b"if(false){"),
    'future-revision-accepted': (b"config.revision !== 1", b"config.revision < 1"),
}


def execute(args, cwd=None):
    return subprocess.run([str(x) for x in args], cwd=cwd, capture_output=True, text=True,
                          encoding='utf-8', errors='replace', timeout=3600)


def counts_of(run):
    matches = re.findall(r'(?:COMBINED )?(\d+)/(\d+) checks passed', run.stdout)
    return tuple(map(int, matches[-1])) if matches else (0, 0)


def removal_order(scratch, opts, report, failures):
    """4.5.19 removed while this release stays; then both removed, in each order."""
    remover_prev = REPO / 'Versions/PART I — Phase 4.5.19 Soul of Artistry/qa/remove-phase.py'
    runner_prev = REPO / 'Versions/PART I — Phase 4.5.18 Paragon/qa/current-suite-runner.js'
    base_prev = subprocess.check_output(['git', 'show', BASE_PREV + ':' + (PHASE / 'l5r-character-sheet.html').relative_to(REPO).as_posix()], cwd=REPO)
    order = report['removal_order'] = {}
    tree = scratch / 'without-4519'
    shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
    steps = [execute([sys.executable, remover_prev, tree]), execute([sys.executable, tree / 'build/recombine.py', '--verify'])]
    if any(step.returncode for step in steps):
        failures.append('4.5.19-first removal failed: ' + ''.join(step.stdout + step.stderr for step in steps)[-400:])
        return
    output = tree / 'l5r-character-sheet.html'
    for label, harness, expected in [('this-release-harness', HERE / 'void-versatility-harness.js', None),
                                     ('pre-4519-retained', runner_prev, (1664, 1664))]:
        run = execute([opts.node, harness, output])
        counts = counts_of(run)
        order['4519-removed-' + label] = {'passed': counts[0], 'total': counts[1], 'exit': run.returncode}
        if run.returncode or counts[1] == 0 or counts[0] != counts[1] or (expected and counts != expected):
            failures.append('with 4.5.19 removed, ' + label + ' failed')
    for label, first, second in [('4520-then-4519', HERE / 'remove-phase.py', remover_prev),
                                 ('4519-then-4520', remover_prev, HERE / 'remove-phase.py')]:
        tree = scratch / label
        shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
        steps = [execute([sys.executable, first, tree]), execute([sys.executable, second, tree]),
                 execute([sys.executable, tree / 'build/recombine.py', '--verify'])]
        output = (tree / 'l5r-character-sheet.html').read_bytes()
        identical = not any(step.returncode for step in steps) and output == base_prev
        order[label] = {'byte_identical_to_4518_restore_point': identical, 'bytes': len(output),
                        'sha256': hashlib.sha256(output).hexdigest()}
        if not identical:
            failures.append(label + ' removal did not reach the 4.5.18 restore point')
    print(json.dumps({'removal_order': order}), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node', required=True)
    parser.add_argument('--retained', action='store_true', help='also run the entire retained suite on the removed build')
    opts = parser.parse_args()
    report = {'baseline_commit': BASE, 'variants': {}}
    failures = []
    for item in (PHASE / 'src').rglob('*'):
        if item.is_file() and b'\r' in item.read_bytes():
            failures.append('CR byte in ' + str(item.relative_to(PHASE)))
    source = subprocess.check_output(['git', 'show', BASE + ':' + (PHASE / 'l5r-character-sheet.html').relative_to(REPO).as_posix()], cwd=REPO)
    if hashlib.sha256(source).hexdigest() != BASE_SHA:
        failures.append('restore-point bytes do not match the pinned SHA-256')
    with tempfile.TemporaryDirectory(prefix='l5r-vv-qa-') as directory:
        scratch = Path(directory)
        base_html = scratch / 'baseline.html'
        base_html.write_bytes(source)
        inventory = PHASE / 'qa/inventory.py'
        baseline = json.loads(execute([sys.executable, inventory, base_html]).stdout)
        live = json.loads(execute([sys.executable, inventory, PHASE / 'l5r-character-sheet.html']).stdout)
        invariant_keys = ['element_ids', 'element_id_count', 'element_id_unique', 'element_ids_duplicated',
                          'section_count', 'roll_modal_overlay_count', 'tag_imbalance', 'script_count', 'style_count']
        report['inventory'] = {key: {'before': baseline[key], 'after': live[key]} for key in invariant_keys if baseline[key] != live[key]}
        report['inventory_counts'] = {key: live[key] for key in invariant_keys if key != 'element_ids'}
        if report['inventory']:
            failures.append('structural invariants changed')
        for name in ['disabled', 'no-styles', *MUTATIONS, 'removed']:
            tree = scratch / name
            shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
            if name == 'disabled':
                data = (tree / JS).read_bytes()
                old = b'const ADV_VOID_VERSATILITY_ENABLED = true;'
                assert data.count(old) == 1, 'kill-switch mutation anchor must be unique'
                (tree / JS).write_bytes(data.replace(old, b'const ADV_VOID_VERSATILITY_ENABLED = false;'))
            elif name == 'no-styles':
                (tree / CSS).write_bytes(b'')
            elif name in MUTATIONS:
                old, new = MUTATIONS[name]
                data = (tree / JS).read_bytes()
                assert data.count(old) == 1, name + ' mutation anchor must be unique'
                (tree / JS).write_bytes(data.replace(old, new))
            else:
                removal = execute([sys.executable, HERE / 'remove-phase.py', tree])
                report['remover_output'] = removal.stdout + removal.stderr
                if removal.returncode:
                    failures.append('remover failed')
                    continue
            build = execute([sys.executable, tree / 'build/recombine.py'])
            if build.returncode:
                failures.append(name + ' rebuild failed')
                continue
            output = tree / 'l5r-character-sheet.html'
            if name == 'removed':
                identical = output.read_bytes() == source
                report['removed'] = {'byte_identical': identical, 'bytes': output.stat().st_size,
                                     'sha256': hashlib.sha256(output.read_bytes()).hexdigest()}
                verify = execute([sys.executable, tree / 'build/recombine.py', '--verify'])
                report['removed']['recombine_verify_exit'] = verify.returncode
                if not identical or verify.returncode:
                    failures.append('removal is not byte-identical to the restore point')
                if not opts.retained:
                    continue
                harness = REPO / 'Versions/PART I — Phase 4.5.19 Soul of Artistry/qa/current-suite-runner.js'
            else:
                harness = HERE / 'void-versatility-harness.js'
            run = execute([opts.node, harness, output])
            matches = re.findall(r'(?:COMBINED )?(\d+)/(\d+) checks passed', run.stdout)
            counts = tuple(map(int, matches[-1])) if matches else (0, 0)
            failed_checks = re.findall(r'^FAIL ([^\s]+)', run.stdout, re.M)
            report['variants'][name] = {'passed': counts[0], 'total': counts[1], 'exit': run.returncode, 'failed_checks': failed_checks}
            if name == 'removed':
                if run.returncode or counts != RETAINED:
                    failures.append('retained suites failed after removal')
            elif run.returncode == 0 or counts[1] == 0 or counts[0] == counts[1]:
                failures.append(name + ' mutation did not make the harness fail')
            print(json.dumps({'variant': name, **report['variants'][name]}), flush=True)
        if opts.retained:
            removal_order(scratch, opts, report, failures)
    report['failures'] = failures
    print('VV4520_VARIANT_RESULT=' + json.dumps(report, ensure_ascii=True), flush=True)
    return bool(failures)


if __name__ == '__main__':
    sys.exit(main())
