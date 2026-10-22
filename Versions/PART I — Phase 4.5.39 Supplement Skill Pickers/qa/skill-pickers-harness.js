'use strict';
// Phase 4.5.39 Supplement Skill Pickers (Cycle 5 Release 5c). node skill-pickers-harness.js <sheet.html>
// The rules are written out here from the books (Book of Void pp.191, 195; Strongholds of the Empire pp.107, 152),
// not read from the layer, so every check but the two guards can fail on main.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const TOTAL = 24;
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 400) +
    ' want=' + String(JSON.stringify(want)).slice(0, 200)));
}

// Page helpers. Every one returns data, never throws, so a build without the layer still runs every check.
function installHelpers() {
  const T = window.__L5R_TEST__;
  const H = window.H439 = {};
  H.safe = f => { try { return f(); } catch (e) { return 'error: ' + String(e.message || e).slice(0, 120); } };
  H.open = () => getComputedStyle(document.getElementById('advConfigModalOverlay')).display !== 'none';
  H.add = (name) => { const s = document.getElementById('advQuickAdd'); s.value = name; s.dispatchEvent(new Event('change'));
    return [H.open(), document.querySelectorAll('#advConfigGrid .supp4539-skill').length]; };
  H.fill = (values) => { document.querySelectorAll('#advConfigGrid .supp4539-skill').forEach((i, n) => { i.value = values[n] || ''; });
    T.confirmAdvConfigModal(); };
  H.error = () => { const e = document.querySelector('#advConfigGrid .supp4539-error'); return H.open() && e && !e.hidden ? e.textContent : null; };
  H.entry = (name) => Array.from(document.querySelectorAll('#advList .entry')).find(d => d.querySelector('.en-name').value === name) || null;
  H.row = (div) => div ? [div.querySelector('.en-name').value, Number(div.querySelector('.en-cost').value),
    (div.querySelector('.adv-config-summary') || {textContent: null}).textContent] : null;
  H.skill = (name) => Array.from(document.querySelectorAll('#skillsBody tr')).filter(t => t.querySelector('.sk-name').value === name)
    .map(t => [t.querySelector('.sk-rank').value, t.querySelector('.sk-cost').textContent]);
  H.makeSkill = (name, rank) => { document.getElementById('skillsBody').appendChild(T.makeSkillRow({name, trait: 'Intelligence', rank, emph: ''})); T.recalcAll(); };
  H.change = (name) => { const d = H.entry(name); if (d) T.openAdvConfigModal(d); return H.open(); };
  H.mods = (kind, skillName, label) => T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS[kind], {skillName, traitName: 'Perception',
    skillRank: 1, traitValue: 2})).filter(m => m.label === label);
  H.setSchool = (name) => { document.getElementById('f_schoolsData').value = name ? JSON.stringify([{name, frozen: false, frozenRank: null,
    floorRank: 1, anchorInsightRank: 0}]) : '[]'; T.recalcAll(); };
}

