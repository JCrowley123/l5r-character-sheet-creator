"""One-use scoped proof of A08's corrected wait (18 November 2026, Claude), after the first G5 chain stopped at the 4x CPU
screen (A08-UNDER-LOAD-INVESTIGATION.md). The corrected harness runs once on every input its result depends on:
  candidate        the frozen page, normal speed, both required preloads (21/21)
  candidate-cpu4   the frozen page at 4x CPU, the screen's three preloads, as run-under-load.py runs a leaf (21/21)
  AE3-removed      AE3 removed by its own remover with A08 kept, as the removal proof ran A08's harness (21/21)
  A08:<case>       the baseline and the five mutations of verify-variants.py, each failing exactly its pin in variants.json
Never re-runs or rewrites the failed chain. Nothing is retried; a failed case is kept. Writes a08-wait-validation/."""
from pathlib import Path
import ast, ctypes, datetime, hashlib, json, os, re, shutil, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding='utf-8')
Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file() and (d / 'CLAUDE.md').is_file())
F = V / 'Part F — Cross-Platform Delivery'
P = F / 'PART F — Phase 0 Source Reorganization for Maintainability'
R = Q.parent.parent
A = R / 'A08 — One Undo for Quick Taps/qa'
HARNESS = A / 'quick-tap-undo-harness.js'
NODE = r'C:\Program Files\nodejs\node.exe'
NB = V / 'PART K — Phase 14.2 Kata and Kiho References/qa/navigation-budget.cjs'
SF = F / 'PART F — Phase 0.6.2 Splash Screen/qa/splash-fast.cjs'
CT = V / 'QA — Cycle 7a Device Follow-up 2026-10-27/qa/cpu-throttle.cjs'
OUT = Q / 'a08-wait-validation'
sha = lambda b: hashlib.sha256(b).hexdigest()
FROZEN = (Q / 'qualified-sha256.txt').read_text().strip()
change = json.loads((Q / 'a08-wait-change.json').read_bytes())
assert sha((P / 'l5r-character-sheet.html').read_bytes()) == FROZEN == change['app_sha256']
assert sha(HARNESS.read_bytes()) == change['new_harness_sha256']
assert sha((A / 'expected-checks.json').read_bytes()) == change['expected_checks_sha256']
assert sha((A / 'dense-kuni.l5r.json').read_bytes()) == change['character_sha256']
CHECKS = json.loads((A / 'expected-checks.json').read_bytes())['checks']
assert len(CHECKS) == 21 and len(set(CHECKS)) == 21
# The failed chain, exactly as kept.
chain = json.loads((Q / 'qualification-6d47849b.json').read_bytes())
assert chain['passed'] is False and [(s['label'], s['exit']) for s in chain['stages']] == [
    ('removal-final', 0), ('variants-final', 0), ('dependencies', 0), ('under-load-final', 1)]
assert not (Q / 'full-launched.txt').exists()
# The baseline and the five mutations, read from verify-variants.py itself so they cannot drift.
vv = (Q / 'verify-variants.py').read_text(encoding='utf-8')
tree = ast.parse(vv)
cases = next(ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign) and getattr(n.targets[0], 'id', '') == 'cases')
BASELINE_REF = next(ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign) and getattr(n.targets[0], 'id', '') == 'BASELINE_REF')
BASELINE_SHA = next(ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign) and getattr(n.targets[0], 'id', '') == 'BASELINE_SHA')
PINNED = json.loads((Q / 'variants.json').read_bytes())
assert len(cases) == 5 and set(PINNED) == {'A08:baseline'} | {u + ':' + l for u, l, _, _ in cases}
power = (ctypes.c_byte * 12)()
assert ctypes.windll.kernel32.GetSystemPowerStatus(ctypes.byref(power)) and power[0] == 1, 'Mains power required'
OUT.mkdir(exist_ok=False)
env = dict(os.environ, NODE_PATH='C:/Users/jcrow/l5r-qa-tools/node_modules', PLAYWRIGHT_BROWSERS_PATH='C:/Users/jcrow/l5r-qa-tools/ms-playwright',
           PYTHONUTF8='1')
