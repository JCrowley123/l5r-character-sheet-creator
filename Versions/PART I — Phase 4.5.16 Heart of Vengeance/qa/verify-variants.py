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
BASE = '45d0f489081de3c5740c60b74afb0714396b6a6d'
BASE_SHA = '1d8aa345b8c054cca212bd57a57acb49cb593bf4b7805cec0438a171537a70e4'
RETAINED = (1406, 1406)
BASE_PREV = '0055ec53fa71b22ab0e71127bb869fd2c092ef6f'
JS = 'src/sheet/209.928-feat-adv-heart-vengeance.js'
CSS = 'src/css/59.92-adv-heart-vengeance.css'
MUTATIONS = {
    'no-spider-price': (b"=== 'spider' ? 4 : 5;", b"=== 'spider' ? 5 : 5;"),
    'attack-offered': (b'[ROLL_KINDS.SKILL, ROLL_KINDS.TRAIT, ROLL_KINDS.RING, ROLL_KINDS.MANUAL]',
                       b'[ROLL_KINDS.ATTACK, ROLL_KINDS.SKILL, ROLL_KINDS.TRAIT, ROLL_KINDS.RING, ROLL_KINDS.MANUAL]'),
    'stacks-per-rival': (b"return [{label:api.NAME, rolledDelta:1, keptDelta:1, note:'Contested against ' + named.join(' / ')}];",
                         b"return named.map(function(n){ return {label:api.NAME, rolledDelta:1, keptDelta:1, note:n}; });"),
    'no-faction-dedupe': (b'if(!seen[key]){ seen[key] = true; out.push(faction); }', b'out.push(faction);'),
    'blank-faction-accepted': (b"return typeof config.faction === 'string' && config.faction.trim().length > 0;",
                               b"return typeof config.faction === 'string';"),
    'provider-not-registered': (b"    if(typeof RD4515 === 'object' && RD4515) RD4515.register(HV4516.PROVIDER, HV4516.provider);\n", b''),
    'no-inline-error': (b"before confirming.'; error.hidden = false;", b"before confirming.'; error.hidden = true;"),
    'no-brotherhood-suggestion': (b"      out.push('Brotherhood of Shinsei');\n", b''),
}


def execute(args, cwd=None):
    return subprocess.run([str(x) for x in args], cwd=cwd, capture_output=True, text=True,
                          encoding='utf-8', errors='replace', timeout=3600)


def counts_of(run):
    matches = re.findall(r'(?:COMBINED )?(\d+)/(\d+) checks passed', run.stdout)
    return tuple(map(int, matches[-1])) if matches else (0, 0)


def removal_order(scratch, opts, report, failures):
    """4.5.16 depends on 4.5.15: its remover must refuse while this release is present, and
    removing this release then 4.5.15 must reach 4.5.14's restore point byte for byte."""
    remover_prev = REPO / 'Versions/PART I — Phase 4.5.15 Roll Declaration Registry/qa/remove-phase.py'
    base_prev = subprocess.check_output(['git', 'show', BASE_PREV + ':' + (PHASE / 'l5r-character-sheet.html').relative_to(REPO).as_posix()], cwd=REPO)
    order = report['removal_order'] = {}
    tree = scratch / 'dependency-refusal'
    shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
    before = {p.relative_to(tree).as_posix(): p.read_bytes() for p in tree.rglob('*') if p.is_file()}
    refused = execute([sys.executable, remover_prev, tree])
    after = {p.relative_to(tree).as_posix(): p.read_bytes() for p in tree.rglob('*') if p.is_file()}
    order['4515-first'] = {'exit': refused.returncode, 'unchanged': before == after,
                           'names_dependent': '209.928-feat-adv-heart-vengeance.js' in refused.stderr,
                           'message': refused.stderr.strip()[-200:]}
    if refused.returncode == 0 or before != after:
        failures.append('4.5.15 remover did not refuse while its dependent 4.5.16 is present')
    tree = scratch / '4516-then-4515'
    shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
    steps = [execute([sys.executable, HERE / 'remove-phase.py', tree]), execute([sys.executable, remover_prev, tree]),
             execute([sys.executable, tree / 'build/recombine.py', '--verify'])]
    output = (tree / 'l5r-character-sheet.html').read_bytes()
    identical = not any(step.returncode for step in steps) and output == base_prev
    order['4516-then-4515'] = {'byte_identical_to_4514_restore_point': identical, 'bytes': len(output),
                               'sha256': hashlib.sha256(output).hexdigest()}
    if not identical:
        failures.append('4516-then-4515 removal did not reach the 4.5.14 restore point')
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
    with tempfile.TemporaryDirectory(prefix='l5r-hv-qa-') as directory:
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
                old = b'const ADV_HEART_VENGEANCE_ENABLED = true;'
                assert data.count(old) == 1, 'kill-switch mutation anchor must be unique'
                (tree / JS).write_bytes(data.replace(old, b'const ADV_HEART_VENGEANCE_ENABLED = false;'))
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
                harness = REPO / 'Versions/PART I — Phase 4.5.15 Roll Declaration Registry/qa/current-suite-runner.js'
            else:
                harness = HERE / 'heart-vengeance-harness.js'
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
    print('HV4516_VARIANT_RESULT=' + json.dumps(report, ensure_ascii=True), flush=True)
    return bool(failures)


if __name__ == '__main__':
    sys.exit(main())
