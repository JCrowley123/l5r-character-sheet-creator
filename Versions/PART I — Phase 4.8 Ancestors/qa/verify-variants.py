#!/usr/bin/env python3
"""Mutation checks for Phase 4.8 (Part I), Ancestors. All mutations occur in temporary copies.

    python qa/verify-variants.py [--discover]

A normal run pins every expected failing assertion of each deliberately broken variant against
qa/expected-failures.json, and separately runs boundary builds that must be fully green: this part
removed and its switch off (both --absent), Phase 4.5's roll effects off (--no-rolls), Feature
4.5.15's declaration registry off (--no-declare), Phase 12's modes off (--no-modes) and Phase 11.2's
wizard off (--no-wizard). --discover prints an oracle candidate for review; it never updates the
oracle. The removed build's SHA is pinned independently of the live build. Adapted from Phase 7's
(Part J) verify-variants.py.
"""
from __future__ import annotations
import hashlib, importlib.util, json, re, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent


def versions_dir() -> Path:
    for directory in HERE.parents:
        if (directory / 'BUILD-LEDGER.md').is_file() and (directory / 'CLAUDE.md').is_file():
            return directory
    raise SystemExit('cannot find Versions/ above ' + str(HERE))


VERSIONS = versions_dir()
LIVE = VERSIONS / 'Part F — Cross-Platform Delivery' / 'PART F — Phase 0 Source Reorganization for Maintainability'
FRAGMENT = 'src/sheet/209.99998-feat-ancestors.js'
HARNESS = HERE / 'ancestors-harness.js'
NODE = shutil.which('node') or r'C:\Program Files\nodejs\node.exe'
BASELINE = '2e65b361aac71649c137b4f22fc37de7c5a77826ea43eb5f889a49fa47fe4763'
THIS_RELEASE = 'PART I — Phase 4.8 Ancestors'


def removal_chain():
    location = VERSIONS / 'QA — Removal Chain Registry' / 'removal_chain.py'
    spec = importlib.util.spec_from_file_location('removal_chain', location)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def edit(old, new, count=1, target=FRAGMENT):
    def apply(tree):
        p = tree / target
        s = p.read_bytes().decode('utf-8')
        assert s.count(old) == count, (target, old, s.count(old), count)
        p.write_bytes(s.replace(old, new).encode('utf-8'))
    return apply


def removed(tree):
    subprocess.run([sys.executable, str(HERE / 'remove-phase.py'), str(tree)], check=True, capture_output=True)


SWITCH_OFF = edit('const ANCESTORS_ENABLED = true;', 'const ANCESTORS_ENABLED = false;')
TRACKERS = 'src/sheet/110-modals-trackers.js'

