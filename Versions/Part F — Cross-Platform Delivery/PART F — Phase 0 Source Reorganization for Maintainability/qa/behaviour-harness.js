/* =============================================================================
   PHASE 0 — BEHAVIOURAL PARITY HARNESS

   Drives a real browser against a built single-file sheet and writes what it
   observes to JSON. The roadmap names four representative flows for this phase
   -- character load, a roll, a wound change, a tab switch -- and each has a
   step below.

     NODE_PATH=$(npm root -g) node behaviour-harness.js <file.html> > out.json

   The point is PARITY, not absolute correctness. Run it against the pre-split
   deliverable, run it again against the recombined output, diff the two JSON
   files: anything that differs is a regression the split introduced.

   Two design choices make that diff trustworthy:

   1. Dice are pinned. Math.random is replaced with a seeded PRNG before any
      page script runs, so every roll is reproducible run-to-run and build-to-
      build. Without this the roll flow would differ on every run and the diff
      would be worthless.

   2. The snapshot is generic, not hand-picked. Rather than assert on a chosen
      dozen fields -- which only ever catches what the author thought to list --
      it records the state of EVERY element carrying an id. That is ~228
      elements, so any stray behavioural change anywhere in the sheet shows up
      as a diff line rather than slipping past an assertion that was never
      written.

   Reads only. Never writes to the file it is given.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

/* Injected before any page script. mulberry32 -- small, fast, and identical
   across runs given the same seed. */
const SEED_RANDOM = `
(() => {
  let a = 0x9E3779B9;
  Math.random = function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();
`;

/* Snapshot every element with an id. Values are truncated: a few nodes hold
   the whole serialized character and would otherwise dominate the diff without
   telling us anything a hash does not. */
/* NB: these are passed to page.evaluate as STRINGS, so each must be an
   expression that produces the value we want -- an IIFE. A bare arrow function
   would evaluate to a function object, which is not serializable, and every
   snapshot would silently come back undefined. */
const SNAPSHOT = `(() => {
  const out = {};

  // Long values are clipped so the JSON stays readable, but a clipped preview
  // alone would compare equal for two different strings that happen to share a
  // prefix and a length. Every clipped value therefore carries a hash of the
  // FULL text, so the parity diff is exact even where the preview is not.
  const hash = (s) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(16);
  };
  const clip = (s) => {
    s = (s == null) ? '' : String(s);
    if (s.length <= 160) return s;
    return s.slice(0, 160) + '\\u2026[len=' + s.length + ' h=' + hash(s) + ']';
  };

  for (const el of document.querySelectorAll('[id]')) {
    const rec = { tag: el.tagName.toLowerCase() };
    if ('value'   in el) rec.value   = clip(el.value);
    if ('checked' in el) rec.checked = el.checked;
    if (el.tagName === 'SELECT') rec.options = el.options.length;
    if (!('value' in el)) rec.text = clip((el.textContent || '').trim());
    if (el.hidden) rec.hidden = true;
    out[el.id] = rec;
  }
  return out;
})()`;