env.pop('NODE_OPTIONS', None)
report = {'started_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'app_sha256': FROZEN, 'change': change, 'cases': []}
save = lambda: (OUT / 'summary.json').write_bytes((json.dumps(report, indent=2) + '\n').encode())


def run(label, page_bytes, pin=None, cpu=None, real=None):
    # real: the frozen page where it is, as the 4x CPU screen and the full suite run it; otherwise a scratch copy.
    with tempfile.TemporaryDirectory(prefix='l5r-g5-a08wait-') as folder:
        page = real or Path(folder) / 'index.html'
        if real is None: page.write_bytes(page_bytes)
        pre = [NB, SF] + ([CT] if cpu else [])
        e = dict(env, **({'L5R_CPU_RATE': cpu} if cpu else {}))
        r = subprocess.run([NODE] + sum([['--require', str(p)] for p in pre], []) + [str(HARNESS), str(page)], cwd=str(A), env=e,
                           capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=2400)
    text = r.stdout + r.stderr
    (OUT / (label.replace(':', '-') + '.log')).write_bytes(text.encode('utf-8'))
    failed = sorted(re.findall(r'^FAIL (\S+)', text, re.M))
    passed = sorted(re.findall(r'^PASS (\S+)', text, re.M))
    counts = re.findall(r'(\d+)/(\d+) checks passed', text)
    got = list(map(int, counts[-1])) if counts else []
    if pin is None:
        ok = r.returncode == 0 and got == [21, 21] and failed == [] and passed == sorted(CHECKS)
    else:
        ok = r.returncode == 1 and failed == sorted(pin) and len(got) == 2 and got[1] == 21 and got[1] - got[0] == len(failed)
    case = {'label': label, 'page_sha256': sha(page_bytes), 'page_bytes': len(page_bytes), 'cpu_rate': cpu, 'exit': r.returncode,
            'counts': got, 'failed': failed, 'expected_failures': pin, 'passed': ok,
            'log_sha256': sha((OUT / (label.replace(':', '-') + '.log')).read_bytes())}
    report['cases'].append(case)
    save()
    print(('PASS ' if ok else 'FAIL ') + label + ' ' + str(got) + ('' if ok else ' ' + json.dumps(failed)), flush=True)


assert ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
try:
    save()
    candidate = (P / 'l5r-character-sheet.html').read_bytes()
    run('candidate', candidate, real=P / 'l5r-character-sheet.html')
    run('candidate-cpu4', candidate, cpu='4', real=P / 'l5r-character-sheet.html')
    assert sha((P / 'l5r-character-sheet.html').read_bytes()) == FROZEN
    with tempfile.TemporaryDirectory(prefix='l5r-g5-a08wait-') as work:
        t = Path(work) / 'phase0'
        shutil.copytree(P, t, ignore=shutil.ignore_patterns('__pycache__', 'dist'))
        r = subprocess.run([sys.executable, '-B', str(R / 'AE3 — No XP Box or Remove on Automatic Entries/qa/remove-phase.py'), str(t)],
                           capture_output=True, text=True, encoding='utf-8')
        assert r.returncode == 0, r.stderr
        b = subprocess.run([sys.executable, str(t / 'build/recombine.py'), '--verify'], capture_output=True, text=True, encoding='utf-8')
        assert b.returncode == 0 and 'BYTE-IDENTICAL' in b.stdout, b.stdout[-300:]
        ae3_removed = (t / 'l5r-character-sheet.html').read_bytes()
    text = ae3_removed.decode('utf-8')
    assert 'PART H PHASE 15.1.31' in text and not re.search(r'PART H PHASE 15\.1\.30(?![\d.]*\d)', text)
    run('AE3-removed', ae3_removed)
    baseline = subprocess.check_output(['git', 'show', BASELINE_REF + ':' + P.relative_to(V.parent).as_posix() + '/l5r-character-sheet.html'], cwd=V.parent)
    assert sha(baseline) == BASELINE_SHA
    run('A08:baseline', baseline, PINNED['A08:baseline'])
    original = candidate.decode('utf-8')
    for unit, label, old, new in cases:
        assert original.count(old) == 1
        run(unit + ':' + label, original.replace(old, new).encode('utf-8'), PINNED[unit + ':' + label])
    report['passed'] = all(c['passed'] for c in report['cases']) and len(report['cases']) == 9
finally:
    report['finished_utc'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    report.setdefault('passed', False)
    save()
    ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
print('SCOPED PROOF ' + ('PASSED' if report['passed'] else 'FAILED') + ': ' + str(sum(c['passed'] for c in report['cases'])) + '/' + str(len(report['cases'])))
sys.exit(0 if report['passed'] else 1)
