"""Run release and retained suites sequentially, including actual scratch removal."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

here = Path(__file__).resolve().parent
versions = next(p for p in here.parents if (p / 'BUILD-LEDGER.md').is_file())
live = versions / 'Part F — Cross-Platform Delivery' / 'PART F — Phase 0 Source Reorganization for Maintainability'
node = shutil.which('node') or 'C:/Program Files/nodejs/node.exe'
retained = versions / 'PART I — Phase 4.5.26 Dice Rolling Entries/qa/current-suite-runner.js'
spec = importlib.util.spec_from_file_location('as47_remover', here / 'remove-phase.py')
remover = importlib.util.module_from_spec(spec)
spec.loader.exec_module(remover)


def measured(file):
    raw = file.read_bytes()
    return {'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}


def run(name, command):
    print('Starting ' + name, flush=True)
    log = here / (name + '.log')
    with log.open('w', encoding='utf-8', newline='') as output:
        process = subprocess.run(command, stdout=output, stderr=subprocess.STDOUT, env=os.environ, timeout=7200)
    text = log.read_text(encoding='utf-8')
    counts = re.findall(r'(\d+)/(\d+) checks passed', text)
    result = {'exit': process.returncode, 'log': log.name}
    if counts:
        result.update(passed=int(counts[-1][0]), total=int(counts[-1][1]))
    print(name + ': ' + json.dumps(result), flush=True)
    if process.returncode or (counts and result['passed'] != result['total']):
        raise RuntimeError(name + ' failed; inspect ' + str(log))
    return result


record = {'release': measured(live / 'l5r-character-sheet.html')}
if '--reuse-full' in sys.argv:
    inventory = json.loads((here / 'inventory-check.json').read_text(encoding='utf-8'))
    assert record['release']['sha256'] == inventory['release_sha256'], 'build changed since recorded full suite'
    prior = (here / 'full-suite.log').read_text(encoding='utf-8')
    assert 'COMBINED 4036/4036 checks passed across every retained suite plus Phase 4.7 Advanced Schools' in prior
    record['full'] = {'passed': 4036, 'total': 4036, 'log': 'full-suite.log', 'reused': True}
else:
    record['full'] = run('full-suite', [node, str(here / 'current-suite-runner.js'), str(live / 'l5r-character-sheet.html')])
with tempfile.TemporaryDirectory(prefix='l5r-as47-final-removal-') as temporary:
    scratch = Path(temporary) / 'phase0'
    shutil.copytree(live, scratch, ignore=shutil.ignore_patterns('l5r-character-sheet.html', '__pycache__'))
    remover.remove(scratch, expect_sha=remover.PRE_RELEASE_SHA)
    run('removed-recombine', [sys.executable, '-B', str(scratch / 'build/recombine.py'), '--verify'])
    record['removed'] = measured(scratch / 'l5r-character-sheet.html')
    assert record['removed'] == {'bytes': remover.PRE_RELEASE_BYTES, 'sha256': remover.PRE_RELEASE_SHA}
    record['retained'] = run('removed-retained-suite', [node, str(retained), str(scratch / 'l5r-character-sheet.html')])
    assert Path(temporary).resolve().parent == Path(tempfile.gettempdir()).resolve()
record['removal_tests'] = run('removal-tests', [sys.executable, '-B', str(here / 'test-removal.py')])
record['ownership'] = run('ownership', [sys.executable, '-B', str(live / 'qa/feature-dependencies.py'),
    str(live / 'src/sheet/209.999999-feat-advanced-schools.js'), 'PART I PHASE 4.7', '--also',
    'advancedSchoolPanel', 'advancedSchoolPicker', 'advancedSchoolElement', 'advancedSchoolConfirmations',
    'advancedSchoolEnter', 'advancedSchoolResume', 'advancedSchoolGmApproval', 'f_advancedSchoolData', 'as47-confirm', 'as47-reference'])
assert measured(live / 'l5r-character-sheet.html') == record['release'], 'live build changed during verification'
(here / 'final-verification.json').write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
print('Release and removal verification complete.', flush=True)