const SEAM_KEYS = `(() => ({
  test:     window.__L5R_TEST__     ? Object.keys(window.__L5R_TEST__).sort()     : null,
  carousel: window.__L5R_CAROUSEL__ ? Object.keys(window.__L5R_CAROUSEL__).sort() : null,
}))()`;

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: node behaviour-harness.js <file.html>');
    process.exit(2);
  }

  const out = { file, flows: {}, pageErrors: [], consoleErrors: [] };

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  page.on('pageerror', (e) => out.pageErrors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') out.consoleErrors.push(m.text());
  });

  await page.addInitScript(SEED_RANDOM);
  await page.goto(pathToFileURL(path.resolve(file)).href, { waitUntil: 'load' });
  await page.waitForTimeout(800);           // the sheet's init is async

  const snap = () => page.evaluate(SNAPSHOT);

  /* ---- FLOW 1: character load ------------------------------------------ */
  out.flows['01_boot'] = await snap();
  out.seams = await page.evaluate(SEAM_KEYS);

  /* ---- FLOW 2: identity, through the sheet's own picker ----------------- */
  await page.fill('#f_name', 'Phase0 Baseline');
  await page.waitForTimeout(150);
  out.flows['02_name_set'] = await snap();

  out.flows['03_clan_pick'] = await page.evaluate(async () => {
    const sel = document.getElementById('cfs_clan');
    if (!sel) return { error: 'no cfs_clan' };
    const clans = Array.from(sel.options).map((o) => o.value).filter(Boolean);
    const chosen = clans.includes('Dragon') ? 'Dragon' : clans[0];
    sel.value = chosen;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    return { clans, chosen };
  });
  await page.waitForTimeout(400);
  out.flows['04_after_clan'] = await snap();

  /* ---- FLOW 3: a roll, through the published test seam ------------------ */
  out.flows['05_rolls'] = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    if (!T) return { error: 'no __L5R_TEST__' };
    const res = {};
    const call = (label, fn) => {
      try { res[label] = fn(); } catch (e) { res[label] = 'THREW: ' + e.message; }
    };
    // Seeded Math.random makes each of these deterministic.
    call('pool_5k3',       () => T.rollDicePool && T.rollDicePool(5, 3));
    call('pool_10k4',      () => T.rollDicePool && T.rollDicePool(10, 4));
    call('tenDice_12k5',   () => T.applyTenDiceRule && T.applyTenDiceRule(12, 5));
    call('tenDice_7k7',    () => T.applyTenDiceRule && T.applyTenDiceRule(7, 7));
    call('notation_6k3',   () => T.formatRollNotation && T.formatRollNotation(6, 3));
    call('exploding_at10', () => T.rollExplodingD10At && T.rollExplodingD10At(10));
    call('exploding_at9',  () => T.rollExplodingD10At && T.rollExplodingD10At(9));
    call('findSkill_Kenjutsu', () => T.findSkill && !!T.findSkill('Kenjutsu'));
    call('skillLibrarySize',   () => T.SKILL_LIBRARY && T.SKILL_LIBRARY.length);
    call('weaponLibrarySize',  () => T.WEAPON_LIBRARY && T.WEAPON_LIBRARY.length);
    call('kihoLibrarySize',    () => T.KIHO_LIBRARY && T.KIHO_LIBRARY.length);
    call('schemaVersion',      () => T.SHEET_SCHEMA_VERSION);
    return res;
  });

  /* ---- FLOW 4: wound changes ------------------------------------------- */
  // Wounds feed a TN penalty into the shared pre-roll pipeline, so each step
  // exercises classification and its knock-on to the combat readouts together.
  for (const taken of ['0', '5', '12', '25', '60']) {
    await page.evaluate((v) => {
      const el = document.getElementById('f_woundsTaken');
      if (!el) return;
      el.value = v;
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, taken);
    await page.waitForTimeout(220);
    out.flows[`06_wounds_${taken}`] = await snap();
  }

  /* ---- FLOW 5: tab switching, through the carousel's own API ------------ */
  out.flows['07_carousel'] = await page.evaluate(async () => {
    const C = window.__L5R_CAROUSEL__;
    if (!C) return { error: 'no __L5R_CAROUSEL__' };

    // getActiveTab() hands back live DOM nodes alongside the useful fields.
    // Nodes are not serializable and would land in the JSON as "ref: <Node>",
    // so keep only what identifies the tab.
    const plain = (t) => (t ? { index: t.index, label: t.label, slug: t.slug } : null);

    // nextTab() reports the tab being navigated TO; `current` only commits once
    // the track settles. whenSettled() is the seam's own answer to that, so use
    // it rather than racing a fixed timeout.
    const settle = () => (C.whenSettled ? C.whenSettled(2000)
                                        : new Promise((r) => setTimeout(r, 300)));

    const rec = { version: C.version, start: plain(C.getActiveTab && C.getActiveTab()), visits: [] };
    for (let i = 0; i < 6; i++) {
      const to = C.nextTab && C.nextTab();
      await settle();
      rec.visits.push({
        step: i,
        requested: plain(to),
        active: plain(C.getActiveTab && C.getActiveTab()),
      });
    }
    if (C.goToTab) { C.goToTab(0); await settle(); }
    rec.afterGoToZero = plain(C.getActiveTab && C.getActiveTab());
    return rec;
  });
  await page.waitForTimeout(300);
  out.flows['08_after_tabs'] = await snap();

  /* ---- FLOW 6: save/load round-trip ------------------------------------ */
  // collectData/applyData is the persistence path Phase 7 builds on; a split
  // that disturbed field wiring would show up here first.
  out.flows['09_roundtrip'] = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    if (!T || !T.collectData || !T.applyData) return { error: 'no collect/apply' };
    try {
      const before = T.collectData();
      T.applyData(before);
      const after = T.collectData();
      const bs = JSON.stringify(before), as = JSON.stringify(after);
      return {
        keys: Object.keys(before).length,
        bytes: bs.length,
        stableAcrossRoundTrip: bs === as,
      };
    } catch (e) { return { error: String(e) }; }
  });
  out.flows['10_final'] = await snap();

  await browser.close();
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
