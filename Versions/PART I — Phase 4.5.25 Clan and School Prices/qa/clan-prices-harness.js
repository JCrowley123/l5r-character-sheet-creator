/*
 * PART I Feature 4.5.25 — Clan and School Prices: real-browser acceptance. The input HTML is read only.
 *   node clan-prices-harness.js <sheet.html>
 *
 * Oracles, none of them this release's own table: the book's prices, written below from the Core
 * Rulebook's sentences ("Dragon characters may purchase this Advantage for 2 points"; "This
 * Disadvantage is worth 4 points to Lion characters"); the trunk's own ADV_LIBRARY and
 * DISADV_LIBRARY costs; the trunk's own XP fields; and the Characters list's saved-state test,
 * which is JSON.stringify(collectData()). Every scenario has its own page and declares its
 * assertion identities first, so an exception fails what it did not reach.
 */
'use strict';
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const sheet = process.argv[2];
const results = [];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function record(id, actual, expected, detail = '') {
  if (results.some(r => r.id === id)) throw new Error('duplicate assertion ' + id);
  const pass = same(actual, expected);
  results.push({ id, pass });
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : '\n expected ' + JSON.stringify(expected)
    + '\n actual ' + JSON.stringify(actual) + (detail ? '\n ' + detail : '')));
}
async function scenario(browser, prefix, names, run) {
  const ids = names.map(n => 'CP-' + prefix + '-' + n);
  const check = (n, a, e = true) => {
    const id = 'CP-' + prefix + '-' + n;
    if (!ids.includes(id)) throw new Error('undeclared assertion ' + id);
    record(id, a, e);
  };
  let error = '', page = null;
  try { page = await open(browser); await run(page, check); }
  catch (e) { error = String(e.stack || e).split('\n').slice(0, 5).join('\n'); }
  finally { if (page) await page.context().close().catch(() => {}); }
  for (const id of ids) if (!results.some(r => r.id === id)) record(id, 'not reached', 'completed', error);
}
async function open(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) page.errors.push('console: ' + m.text().slice(0, 300)); });
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.goto(pathToFileURL(path.resolve(sheet)).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return !!T && !!window.__L5R_CAROUSEL__?.isReady?.()
    && (!T.CL11 || T.CL11.ready || T.CL11.enabled() === false); }, null, { timeout: 60000 });
  await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
  await page.waitForTimeout(150);
  // In-page helpers: a fresh character in Management, rows added the way the sheet adds them.
  await page.evaluate(() => {
    const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
    window.__cp = {
      prep(o) {
        T.resetToBaseline();
        if (T.MODES12) T.MODES12.set('management');
        $('f_clan').value = o.clan || ''; $('f_family').value = o.family || '';
        T.saveSchoolsList((o.schools || []).map(n => ({ name: n, frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0 })));
        T.recalcAll();
      },
      schools(names) { T.saveSchoolsList(names.map(n => ({ name: n, frozen: false, frozenRank: null, floorRank: 1, anchorInsightRank: 0 }))); T.recalcAll(); },
      add(name, cost) {
        const adv = T.ADV_LIBRARY.find(e => e.name === name), dis = T.DISADV_LIBRARY.find(e => e.name === name);
        const lib = adv || dis;
        $(adv ? 'advList' : 'disadvList').appendChild(T.makeEntry({ name, cost: cost == null ? lib.cost : cost, desc: lib.desc || '' }, true));
        T.recalcAll();
      },
      row(name) {
        const d = Array.from(document.querySelectorAll('#advList .entry, #disadvList .entry')).find(x => x.querySelector('.en-name').value === name);
        if (!d) return null;
        let s = null; try { s = d.dataset.cp4525 ? JSON.parse(d.dataset.cp4525).s : null; } catch (e) { s = 'corrupt'; }
        return { cost: Number(d.querySelector('.en-cost').value), state: s, note: (d.querySelector('.cp4525-note') || {}).textContent || '' };
      },
      type(name, value) {
        const d = Array.from(document.querySelectorAll('#advList .entry, #disadvList .entry')).find(x => x.querySelector('.en-name').value === name);
        d.querySelector('.en-cost').value = String(value); T.recalcAll();
      },
      remain() { T.recalcAll(); return parseFloat($('f_xpRemain').value || $('f_xpRemain').textContent) || 0; }
    };
  });
  return page;
}

