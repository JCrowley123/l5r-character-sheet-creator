#!/usr/bin/env python3
"""Surgically remove PART I PHASE 4.5 from a COPY of the Phase 0 source tree.

    python3 remove-phase.py <path-to-a-copy-of-phase-0>

This exists to PROVE the phase is removable, per CLAUDE.md's end-of-phase rule, so it
refuses to be clever: every line it is about to delete is checked first, and the script
fails loudly rather than succeeding by luck. Two assertions run over every doomed block:

  * it contains no OTHER phase's marker -- the failure Part G Phase 4 shipped, where one
    phase's CSS marker had silently taken ownership of four of Phase 3's rules;
  * every line either names something this phase introduced, or is pure punctuation.

This phase is PURELY ADDITIVE to every shared file it touches -- it rewrote no existing
line anywhere, which `git diff` confirms by showing no deletions. That is what lets the
removal below be "delete these blocks" with nothing to restore afterwards, and it is why
the rebuilt output is expected to be byte-identical to the pre-phase build rather than
merely equivalent.

Deliberately destructive, and it refuses to run against the live tree.
"""
import json
import os
import re
import sys

MARKER = 'PART I PHASE 4.5'
FRAGMENT = 'src/sheet/209.8-feat-adv-config.js'

# The build hashes either side of this phase. Removal restores the first; the second is what the
# manifest asserts while the phase is present.
PRE_PHASE_SHA = '9dbaf6c626f2baba33df8547078bc158ef32926c8fc7ea1b0b1501f4c8b116e4'
POST_PHASE_SHA = '497c6bd7702da667a4aa90e6650183d7665a378fd28d4b8c151fdec1dbee3bb9'

OURS = re.compile(
    r'PART I PHASE 4\.5|ADV_CONFIG_ENABLED|ADV_DISADV_CONFIG_SCHEMA|'
    r'ADV_CONFIG_SCHEMA_BY_NORM_NAME|advConfigSchemaFor|advConfigOptionsFor|'
    r'advConfigTraitXpDiscount|advConfigRowFor|removeAdvConfigRow|refreshAdvConfigControl|'
    r'refreshAllAdvConfigControls|activeAdvConfigEffects|resolveAdvDisadvEffect|'
    r'normalizeAdvName|readAdvConfig|writeAdvConfig|advConfigTargetEntry|'
    r'openAdvConfigModal|closeAdvConfigModal|confirmAdvConfigModal|initAdvConfig|'
    r'attachAdvConfigToSave|advConfig|adv-config|advConfigModalOverlay|advConfigTitle|'
    r'ADV_CONFIG_ROLL_EFFECTS_ENABLED|advConfigRollModifiers|ADV_CONFIG_UNIVERSAL_SPELLS|'
    r'data\.config|\.config\b|'
    r'advConfigSubtitle|advConfigGrid|advConfigNote|advConfigConfirm|advConfigX|'
    r'209\.8-feat-adv-config|'
    # prose that appears inside this phase's own comment blocks and names nothing else
    r'Elemental Blessing|Lord Moon|Needs a choice|variable entry|pick-time|severity tier'
)
# A line inside one of our blocks that names nothing of ours is only allowed if it is pure
# punctuation, prose continuation of one of our own comments, a bare CSS declaration, or the
# one piece of structural boilerplate every phase's seam block opens with -- that line is
# character-for-character identical in every other phase's block too, so it carries no phase
# identity of its own and cannot be attributed by name.
BENIGN = re.compile(
    r'^[\s{}\[\]();,:*/\'"|-]*$'               # pure punctuation / block delimiters
    r'|^\s*//|^\s*/?\*'                         # a single-line or asterisk-led comment
    r'|^\s*<!--|^\s*-->'                        # an HTML comment delimiter
    r'|^\s*([a-z-]+\s*:[^;{}]*;\s*)+\}?\s*$'    # one or more plain CSS declarations
    r'|^\s*try\s*\{\s*$'                        # language structure, carries no phase identity
    r'|^\s*\}?\s*catch\s*\([^)]*\)\s*\{'        # ditto -- the catch arm of the same try
    r'|^\s*Object\.assign\(window\.__L5R_TEST__, \{\s*$'  # seam boilerplate, see above
    # Modal scaffolding. Every overlay on this sheet opens with the same four elements and the
    # same trunk-owned classes -- .roll-modal, .roll-modal-head, .notation, .ghost, .rm-btn,
    # .affinity-pick-grid. Those carry no phase identity (the trunk defines them and several
    # phases reuse them), so a line whose only attributes are one of them, a style, or nothing
    # at all cannot be attributed by name and is allowed here. A tag carrying ANOTHER phase's
    # class still fails, which is the property this is protecting.
    r'|^\s*</?(div|button|h3)\b'
    r'(?:\s+(?:class="(?:roll-modal|roll-modal-head|notation|ghost|rm-btn|affinity-pick-grid)"'
    r'|style="[^"]*"|type="button"))*\s*>\s*$'
)

