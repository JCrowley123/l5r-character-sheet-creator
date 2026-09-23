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
BASE = '94235855fde49542fbac785f8f2534624051afbd'
BASE_SHA = '4d112320eb4c1e9937a280b1e7d3f25ef1d5aff49a5a938e80b351fa329ccac7'
RETAINED = (2002, 2002)
# 4.5.23 is unrelated: removing both, in either order, must land on 4.5.22's build.
BASE_PREV = '862dfbf316d8d05532e9b59d26dac9ddb844fb66'
BASE_PREV_SHA = '985fdeeeb4888e2d62195b5182481c5f6da053418f0737b00bbacd9c9d8b9a3f'
JS = 'src/sheet/209.92992-feat-adv-spirit-realms.js'
CSS = 'src/css/59.991-adv-spirit-realms.css'
MUTATIONS = {
    'shugenja-no-discount': (b"return r ? r.base - (api.shugenja() ? 1 : 0) : null;", b"return r ? r.base : null;"),
    'shugenja-flat-4': (b"return r ? r.base - (api.shugenja() ? 1 : 0) : null;", b"return r ? (api.shugenja() ? 4 : r.base) : null;"),
    'toshigoku-costs-5': (b"Toshigoku:{base:8,", b"Toshigoku:{base:5,"),
    'no-gm-note': (b"if(api.interpreted(config.realm)) notes.push(", b"if(false) notes.push("),
    'chikushudo-any-skill': (b"api.skillIs(context, 'Animal Handling') && api.first('Chikushudo')", b"api.first('Chikushudo')"),
    'yomi-plus-1k1': (b"rolledDelta:1, keptDelta:0, note:yomi.config.skill", b"rolledDelta:1, keptDelta:1, note:yomi.config.skill"),
    'yomi-stale-applies': (b"api.skillIs(context, yomi.config.skill) && api.isSchoolSkill(yomi.config.skill)){", b"api.skillIs(context, yomi.config.skill)){"),
    'jigoku-mental-traits': (b"api.PHYSICAL.indexOf(context.traitName) !== -1;", b"true;"),
    'jigoku-any-roll': (b"if(context.kind === ROLL_KINDS.ATTACK) return true;", b"return true;"),
    'lost-not-doubling': (b"(entry.config.lost ? 2 : 1)", b"1"),
    'no-taint-flag': (b"if(!taint) notes.push(['tr4524-flag'", b"if(false) notes.push(['tr4524-flag'"),
    'sakkaku-any-skill': (b"c.kind === ROLL_KINDS.SKILL && api.skillIs(c, 'Sincerity'); }", b"c.kind === ROLL_KINDS.SKILL; }"),
    'meido-on-attack': (b"[ROLL_KINDS.SKILL, ROLL_KINDS.TRAIT, ROLL_KINDS.RING, ROLL_KINDS.MANUAL].indexOf(c", b"[ROLL_KINDS.SKILL, ROLL_KINDS.TRAIT, ROLL_KINDS.RING, ROLL_KINDS.MANUAL, ROLL_KINDS.ATTACK].indexOf(c"),
    'tengoku-any-ring': (b"c.kind === ROLL_KINDS.RING && c.ringName === 'Earth'", b"c.kind === ROLL_KINDS.RING"),
    'declared-without-realm': (b"const d = api.DECLARATIONS[k]; return api.first(d.realm) && d.when(context);", b"const d = api.DECLARATIONS[k]; return d.when(context);"),
    'lost-reset-on-reconfirm': (b"config.lost = !!(api.complete(before) && before.realm === 'Jigoku' && before.lost === true);", b"config.lost = false;"),
    'extra-fields-accepted': (b"concat(config.realm === 'Yomi' ? ['skill'] : config.realm === 'Jigoku' ? ['lost'] : [])", b"concat(['skill', 'lost'])"),
    'skill-field-always-shown': (b"if(field) field.hidden = !picked || picked.value !== 'Yomi';", b"if(field) field.hidden = false;"),
    'lost-tick-ignored': (b"      writeAdvConfig(div, api.TYPE, Object.assign({}, config, {lost:!!lost}));\n", b""),
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
    """4.5.23 is unrelated (either order reaches 4.5.22's build). 4.5.15 is a declared dependency:
    with every other registry user gone, its remover still refuses because of THIS release."""
    rel = lambda name: REPO / 'Versions' / name / 'qa/remove-phase.py'
    r4523 = rel('PART I — Phase 4.5.23 Dark Paragon')
    r4522 = rel('PART I — Phase 4.5.22 Naishou Citizen')
    r4521 = rel('PART I — Phase 4.5.21 Seven Fortunes Blessing')
    r4516 = rel('PART I — Phase 4.5.16 Heart of Vengeance')
    r4515 = rel('PART I — Phase 4.5.15 Roll Declaration Registry')
    runner_prev = REPO / 'Versions/PART I — Phase 4.5.22 Naishou Citizen/qa/current-suite-runner.js'
    base_prev = subprocess.check_output(['git', 'show', BASE_PREV + ':' + (PHASE / 'l5r-character-sheet.html').relative_to(REPO).as_posix()], cwd=REPO)
    order = report['removal_order'] = {}
    if hashlib.sha256(base_prev).hexdigest() != BASE_PREV_SHA:
        failures.append('4.5.22 restore-point bytes do not match the pinned SHA-256')
    tree = scratch / 'without-4523'
    shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
    steps = [execute([sys.executable, r4523, tree]), execute([sys.executable, tree / 'build/recombine.py', '--verify'])]
    if any(step.returncode for step in steps):
        failures.append('4.5.23-first removal failed')
    else:
        output = tree / 'l5r-character-sheet.html'
        for label, harness, expected in [('this-release-harness', HERE / 'spirit-realms-harness.js', None),
                                         ('pre-4523-retained', runner_prev, (1935, 1935))]:
            run = execute([opts.node, harness, output])
            counts = counts_of(run)
            order['4523-removed-' + label] = {'passed': counts[0], 'total': counts[1], 'exit': run.returncode}
            if run.returncode or counts[1] == 0 or counts[0] != counts[1] or (expected and counts != expected):
                failures.append('with 4.5.23 removed, ' + label + ' failed')
    for label, first, second in [('4524-then-4523', HERE / 'remove-phase.py', r4523),
                                 ('4523-then-4524', r4523, HERE / 'remove-phase.py')]:
        tree = scratch / label
        shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
        steps = [execute([sys.executable, first, tree]), execute([sys.executable, second, tree]),
                 execute([sys.executable, tree / 'build/recombine.py', '--verify'])]
        output = (tree / 'l5r-character-sheet.html').read_bytes()
        identical = not any(step.returncode for step in steps) and output == base_prev
        order[label] = {'byte_identical_to_4522_restore_point': identical, 'bytes': len(output),
                        'sha256': hashlib.sha256(output).hexdigest()}
        if not identical:
            failures.append(label + ' removal did not reach the 4.5.22 restore point')
    tree = scratch / 'dependency-4515'
    shutil.copytree(PHASE, tree, ignore=shutil.ignore_patterns('__pycache__'))
    steps = [execute([sys.executable, r, tree]) for r in (r4523, r4522, r4521, r4516)]
    if any(step.returncode for step in steps):
        failures.append('could not strip 4.5.23/4.5.22/4.5.21/4.5.16 for the 4.5.15 dependency proof')
    else:
        before = snapshot(tree)
        refused = execute([sys.executable, r4515, tree])
        message = (refused.stdout + refused.stderr).strip()
        unchanged = snapshot(tree) == before
        order['4515-while-4524-present'] = {'exit': refused.returncode, 'tree_unchanged': unchanged, 'message': message[-300:]}
        if refused.returncode == 0 or not unchanged or '209.92992-feat-adv-spirit-realms.js' not in message:
            failures.append('4.5.15 remover did not refuse because of this release')
        steps = [execute([sys.executable, HERE / 'remove-phase.py', tree]), execute([sys.executable, r4515, tree]),
                 execute([sys.executable, tree / 'build/recombine.py', '--verify'])]
        order['4524-then-4515'] = {'exits': [step.returncode for step in steps]}
        if any(step.returncode for step in steps):
            failures.append('4.5.24 then 4.5.15 removal failed')
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
    with tempfile.TemporaryDirectory(prefix='l5r-tr-qa-') as directory:
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
                old = b'const ADV_SPIRIT_REALMS_ENABLED = true;'
                assert data.count(old) == 1, 'kill-switch mutation anchor must be unique'
                (tree / JS).write_bytes(data.replace(old, b'const ADV_SPIRIT_REALMS_ENABLED = false;'))
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
                harness = REPO / 'Versions/PART I — Phase 4.5.23 Dark Paragon/qa/current-suite-runner.js'
            else:
                harness = HERE / 'spirit-realms-harness.js'
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
    print('TR4524_VARIANT_RESULT=' + json.dumps(report, ensure_ascii=True), flush=True)
    return bool(failures)


if __name__ == '__main__':
    sys.exit(main())
