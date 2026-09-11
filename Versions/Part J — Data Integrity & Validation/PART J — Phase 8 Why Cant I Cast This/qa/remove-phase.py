#!/usr/bin/env python3
"""Surgically remove PART J PHASE 8 from a COPY of the Phase 0 source tree.

    python3 remove-phase.py <path-to-a-copy-of-phase-0>

This exists to PROVE the phase is removable, per CLAUDE.md's end-of-phase rule, so it
refuses to be clever: every line it is about to delete is checked first, and the script
fails loudly rather than succeeding by luck. Two assertions run over every doomed block:

  * it contains no OTHER phase's marker -- the failure Part G Phase 4 shipped, where one
    phase's CSS marker had silently taken ownership of four of Phase 3's rules. That
    assertion is not theoretical here: this phase's CSS block was FIRST written between
    Part J Phase 5's block and the trunk's Print banner, and Phase 5's own remover
    immediately refused to run ("line 1752 belongs to another phase"). The block was moved
    above Phase 5's instead, which is why this script's CSS terminator is Phase 5's marker.
  * every line either names something this phase introduced, or is pure punctuation.

Deliberately destructive, and it refuses to run against the live tree.
"""
import json
import os
import re
import sys

MARKER = 'PART J PHASE 8'
FRAGMENT = 'src/sheet/209.7-feat-casting-diagnostics.js'

OURS = re.compile(
    r'PART J PHASE 8|CASTING_DIAGNOSTIC|CASTING_SEVERITY|CASTING_BADGES|'
    r'castingFinding|castingSuppression|castingRule|castingDiagnosticsHTML|'
    r'registerCastingDiagnostic|unregisterCastingDiagnostic|getCastingDiagnostics|'
    r'makeCastingContext|diagnoseCastability|attachCastingDiagnosticButton|'
    r'refreshCastingDiagnosticButton|refreshAllCastingDiagnosticButtons|'
    r'openCastingDiagnostics|closeCastingDiagnostics|initCastingDiagnostics|'
    r'castWhyModalOverlay|castWhySubtitle|castWhyBody|castWhyX|'
    r'cast-why-btn|cwd-|209\.7-feat-casting-diagnostics'
)
# A line inside one of our blocks that names nothing of ours is only allowed if it is pure
# punctuation, prose continuation of one of our own comments, a bare CSS declaration, or the
# one piece of structural boilerplate every phase's seam block opens with -- that line is
# character-for-character identical in Phase 1's, 2's, 9's, 3's, 4's and 5's blocks too, so
# it carries no phase identity of its own and cannot be attributed by name.
BENIGN = re.compile(
    r'^[\s{}\[\]();,:*/\'"|-]*$'               # pure punctuation / block delimiters
    r'|^\s*//|^\s*/?\*'                         # a single-line or asterisk-led comment
    r'|^\s*([a-z-]+\s*:[^;{}]*;\s*)+\}?\s*$'    # one or more plain CSS declarations
    r'|^\s*Object\.assign\(window\.__L5R_TEST__, \{\s*$'  # seam boilerplate, see above
)

FOREIGN = re.compile(r'PART [A-Z] (PHASE|FEATURE)|BUGFIX')

# The sheet's standard modal scaffolding. This phase's overlay deliberately REUSES the trunk's
# own modal classes rather than inventing a parallel set -- one modal look across the sheet,
# not two -- which means these structural lines name nothing unique to this phase and neither
# OURS nor BENIGN can vouch for them. They are therefore listed VERBATIM rather than waved
# through by a loose tag pattern, so any markup line carrying real content still has to justify
# itself by name. Every one of these sits inside this phase's own marked block.
SCAFFOLD = {
    '<div class="roll-modal" style="max-width:420px;">',
    '<div class="roll-modal-head">',
    '<div>',
    '<h3>Casting check</h3>',
    '</div>',
}


def fail(msg):
    print('REFUSING: ' + msg)
    sys.exit(1)


def cut(path, starts, ends, label, inclusive, eat_blank_before=False):
    """Delete from the first line matching `starts` to the next matching `ends`.

    inclusive=True also deletes the matched end line; False stops just before it.
    eat_blank_before also takes the blank line immediately above the block, so removal does
    not leave a doubled blank line and break byte-identity with the pre-phase state.
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
    # single-line comment patterns in BENIGN, so track comment state explicitly rather than
    # loosening BENIGN into something that would wave through real markup or real CSS.
    in_comment = False
    for n, l in enumerate(doomed, start=start + 1):
        if FOREIGN.search(l) and MARKER not in l:
            fail('"%s" line %d belongs to another phase -- %r' % (label, n, l.strip()))
        if not (in_comment or OURS.search(l) or BENIGN.match(l) or l.strip() in SCAFFOLD):
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
    if 'PART J Phase 8' not in mlines[idx + 1]:
        fail('manifest entry does not look like this phase\'s: ' + mlines[idx + 1][:80])
    del mlines[idx:idx + 2]
    with open(mpath, 'w', encoding='utf-8') as fh:
        fh.writelines(mlines)
    json.load(open(mpath, encoding='utf-8'))
    print('  cut  2 lines  manifest.json                      (fragment entry)')

    # 3. the guarded button hook at the end of makeEntry()
    cut(os.path.join(root, 'src/sheet/090-table-rows-weapons.js'),
        lambda l: MARKER in l,
        lambda l: 'attachCastingDiagnosticButton(div, isSpellEntry);' in l,
        'makeEntry hook', inclusive=True)

    # 4. the guarded badge refresh at the end of recalcAll()
    cut(os.path.join(root, 'src/sheet/110-modals-trackers.js'),
        lambda l: MARKER in l,
        lambda l: 'refreshAllCastingDiagnosticButtons();' in l,
        'recalcAll hook', inclusive=True)

    # 5. the seam export block: marker, prose, the guard, the Object.assign, the closing brace
    cut(os.path.join(root, 'src/sheet/210-test-seam-and-init.js'),
        lambda l: MARKER in l and 'Casting Diagnostics' in l,
        lambda l: l.rstrip('\n') == '  }',
        'seam export', inclusive=True, eat_blank_before=True)

    # 6. the guarded init() call
    cut(os.path.join(root, 'src/sheet/210-test-seam-and-init.js'),
        lambda l: MARKER in l,
        lambda l: 'initCastingDiagnostics();' in l,
        'init hook', inclusive=True)

    # 7. the modal markup. Terminated by the TRUNK's next comment banner rather than by the
    #    overlay's own closing </div>, because the blank line this phase inserted after that
    #    </div> is also this phase's and must go with it -- otherwise removal leaves a doubled
    #    blank line and the rebuild is no longer byte-identical to the pre-phase build, which
    #    is the assertion the README quotes. Anything a future phase inserts into that gap
    #    would carry its own marker and be caught by the FOREIGN check above.
    cut(os.path.join(root, 'src/markup/20-fixed-layers.html'),
        lambda l: MARKER in l,
        lambda l: 'CHUDA SHUGENJA DEFICIENCY PICKER' in l,
        'markup host', inclusive=False)

    # 8. the CSS block. Terminated by PART J PHASE 5's marker, NOT by the trunk's Print
    #    banner -- see this file's docstring for why that distinction is load-bearing.
    cut(os.path.join(root, 'src/css/10-sheet-base.css'),
        lambda l: MARKER in l and '----' in l,
        lambda l: 'PART J PHASE 5: ValidationReport' in l,
        'CSS block', inclusive=False)

    print('\nremoval complete. Rebuild, then run the other phases\' harnesses.')


if __name__ == '__main__':
    main()
