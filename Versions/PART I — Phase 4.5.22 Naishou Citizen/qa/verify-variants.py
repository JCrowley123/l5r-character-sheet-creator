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
BASE = '436372ad4e0782417c4efcb7dd20f3a342b3c7ee'
BASE_SHA = '9c749b7dc9c45fc5829f8db3172067d91ced54833e734da4f245d3ddb08528d0'
RETAINED = (1899, 1899)
# 4.5.21 is a HARD dependency: its restore point is where removing both releases must land.
BASE_PREV = '5b1fc0082b576a6fb1f118a06bba119fe408c49e'
BASE_PREV_SHA = '106833069f5bf72a69b185b9d29c85c7f0d1cbf6748bff2195a2581b5d1e8e79'
JS = 'src/sheet/209.9299-feat-adv-naishou-citizen.js'
CSS = 'src/css/59.98-adv-naishou-citizen.css'
MUTATIONS = {
    'no-discount': (b"return Math.max(1, price - 1);", b"return price;"),
    'discount-of-2': (b"return Math.max(1, price - 1);", b"return Math.max(1, price - 2);"),
    'counted-from-disadvantages': (b"'#advList .entry .en-name'", b"'.entry .en-name'"),
    'no-blessing-note': (b"row.appendChild(note);", b""),
    'no-modal-note': (b"if(opened) NC4522.noteModal();", b"if(false) NC4522.noteModal();"),
    'badge-fixed-fortune': (b"'Aligned with ' + blessing.fortune", b"'Aligned with Benten'"),
    'reminder-fixed-fortune': (b"'One Free Raise on Social Skill rolls with monks aligned to ' + blessing.fortune",
                               b"'One Free Raise on Social Skill rolls with monks aligned to ' + 'Benten'"),
    'no-missing-blessing-warning': ("'No Seven Fortunes\u2019 Blessing yet'".encode(), b"''"),
    'no-wrong-side-warning': (b"if(wrong){", b"if(false){"),
    'foreign-row-kept': (b"if(foreign){ delete div.dataset.advConfig; foreign.remove(); }", b"if(false){ delete div.dataset.advConfig; foreign.remove(); }"),
    'no-info-button': (b"row.appendChild(api.info());", b""),
}


def execute(args, cwd=None):
    return subprocess.run([str(x) for x in args], cwd=cwd, capture_output=True, text=True,
                          encoding='utf-8', errors='replace', timeout=3600)


def counts_of(run):
    matches = re.findall(r'(?:COMBINED )?(\d+)/(\d+) checks passed', run.stdout)
    return tuple(map(int, matches[-1])) if matches else (0, 0)


def snapshot(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob('*')
            if p.is_file() and '__pycache__' not in p.parts}


def removal_order(scratch, opts, report, failures):
    """HARD dependency: 4.5.21 must refuse while this release stays; 4.5.22 then 4.5.21 reaches 4.5.20's restore point."""
    remover_prev = REPO / 'Versions/PART I — Phase 4.5.21 Seven Fortunes Blessing/qa/remove-phase.py'
    base_prev = subprocess.check_output(['git', 'show', BASE_PREV + ':' + (PHASE / 'l5r-character-sheet.html').relative_to(REPO).as_posix()], cwd=REPO)
    order = report['removal_order'] = {}
    if hashlib.sha256(base_prev).hexdigest() != BASE_PREV_SHA:
        failures.append('4.5.20 restore-point bytes do not match the pinned SHA-256')
    tree = scratch / 'refuse-4521-first'
    shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
    before = snapshot(tree)
    refused = execute([sys.executable, remover_prev, tree])
    unchanged = snapshot(tree) == before
    order['4521-while-4522-present'] = {'exit': refused.returncode, 'tree_unchanged': unchanged,
                                        'message': (refused.stdout + refused.stderr).strip()[-300:]}
    if refused.returncode == 0 or not unchanged:
        failures.append('4.5.21 remover did not refuse cleanly while 4.5.22 is present')
    tree = scratch / '4522-then-4521'
    shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
    steps = [execute([sys.executable, HERE / 'remove-phase.py', tree]), execute([sys.executable, remover_prev, tree]),
             execute([sys.executable, tree / 'build/recombine.py', '--verify'])]
    output = (tree / 'l5r-character-sheet.html').read_bytes()
    identical = not any(step.returncode for step in steps) and output == base_prev
    order['4522-then-4521'] = {'byte_identical_to_4520_restore_point': identical, 'bytes': len(output),
                               'sha256': hashlib.sha256(output).hexdigest()}
    if not identical:
        failures.append('4522-then-4521 removal did not reach the 4.5.20 restore point')
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
    with tempfile.TemporaryDirectory(prefix='l5r-nc-qa-') as directory:
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
                old = b'const ADV_NAISHOU_CITIZEN_ENABLED = true;'
                assert data.count(old) == 1, 'kill-switch mutation anchor must be unique'
                (tree / JS).write_bytes(data.replace(old, b'const ADV_NAISHOU_CITIZEN_ENABLED = false;'))
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
                harness = REPO / 'Versions/PART I — Phase 4.5.21 Seven Fortunes Blessing/qa/current-suite-runner.js'
            else:
                harness = HERE / 'naishou-citizen-harness.js'
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
    print('NC4522_VARIANT_RESULT=' + json.dumps(report, ensure_ascii=True), flush=True)
    return bool(failures)


if __name__ == '__main__':
    sys.exit(main())