# name: mutation. Each disables exactly one piece of the part.
CSS = 'src/css/59.9997-feat-ancestors.css'
VARIANTS = {
    'part removed': removed,
    'master switch off': SWITCH_OFF,
    'cost not charged': edit('function ancestorXpCost(){ return ANC48.enabled() ? ANC48.cost() : 0; }',
                             'function ancestorXpCost(){ return 0; }'),
    'lost favour keeps the gifts': edit("      if(s.lost) return s.final ? 'Favour lost for good' : 'Favour lost';\n", ''),
    'favour can return again and again': edit('api.write(Object.assign({}, s, {lost:true, final:final}));',
                                              'api.write(Object.assign({}, s, {lost:true, final:false, regained:false}));'),
    'jealousy not enforced': edit('api.locked = function(s){ return !!s && (s.lost || s.regained || s.final); };',
                                  'api.locked = function(s){ return false; };'),
    'other Clans choosable': edit("api.choosable = function(a){ return api.ownClan(a) || (a && a.clan === 'Spider'); };",
                                  'api.choosable = function(a){ return !!a; };'),
    'Spider taken without the GM': edit("        const ok = await appConfirm(", "        const ok = true || await appConfirm("),
    'no damage dice': edit('function ancestorDamageDice(entry, skillName){ return ANC48.enabled() ? ANC48.damage(entry, skillName) : null; }',
                           'function ancestorDamageDice(entry, skillName){ return null; }'),
    'no Armor TN': edit('function ancestorArmorTNBonus(){ return ANC48.enabled() ? ANC48.armorTN() : 0; }',
                        'function ancestorArmorTNBonus(){ return 0; }'),
    'declarations not registered': edit('      RD4515.register(ANC48.PROVIDER, ANC48.provider);\n', ''),
    'no automatic bonuses': edit('return (anc48PreviousModifiers(context) || []).concat(ANC48.modifiers(context));',
                                 'return anc48PreviousModifiers(context) || [];'),
    'old save keeps the Ancestor': edit('      if(result !== false && !has && f && f.value){', '      if(false){'),
    'picker not locked in Play': edit("MODES12.register('#anc48Pick');", 'false;'),
    'wizard not installed': edit('    ANC48.wizardInstall();\n', ''),
    'demands never flagged': edit('      if(!a || !a.flag || (s && s.lost)) return out;', '      return out;'),
    'Kitsuki on every roll': edit("if((skill || traitRoll) && trait === 'Awareness'){", 'if((skill || traitRoll)){'),
    'Low weapons count as Bugei': edit("return !!s && (s.cat === 'Bugei' || s.cat === 'Weapon');", 'return !!s && /Bugei|Weapon/.test(s.cat);'),
    'Mirumoto never +3k1': edit('api.mirumotoSkill(context.skillName) ?', 'false ?'),
    'card never repainted': edit("    if(typeof renderAncestorCard === 'function') renderAncestorCard();\n", '', target=TRACKERS),
    # The owner's rule (point 6 to 8 of the first iPhone check), and what came with it.
    'Kakita not offered after the roll': edit("if(a.name === 'Kakita' && skillish && whole && api.skillIn(c, ['Iaijutsu', 'Artisan'])){", 'if(false){'),
    'Kakita re-roll costs nothing': edit("      if(!api.payVoid()){ api.outcome('Kakita’s re-roll needs a Void Point. ", "      if(false){ api.outcome('Kakita’s re-roll needs a Void Point. "),
    'Kakita re-roll without +1k1': edit('const again = api.rerollPlus(result, 1, 1);', 'const again = api.rerollPlus(result, 0, 0);'),
    'Kakita never keeps the re-roll': edit("      if(better) showRollResult(title + ' — Kakita’s re-roll (+1k1)', again, tn);\n", ''),
    'costs never taken': edit('          if(await ANC48.gate(req)) return proceed;', '          return proceed;'),
    'once-a-session not marked': edit('        if(p.session) api.useSession();\n', ''),
    'Void upgrades without a Void Point': edit('api.voidArmed = function(){ return !!api.pendingVoid().k1; };', 'api.voidArmed = function(){ return true; };'),
    'free Void Point beside a spent one': edit('return api.voidRoll(c) && !api.oneRollVoidArmed();', 'return api.voidRoll(c);', count=2),
    'Chuda Bikimi can return': edit('const final = s.regained || !!a.noReturn;', 'const final = s.regained;'),
    'loyalty never checked': edit('      if(!a || !a.check || (s && s.lost)) return out;', '      return out;'),
    'Sun Tao picks the best dice': edit("e.classList.toggle('kept', at !== -1);", "e.classList.toggle('kept', e.classList.contains('kept'));"),
    'Sun Tao on a roll that succeeded': edit('if(currentRollTN !== null && shown >= currentRollTN){', 'if(false){'),
    'Toku not offered': edit("if(a.name === 'Toku' && whole && typeof advConfigLuckRerollResult === 'function'){", 'if(false){'),
    'Atarasi damage forgotten': edit("if(a.name === 'Hida Atarasi' && api.inCombat() && typeof getRoundSpend === 'function'){", 'if(false){'),
    'i button its own look': edit('    width:18px; height:18px; padding:0; margin-left:6px;', '    width:28px; height:28px; padding:0; margin-left:auto;', target=CSS),
    'Iuchi on every spell': edit("const d = api.deficiencyDie(context); if(d > 0) out.push(api.mod(a, d, 0, 'no Deficient Element'));",
                                 "out.push(api.mod(a, 1, 0, 'no Deficient Element'));"),
    'Yogo Junzo counts nothing': edit('const n = api.forbiddenKnowledge() + Math.floor(api.taint()), each = context.maho === true ? 4 : 2;',
                                      'const n = 0, each = 2;'),
    'Reichin adds both': edit("        if(chosen.indexOf('reichin-bloodspeaker') !== -1) chosen = chosen.filter(function(k){ return k !== 'reichin-fear'; });\n", ''),
    'monks not guided': edit("return a.clan === 'Brotherhood of Shinsei' && api.monk();", 'return false;'),
    'Fox not guided by the Kitsune spirits': edit('api.serves = function(a){ return [a.clan].concat(a.also || []); };', 'api.serves = function(a){ return [a.clan]; };'),
}
BOUNDARIES = {
    'part removed': (removed, '--absent'),
    'master switch off': (SWITCH_OFF, '--absent'),
    'Phase 4.5 roll effects off': (edit('const ADV_CONFIG_ROLL_EFFECTS_ENABLED = true;', 'const ADV_CONFIG_ROLL_EFFECTS_ENABLED = false;',
                                        target='src/sheet/209.8-feat-adv-config.js'), '--no-rolls'),
    'Feature 4.5.15 registry off': (edit('const ROLL_DECLARATIONS_ENABLED = true;', 'const ROLL_DECLARATIONS_ENABLED = false;',
                                         target='src/sheet/209.927-feat-roll-declarations.js'), '--no-declare'),
    'Phase 12 modes off': (edit('const MODES12_ENABLED = true;', 'const MODES12_ENABLED = false;',
                                target='src/sheet/209.9996-feat-play-management-modes.js'), '--no-modes'),
    'Phase 11.2 wizard off': (edit('const CREATION_WIZARD_ENABLED = true;', 'const CREATION_WIZARD_ENABLED = false;',
                                   target='src/sheet/209.994-feat-creation-wizard.js'), '--no-wizard'),
}


