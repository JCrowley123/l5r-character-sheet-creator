"""Adapt 8a.1 orchestration paths only; retain every check and exact count."""
from pathlib import Path

Q = Path(__file__).resolve().parent
V = Q.parents[2]
OLD = V / 'QA — Release 8a.1 2026-10-30/qa'

def write(name, text):
    (Q / name).write_bytes(text.encode('utf-8'))

text = (OLD / 'final-qa.py').read_text(encoding='utf-8')
text = text.replace("V = Q.parent.parent", "V = Q.parents[2]\nOLD = V / 'QA — Release 8a.1 2026-10-30/qa'")
text = text.replace("str(Q / 'flat-suite-runner.js')", "str(OLD / 'flat-suite-runner.js')")
# The audit must not rewrite production files. Recombination and all browser tests read a scratch copy.
text = text.replace("def main():", "def run_frozen():")
text = text.replace("if __name__ == '__main__':", "def main():\n    global P\n    live = P\n    before = hashlib.sha256((live / 'l5r-character-sheet.html').read_bytes()).hexdigest()\n    with tempfile.TemporaryDirectory(prefix='l5r-phase15-candidate-') as folder:\n        root = Path(folder).resolve()\n        assert root.parent == Path(tempfile.gettempdir()).resolve()\n        P = root / 'phase0'\n        shutil.copytree(live, P, ignore=shutil.ignore_patterns('__pycache__', 'dist'))\n        run_frozen()\n    assert hashlib.sha256((live / 'l5r-character-sheet.html').read_bytes()).hexdigest() == before\n\nif __name__ == '__main__':")
write('final-qa.py', text)
write('run-final-twice.py', (OLD / 'run-final-twice.py').read_text(encoding='utf-8'))
text = (OLD / 'discovery.py').read_text(encoding='utf-8')
text = text.replace("P = Q.parent.parent /", "OLD = Q.parents[2] / 'QA — Release 8a.1 2026-10-30/qa'\nP = Q.parents[2] /")
text = text.replace("str(Q / 'flat-suite-runner.js')", "str(OLD / 'flat-suite-runner.js')")
write('discovery.py', text)
text = (OLD / 'run-under-load.py').read_text(encoding='utf-8')
text = text.replace("V = Q.parent.parent", "V = Q.parents[2]\nOLD = V / 'QA — Release 8a.1 2026-10-30/qa'")
text = text.replace("CHANGED = [", "CHANGED = ['characters-harness.js', 'dependant-typing-harness.js', ")
text = text.replace("(Q / 'list.json')", "(OLD / 'list.json')")
text = text.replace("results = []", "PINNED = {'one-line-harness.js': 12, 'free-choice-harness.js': 9, 'overspend-warns-harness.js': 17, 'wizard-harness.js': 43, 'wizard2-harness.js': 32, 'wizard3-harness.js': 52, 'school-skill-rows-harness.js': 37, 'characters-harness.js': 70, 'dependant-typing-harness.js': 73}\nresults = []")
text = text.replace("len(got) == 2 and got[0] == got[1] > 0", "got == [PINNED[Path(leaf['file']).name]] * 2")
write('run-under-load.py', text)
print('Prepared four audit-local runners; historical harnesses and assertions untouched.')
