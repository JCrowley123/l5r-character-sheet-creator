"""Release 7c.1: Empty Quiver Rolls On's own pinned variants, run on the 7c.1 candidate with only
EMPTY_QUIVER_CANCEL_ENABLED off. QC7 replaces EQ7's roll-without button and message, so three of EQ7's variants
(pass-ignored, no-pass, message-kept) mutate code QC7 leaves unreachable; with QC7 off they must match their pins
exactly as on 7c. Output in eq7-negative-qc-off/ (EQ7's own negative/ records stay as 7c left them).
Usage: python -B eq7-variants-qc-off.py"""
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
TARGET = HERE.parent.parent / 'BUGFIX — Empty Quiver Rolls On' / 'qa' / 'verify-variants.py'
src = TARGET.read_bytes().decode('utf-8')
read = "original = (P / 'l5r-character-sheet.html').read_bytes().decode('utf-8')\n"
assert src.count(read) == 1 and src.count("out = Q / 'negative'") == 1
switch = "const EMPTY_QUIVER_CANCEL_ENABLED = true;"
src = src.replace(read, read + "assert original.count(%r) == 1\noriginal = original.replace(%r, %r)\n" % (switch, switch, switch.replace('true', 'false')))
src = src.replace("out = Q / 'negative'", "out = Path(%r) / 'eq7-negative-qc-off'" % str(HERE))
sys.argv = [str(TARGET)]
exec(compile(src, str(TARGET), 'exec'), {'__file__': str(TARGET), '__name__': '__main__'})