FOREIGN = re.compile(r'PART [A-Z] (PHASE|FEATURE)|BUGFIX')


def fail(msg):
    print('REFUSING: ' + msg)
    sys.exit(1)


def cut(path, starts, ends, label, inclusive, eat_blank_before=False, eat_blank_after=False):
    """Delete from the first line matching `starts` to the next matching `ends`.

    inclusive=True also deletes the matched end line; False stops just before it.
    eat_blank_before / eat_blank_after also take the blank line immediately above / below
    the block. A phase that inserts "<its block><blank>" ahead of an existing block must
    remove both, or removal leaves a doubled blank line and the file is no longer
    byte-identical to its pre-phase state -- which is exactly what the markup block here did
    on the first run of this script.
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
    if eat_blank_after and stop < len(lines) and lines[stop].strip() == '':
        stop += 1
    doomed = lines[start:stop]
    # Continuation lines inside a multi-line comment are prose and match none of the
    # single-line comment patterns in BENIGN. Track the comment state explicitly rather than
    # loosening BENIGN into something that would wave through real markup or real CSS.
    # FOREIGN is still checked on every line, comment or not.
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


def cut_lines(path, pred, label, expected):
    """Delete every single line matching `pred`, asserting exactly `expected` of them.

    For hooks that are one line rather than a span. The count is asserted so a hook that
    silently stops matching (a reworded line, a second copy added later) fails here instead
    of leaving a live call behind pointing at a fragment that no longer exists.
    """
    with open(path, encoding='utf-8') as fh:
        lines = fh.readlines()
    hits = [i for i, l in enumerate(lines) if pred(l)]
    if len(hits) != expected:
        fail('"%s": expected %d line(s) in %s, found %d' % (label, expected, path, len(hits)))
    for i in hits:
        if FOREIGN.search(lines[i]) and MARKER not in lines[i]:
            fail('"%s" line %d belongs to another phase -- %r' % (label, i + 1, lines[i].strip()))
        if not OURS.search(lines[i]):
            fail('"%s" line %d names nothing this phase owns -- %r' % (label, i + 1, lines[i].strip()))
    for i in reversed(hits):
        del lines[i]
    with open(path, 'w', encoding='utf-8') as fh:
        fh.writelines(lines)
    print('  cut %2d lines  %-34s (%s)' % (len(hits), os.path.basename(path), label))


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

    # 2. its manifest entry (two consecutive lines: "file" then "note")
    mpath = os.path.join(root, 'build', 'manifest.json')
    with open(mpath, encoding='utf-8') as fh:
        mlines = fh.readlines()
    idx = next((i for i, l in enumerate(mlines) if FRAGMENT in l), None)
    if idx is None:
        fail('no manifest entry for ' + FRAGMENT)
    if 'PART I Phase 4.5' not in mlines[idx + 1]:
        fail('manifest entry does not look like this phase\'s: ' + mlines[idx + 1][:80])
    if not mlines[idx].lstrip().startswith('{ "file"'):
        fail('manifest entry is not the expected 2-line object shape')
    del mlines[idx:idx + 2]
    with open(mpath, 'w', encoding='utf-8') as fh:
        fh.writelines(mlines)
    json.load(open(mpath, encoding='utf-8'))
    print('  cut  2 lines  manifest.json                      (fragment entry)')

    # 2b. restore expect_sha256 to the PRE-PHASE build hash. Without this the removal leaves the
    #     manifest asserting this phase's own output hash, so `recombine.py --verify` would report
    #     the correctly-removed build as wrong -- and the tree would not actually be back in its
    #     pre-phase state, which is the property the removal claims.
    with open(mpath, encoding='utf-8') as fh:
        text = fh.read()
    if POST_PHASE_SHA not in text:
        fail('manifest expect_sha256 is not this phase\'s -- has another phase been built since?')
    with open(mpath, 'w', encoding='utf-8') as fh:
        fh.write(text.replace(POST_PHASE_SHA, PRE_PHASE_SHA))
    print('  restored      manifest.json                      (expect_sha256 -> pre-phase)')

    # 3. the pick-time modal open, inside buildAdvDisadvQuickAdd's change handler
    cut(os.path.join(root, 'src/sheet/040-lib-kata-kiho-spells.js'),
        lambda l: MARKER in l,
        lambda l: 'openAdvConfigModal(document.getElementById(listId).lastElementChild);' in l,
        'quick-add pick-time hook', inclusive=True)

    # 4. the dataset carry in makeEntry()
    cut(os.path.join(root, 'src/sheet/090-table-rows-weapons.js'),
        lambda l: MARKER in l,
        lambda l: l.strip() == '}',
        'makeEntry dataset carry', inclusive=True)

    # 5. the Trait XP discount inside recalcAll()'s RINGS loop
    cut(os.path.join(root, 'src/sheet/110-modals-trackers.js'),
        lambda l: MARKER in l and 'Elemental Blessing' in l,
        lambda l: l.strip() == '}',
        'Trait XP discount', inclusive=True)

    # 6. the control-repaint hook at the end of recalcAll()
    cut(os.path.join(root, 'src/sheet/110-modals-trackers.js'),
        lambda l: MARKER in l,
        lambda l: 'refreshAllAdvConfigControls();' in l,
        'recalcAll repaint hook', inclusive=True)

    # 7. the save-side config attachment (helper + the two call lines)
    cut(os.path.join(root, 'src/sheet/120-persistence.js'),
        lambda l: MARKER in l,
        lambda l: l.rstrip('\n') == '    };',
        'collectData helper', inclusive=True)
    # The two call lines are single lines each, so they are cut individually rather than as a
    # span -- a span whose start and end predicate are both "has our marker" would find the
    # SECOND call as the first one's end and swallow the trunk's own disadvList loop between
    # them. That is not hypothetical: it is what the first version of this script did, and the
    # FOREIGN/OURS assertion is what stopped it.
    cut_lines(os.path.join(root, 'src/sheet/120-persistence.js'),
              lambda l: MARKER in l and 'attachAdvConfigToSave(' in l,
              'collectData calls', expected=2)

    # 8. the seam export block
    cut(os.path.join(root, 'src/sheet/210-test-seam-and-init.js'),
        lambda l: MARKER in l and 'Modal-Configured' in l,
        lambda l: l.rstrip('\n') == '  }',
        'seam export', inclusive=True, eat_blank_before=True)

    # 9. the init() wiring call
    cut(os.path.join(root, 'src/sheet/210-test-seam-and-init.js'),
        lambda l: MARKER in l,
        lambda l: 'initAdvConfig();' in l,
        'init hook', inclusive=True)

    # 10. the modal host markup
    cut(os.path.join(root, 'src/markup/20-fixed-layers.html'),
        lambda l: MARKER in l,
        lambda l: l.rstrip('\n') == '  </div>',
        'markup host', inclusive=True, eat_blank_after=True)

    # 11. the CSS block. Terminated by Part J Phase 8's own marker, which hands ownership
    #     of everything below back to that phase -- never by EOF, and never by the trunk's
    #     Print banner, which belongs to Part J Phase 5's span.
    cut(os.path.join(root, 'src/css/10-sheet-base.css'),
        lambda l: MARKER in l and '----' in l,
        lambda l: 'PART J PHASE 8' in l and '----' in l,
        'CSS block', inclusive=False)

    print('\nremoval complete. Rebuild, then run the other phases\' harnesses.')


if __name__ == '__main__':
    main()
