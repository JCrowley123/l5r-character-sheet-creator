"""Phase 4.5.36 measurement: every place the sheet reads a Trait or Ring value, and the Void card's spend paths.
Prints one line per hit (fragment:line: text) grouped by pattern; writes the same to trait-consumers.txt."""
from pathlib import Path
import re, sys

Q = Path(__file__).resolve().parent
V = next(d for d in Q.parents if (d / 'BUILD-LEDGER.md').is_file())
P = V / 'Part F — Cross-Platform Delivery/PART F — Phase 0 Source Reorganization for Maintainability'
PATTERNS = [
    ('trait-getter', r'\bgetTraitValueByName\s*\('),
    ('ring-getter', r'\bgetRingValueByName\s*\('),
    ('trait-input', r"""['"`]trait_|\btrait_(?:reflexes|awareness|stamina|willpower|agility|intelligence|strength|perception)\b|TRAIT_ID_MAP"""),
    ('trait-loop', r'\.traits\.(?:map|forEach|some|every|filter|reduce)\b|\br\.traits\b'),
    ('ring-input', r"""['"`]ring_|\bring_(?:air|earth|fire|water|void)\b"""),
    ('wounds', r'\bcomputeWoundThresholds\s*\(|\bwoundThreshold|\bWOUND_LEVELS\b'),
    ('armor-tn', r'\bArmorTN\b|armorTN|f_armorTN|armor_tn|tnToBeHit|TN to be hit'),
    ('initiative', r'\binitiative\b|Initiative\s*\('),
    ('void-spend', r'\bspendVoid|voidSpent|void_spent|spentVoid|VoidPoint|voidPoints|\bundoVoid|refundVoid|restoreVoid'),
]
SKIP = re.compile(r'^\s*(?://|\*|/\*)')
roots = [P / 'src/sheet', P / 'src/layer', P / 'src/markup']
lines_out = []
for label, pattern in PATTERNS:
    rx = re.compile(pattern, re.I if label in ('initiative', 'armor-tn', 'void-spend') else 0)
    hits = []
    for root in roots:
        for f in sorted(root.iterdir()):
            if f.suffix not in ('.js', '.html'):
                continue
            for n, line in enumerate(f.read_bytes().decode('utf-8').splitlines(), 1):
                if rx.search(line) and not SKIP.match(line):
                    hits.append(f'{f.name}:{n}: {line.strip()[:220]}')
    lines_out.append(f'== {label} ({len(hits)} code hits; comment-only lines skipped)')
    lines_out.extend(hits)
text = '\n'.join(lines_out) + '\n'
(Q / 'trait-consumers.txt').write_bytes(text.encode('utf-8'))
sys.stdout.buffer.write(('\n'.join(l for l in lines_out if l.startswith('==')) + '\n').encode('utf-8'))
