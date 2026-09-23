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
BASE = '862dfbf316d8d05532e9b59d26dac9ddb844fb66'
BASE_SHA = '985fdeeeb4888e2d62195b5182481c5f6da053418f0737b00bbacd9c9d8b9a3f'
RETAINED = (1935, 1935)
# 4.5.22 is unrelated: removing both, in either order, must land on 4.5.21's build.
BASE_PREV = '436372ad4e0782417c4efcb7dd20f3a342b3c7ee'
BASE_PREV_SHA = '9c749b7dc9c45fc5829f8db3172067d91ced54833e734da4f245d3ddb08528d0'
JS = 'src/sheet/209.92991-feat-adv-dark-paragon.js'
CSS = 'src/css/59.99-adv-dark-paragon.css'
MUTATIONS = {
    'spider-pays-5': (b"=== 'spider' ? 4 : 5; };", b"=== 'spider' ? 5 : 5; };"),
    'no-plus-5': (b"api.PLUS = 5;", b"api.PLUS = 0;"),
    'keep-higher': (b"      const carried = rerolled.bonus || 0;",
                    b"      if(rerolled.total + api.PLUS <= originalTotal){ api.note('Kept the higher original.'); return true; }\n      const carried = rerolled.bonus || 0;"),
    'control-any-roll': (b"if(precept === 'Control') return c.kind === ROLL_KINDS.SKILL && api.social(c.skillName);", b"if(precept === 'Control') return true;"),
    'insight-on-air-ring': (b"if(precept === 'Insight') return c.traitName === 'Awareness';", b"if(precept === 'Insight') return c.traitName === 'Awareness' || c.ringName === 'Air';"),
    'strength-any-roll': (b"if(precept === 'Strength') return damage;", b"if(precept === 'Strength') return true;"),
    'offered-on-willpower-check': (b"if(!token || !entry || api.inCheck() ||", b"if(!token || !entry ||"),
    'void-before-honor': (b"if(honor + 1e-9 >= api.HONOR_COST){", b"if(false){"),
    'honor-cost-10-points': (b"api.HONOR_COST = 0.5;", b"api.HONOR_COST = 1;"),
    'no-round-limit': (b"typeof hasSpentThisRound === 'function' && hasSpentThisRound('void')){", b"false){"),
    'use-never-spent': (b"      api.setRemaining(entry.div, 0);\n      setTimeout", b"      setTimeout"),
    'cancel-still-charges': (b"      if(!ok) return false;\n      // Re-read", b"      if(!ok){ api.charge(entry, pay); return false; }\n      // Re-read"),
    'determination-plus-5': (b"totalDelta:-penalty, note:'Wound penalty negated'", b"totalDelta:-penalty + 5, note:'Wound penalty negated'"),
    'determination-on-trait': (b"return [ROLL_KINDS.SKILL, ROLL_KINDS.ATTACK, ROLL_KINDS.SPELL];", b"return [ROLL_KINDS.SKILL, ROLL_KINDS.ATTACK, ROLL_KINDS.SPELL, ROLL_KINDS.TRAIT];"),
    'without-keeps-tick': (b"if(choice === 'cancel'){ RD4515.toggle(api.KEY, false); return true; }", b"if(choice === 'cancel'){ return true; }"),
    'determination-free': (b"now.before !== pay.before || !api.charge(entry, now)){", b"now.before !== pay.before || false){"),
    'paid-roll-loses-tick': (b"      api.paidContext = req.context;\n", b""),
    'precept-change-resets-use': (b"const remaining = api.complete(before) ? before.remaining : 1;", b"const remaining = 1;"),
    'any-remaining-accepted': (b"(config.remaining === 0 || config.remaining === 1)", b"config.remaining !== undefined"),
    'ten-dice-label-left': (b"if(/^Ten Dice Rule bonus:/.test((el.textContent || '').trim())) el.style.display = 'none';", b"void el;"),
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
    """4.5.22 is unrelated (either order reaches 4.5.21's build). 4.5.15 is a declared dependency:
    with every other registry user gone, its remover still refuses because of THIS release."""
    rel = lambda name: REPO / 'Versions' / name / 'qa/remove-phase.py'
    r4522 = rel('PART I — Phase 4.5.22 Naishou Citizen')
    r4521 = rel('PART I — Phase 4.5.21 Seven Fortunes Blessing')
    r4516 = rel('PART I — Phase 4.5.16 Heart of Vengeance')
    r4515 = rel('PART I — Phase 4.5.15 Roll Declaration Registry')
    runner_prev = REPO / 'Versions/PART I — Phase 4.5.21 Seven Fortunes Blessing/qa/current-suite-runner.js'
    base_prev = subprocess.check_output(['git', 'show', BASE_PREV + ':' + (PHASE / 'l5r-character-sheet.html').relative_to(REPO).as_posix()], cwd=REPO)
    order = report['removal_order'] = {}
    if hashlib.sha256(base_prev).hexdigest() != BASE_PREV_SHA:
        failures.append('4.5.21 restore-point bytes do not match the pinned SHA-256')
    # 4.5.22 removed while this release stays.
    tree = scratch / 'without-4522'
    shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
    steps = [execute([sys.executable, r4522, tree]), execute([sys.executable, tree / 'build/recombine.py', '--verify'])]
    if any(step.returncode for step in steps):
        failures.append('4.5.22-first removal failed')
    else:
        output = tree / 'l5r-character-sheet.html'
        for label, harness, expected in [('this-release-harness', HERE / 'dark-paragon-harness.js', None),
                                         ('pre-4522-retained', runner_prev, (1899, 1899))]:
            run = execute([opts.node, harness, output])
            counts = counts_of(run)
            order['4522-removed-' + label] = {'passed': counts[0], 'total': counts[1], 'exit': run.returncode}
            if run.returncode or counts[1] == 0 or counts[0] != counts[1] or (expected and counts != expected):
                failures.append('with 4.5.22 removed, ' + label + ' failed')
    for label, first, second in [('4523-then-4522', HERE / 'remove-phase.py', r4522),
                                 ('4522-then-4523', r4522, HERE / 'remove-phase.py')]:
        tree = scratch / label
        shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
        steps = [execute([sys.executable, first, tree]), execute([sys.executable, second, tree]),
                 execute([sys.executable, tree / 'build/recombine.py', '--verify'])]
        output = (tree / 'l5r-character-sheet.html').read_bytes()
        identical = not any(step.returncode for step in steps) and output == base_prev
        order[label] = {'byte_identical_to_4521_restore_point': identical, 'bytes': len(output),
                        'sha256': hashlib.sha256(output).hexdigest()}
        if not identical:
            failures.append(label + ' removal did not reach the 4.5.21 restore point')
    # The 4.5.15 dependency, isolated from the other registry users.
    tree = scratch / 'dependency-4515'
    shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
    steps = [execute([sys.executable, r, tree]) for r in (r4522, r4521, r4516)]
    if any(step.returncode for step in steps):
        failures.append('could not strip 4.5.22/4.5.21/4.5.16 for the 4.5.15 dependency proof')
    else:
        before = snapshot(tree)
        refused = execute([sys.executable, r4515, tree])
        message = (refused.stdout + refused.stderr).strip()
        unchanged = snapshot(tree) == before
        order['4515-while-4523-present'] = {'exit': refused.returncode, 'tree_unchanged': unchanged, 'message': message[-300:]}
        if refused.returncode == 0 or not unchanged or '209.92991-feat-adv-dark-paragon.js' not in message:
            failures.append('4.5.15 remover did not refuse because of this release')
        steps = [execute([sys.executable, HERE / 'remove-phase.py', tree]), execute([sys.executable, r4515, tree]),
                 execute([sys.executable, tree / 'build/recombine.py', '--verify'])]
        order['4523-then-4515'] = {'exits': [step.returncode for step in steps]}
        if any(step.returncode for step in steps):
            failures.append('4.5.23 then 4.5.15 removal failed')
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
    with tempfile.TemporaryDirectory(prefix='l5r-dp-qa-') as directory:
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
                old = b'const ADV_DARK_PARAGON_ENABLED = true;'
                assert data.count(old) == 1, 'kill-switch mutation anchor must be unique'
                (tree / JS).write_bytes(data.replace(old, b'const ADV_DARK_PARAGON_ENABLED = false;'))
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
                harness = REPO / 'Versions/PART I — Phase 4.5.22 Naishou Citizen/qa/current-suite-runner.js'
            else:
                harness = HERE / 'dark-paragon-harness.js'
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
    print('DP4523_VARIANT_RESULT=' + json.dumps(report, ensure_ascii=True), flush=True)
    return bool(failures)


if __name__ == '__main__':
    sys.exit(main())
