"""Release 8a.1 (Release 8a's script, its logs kept apart in xw8-off-8a1/): the creation wizard's own pinned variants, Phase 11.2's and 11.2.1's (Part K), run on the 8a candidate with
only WIZARD_OVERSPEND_WARNS_ENABLED off. XW8 takes the overspend out of every step's check, so three of their variants
("no validator gate on Traits", "Finish not gated by errors", "no overspend gate on Skills") mutate a gate XW8 leaves
with nothing to catch; with XW8 off every variant must match its pin exactly as on 7c.1. Each scratch tree is the
variant script's own copy, with this one switch turned off before its rebuild. Logs in xw8-off/.
Usage: python -B xw8-variants-off.py"""
from pathlib import Path
import contextlib, io, sys

HERE = Path(__file__).resolve().parent
V = HERE.parent.parent
FRAGMENT = 'src/sheet/209.999999999999996-bugfix-wizard-overspend-warns.js'
SWITCH = 'const WIZARD_OVERSPEND_WARNS_ENABLED = true;'
OUT = HERE / 'xw8-off-8a1'
OUT.mkdir(exist_ok=True)
codes = {}
for phase in ('PART K — Phase 11.2 Creation Wizard', 'PART K — Phase 11.2.1 Wizard Skills and Advantages'):
    target = V / phase / 'qa' / 'verify-variants.py'
    src = target.read_bytes().decode('utf-8')
    copy = '    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns("l5r-character-sheet.html"))\n'
    assert src.count(copy) == 1, phase
    off = ('    _xw8 = tree / %r\n'
           '    _text = _xw8.read_bytes().decode("utf-8")\n'
           '    assert _text.count(%r) == 1\n'
           '    _xw8.write_bytes(_text.replace(%r, %r).encode("utf-8"))\n') % (FRAGMENT, SWITCH, SWITCH, SWITCH.replace('true', 'false'))
    src = src.replace(copy, copy + off)
    sys.argv = [str(target)]
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer):
        try:
            exec(compile(src.replace('if __name__ == "__main__":', 'if False:'), str(target), 'exec'),
                 scope := {'__file__': str(target), '__name__': 'variants'})
            code = scope['main']()
        except SystemExit as e:
            code = e.code
    text = buffer.getvalue()
    (OUT / (phase.split(' — ')[1].split(' ')[1] + '.log')).write_bytes(text.encode('utf-8'))
    print(phase + ': exit ' + str(code) + '\n' + text, flush=True)
    codes[phase] = code
sys.exit(0 if all(c == 0 for c in codes.values()) else 1)
