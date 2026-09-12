#!/usr/bin/env python3
"""Surgically remove the complete PART I PHASE 4.5 from a COPY of Phase 0.

    python3 remove-phase.py <path-to-a-copy-of-phase-0>

This is deliberately destructive and refuses to run against the live Phase 0 tree.
It removes only Phase 4.5 fragments, marker-owned additions, and three narrowly
specified substitutions that restore the original weapon lookup line. Every target is
unique and asserted before it is changed; a changed shape is a refusal, not a guess.
"""

from __future__ import print_function

import io
import os
import re
import sys


MARKER = "PART I PHASE 4.5"
PRE_PHASE_SHA = "9dbaf6c626f2baba33df8547078bc158ef32926c8fc7ea1b0b1501f4c8b116e4"
FRAGMENTS = [
    "src/sheet/209.8-feat-adv-config.js",
    "src/sheet/209.81-feat-adv-config-extended.js",
    "src/sheet/209.82-feat-adv-config-kharmic-tie.js",
    "src/sheet/209.83-feat-adv-config-resources.js",
    "src/sheet/209.84-feat-adv-config-sacred-weapon.js",
]


def fail(message):
    print("REFUSING: " + message)
    sys.exit(1)


def read_lines(path):
    with io.open(path, "r", encoding="utf-8", newline="") as handle:
        return handle.readlines()


def write_lines(path, lines):
    # newline='' preserves the copy's original LF/CRLF convention for every untouched line.
    with io.open(path, "w", encoding="utf-8", newline="") as handle:
        handle.writelines(lines)


def strip_final_eol(path, label):
    """Restore a known no-final-newline trunk file after its Phase 4.5 block is cut."""
    lines = read_lines(path)
    if not lines:
        fail('%s: file is unexpectedly empty' % label)
    if lines[-1].endswith("\r\n"):
        lines[-1] = lines[-1][:-2]
    elif lines[-1].endswith("\n"):
        lines[-1] = lines[-1][:-1]
    else:
        fail('%s: expected one final newline to restore' % label)
    write_lines(path, lines)
    print('  restored      %-36s (no final newline)' % (os.path.basename(path)))


def one_index(lines, predicate, label, path):
    hits = [index for index, line in enumerate(lines) if predicate(line)]
    if len(hits) != 1:
        fail('%s: expected one target in %s, found %d' % (label, path, len(hits)))
    return hits[0]


def eol_of(line):
    return "\r\n" if line.endswith("\r\n") else "\n"


def assert_phase_block(lines, start, stop, label):
    """Make an added block prove it is actually Phase 4.5-owned before deleting it."""
    doomed = lines[start:stop]
    if not any(MARKER in line for line in doomed):
        fail('%s: target block has no %s marker' % (label, MARKER))
    foreign = re.compile(r"PART\s+[A-Z]\s+(?:PHASE|FEATURE)\s+[\d.]+", re.I)
    for number, line in enumerate(doomed, start + 1):
        match = foreign.search(line)
        if match and MARKER not in line:
            fail('%s: line %d names another phase: %r' % (label, number, line.strip()))


def cut(path, starts, ends, label, inclusive=True, blank_before=False, blank_after=False):
    """Delete one asserted, marker-owned line span from a shared source file."""
    lines = read_lines(path)
    start = one_index(lines, starts, label + " start", path)
    if blank_before and start and not lines[start - 1].strip():
        start -= 1
    end = next((i for i in range(start + 1, len(lines)) if ends(lines[i])), None)
    if end is None:
        fail('%s: no end target in %s' % (label, path))
    stop = end + 1 if inclusive else end
    if blank_after and stop < len(lines) and not lines[stop].strip():
        stop += 1
    assert_phase_block(lines, start, stop, label)
    del lines[start:stop]
    write_lines(path, lines)
    print('  cut %3d lines  %-36s (%s)' % (stop - start, os.path.basename(path), label))


