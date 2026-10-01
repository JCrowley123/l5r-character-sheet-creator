/*
 * BUGFIX — Ancestor Corrections (Void Offer, Info Button, Clan Picker): real-browser acceptance.
 * The input HTML is read only.
 *   node ancfix-harness.js <sheet.html> [--no-ancestors]
 *
 * Three corrections from the owner's iPhone check of 1 October 2026:
 *   VOID  check 4.23: with Seppun's (or Komori Iongi's) gift ticked, the roll preview offered "Make
 *         an Unskilled roll Skilled" on a Rank 1 Skill roll and on a Trait roll, because arming any
 *         Void option switches the gift off and so "changes" the roll. Oracle: the preview's own Void
 *         checkboxes, as the player sees them, and the dice of a real roll.
 *   INFO  check 4.1: the Ancestor's circled i is to be the one the A01-A16 Advantages carry. Oracle:
 *         a button carrying those Advantages' own classes (.dp4523-info, .named4513-info), placed
 *         where their buttons sit, measured with getComputedStyle; never the fix's stylesheet.
 *   CLAN  found the same day: the Ancestor list ignored a change of the Clan picker until the next
 *         recalculation. Oracle: the Ancestor picker's first group, read straight after a change
 *         event on the picker and nothing else.
 * --no-ancestors  Phase 4.8's Ancestors switched off: no card and no gifts. The fix must then change
 *                 nothing and break nothing: the ordinary Void offers stand and the Clan pickers raise
 *                 no error.
 * Every scenario has its own page and setup, and declares its assertion identities first, so an
 * exception fails what it did not reach.
 */
