#!/usr/bin/env python3
"""Surgically remove PART J PHASE 5 from a COPY of the Phase 0 source tree.

    python3 remove-phase.py <path-to-a-copy-of-phase-0>

This exists to PROVE the phase is removable, per CLAUDE.md's end-of-phase rule, so it
refuses to be clever: every line it is about to delete is checked first, and the script
fails loudly rather than succeeding by luck. Two assertions run over every doomed block:

  * it contains no OTHER phase's marker -- the failure Part G Phase 4 shipped, where one
    phase's CSS marker had silently taken ownership of four of Phase 3's rules;
  * every line either names something this phase introduced, or is pure punctuation.

Deliberately destructive, and it refuses to run against the live tree.
"""
import json
import os
import re
import sys

MARKER = 'PART J PHASE 5'
FRAGMENT = 'src/sheet/209.5-feat-character-validator.js'

OURS = re.compile(
    r'PART J PHASE 5|validationReport|validateCharacter|renderValidationReport|'
    r'CHARACTER_VALIDATOR|ruleCasterLockConflict|ruleBushiSpellViolation|'
    r'ruleMissingSchoolSkills|ruleSchoolChoiceSlots|ruleXpOverspend|ruleXpUnspent|'
    r'ruleTraitRange|ruleTraitBelowFreeFloor|ruleSchoolRankOverInsight|'
    r'validatorConcreteSkills|validatorChoiceSlots|validatorSchoolEntries|'
    r'vr-panel|vr-badge|vr-row|vr-head|vr-text|vr-detail|vr-clean|vr-error|vr-warning|vr-info|'
    r'209\.5-feat-character-validator'
)
# A line inside one of our blocks that names nothing of ours is only allowed if it is pure
# punctuation, prose continuation of one of our own comments, a bare CSS declaration, or the
# one piece of structural boilerplate every phase's seam block opens with -- that line is
# character-for-character identical in Phase 1's, 2's, 9's, 3's and 4's blocks too, so it
# carries no phase identity of its own and cannot be attributed by name.
BENIGN = re.compile(
    r'^[\s{}\[\]();,:*/\'"|-]*$'              # pure punctuation / block delimiters
    r'|^\s*//|^\s*/?\*'                        # a single-line or asterisk-led comment
    r'|^\s*([a-z-]+\s*:[^;{}]*;\s*)+\}?\s*$'   # one or more plain CSS declarations
    r'|^\s*Object\.assign\(window\.__L5R_TEST__, \{\s*$'  # seam boilerplate, see above
)

FOREIGN = re.compile(r'PART [A-Z] (PHASE|FEATURE)|BUGFIX')


def fail(msg):
    print('REFUSING: ' + msg)
    sys.exit(1)


def cut(path, starts, ends, label, inclusive, eat_blank_before=False):
    """Delete from the first line matching `starts` to the next matching `ends`.

    inclusive=True also deletes the matched end line; False stops just before it.
    eat_blank_before also takes the blank line immediately above the block. A phase that
    inserts "<blank><its block>" after an existing block must remove both, or removal leaves
    a doubled blank line and the file is no longer byte-identical to its pre-phase state --
    which is exactly what the first run of this script produced.
    """
    with open(path, encoding='utf-8') as fh:
        lines = fh.readlines()
    start = next((i for i, l in enumerate(lines) if starts(l)), None)
    if start is None:
        fail('could not find the start of "%s" in %s' % (label, path))
    if eat_blank_before and start > 0 and lines[start - 1].strip() == '':
        start -= 1
    end = next((i for i in range(start + 1, len(lines)) if ends(lines[i])), None)
    if end is None:
        fail('could not find the end of "%s" in %s' % (label, path))
    stop = end + 1 if inclusive else end
    doomed = lines[start:stop]
    # Continuation lines inside a multi-line comment are prose and match none of the
    # single-line comment patterns in BENIGN. Track the comment state explicitly rather than
    # loosening BENIGN into something that would wave through real markup or real CSS.
    # FOREIGN is still checked on every line, comment or not: another phase's marker inside a
    # block we are about to delete is a hard stop wherever it appears.
    in_comment = False
    for n, l in enumerate(doomed, start=start + 1):
        if FOREIGN.search(l) and MARKER not in l:
            fail('"%s" line %d belongs to another phase -- %r' % (label, n, l.strip()))
        if not (in_comment or OURS.search(l) or BENIGN.match(l)):
            fail('"%s" line %d names nothing this phase owns -- %r' % (label, n, l.strip()))
        opened = l.rfind('<!--') if '<!--' in l else l.rfind('/*')
        closed = l.rfind('-->') if '-->' in l else l.rfind('*/')
        if opened != -1 and opened > closed:
            in_comment = True
        elif closed != -1 and closed > opened:
            in_comment = False
    del lines[start:stop]
    with open(path, 'w', encoding='utf-8') as fh:
        fh.writelines(lines)
    print('  cut %2d lines  %-34s (%s)' % (len(doomed), os.path.basename(path), label))


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    root = os.path.abspath(sys.argv[1])
    if 'PART F — Phase 0 Source Reorganization' in root:
        fail('that is the LIVE tree. Run this against a copy.')
    if not os.path.isfile(os.path.join(root, 'build', 'manifest.json')):
        fail('no build/manifest.json under ' + root)

    # 1. the fragment
    frag = os.path.join(root, FRAGMENT)
    if not os.path.isfile(frag):
        fail('fragment already gone: ' + frag)
    os.remove(frag)
    print('  removed       ' + FRAGMENT)

    # 2. its manifest entry (two consecutive lines)
    mpath = os.path.join(root, 'build', 'manifest.json')
    with open(mpath, encoding='utf-8') as fh:
        mlines = fh.readlines()
    idx = next((i for i, l in enumerate(mlines) if FRAGMENT in l), None)
    if idx is None:
        fail('no manifest entry for ' + FRAGMENT)
    if 'PART J Phase 5' not in mlines[idx + 1]:
        fail('manifest entry does not look like this phase\'s: ' + mlines[idx + 1][:80])
    del mlines[idx:idx + 2]
    with open(mpath, 'w', encoding='utf-8') as fh:
        fh.writelines(mlines)
    json.load(open(mpath, encoding='utf-8'))
    print('  cut  2 lines  manifest.json                      (fragment entry)')

    # 3. the guarded call at the end of recalcAll(): marker comment + the guard line
    cut(os.path.join(root, 'src/sheet/110-modals-trackers.js'),
        lambda l: MARKER in l,
        lambda l: 'renderValidationReport();' in l,
        'recalcAll hook', inclusive=True)

    # 4. the seam export block: marker, prose, the guard, the Object.assign, the closing brace
    cut(os.path.join(root, 'src/sheet/210-test-seam-and-init.js'),
        lambda l: MARKER in l,
        lambda l: l.rstrip('\n') == '  }',
        'seam export', inclusive=True, eat_blank_before=True)

    # 5. the markup: the explanatory comment and the host element
    cut(os.path.join(root, 'src/markup/10-swipe-tab-shell.html'),
        lambda l: MARKER in l,
        lambda l: 'id="validationReport"' in l,
        'markup host', inclusive=True)

    # 6. the CSS block. Terminated by the TRUNK's own Print banner, never by EOF -- deleting
    #    "to the end of the file" would take that banner with it.
    cut(os.path.join(root, 'src/css/10-sheet-base.css'),
        lambda l: MARKER in l and '----' in l,
        lambda l: 'Print / PDF export' in l,
        'CSS block', inclusive=False)

    print('\nremoval complete. Rebuild, then run the other phases\' harnesses.')


if __name__ == '__main__':
    main()