def cut_single_lines(path, predicate, label, expected):
    lines = read_lines(path)
    hits = [index for index, line in enumerate(lines) if predicate(line)]
    if len(hits) != expected:
        fail('%s: expected %d target lines in %s, found %d' % (label, expected, path, len(hits)))
    for index in reversed(hits):
        if MARKER not in lines[index]:
            fail('%s: unmarked line %d' % (label, index + 1))
        del lines[index]
    write_lines(path, lines)
    print('  cut %3d lines  %-36s (%s)' % (len(hits), os.path.basename(path), label))


def restore_weapon_lookup(path, marker_phrase, replacement, label):
    """Restore one exact `const entry = findWeapon(...)` line after deleting its wrapper."""
    lines = read_lines(path)
    marker = one_index(lines, lambda line: marker_phrase in line, label + " marker", path)
    start = marker - 1
    if start < 0 or "const baseEntry = keyEl ? findWeapon(keyEl.value) : null;" not in lines[start]:
        fail('%s: expected baseEntry directly above its marker' % label)
    end = next((i for i in range(marker, len(lines)) if ": baseEntry;" in lines[i]), None)
    if end is None:
        fail('%s: no decorated entry terminator' % label)
    assert_phase_block(lines, marker, end + 1, label)
    lines[start:end + 1] = [replacement + eol_of(lines[start])]
    write_lines(path, lines)
    print('  restore      %-36s (%s)' % (os.path.basename(path), label))


def remove_manifest_entries(root):
    path = os.path.join(root, "build", "manifest.json")
    lines = read_lines(path)
    for fragment in FRAGMENTS:
        start = one_index(lines, lambda line, f=fragment: '"file": "' + f + '"' in line,
                          "manifest entry " + fragment, path)
        end = next((i for i in range(start, len(lines)) if lines[i].strip().endswith("},")), None)
        if end is None or end - start > 3:
            fail('manifest entry for %s is not the expected short object' % fragment)
        del lines[start:end + 1]
        print('  cut %3d lines  manifest.json                        (%s)' % (end - start + 1, os.path.basename(fragment)))
    hash_index = one_index(lines, lambda line: '"expect_sha256"' in line, "manifest expected hash", path)
    match = re.search(r'"([0-9a-f]{64})"', lines[hash_index])
    if not match:
        fail('manifest expected hash is not a SHA-256')
    if match.group(1) == PRE_PHASE_SHA:
        fail('manifest already claims the pre-phase build')
    lines[hash_index] = lines[hash_index].replace(match.group(1), PRE_PHASE_SHA)
    trunk_index = one_index(lines,
                             lambda line: '"file": "src/sheet/210-test-seam-and-init.js"' in line,
                             "manifest trunk seam entry", path)
    if not lines[trunk_index].startswith("   {"):
        fail('manifest trunk seam entry no longer has Phase-4.5 indentation')
    lines[trunk_index] = "    " + lines[trunk_index].lstrip()
    write_lines(path, lines)
    print('  restored      manifest.json                        (pre-Phase-4.5 hash)')


def remove_fragments(root):
    for fragment in FRAGMENTS:
        path = os.path.join(root, fragment)
        if not os.path.isfile(path):
            fail('fragment missing before removal: ' + fragment)
        os.remove(path)
        print('  removed       ' + fragment)


def remove_adv_config_modal_host(path):
    """Remove the one nested modal host without mistaking an inner closing div for its end."""
    lines = read_lines(path)
    start = one_index(lines, lambda line: MARKER in line and "Host only" in line,
                      "configuration modal host", path)
    overlay = one_index(lines,
                        lambda line: 'id="advConfigModalOverlay"' in line,
                        "configuration modal overlay", path)
    if overlay <= start:
        fail('configuration modal overlay does not follow its Phase-4.5 host marker')
    depth = 0
    end = None
    for index in range(overlay, len(lines)):
        depth += len(re.findall(r"<div\b", lines[index], re.I))
        depth -= len(re.findall(r"</div\s*>", lines[index], re.I))
        if depth == 0:
            end = index
            break
        if depth < 0:
            fail('configuration modal host div nesting underflowed')
    if end is None:
        fail('configuration modal host has no matching closing div')
    stop = end + 1
    if stop < len(lines) and not lines[stop].strip():
        stop += 1
    assert_phase_block(lines, start, stop, "configuration modal host")
    del lines[start:stop]
    write_lines(path, lines)
    print('  cut %3d lines  %-36s (configuration modal host)' %
          (stop - start, os.path.basename(path)))