// The book (Core Rulebook pp. 147-162): [list, catalogue, price, who qualifies].
const BOOK = {
  'Blood of Osano-Wo': ['adv', 4, 3, 'Crab'], 'Clear Thinker': ['adv', 3, 2, 'Dragon'], 'Crab Hands': ['adv', 3, 2, 'bushi'],
  'Crafty': ['adv', 3, 2, 'ninja'], 'Dangerous Beauty': ['adv', 3, 2, 'Scorpion'], 'Daredevil': ['adv', 3, 2, 'Mantis'],
  'Enlightened': ['adv', 6, 5, 'monk'], 'Friend of the Brotherhood': ['adv', 5, 4, 'Dragon'], 'Gaijin Gear': ['adv', 5, 4, 'Unicorn'],
  'Hands of Stone': ['adv', 6, 5, 'monk'], 'Irreproachable': ['adv', 2, 1, 'Imperial'], 'Ishiken-Do': ['adv', 8, 6, 'Phoenix'],
  'Large': ['adv', 4, 3, 'Crab'], 'Leadership': ['adv', 6, 5, 'Lion'], 'Quick': ['adv', 6, 5, 'ninja'],
  'Read Lips': ['adv', 4, 3, 'courtier'], 'Sacrosanct': ['adv', 4, 3, 'Imperial'], 'Sage': ['adv', 4, 3, 'shugenja'],
  'Silent': ['adv', 3, 2, 'ninja'], 'Strength of the Earth': ['adv', 3, 2, 'bushi'], 'Tactician': ['adv', 4, 3, 'Lion'],
  'Ascetic': ['disadv', 2, 3, 'monk'], 'Bitter Betrothal': ['disadv', 2, 3, 'Imperial'], 'Brash': ['disadv', 3, 4, 'Lion'],
  'Contrary': ['disadv', 3, 4, 'courtier'], 'Dark Secret': ['disadv', 4, 5, 'ninja'], 'Disturbing Countenance': ['disadv', 3, 4, 'Spider'],
  'Epilepsy': ['disadv', 4, 5, 'Crane'], 'Forced Retirement': ['disadv', 4, 5, 'monk'], 'Gaijin Name': ['disadv', 1, 2, 'Unicorn'],
  'Greedy': ['disadv', 3, 4, 'Mantis'], 'Idealistic': ['disadv', 2, 3, 'Lion'], 'Insensitive': ['disadv', 2, 3, 'Scorpion'],
  'Obtuse': ['disadv', 3, 4, 'bushi'], 'Overconfident': ['disadv', 3, 4, 'Mantis'], 'Permanent Wound': ['disadv', 4, 5, 'bushi'],
  'Rumormonger': ['disadv', 4, 5, 'courtier'], 'Soft-Hearted': ['disadv', 2, 3, 'Phoenix'], 'Touch of the Void': ['disadv', 3, 4, 'Phoenix']
};
// A character who qualifies through one group. A School type is given with no Clan at all.
const SETUP = { bushi: { schools: ['Hida Bushi'] }, courtier: { schools: ['Doji Courtier'] }, shugenja: { schools: ['Isawa Shugenja'] },
  monk: { schools: ['Kuni Witch-Hunter [Monk]'] }, ninja: { schools: ['Shosuro Infiltrator [Ninja]'] }, Imperial: { clan: 'Imperial' } };