def build(tree):
    subprocess.run([sys.executable, str(tree / 'build/recombine.py')], check=True, capture_output=True)


def run(tree, *args):
    p = subprocess.run([NODE, str(HARNESS), str(tree / 'l5r-character-sheet.html'), *args], capture_output=True,
                       text=True, encoding='utf-8', errors='replace', timeout=1200)
    return p.returncode, p.stdout + p.stderr


def copy(work, name):
    tree = work / re.sub(r'\W+', '-', name)
    shutil.copytree(LIVE, tree, ignore=shutil.ignore_patterns('l5r-character-sheet.html', 'dist', '__pycache__'))
    removal_chain().strip_later(tree, after=THIS_RELEASE)
    return tree


def main():
    discover = '--discover' in sys.argv
    wanted = {} if discover else json.loads((HERE / 'expected-failures.json').read_text(encoding='utf-8'))
    found, bad = {}, 0
    with tempfile.TemporaryDirectory(prefix='l5r-anc48-mutations-') as scratch:
        work = Path(scratch)
        for name, mutate in VARIANTS.items():
            tree = copy(work, 'variant ' + name); mutate(tree); build(tree)
            if name == 'part removed':
                actual = hashlib.sha256((tree / 'l5r-character-sheet.html').read_bytes()).hexdigest()
                assert actual == BASELINE, (actual, BASELINE)
            rc, out = run(tree)
            failures = sorted(set(re.findall(r'^FAIL (\S+)', out, re.M)))
            count = re.search(r'\d+/\d+ checks passed', out)
            assert count, (name, out[-3000:])
            found[name] = {'failures': failures, 'count': count[0]}
            # A variant that turns nothing red proves nothing; that is a failure even in discovery.
            good = rc != 0 and bool(failures) and (discover or found[name] == wanted.get(name))
            bad += not good
            print(('DISCOVER' if discover and good else 'OK' if good else 'BAD') + ' ' + name + ': ' + count[0] + '; '
                  + str(len(failures)) + ' failing assertions', flush=True)
            if not good and not discover:
                print('Expected:', wanted.get(name), '\nActual:', found[name], flush=True)
            shutil.rmtree(tree, ignore_errors=True)
        for name, (mutate, flag) in BOUNDARIES.items():
            tree = copy(work, 'boundary ' + name); mutate(tree); build(tree)
            rc, out = run(tree, flag)
            count = re.search(r'(\d+)/(\d+) checks passed', out)
            good = rc == 0 and bool(count) and count[1] == count[2] and int(count[2]) > 0
            bad += not good
            print(('OK' if good else 'BAD') + ' boundary ' + name + ' (' + flag + '): ' + (count[0] if count else 'no count'), flush=True)
            if not good:
                print('\n'.join(line for line in out.splitlines() if line.startswith('FAIL') or 'Error' in line)[:3000], flush=True)
            shutil.rmtree(tree, ignore_errors=True)
    if discover:
        print('ORACLE_JSON ' + json.dumps(found, sort_keys=True))
    print('VARIANTS ' + ('all as expected' if not bad else str(bad) + ' NOT as expected'))
    return int(bool(bad))


if __name__ == '__main__':
    sys.exit(main())