def restore_preview_action_spacing(path):
    """The Phase-4.5 preview section adds one separator; retain the trunk's one separator."""
    lines = read_lines(path)
    action = one_index(lines, lambda line: "html += '<div class=\"rp-actions\">'" in line,
                       "roll-preview actions", path)
    if action < 2 or lines[action - 1].strip() or lines[action - 2].strip():
        fail('roll-preview actions do not have the expected Phase-4.5 double separator')
    del lines[action - 1]
    write_lines(path, lines)
    print('  restored      208-feat-roll-preview.js             (trunk action spacing)')


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    root = os.path.abspath(sys.argv[1])
    if "PART F — Phase 0 Source Reorganization" in root:
        fail('that is the live tree; supply a copy')
    if not os.path.isfile(os.path.join(root, "build", "manifest.json")):
        fail('no build/manifest.json under ' + root)

    remove_fragments(root)
    remove_manifest_entries(root)

    # Existing Phase 4.5 core hooks.
    cut(os.path.join(root, "src/sheet/040-lib-kata-kiho-spells.js"),
        lambda line: MARKER in line and "variable entry" in line,
        lambda line: "openAdvConfigModal(document.getElementById(listId).lastElementChild);" in line,
        "quick-add picker hook")
    cut(os.path.join(root, "src/sheet/090-table-rows-weapons.js"),
        lambda line: MARKER in line and "configured Advantage/Disadvantage carries" in line,
        lambda line: line.strip() == "}", "entry config carry")
    cut(os.path.join(root, "src/sheet/110-modals-trackers.js"),
        lambda line: MARKER in line and "Elemental Blessing makes" in line,
        lambda line: line.strip() == "}", "Trait XP discount")
    cut(os.path.join(root, "src/sheet/110-modals-trackers.js"),
        lambda line: MARKER in line and "repaint the per-entry configuration" in line,
        lambda line: "refreshAllAdvConfigControls();" in line, "recalc repaint hook")
    cut(os.path.join(root, "src/sheet/120-persistence.js"),
        lambda line: MARKER in line and "attachAdvConfigToSave() copies" in line,
        lambda line: line.strip() == "};", "entry config serialization helper")
    cut_single_lines(os.path.join(root, "src/sheet/120-persistence.js"),
        lambda line: MARKER in line and "attachAdvConfigToSave(" in line,
        "entry config serialization calls", 2)

    # Completion-pass hooks in shared source.
    cut(os.path.join(root, "src/sheet/090-table-rows-weapons.js"),
        lambda line: MARKER in line and "Sacred Weapon auto-grants are tagged" in line,
        lambda line: line.strip() == "}", "Sacred Weapon row tag")
    restore_weapon_lookup(os.path.join(root, "src/sheet/090-table-rows-weapons.js"),
        "a tagged Sacred Weapon keeps", "    const entry = keyEl ? findWeapon(keyEl.value) : null;",
        "weapon refresh lookup")
    restore_weapon_lookup(os.path.join(root, "src/sheet/090-table-rows-weapons.js"),
        "show the same Sacred Weapon base profile", "    const entry = keyEl ? findWeapon(keyEl.value) : null;",
        "weapon info lookup")
    cut(os.path.join(root, "src/sheet/100-dice-engine.js"),
        lambda line: MARKER in line and "Luck decorates every normal result" in line,
        lambda line: "onAdvConfigRollResult(title, result);" in line, "Luck result hook")
    cut(os.path.join(root, "src/sheet/100-dice-engine.js"),
        lambda line: MARKER in line and "Luck must reroll the whole original roll" in line,
        lambda line: "explodeOn:explodeOn," in line, "weapon reroll threshold carry")
    restore_weapon_lookup(os.path.join(root, "src/sheet/100-dice-engine.js"),
        "Tagged Sacred Weapon rows preserve", "    const entry = keyEl ? findWeapon(keyEl.value) : null;",
        "weapon attack lookup")
    cut(os.path.join(root, "src/sheet/120-persistence.js"),
        lambda line: MARKER in line and "retain the exact ownership tag" in line,
        lambda line: line.strip() == "}", "Sacred Weapon serialization tag")

    # Kharmic Tie's deliberately narrow Phase-3 integration.
    preview = os.path.join(root, "src/sheet/208-feat-roll-preview.js")
    cut(preview,
        lambda line: MARKER in line and "ring-fenced preview decision" in line,
        lambda line: "advConfigKharmicPreviewStart(context);" in line, "Kharmic preview start")
    cut(preview,
        lambda line: MARKER in line and "confirm the declaration before" in line,
        lambda line: line.strip() == "}", "Kharmic preview commit")
    # The cancellation branch extends the trunk `if(go)` statement. Restore that one closing
    # brace while removing the Phase-4.5-only `else if`; this is a strictly specified
    # substitution, not a span that can consume neighbouring Phase 3 code.
    lines = read_lines(preview)
    cancel = one_index(lines, lambda line: "else if(typeof advConfigKharmicPreviewCancel" in line,
                       "Kharmic preview cancellation", preview)
    if cancel < 1 or lines[cancel - 1].strip() != "}":
        fail('Kharmic preview cancellation no longer follows if(go)')
    end = next((i for i in range(cancel + 1, len(lines)) if lines[i].strip() == "}"), None)
    if end is None:
        fail('Kharmic preview cancellation has no closing brace')
    if "advConfigKharmicPreviewCancel" not in lines[cancel]:
        fail('Kharmic preview cancellation target was not unique')
    lines[cancel:end + 1] = ["        }" + eol_of(lines[cancel])]
    write_lines(preview, lines)
    print('  restore      208-feat-roll-preview.js             (Kharmic cancellation branch)')
    cut(preview,
        lambda line: MARKER in line and "only weapon attacks expose" in line,
        lambda line: line.strip() == "}", "Kharmic preview markup")
    # This hook contains nested callback braces, so its outer `});` is the second such line.
    # Count it explicitly instead of allowing a generic first-match cut to leave one orphaned.
    lines = read_lines(preview)
    start = one_index(lines, lambda line: MARKER in line and "changing this checkbox only" in line,
                      "Kharmic preview listener", preview)
    first_close = next((i for i in range(start + 1, len(lines)) if lines[i].strip() == "});"), None)
    end = next((i for i in range((first_close or -1) + 1, len(lines)) if lines[i].strip() == "});"), None)
    if first_close is None or end is None:
        fail('Kharmic preview listener does not have its two expected callback closers')
    assert_phase_block(lines, start, end + 1, "Kharmic preview listener")
    del lines[start:end + 1]
    write_lines(preview, lines)
    print('  cut %3d lines  208-feat-roll-preview.js             (Kharmic preview listener)' % (end - start + 1))
    restore_preview_action_spacing(preview)

    # The entire seam export is one Phase-4.5-owned section, including completion modules.
    cut(os.path.join(root, "src/sheet/210-test-seam-and-init.js"),
        lambda line: MARKER in line and "Modal-Configured Advantages/Disadvantages" in line,
        lambda line: line.strip() == "// ---------- Init ----------", "Phase 4.5 seam export",
        inclusive=False)
    cut(os.path.join(root, "src/sheet/210-test-seam-and-init.js"),
        lambda line: MARKER in line and "Modal-configured Advantages/Disadvantages" in line,
        lambda line: "initAdvConfig();" in line, "Phase 4.5 init hook")
    strip_final_eol(os.path.join(root, "src/sheet/210-test-seam-and-init.js"), "Phase 4.5 seam")

    # Original modal host and the one combined, safely scoped CSS block.
    remove_adv_config_modal_host(os.path.join(root, "src/markup/20-fixed-layers.html"))
    css = os.path.join(root, "src/css/10-sheet-base.css")
    cut(css,
        lambda line: MARKER in line and "Modal-Configured Advantages" in line,
        lambda line: "PART J PHASE 8" in line and "Casting Diagnostics" in line,
        "Phase 4.5 CSS", inclusive=False)
    strip_final_eol(css, "Phase 4.5 CSS")

    print("\nRemoval complete. Rebuild this copy and run the independent harnesses.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