(async () => {
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    // 1. Every entry: the book's price for a character who qualifies, the catalogue for one who does not.
    await scenario(browser, 'TABLE', ['CATALOGUE-AGREES', 'QUALIFIED-PRICE', 'OTHERS-CATALOGUE', 'OR-READING', 'IMPERIAL-FAMILY', 'LEFT-OUT', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(([BOOK, SETUP]) => {
        const T = window.__L5R_TEST__, cp = window.__cp, out = { cat: [], qual: [], other: [] };
        for (const [name, [list, base, price, who]] of Object.entries(BOOK)) {
          const lib = (list === 'adv' ? T.ADV_LIBRARY : T.DISADV_LIBRARY).find(e => e.name === name);
          if (!lib || lib.cost !== base) out.cat.push(name);
          cp.prep(SETUP[who] || { clan: who }); cp.add(name);
          if (cp.row(name).cost !== price) out.qual.push(name + ' ' + cp.row(name).cost);
          cp.prep({}); cp.add(name);
          if (cp.row(name).cost !== base) out.other.push(name + ' ' + cp.row(name).cost);
        }
        const price = o => { cp.prep(o); cp.add('Crab Hands'); return cp.row('Crab Hands').cost; };
        out.or = [price({ clan: 'Crab', schools: ['Doji Courtier'] }), price({ clan: 'Lion', schools: ['Akodo Bushi'] }), price({ clan: 'Lion', schools: ['Doji Courtier'] })];
        cp.prep({ clan: 'Crane', family: 'Otomo' }); cp.add('Irreproachable'); out.fam = cp.row('Irreproachable').cost;
        cp.prep({ clan: 'Dragon', schools: ['The Togashi Tattooed Order [Monk]'] });
        cp.add('Blackmail'); cp.add('Way of the Land');
        out.left = ['Blackmail', 'Way of the Land'].map(n => cp.row(n).state);
        return out;
      }, [BOOK, SETUP]);
      check('CATALOGUE-AGREES', r.cat, []);
      check('QUALIFIED-PRICE', r.qual, []);
      check('OTHERS-CATALOGUE', r.other, []);
      // "Crab and bushi characters": a Crab courtier and a Lion bushi qualify, a Lion courtier does not.
      check('OR-READING', r.or, [2, 2, 3]);
      check('IMPERIAL-FAMILY', r.fam, 1);
      check('LEFT-OUT', r.left, [null, null]);
      check('NO-ERRORS', p.errors, []);
    });

    // 2. The XP totals, read from the trunk's own field: cheaper Advantages, dearer Disadvantages.
    await scenario(browser, 'XP', ['ADV-DRAGON', 'ADV-OTHER', 'DISADV-LION', 'DISADV-OTHER', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(() => {
        const cp = window.__cp, delta = (o, name) => { cp.prep(o); const before = cp.remain(); cp.add(name); return cp.remain() - before; };
        return [delta({ clan: 'Dragon' }, 'Clear Thinker'), delta({ clan: 'Crab' }, 'Clear Thinker'), delta({ clan: 'Lion' }, 'Brash'), delta({ clan: 'Crab' }, 'Brash')];
      });
      check('ADV-DRAGON', r[0], -2);
      check('ADV-OTHER', r[1], -3);
      check('DISADV-LION', r[2], 4);
      check('DISADV-OTHER', r[3], 3);
      check('NO-ERRORS', p.errors, []);
    });

    // 2b. The sheet's own quick-add lists, the path the wizard's Advantages step also uses.
    await scenario(browser, 'QUICKADD', ['ADV', 'DISADV', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(() => {
        const cp = window.__cp, pick = (id, name) => { const s = document.getElementById(id); s.value = name; s.dispatchEvent(new Event('change', { bubbles: true })); };
        cp.prep({ clan: 'Dragon' }); pick('advQuickAdd', 'Clear Thinker'); const a = cp.row('Clear Thinker');
        cp.prep({ clan: 'Lion' }); pick('disadvQuickAdd', 'Brash'); const d = cp.row('Brash');
        return [a && [a.cost, a.state], d && [d.cost, d.state]];
      });
      check('ADV', r[0], [2, 'provisional']);
      check('DISADV', r[1], [4, 'provisional']);
      check('NO-ERRORS', p.errors, []);
    });

    // 2c. Uncentered (Book of Void p. 192): 2 points for Clan monks, 4 for Brotherhood monks.
    // Owner's ruling: a Clan monk holds a [Monk] School of a Clan; a Brotherhood monk a School of
    // the trunk's BROTHERHOOD_SCHOOL_LIBRARY. New purchases only: a saved row is never lowered.
    await scenario(browser, 'UNCENTERED', ['CLAN-MONK', 'TOGASHI', 'BROTHERHOOD', 'OLD-SAVE-KEPT', 'OLD-SAVE-NOTED', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(() => {
        const T = window.__L5R_TEST__, cp = window.__cp, out = {};
        const price = o => { cp.prep(o); cp.add('Uncentered'); return cp.row('Uncentered').cost; };
        out.kuni = price({ clan: 'Crab', schools: ['Kuni Witch-Hunter [Monk]'] });
        out.togashi = price({ clan: 'Dragon', schools: ['The Togashi Tattooed Order [Monk]'] });
        out.brotherhood = price({ schools: [T.BROTHERHOOD_SCHOOL_LIBRARY[0].name] });
        cp.prep({ clan: 'Crab', schools: ['Kuni Witch-Hunter [Monk]'] });
        const old = T.collectData(); old.adv = []; old.disadv = [{ name: 'Uncentered', cost: '4', desc: '' }];
        T.applyData(old); out.old = cp.row('Uncentered');
        return out;
      });
      check('CLAN-MONK', r.kuni, 2);
      check('TOGASHI', r.togashi, 2);
      check('BROTHERHOOD', r.brotherhood, 4);
      check('OLD-SAVE-KEPT', [r.old.cost, r.old.state], [4, 'fixed']);
      check('OLD-SAVE-NOTED', r.old.note, 'Fixed when bought: 4 XP. Book value now: 2 XP (Clan monk).');
      check('NO-ERRORS', p.errors, []);
    });

    // 3. A Management visit is the purchase (owner's ruling, 2 October 2026).
    await scenario(browser, 'VISIT', ['PROVISIONAL', 'SCHOOL-ADDED-AFTER', 'FOLLOWS-CLAN', 'FIXED-ON-PLAY', 'FIXED-STAYS',
      'NO-RETRO', 'NO-RETRO-NOTE', 'NEW-PURCHASE-ALL-SCHOOLS', 'WIZARD-FIXES', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(() => {
        const T = window.__L5R_TEST__, cp = window.__cp, out = {};
        cp.prep({ clan: 'Crane', schools: ['Doji Courtier'] }); cp.add('Strength of the Earth');
        out.prov = cp.row('Strength of the Earth');
        cp.schools(['Doji Courtier', 'Hida Bushi']); out.after = cp.row('Strength of the Earth').cost;
        cp.add('Clear Thinker'); document.getElementById('f_clan').value = 'Dragon'; T.recalcAll(); out.clan = cp.row('Clear Thinker').cost;
        T.MODES12.set('play'); out.play = cp.row('Strength of the Earth').state;
        T.MODES12.set('management'); cp.schools(['Doji Courtier']); out.stays = cp.row('Strength of the Earth').cost;
        // A courtier who bought it, then trains as a bushi in a later visit.
        cp.prep({ clan: 'Crane', schools: ['Doji Courtier'] }); cp.add('Strength of the Earth'); T.MODES12.set('play');
        T.MODES12.set('management'); cp.schools(['Doji Courtier', 'Hida Bushi']);
        out.retro = cp.row('Strength of the Earth'); cp.add('Crab Hands'); out.fresh = cp.row('Crab Hands').cost;
        cp.prep({ clan: 'Dragon' }); cp.add('Clear Thinker'); T.CW112.finish(); out.wizard = cp.row('Clear Thinker').state;
        return out;
      });
      check('PROVISIONAL', [r.prov.cost, r.prov.state], [3, 'provisional']);
      check('SCHOOL-ADDED-AFTER', r.after, 2);
      check('FOLLOWS-CLAN', r.clan, 2);
      check('FIXED-ON-PLAY', r.play, 'fixed');
      check('FIXED-STAYS', r.stays, 2);
      check('NO-RETRO', [r.retro.cost, r.retro.state], [3, 'fixed']);
      check('NO-RETRO-NOTE', /^Fixed when bought: 3 XP\. Book price now: 2 XP \(Bushi\)/.test(r.retro.note), true);
      check('NEW-PURCHASE-ALL-SCHOOLS', r.fresh, 2);
      check('WIZARD-FIXES', r.wizard, 'fixed');
      check('NO-ERRORS', p.errors, []);
    });

    // 4. A typed cost is kept and marked, in the visit and after it.
    await scenario(browser, 'TYPED', ['KEPT', 'MARKED', 'KEPT-AFTER-PLAY', 'NOTE-ON-PRICED-ROW', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(() => {
        const T = window.__L5R_TEST__, cp = window.__cp;
        cp.prep({ clan: 'Dragon' }); cp.add('Clear Thinker'); const priced = cp.row('Clear Thinker').note;
        cp.type('Clear Thinker', 7); const typed = cp.row('Clear Thinker');
        T.MODES12.set('play'); T.recalcAll();
        return { priced, typed, after: cp.row('Clear Thinker') };
      });
      check('KEPT', [r.typed.cost, r.typed.state], [7, 'typed']);
      check('MARKED', r.typed.note, 'Cost set by hand. Book price: 2 XP (Dragon).');
      check('KEPT-AFTER-PLAY', [r.after.cost, r.after.state], [7, 'typed']);
      check('NOTE-ON-PRICED-ROW', r.priced, 'Dragon price: 2 XP (catalogue 3) — fixed when you leave Management.');
      check('NO-ERRORS', p.errors, []);
    });

    // 5. Saving, opening, and a save from before this release.
    await scenario(browser, 'SAVE', ['RECORD-SAVED', 'RESTORED', 'OPEN-NOT-A-CHANGE', 'OLD-CATALOGUE-REPRICED', 'OLD-STARTING-SCHOOL',
      'OLD-STARTING-TYPE', 'OLD-CLAN-PRICE-KEPT', 'OLD-NOT-A-CHANGE', 'NO-ERRORS'], async (p, check) => {
      const r = await p.evaluate(() => {
        const T = window.__L5R_TEST__, cp = window.__cp, $ = id => document.getElementById(id), out = {};
        cp.prep({ clan: 'Dragon' }); cp.add('Clear Thinker');
        const data = T.collectData(); out.saved = ((data.adv || []).find(a => a.name === 'Clear Thinker') || {}).clanPrice || null;
        T.applyData(JSON.parse(JSON.stringify(data))); out.restored = cp.row('Clear Thinker');
        const a = JSON.stringify(T.collectData()); T.recalcAll(); out.stable = a === JSON.stringify(T.collectData());
        // An old save: no records. Dragon; started as a courtier, later a bushi too.
        cp.prep({ clan: 'Dragon', schools: ['Doji Courtier', 'Hida Bushi'] });
        const old = T.collectData();
        old.adv = [{ name: 'Clear Thinker', cost: '3', desc: '' }, { name: 'Strength of the Earth', cost: '3', desc: '' },
          { name: 'Read Lips', cost: '4', desc: '' }, { name: 'Large', cost: '3', desc: '' }];
        old.disadv = [];
        T.applyData(old);
        out.old = ['Clear Thinker', 'Strength of the Earth', 'Read Lips', 'Large'].map(n => { const x = cp.row(n); return [x.cost, x.state]; });
        const b = JSON.stringify(T.collectData()); T.recalcAll(); out.oldStable = b === JSON.stringify(T.collectData());
        return out;
      });
      check('RECORD-SAVED', r.saved && [r.saved.s, r.saved.v, r.saved.b], ['provisional', 2, 'Dragon']);
      check('RESTORED', [r.restored.cost, r.restored.state], [2, 'provisional']);
      check('OPEN-NOT-A-CHANGE', r.stable, true);
      check('OLD-CATALOGUE-REPRICED', r.old[0], [2, 'fixed']);
      check('OLD-STARTING-SCHOOL', r.old[1], [3, 'fixed']);
      check('OLD-STARTING-TYPE', r.old[2], [3, 'fixed']);
      // A Clan price on a character who does not qualify is never taken away: kept and marked.
      check('OLD-CLAN-PRICE-KEPT', r.old[3], [3, 'typed']);
      check('OLD-NOT-A-CHANGE', r.oldStable, true);
      check('NO-ERRORS', p.errors, []);
    });
  } finally {
    await browser.close().catch(() => {});
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
})().catch(e => { console.error(e); console.log(`0/${Math.max(results.length, 1)} checks passed`); process.exitCode = 1; });
