"""Release 8a.1: the Wizard Overspend Warns layer's own 9 pinned variants (and its baseline, main at 7c.1), run on the 8a.1
candidate with only OVERSPEND_ONE_LINE_ENABLED off. XW8's harness expects XW8's own behaviour whenever OL8 is off, so
every variant must fail exactly its pinned checks, as in Release 8a. XW8's verify-variants.py is run as it is, with two
changes made in memory: the page it mutates has this one switch off, and its logs go to xw8-negative-ol8-off/ here.
Usage: python -B xw8-variants-ol8-off.py"""
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
TARGET = HERE.parent.parent / 'BUGFIX — Wizard Overspend Warns' / 'qa' / 'verify-variants.py'
SWITCH = 'const OVERSPEND_ONE_LINE_ENABLED = true;'
src = TARGET.read_bytes().decode('utf-8')
read = "original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')\n"
out = "out = Q / 'negative'\n"
assert src.count(read) == 1 and src.count(out) == 1
src = src.replace(read, read + 'assert original.count(%r) == 1\noriginal = original.replace(%r, %r)\n' % (SWITCH, SWITCH, SWITCH.replace('true', 'false')))
src = src.replace(out, 'out = Path(%r)\n' % str(HERE / 'xw8-negative-ol8-off'))
sys.argv = [str(TARGET)] + sys.argv[1:]
exec(compile(src, str(TARGET), 'exec'), {'__file__': str(TARGET), '__name__': '__main__'})