async function main() {
  if (!process.argv[2]) throw Error('Pass the built HTML path');
  const browser = await chromium.launch();
  const errors = [];
  try {
    const page = await browser.newPage({viewport: {width: 1280, height: 900}});
    page.setDefaultTimeout(8000);
    page.on('pageerror', e => errors.push(String(e)));
    page.on('dialog', d => d.dismiss().catch(() => {}));
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_CAROUSEL__?.isReady?.() &&
      (!window.__L5R_TEST__.CL11 || window.__L5R_TEST__.CL11.ready), null, {timeout: 60000});
    await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
    await page.evaluate(installHelpers);
    await page.evaluate(() => { const T = window.__L5R_TEST__; T.resetToBaseline(); T.MODES12?.set('management'); T.clearAllRows?.(); });
    const ev = (f, arg) => page.evaluate(([f, arg]) => window.H439.safe(() => (0, eval)('(' + f + ')')(window.H439, window.__L5R_TEST__, arg)), [String(f), arg]);

    check('S439-SWITCH', await ev((H, T) => T.SUPPLEMENT_SKILL_PICKERS_ENABLED === true && !!T.SUPP4539));

    // Water Hammer Citizen (Strongholds p.107): one Rank in a Craft, not above 4.
    check('S439-WH-ASKS', await ev(H => H.add('Water Hammer Citizen')), [true, 1]);
    check('S439-WH-NEW-ROW', await ev(H => { H.fill(['Craft: Pottery']); return [H.row(H.entry('Water Hammer Citizen')), H.skill('Craft: Pottery')]; }),
      [['Water Hammer Citizen', 3, 'Craft: Pottery — one free Rank; crafting time as if it cost one coin smaller'], [['1', '0 xp']]]);
    check('S439-WH-MAX', await ev((H, T) => {
      H.makeSkill('Craft: Weaving', 4);
      if (!H.change('Water Hammer Citizen')) return 'no picker';
      H.fill(['Craft: Weaving']);
      const out = [H.error(), H.skill('Craft: Weaving'), H.skill('Craft: Pottery')];
      T.closeAdvConfigModal();
      return out;
    }), ['Craft: Weaving is at Rank 4 already, the starting maximum; choose another Craft.', [['4', '10 xp']], [['1', '0 xp']]]);
    check('S439-WH-CHANGE-MOVES-RANK', await ev(H => {
      if (!H.change('Water Hammer Citizen')) return 'no picker';
      H.fill(['Craft: Tailoring']);
      return [H.skill('Craft: Pottery'), H.skill('Craft: Tailoring')];
    }), [[], [['1', '0 xp']]]);

    // Zakyo Toshi Citizen (Strongholds p.152): one Rank in a Games Skill.
    check('S439-ZT-ASKS', await ev(H => { H.makeSkill('Games: Go', 2); return H.add('Zakyo Toshi Citizen'); }), [true, 1]);
    check('S439-ZT-EXISTING-ROW', await ev(H => { H.fill(['Games: Go']); return [H.row(H.entry('Zakyo Toshi Citizen')), H.skill('Games: Go')]; }),
      [['Zakyo Toshi Citizen', 3, 'Games: Go — one free Rank'], [['3', '5 xp']]]);
    check('S439-ZT-REMOVED-TAKES-BACK', await ev(H => {
      const before = H.skill('Games: Go');
      const d = H.entry('Zakyo Toshi Citizen');
      if (d) d.querySelector('.rm-btn').click();
      return [before, H.skill('Games: Go'), !!H.entry('Zakyo Toshi Citizen')];
    }), [[['3', '5 xp']], [['2', '3 xp']], false]);

    // Reincarnated (Book of Void p.191): three non-School Skills, +1k0; 5 points for Henshin or with an Ancestor.
    check('S439-RE-ASKS', await ev(H => { H.setSchool('Hida Bushi'); return H.add('Reincarnated'); }), [true, 3]);
    check('S439-RE-SCHOOL-SKILL-REFUSED', await ev(H => { H.fill(['Athletics', 'Hunting', 'Sincerity']); return [H.error(), H.open()]; }),
      ['Athletics is one of your School Skills; choose another.', true]);
    check('S439-RE-PRICE', await ev(H => { H.fill(['Hunting', 'Sincerity', 'Kyujutsu']); return [H.row(H.entry('Reincarnated')), H.open()]; }),
      [['Reincarnated', 6, '+1k0 on Hunting, Sincerity and Kyujutsu (the GM approves)'], false]);
    check('S439-RE-ROLL', await ev(H => [H.mods('SKILL', 'Hunting', 'Reincarnated').map(m => [m.rolledDelta, m.keptDelta, !!m.informational]),
      H.mods('SKILL', 'Etiquette', 'Reincarnated').length]), [[[1, 0, false]], 0]);
    check('S439-RE-ATTACK', await ev(H => H.mods('ATTACK', 'Kyujutsu', 'Reincarnated').map(m => [m.rolledDelta, m.keptDelta])), [[1, 0]]);
    check('S439-RE-VOID-ANACHRONISM', await ev((H, T) => {
      T.setVoidPending({k1: true});
      const armed = H.mods('SKILL', 'Sincerity', 'Reincarnated').filter(m => m.informational).map(m => m.display);
      T.setVoidPending({});
      return [armed, H.mods('SKILL', 'Sincerity', 'Reincarnated').filter(m => m.informational).length];
    }), [['Anachronism for 1–10 hours'], 0]);
    check('S439-RE-ANCESTOR-HENSHIN-PRICE', await ev((H, T) => {
      const cost = () => { T.recalcAll(); return Number(H.entry('Reincarnated').querySelector('.en-cost').value); };
      T.ANC48.write({v: 1, name: 'Kuni', lost: false, regained: false, final: false, gm: false});
      const ancestor = cost();
      T.ANC48.write(null);
      const none = cost();
      H.setSchool('Asako Henshin [Monk]');
      const henshin = cost();
      H.setSchool('');
      return [ancestor, none, henshin, cost()];
    }), [5, 6, 5, 6]);

    // Watanu-Trained (Book of Void p.195): one Craft; +1k1 declared when making metal goods.
    check('S439-WA-ASKS', await ev(H => H.add('Watanu-Trained')), [true, 1]);
    check('S439-WA-CRAFT-ONLY', await ev((H, T) => { H.fill(['Blacksmithing']); const e = H.error(); T.closeAdvConfigModal(); return e; }),
      'Write the Skill as Craft: its name, such as Craft: Blacksmithing.');
    check('S439-WA-OFFERED', await ev((H, T) => {
      if (!H.change('Watanu-Trained')) return 'no picker';
      H.fill(['Craft: Blacksmithing']);
      const ctx = n => T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName: n, traitName: 'Intelligence', skillRank: 1, traitValue: 2});
      const offered = n => T.RD4515.offered(ctx(n)).filter(o => /^Watanu-Trained/.test(o.label)).map(o => o.label);
      return [H.row(H.entry('Watanu-Trained')), offered('Craft: Blacksmithing'), offered('Craft: Pottery').length];
    }), [['Watanu-Trained', 1, 'Craft: Blacksmithing — +1k1 making metal goods (declare it on the roll)'],
      ['Watanu-Trained: making a metal item, not a weapon or armour — +1k1'], 0]);
    check('S439-WA-DECLARED-DICE', await ev((H, T) => {
      const ctx = T.makeRollContext(T.ROLL_KINDS.SKILL, {skillName: 'Craft: Blacksmithing', traitName: 'Intelligence', skillRank: 1, traitValue: 2});
      const watanu = () => T.getPreRollModifiers(ctx).filter(m => m.label === 'Watanu-Trained').map(m => [m.rolledDelta, m.keptDelta]);
      const before = watanu();
      T.RD4515.start(ctx);
      const key = (T.RD4515.offered(ctx).find(o => /^Watanu/.test(o.label)) || {}).key;
      T.RD4515.toggle(key, true);
      const armed = watanu();
      T.RD4515.cancel();
      return [before, armed];
    }), [[], [[1, 1]]]);
    check('S439-NEEDS-A-CHOICE', await ev((H, T) => {
      H.add('Watanu-Trained'); T.closeAdvConfigModal(); T.recalcAll();
      const d = document.querySelector('#advList .entry:last-child');
      return [d.querySelector('.en-name').value, Number(d.querySelector('.en-cost').value), /Needs a choice/.test(d.textContent),
        !!d.querySelector('.adv-config-btn')];
    }), ['Watanu-Trained', 1, true, true]);

    // Saved and opened again: picks, prices, granted Ranks and their XP.
    check('S439-SAVED-AND-OPENED', await ev((H, T) => {
      const snap = () => [Array.from(document.querySelectorAll('#advList .entry')).map(d => {
        const c = T.readAdvConfig(d); return [d.querySelector('.en-name').value, Number(d.querySelector('.en-cost').value), c ? c.value : null];
      }), H.skill('Craft: Tailoring'), H.skill('Games: Go')];
      const before = snap();
      const data = JSON.parse(JSON.stringify(T.collectData()));
      T.resetToBaseline(); T.clearAllRows?.();
      T.applyData(data); T.recalcAll();
      const after = snap();
      return [JSON.stringify(before) === JSON.stringify(after), after];
    }), [true, [[['Water Hammer Citizen', 3, 'Craft: Tailoring'], ['Reincarnated', 6, 'Hunting, Sincerity, Kyujutsu'],
      ['Watanu-Trained', 1, 'Craft: Blacksmithing'], ['Watanu-Trained', 1, null]], [['1', '0 xp']], [['2', '3 xp']]]]);
    check('S439-RENAME-TAKES-BACK', await ev((H, T) => {
      const d = H.entry('Water Hammer Citizen');
      if (!d) return 'no entry';
      const before = H.skill('Craft: Tailoring');
      const n = d.querySelector('.en-name'); n.value = 'Water Hammer Native'; n.dispatchEvent(new Event('input', {bubbles: true})); T.recalcAll();
      return [before, H.skill('Craft: Tailoring'), d.dataset.advConfig || null];
    }), [[['1', '0 xp']], [], null]);
    check('S439-GREAT-POTENTIAL-UNCHANGED', await ev((H, T) => (T.advConfigSchemaFor('Great Potential') || {}).type), 'skillPick');
    check('S439-NO-PAGE-ERRORS', errors, []);
  } finally {
    await browser.close();
  }
  const passed = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('FAIL check count ' + results.length + ' expected ' + TOTAL);
  console.log(`\n${passed}/${TOTAL} checks passed`);
  process.exit(passed === TOTAL && results.length === TOTAL ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