'use strict';
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const sheet = process.argv[2];
const noAncestors = process.argv.includes('--no-ancestors');
const results = [];
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
function record(id, actual, expected, detail = '') {
  if (results.some(r => r.id === id)) throw new Error('duplicate assertion ' + id);
  const pass = same(actual, expected);
  results.push({ id, pass });
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : '\n expected ' + JSON.stringify(expected)
    + '\n actual ' + JSON.stringify(actual) + (detail ? '\n ' + detail : '')));
}
async function scenario(browser, prefix, names, run) {
  const ids = names.map(n => 'AC-' + prefix + '-' + n);
  const check = (n, a, e = true, detail = '') => {
    const id = 'AC-' + prefix + '-' + n;
    if (!ids.includes(id)) throw new Error('undeclared assertion ' + id);
    record(id, a, e, detail);
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
  await page.route('https://fonts.googleapis.com/**', r => r.abort());
  await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.goto(pathToFileURL(path.resolve(sheet)).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => { const T = window.__L5R_TEST__; return !!T && !!window.__L5R_CAROUSEL__?.isReady?.()
    && (!T.CL11 || T.CL11.ready || T.CL11.enabled() === false); }, null, { timeout: 60000 });
  await page.evaluate(() => window.__L5R_TEST__.CL11?.close?.());
  await page.waitForTimeout(150);
  return page;
}

// A fresh character with two Void Points, outside combat; optionally a Clan, Family and Ancestor.
const setup = (p, o = {}) => p.evaluate(async o => {
  const T = window.__L5R_TEST__, $ = id => document.getElementById(id);
  T.resetToBaseline();
  $('f_clan').value = o.clan || '';
  $('f_family').value = o.family || '';
  T.setVoidPending({}); T.resetCombatRound(); T.setCombatActive(false);
  T.recalcAll();
  $('void_current').value = '2'; T.renderVoidPips();
  if (o.ancestor) { await T.ANC48.choose(o.ancestor); T.recalcAll(); }
}, o);
const voids = p => p.evaluate(() => parseInt(document.getElementById('void_current').value, 10));
// Opens a REAL roll preview through the sheet's own pipeline. The roll is left pending: its promise
// comes back inside an object, because an async function returning a promise would wait for it.
async function preview(p, kind, ctx, base) {
  const pending = p.evaluate(({ kind, ctx, base }) => { const T = window.__L5R_TEST__;
    return T.rollWithModifiers('Ancestor correction check', T.makeRollContext(T.ROLL_KINDS[kind], ctx), base[0], base[1]).then(r => !!r); },
  { kind, ctx, base });
  pending.catch(() => {});
  await p.waitForSelector('#rollPreviewGo', { state: 'visible' });
  return { pending };
}
const offers = p => p.evaluate(() => [...document.querySelectorAll('#rollPreviewBody input[data-void-key]')].map(i => i.getAttribute('data-void-key')));
const gift = (p, key) => p.locator('#rollPreviewBody input[data-rd4515-key="ancestors:' + key + '"]');
async function cancel(p, roll) { await p.locator('#rollPreviewCancel').click(); await roll.pending; await p.waitForTimeout(60); }
const SKILLED = ['SKILL', { skillName: 'Battle', traitName: 'Perception', skillRank: 1 }, [4, 3]];
const UNSKILLED = ['SKILL', { skillName: 'Hunting', traitName: 'Perception', skillRank: 0, unskilled: true }, [3, 3]];
const TRAIT = ['TRAIT', { traitName: 'Awareness' }, [2, 2]];
async function offersFor(p, roll, tick) {
  const open = await preview(p, ...roll);
  if (tick) { await gift(p, tick).check(); await p.waitForTimeout(60); }
  const list = await offers(p);
  await cancel(p, open);
  return list;
}
// The Ancestor picker's first group, read with nothing but the change event having happened.
const firstGroup = p => p.evaluate(() => { const g = document.querySelector('#anc48Pick optgroup'); return g ? g.label : null; });
const pick = (p, id, value) => p.evaluate(({ id, value }) => { const s = document.getElementById(id);
  s.value = value; s.dispatchEvent(new Event('change', { bubbles: true })); return s.value; }, { id, value });

(async () => {
  const browser = await chromium.launch(process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {});
  try {
    // 1. Without an Ancestor, the preview's offers are what they always were.
    await scenario(browser, 'VOID-NONE', ['SKILLED', 'UNSKILLED', 'TRAIT', 'NO-ERRORS'], async (p, check) => {
      await setup(p);
      check('SKILLED', await offersFor(p, SKILLED), ['k1']);
      check('UNSKILLED', await offersFor(p, UNSKILLED), ['k1', 'skill']);
      check('TRAIT', await offersFor(p, TRAIT), ['k1']);
      check('NO-ERRORS', p.errors, []);
    });

    if (noAncestors) {
      // With no Ancestors there is nothing to correct, and the fix must leave the pickers alone.
      await scenario(browser, 'ABSENT', ['NO-CARD', 'PICKERS', 'NO-ERRORS'], async (p, check) => {
        await setup(p);
        check('NO-CARD', await p.evaluate(() => !document.getElementById('anc48Section')), true);
        await pick(p, 'cfs_clan', 'Imperial');
        await pick(p, 'cfs_clan', 'Minor Clan');
        check('PICKERS', [await pick(p, 'cfs_minorClan', 'Mantis'), await p.evaluate(() => document.getElementById('cfs_clan').value)],
          ['Mantis', 'Minor Clan']);
        check('NO-ERRORS', p.errors, []);
      });
    } else {

    // 2. Seppun: the owner's case (check 4.23), then the same on a Trait roll and an unskilled roll.
    await scenario(browser, 'VOID-SEPPUN', ['BEFORE-TICK', 'SKILLED', 'TRAIT', 'UNSKILLED-KEEPS-SKILL', 'UNTICK',
      'ROLL-TAKES-GIFT', 'NO-ERRORS'], async (p, check) => {
      await setup(p, { clan: 'Imperial', family: 'Seppun', ancestor: 'Seppun' });
      check('BEFORE-TICK', await offersFor(p, SKILLED), ['k1']);
      check('SKILLED', await offersFor(p, SKILLED, 'seppun-void'), []);
      check('TRAIT', await offersFor(p, TRAIT, 'seppun-void'), []);
      // A real trade on an unskilled roll: making it Skilled costs the gift but does something.
      check('UNSKILLED-KEEPS-SKILL', await offersFor(p, UNSKILLED, 'seppun-void'), ['skill']);
      let open = await preview(p, ...SKILLED);
      await gift(p, 'seppun-void').check(); await p.waitForTimeout(40);
      await gift(p, 'seppun-void').uncheck(); await p.waitForTimeout(40);
      check('UNTICK', await offers(p), ['k1']);
      await cancel(p, open);
      // The gift itself still works: a Void Point's +1k1, and no Void Point spent.
      open = await preview(p, ...SKILLED);
      await gift(p, 'seppun-void').check(); await p.waitForTimeout(40);
      await p.locator('#rollPreviewGo').click();
      await open.pending;
      await p.waitForSelector('#rollDiceRow .roll-die');
      check('ROLL-TAKES-GIFT', [await p.evaluate(() => [document.querySelectorAll('#rollDiceRow .roll-die').length,
        document.querySelectorAll('#rollDiceRow .roll-die.kept').length]), await voids(p)], [[5, 4], 2]);
      check('NO-ERRORS', p.errors, []);
    });

    // 3. Komori Iongi's gift is the same kind: a Void Point's +1k1.
    await scenario(browser, 'VOID-IONGI', ['SKILLED', 'NO-ERRORS'], async (p, check) => {
      await setup(p, { clan: 'Bat', ancestor: 'Komori Iongi' });
      check('SKILLED', await offersFor(p, ['SKILL', { skillName: 'Courtier', traitName: 'Awareness', skillRank: 1 }, [3, 2]], 'iongi-void'), []);
      check('NO-ERRORS', p.errors, []);
    });

    // 4. The Ancestor's i against the A01-A16 Advantages' own info button.
    await scenario(browser, 'INFO', ['REFERENCES-AGREE', 'BOX', 'COLOUR', 'GLYPH', 'NO-TEXT', 'FITS', 'OPENS', 'NO-ERRORS'], async (p, check) => {
      await setup(p);
      const m = await p.evaluate(() => {
        const host = document.getElementById('advList').parentElement;
        const ref = cls => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = 'i';
          host.appendChild(b); return b; };
        const box = el => { const c = getComputedStyle(el); return { w: c.width, h: c.height, bw: c.borderTopWidth, bs: c.borderTopStyle, r: c.borderTopLeftRadius }; };
        const colour = el => { const c = getComputedStyle(el); return { color: c.color, ring: c.borderTopColor }; };
        const glyph = (el, pseudo) => { const b = getComputedStyle(el), g = getComputedStyle(el, pseudo);
          return { family: b.fontFamily, size: b.fontSize, style: g.fontStyle, weight: g.fontWeight }; };
        const a = ref('dp4523-info'), n = ref('named4513-info');
        const anc = document.getElementById('anc48Info');
        const out = { refs: [box(a), colour(a), glyph(a, null)], refs2: [box(n), colour(n), glyph(n, null)],
          box: [box(anc), box(a)], colour: [colour(anc), colour(a)], glyph: [glyph(anc, '::after'), glyph(a, null)],
          text: document.querySelector('#anc48Section .anc48-head').textContent.replace(/\s+/g, ' ').trim(),
          after: getComputedStyle(anc, '::after').content };
        a.remove(); n.remove();
        return out;
      });
      check('REFERENCES-AGREE', m.refs, m.refs2);
      check('BOX', m.box[0], m.box[1]);
      check('COLOUR', m.colour[0], m.colour[1]);
      check('GLYPH', m.glyph[0], m.glyph[1]);
      // The heading's words and nothing more: the i is drawn by the stylesheet, so the button adds no text.
      check('NO-TEXT', [m.text, m.after], ['Ancestoroptional', '"i"']);
      // On Clan & School at phone width the heading still fits its row.
      const fits = await p.evaluate(() => { const h = document.querySelector('#anc48Section .anc48-head');
        const i = document.getElementById('anc48Info').getBoundingClientRect(), s = document.getElementById('anc48Section').getBoundingClientRect();
        return h.scrollWidth <= h.clientWidth + 1 && i.right <= s.right + 1; });
      check('FITS', fits, true);
      await p.evaluate(() => document.getElementById('anc48Info').click());
      await p.waitForTimeout(80);
      check('OPENS', await p.evaluate(() => getComputedStyle(document.getElementById('stanceInfoOverlay')).display !== 'none'
        && /Loyalty/.test(document.getElementById('stanceInfoBody').textContent)), true);
      check('NO-ERRORS', p.errors, []);
    });

    // 5. The Ancestor list follows the Clan picker before a Family is applied.
    await scenario(browser, 'CLAN', ['IMPERIAL', 'RONIN', 'MINOR-CLAN', 'MINOR-PICKER-ONLY', 'CHOICE-KEPT', 'APPLIED-WINS', 'NO-ERRORS'], async (p, check) => {
      await setup(p);
      await pick(p, 'cfs_clan', 'Imperial');
      check('IMPERIAL', await firstGroup(p), 'Imperial families');
      await pick(p, 'cfs_clan', 'Ronin');
      check('RONIN', await firstGroup(p), 'Ronin');
      await pick(p, 'cfs_clan', 'Minor Clan');
      await pick(p, 'cfs_minorClan', 'Badger');
      check('MINOR-CLAN', await firstGroup(p), 'Badger Clan');
      await pick(p, 'cfs_minorClan', 'Mantis');
      check('MINOR-PICKER-ONLY', await firstGroup(p), 'Mantis Clan');
      // A chosen Ancestor is not dropped by the redraw.
      await p.evaluate(async () => { await window.__L5R_TEST__.ANC48.choose('Gusai'); });
      const before = await p.evaluate(() => document.getElementById('f_ancestor').value);
      await pick(p, 'cfs_minorClan', 'Badger');
      check('CHOICE-KEPT', [await p.evaluate(() => document.getElementById('f_ancestor').value), /Gusai/.test(before)], [before, true]);
      // Once a Family is applied, its Clan decides, whatever the picker then shows.
      await setup(p);
      await pick(p, 'cfs_clan', 'Crab');
      await pick(p, 'cfs_family', 'Hida');
      await p.evaluate(() => document.getElementById('cfs_applyFamily').click());
      await pick(p, 'cfs_clan', 'Crane');
      check('APPLIED-WINS', await firstGroup(p), 'Crab Clan');
      check('NO-ERRORS', p.errors, []);
    });
    }
  } finally {
    await browser.close().catch(() => {});
  }
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length && results.length > 0 ? 0 : 1;
})().catch(e => { console.error(e); console.log(`0/${Math.max(results.length, 1)} checks passed`); process.exitCode = 1; });
