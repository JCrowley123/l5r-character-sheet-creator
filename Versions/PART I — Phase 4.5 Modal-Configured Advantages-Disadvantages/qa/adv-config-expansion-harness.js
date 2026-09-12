/* =============================================================================
   PART I PHASE 4.5 — VARIABLE-ADVANTAGE COMPLETION PASS — QA HARNESS

     NODE_PATH=<Playwright modules> L5R_CHROME=<Chrome executable> node \
       qa/adv-config-expansion-harness.js <built-sheet.html>

   This suite is intentionally a browser-facing companion to adv-config-harness.js.
   The original suite remains the regression oracle for the previously shipped Phase 4.5
   entries; this one drives the new multi-step choices through the same modal a player sees,
   then checks the sheet-owned XP field, preview, result modal, persistence payload, and
   generated-equipment ownership.  It does not replace the original suite.

   The handful of numeric contracts below come from the user-approved Phase 4.5 completion
   scope, rather than reading back the implementation's schema.  That keeps an accidentally
   edited option, cost, or clan profile able to fail this harness.
   ============================================================================= */

'use strict';

const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

const LAUNCH = process.env.L5R_CHROME ? { executablePath: process.env.L5R_CHROME } : {};
const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};
// JSON object key order is an implementation detail of dataset serialization. Preserve array
// order (it matters for option ladders), but compare object shapes independent of insertion order.
const canonical = (value) => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.keys(value).sort().reduce((out, key) => {
    out[key] = canonical(value[key]);
    return out;
  }, {});
  return value;
};
const same = (name, actual, expected) => {
  const pass = JSON.stringify(canonical(actual)) === JSON.stringify(canonical(expected));
  record(name, pass, pass ? JSON.stringify(actual) : `got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
};
const truth = (name, value, detail) => record(name, !!value, detail || (value ? '' : 'expected true'));

// Independent, user-approved configuration contracts. Do not read the schema under test here.
const GENTRY_LADDER = [
  ['Village', 8], ['Large Village', 15], ['Unique Holding', 18],
  ['Town', 20], ['City', 25], ['Province', 30],
];
const SACRED_WEAPONS = {
  Crab: ['kaiu-blade', 'Kaiu Blade', 6, 1],
  Crane: ['kakita-blade', 'Kakita Blade', 5, 1],
  Dragon: ['twin-sister-blades', 'Twin Sister Blades', 3, 2],
  Lion: ['akodo-blade', 'Akodo Blade', 6, 1],
  Mantis: ['storm-kama', 'Storm Kama', 6, 2],
  Phoenix: ['inquisitors-strike', 'Inquisitor’s Strike', 6, 1],
  Scorpion: ['shosuro-blade', 'Shosuro Blade', 5, 1],
  Spider: ['black-steel-blade', 'Black Steel Blade', 6, 1],
  Unicorn: ['moto-scimitar', 'Moto Scimitar', 6, 1],
};

const reset = (page) => page.evaluate(() => {
  const T = window.__L5R_TEST__;
  T.resetToBaseline();
  T.recalcAll();
});

const setClan = (page, clan) => page.evaluate((clanName) => {
  const input = document.getElementById('f_clan');
  input.value = clanName;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  window.__L5R_TEST__.recalcAll();
}, clan);

// Uses the real library dropdown. A variable entry opens the existing modal immediately.
const addFromLibrary = (page, name) => page.evaluate((entryName) => {
  const sel = document.getElementById('advQuickAdd');
  const option = Array.from(sel.options).find((o) => o.value === entryName);
  if (!option) return { ok: false, reason: `missing library option ${entryName}` };
  sel.value = entryName;
  sel.dispatchEvent(new Event('change', { bubbles: true }));
  return { ok: true, index: document.querySelectorAll('#advList .entry').length - 1 };
}, name);

const modalState = (page) => page.evaluate(() => {
  const overlay = document.getElementById('advConfigModalOverlay');
  return {
    visible: !!overlay && overlay.style.display !== 'none',
    title: document.getElementById('advConfigTitle').textContent.trim(),
    confirm: document.getElementById('advConfigConfirm').textContent.trim(),
    text: document.getElementById('advConfigGrid').textContent.replace(/\s+/g, ' ').trim(),
  };
});

const chooseModalValue = (page, value) => page.evaluate((wanted) => {
  const item = Array.from(document.querySelectorAll('#advConfigGrid .affinity-pick-item'))
    .find((node) => node.dataset.value === String(wanted));
  if (!item) return { ok: false, reason: `option not offered: ${wanted}` };
  const box = item.querySelector('input[type="checkbox"]');
  box.checked = true;
  box.dispatchEvent(new Event('change', { bubbles: true }));
  return { ok: true };
}, value);

const writeModalText = (page, text) => page.evaluate((value) => {
  const input = document.getElementById('advConfigFreeText');
  if (!input) return false;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}, text);

const confirmModal = (page) => page.evaluate(() => {
  const button = document.getElementById('advConfigConfirm');
  if (!button) return false;
  button.click();
  return true;
});

const entrySnapshot = (page, index = 0) => page.evaluate((entryIndex) => {
  const entry = document.querySelectorAll('#advList .entry')[entryIndex];
  if (!entry) return null;
  const config = entry.dataset.advConfig ? JSON.parse(entry.dataset.advConfig) : null;
  const row = entry.querySelector('.adv-config-row');
  return {
    name: entry.querySelector('.en-name').value,
    cost: entry.querySelector('.en-cost').value,
    config,
    rowText: row ? row.textContent.replace(/\s+/g, ' ').trim() : '',
    unconfigured: !!row && row.classList.contains('unconfigured'),
    badges: Array.from(entry.querySelectorAll('.adv-config-badge')).map((node) => node.textContent.trim()),
  };
}, index);

const xpSpent = (page) => page.evaluate(() => Number(document.getElementById('f_xpSpent').value || 0));

async function configureAllies(page, influence, devotion) {
  const added = await addFromLibrary(page, 'Allies');
  if (!added.ok) return added;
  const first = await modalState(page);
  const pickOne = await chooseModalValue(page, influence);
  await confirmModal(page);
  const second = await modalState(page);
  const pickTwo = await chooseModalValue(page, devotion);
  await confirmModal(page);
  return { ok: pickOne.ok && pickTwo.ok, first, second, index: added.index };
}

async function configureGentry(page, holding) {
  const added = await addFromLibrary(page, 'Gentry');
  if (!added.ok) return added;
  const state = await modalState(page);
  const picked = await chooseModalValue(page, holding);
  await confirmModal(page);
  return { ok: picked.ok, state, index: added.index };
}

async function configureRank(page, name, rankLabel) {
  const added = await addFromLibrary(page, name);
  if (!added.ok) return added;
  const state = await modalState(page);
  const picked = await chooseModalValue(page, rankLabel);
  await confirmModal(page);
  return { ok: picked.ok, state, index: added.index };
}

async function configureKharmic(page, target, rankLabel) {
  const added = await addFromLibrary(page, 'Kharmic Tie');
  if (!added.ok) return added;
  const targetModal = await modalState(page);
  const wrote = await writeModalText(page, target);
  await confirmModal(page);
  const rankModal = await modalState(page);
  const picked = await chooseModalValue(page, rankLabel);
  await confirmModal(page);
  return { ok: wrote && picked.ok, targetModal, rankModal, index: added.index };
}

async function configureLanguage(page, type, language) {
  const added = await addFromLibrary(page, 'Languages');
  if (!added.ok) return added;
  const typeModal = await modalState(page);
  const picked = await chooseModalValue(page, type);
  await confirmModal(page);
  const languageModal = await modalState(page);
  const wrote = await writeModalText(page, language);
  await confirmModal(page);
  return { ok: picked.ok && wrote, typeModal, languageModal, index: added.index };
}

async function configureSkill(page, skill) {
  const added = await addFromLibrary(page, 'Great Potential');
  if (!added.ok) return added;
  const state = await modalState(page);
  const wrote = await writeModalText(page, skill);
  await confirmModal(page);
  return { ok: wrote, state, index: added.index };
}

const closeResultModal = (page) => page.evaluate(() => {
  const overlay = document.getElementById('rollModalOverlay');
  if (overlay) overlay.style.display = 'none';
});

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: node adv-config-expansion-harness.js <built-sheet.html>');
    process.exit(2);
  }

  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  await page.goto(pathToFileURL(path.resolve(file)).href, { waitUntil: 'commit' });
  await page.waitForFunction(() => !!window.__L5R_TEST__, null, { timeout: 30000 });

  const present = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    return !!T && typeof T.resolveExtendedAdvConfigEffect === 'function' &&
      typeof T.advConfigKharmicEntries === 'function' &&
      typeof T.advConfigLuckEntries === 'function' &&
      typeof T.ensureAdvConfigSacredWeapon === 'function';
  });
  if (!present) {
    record('the Phase 4.5 completion-pass modules export their guarded test seams', false, 'one or more completion modules absent');
    console.log('\n0/1 checks passed');
    await browser.close();
    process.exit(1);
  }

  console.log('\nPART I PHASE 4.5 — Variable-Advantage Completion Pass\n');

  // -----------------------------------------------------------------------
  // Schema / resolver contract. The values checked here do not come from
  // the schema itself, so an edited configuration ladder fails visibly.
  // -----------------------------------------------------------------------
  await reset(page);
  await setClan(page, 'Crane');
  same('the completion pass registers the five requested new schema shapes',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      return [
        T.advConfigSchemaFor('Allies').type,
        T.advConfigSchemaFor('Kharmic Tie').type,
        T.advConfigSchemaFor('Languages').type,
        T.advConfigSchemaFor('Great Potential').type,
        T.advConfigSchemaFor('Sacred Weapon').type,
      ];
    }), ['dualTierPick', 'rankPick', 'languagePick', 'skillPick', 'clanWeaponAutoPick']);

  same('Allies computes both selected tiers and the Crane discount with a minimum cost of one',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const normal = T.resolveAdvDisadvEffect('Allies', { type: 'dualTierPick', influence: 4, devotion: 2 });
      const floor = T.resolveAdvDisadvEffect('Allies', { type: 'dualTierPick', influence: 1, devotion: 1 });
      return [normal && normal.cost, floor && floor.cost];
    }), [5, 1]);

  same('Gentry exposes the approved holding ladder, including all intermediate tiers',
    await page.evaluate(() => window.__L5R_TEST__.ADV_CONFIG_GENTRY_OPTIONS.map((o) => [o.label, o.cost])),
    GENTRY_LADDER);

  same('ranked resources resolve their approved costs and ranks',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const sample = (name, value) => {
        const e = T.resolveAdvDisadvEffect(name, value);
        return e && [e.effect, e.rank, e.cost];
      };
      return [
        sample('Kharmic Tie', { type: 'rankPick', value: 'Rank 5', rank: 5, target: 'Aiko', remaining: 5 }),
        sample('Luck', { type: 'rankPick', value: 'Rank 3', rank: 3, remaining: 3 }),
        sample('Magic Resistance', { type: 'rankPick', value: 'Rank 2', rank: 2 }),
      ];
    }), [['kharmicTie', 5, 5], ['luck', 3, 9], ['magicResistanceReminder', 2, 4]]);

  // -----------------------------------------------------------------------
  // Modal / XP / badge flows. Each runs through the live quick-add select
  // and the existing picker host; no direct configuration writes occur here.
  // -----------------------------------------------------------------------
  await reset(page);
  await setClan(page, 'Crane');
  const alliesStart = await xpSpent(page);
  const allies = await configureAllies(page, 4, 2);
  truth('Allies opens Influence then Devotion in the shared modal',
    allies.ok && allies.first.visible && allies.first.title === 'Allies — Influence' &&
    allies.first.confirm === 'Next' && allies.second.visible && allies.second.title === 'Allies — Devotion' &&
    allies.second.confirm === 'Confirm');
  same('Allies writes its dual-tier object and its discounted cost field through the UI',
    await entrySnapshot(page), {
      name: 'Allies', cost: '5',
      config: { type: 'dualTierPick', influence: 4, devotion: 2, value: 'Influence 4 / Devotion 2' },
      rowText: 'Influence 4 + Devotion 2 — 5 points (Crane discount −1)Change',
      unconfigured: false, badges: [],
    });
  same('Allies changes only its own XP contribution', (await xpSpent(page)) - alliesStart, 5);

  await reset(page);
  const gentryStart = await xpSpent(page);
  const gentry = await configureGentry(page, 'Province');
  truth('Gentry uses the shared modal and offers the longest approved tier',
    gentry.ok && gentry.state.visible && gentry.state.text.includes('Province'));
  same('Gentry writes Province at 30 points and no silent default remains',
    await entrySnapshot(page), {
      name: 'Gentry', cost: '30', config: { type: 'severityTier', value: 'Province' },
      rowText: 'Province — 30 pointsChange', unconfigured: false, badges: [],
    });
  same('Gentry contributes exactly its selected tier to XP', (await xpSpent(page)) - gentryStart, 30);

  await reset(page);
  const kharmicStart = await xpSpent(page);
  const kharmic = await configureKharmic(page, 'Aiko', 'Rank 3');
  truth('Kharmic Tie collects the target first and Rank second in the shared modal',
    kharmic.ok && kharmic.targetModal.visible && kharmic.targetModal.title === 'Kharmic Tie — Target' &&
    kharmic.targetModal.confirm === 'Next' && kharmic.rankModal.visible && kharmic.rankModal.confirm === 'Confirm');
  const kharmicUI = await entrySnapshot(page);
  truth('Kharmic Tie displays the target badge and a reset-session control',
    kharmicUI.badges.includes('Target: Aiko') && kharmicUI.rowText.includes('Reset session'));
  same('Kharmic Tie starts with one persistent use per selected Rank and charges its Rank',
    { cost: kharmicUI.cost, target: kharmicUI.config.target, rank: kharmicUI.config.rank, remaining: kharmicUI.config.remaining,
      hasSourceId: typeof kharmicUI.config.sourceId === 'string' && kharmicUI.config.sourceId.startsWith('kharmic-') },
    { cost: '3', target: 'Aiko', rank: 3, remaining: 3, hasSourceId: true });
  same('Kharmic Tie changes only its own XP contribution', (await xpSpent(page)) - kharmicStart, 3);

  await reset(page);
  const languagesStart = await xpSpent(page);
  const languages = await configureLanguage(page, 'Non-human', 'Naga');
  truth('Languages asks for type then a specific free-text language in the shared modal',
    languages.ok && languages.typeModal.visible && languages.typeModal.confirm === 'Next' &&
    languages.languageModal.visible && languages.languageModal.text.includes('Specific language'));
  const languageUI = await entrySnapshot(page);
  same('Languages stores type and free text, displays the badge, and charges 3 XP',
    { cost: languageUI.cost, config: languageUI.config, badge: languageUI.badges[0] },
    { cost: '3', config: { type: 'languagePick', value: 'Non-human: Naga', languageType: 'Non-human', language: 'Naga' }, badge: 'Non-human: Naga' });
  same('Languages changes only its selected XP contribution', (await xpSpent(page)) - languagesStart, 3);

  await reset(page);
  const luckStart = await xpSpent(page);
  const luckConfig = await configureRank(page, 'Luck', 'Rank 3');
  truth('Luck uses the existing rank picker', luckConfig.ok && luckConfig.state.visible && luckConfig.state.text.includes('Rank 3'));
  const luckUI = await entrySnapshot(page);
  truth('Luck paints both per-entry and sidebar pip pools',
    luckUI.rowText.includes('Reset session') && (await page.evaluate(() => document.getElementById('advConfigSessionResources').textContent)).includes('Luck'));
  same('Luck starts with Rank pips and applies its 9 XP cost',
    { cost: luckUI.cost, rank: luckUI.config.rank, remaining: luckUI.config.remaining },
    { cost: '9', rank: 3, remaining: 3 });
  same('Luck changes only its selected XP contribution', (await xpSpent(page)) - luckStart, 9);

  await reset(page);
  const magicStart = await xpSpent(page);
  const magicConfig = await configureRank(page, 'Magic Resistance', 'Rank 2');
  truth('Magic Resistance uses the existing rank picker', magicConfig.ok && magicConfig.state.visible && magicConfig.state.text.includes('Rank 2'));
  const magicUI = await entrySnapshot(page);
  same('Magic Resistance displays its incoming-spell reminder and charges 4 XP',
    { cost: magicUI.cost, rowHasReminder: magicUI.rowText.includes('incoming elemental spell casting TN +6'), badge: magicUI.badges[0] },
    { cost: '4', rowHasReminder: true, badge: 'Incoming spell TN +6' });
  same('Magic Resistance changes only its selected XP contribution', (await xpSpent(page)) - magicStart, 4);

  await reset(page);
  const potential = await configureSkill(page, 'Kenjutsu');
  truth('Great Potential opens a skill input backed by the shared modal',
    potential.ok && potential.state.visible && potential.state.text.includes('Skill'));
  const potentialUI = await entrySnapshot(page);
  same('Great Potential persists its selected Skill and displays a badge',
    { config: potentialUI.config, badge: potentialUI.badges[0] },
    { config: { type: 'skillPick', value: 'Kenjutsu', skill: 'Kenjutsu' }, badge: 'Raise-limit reminder' });

  // Every new type must visibly reject an absent configuration, rather than defaulting.
  await reset(page);
  const unconfigured = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    const names = ['Allies', 'Gentry', 'Kharmic Tie', 'Languages', 'Luck', 'Magic Resistance', 'Great Potential'];
    const out = {};
    names.forEach((name) => {
      const sel = document.getElementById('advQuickAdd');
      sel.value = name;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      const overlay = document.getElementById('advConfigModalOverlay');
      if (overlay && overlay.style.display !== 'none') document.getElementById('advConfigX').click();
      const entry = document.querySelector('#advList .entry:last-child');
      const row = entry.querySelector('.adv-config-row');
      out[name] = {
        effect: T.resolveAdvDisadvEffect(name, T.readAdvConfig(entry)),
        flagged: !!row && row.classList.contains('unconfigured'),
        cost: entry.querySelector('.en-cost').value,
      };
    });
    return out;
  });
  truth('every non-auto variable Advantage is visibly unconfigured and inert until configured',
    Object.entries(unconfigured).every(([name, entry]) => entry.effect === null && entry.flagged &&
      // Great Potential's base 5 XP price is fixed by its library entry; its *choice* has no
      // silent default. The other entries’ prices depend on the missing configuration, so they
      // visibly contribute zero until chosen.
      (name === 'Great Potential' ? entry.cost === '5' : entry.cost === '0')),
    JSON.stringify(unconfigured));

  // -----------------------------------------------------------------------
  // Kharmic Tie: a real Katana attack travels through the existing preview.
  // Cancel must be free; confirmation spends once and the reset restores rank.
  // -----------------------------------------------------------------------
  await reset(page);
  await configureKharmic(page, 'Aiko', 'Rank 2');
  await page.evaluate(() => {
    const skill = document.getElementById('skillQuickAdd');
    skill.value = 'Kenjutsu';
    skill.dispatchEvent(new Event('change', { bubbles: true }));
    const skillRow = document.querySelector('#skillsBody tr');
    skillRow.querySelector('.sk-rank').value = '2';
    const weapon = document.getElementById('weaponQuickAdd');
    weapon.value = 'Katana';
    weapon.dispatchEvent(new Event('change', { bubbles: true }));
    window.__L5R_TEST__.recalcAll();
    document.querySelector('#weaponsBody .wp-roll-btn').click();
  });
  await page.waitForFunction(() => document.getElementById('rollPreviewOverlay').style.display !== 'none');
  truth('a weapon attack preview offers the target-specific Kharmic Tie declaration',
    await page.evaluate(() => document.getElementById('rollPreviewBody').textContent.includes('protecting Aiko')));
  await page.evaluate(() => document.querySelector('[data-adv-config-kharmic-use]').click());
  truth('checking Kharmic Tie projects +1k1 through the one existing modifier registry contributor',
    await page.evaluate(() => document.getElementById('rollPreviewBody').textContent.includes('Kharmic Tie') &&
      document.getElementById('rollPreviewBody').textContent.includes('+1k1')));
  await page.evaluate(() => document.getElementById('rollPreviewCancel').click());
  await page.waitForFunction(() => document.getElementById('rollPreviewOverlay').style.display === 'none');
  same('cancelling a declared Kharmic Tie attack spends nothing',
    await page.evaluate(() => JSON.parse(document.querySelector('#advList .entry').dataset.advConfig).remaining), 2);

  await page.evaluate(() => document.querySelector('#weaponsBody .wp-roll-btn').click());
  await page.waitForFunction(() => document.getElementById('rollPreviewOverlay').style.display !== 'none');
  await page.evaluate(() => document.querySelector('[data-adv-config-kharmic-use]').click());
  await page.evaluate(() => document.getElementById('rollPreviewGo').click());
  await page.waitForFunction(() => document.getElementById('rollModalOverlay').style.display !== 'none');
  same('confirming a declared Kharmic Tie weapon attack spends exactly one use',
    await page.evaluate(() => JSON.parse(document.querySelector('#advList .entry').dataset.advConfig).remaining), 1);
  truth('the finished attack records the Kharmic Tie modifier',
    await page.evaluate(() => document.getElementById('rollModalBody').textContent.includes('Kharmic Tie')));
  await page.evaluate(() => document.querySelector('#advList .adv-config-reset-session').click());
  same('the per-entry reset restores Kharmic Tie to its Rank maximum',
    await page.evaluate(() => JSON.parse(document.querySelector('#advList .entry').dataset.advConfig).remaining), 2);
  await closeResultModal(page);

  // -----------------------------------------------------------------------
  // Luck: deterministic whole-roll rerolls. First wins, second loses, and
  // exhausted Luck stays visible but disabled after an ordinary roll.
  // -----------------------------------------------------------------------
  await reset(page);
  await configureRank(page, 'Luck', 'Rank 2');
  await page.evaluate(() => {
    window.__qaLuckOriginalRandom = Math.random;
    window.__qaLuckNumbers = [0, 0, 0, 0.8, 0.8, 0.8, 0, 0, 0, 0.1, 0.1, 0.1];
    Math.random = () => window.__qaLuckNumbers.shift();
    const T = window.__L5R_TEST__;
    window.__qaLuckPromise = T.rollWithModifiers('Luck QA Roll',
      T.makeRollContext(T.ROLL_KINDS.MANUAL, { notation: '3k2' }), 3, 2,
      { skipPreview: true, explode: false });
  });
  await page.waitForFunction(() => document.getElementById('rollModalOverlay').style.display !== 'none');
  same('Luck appears after an ordinary result with the full-roll action and all pips available',
    await page.evaluate(() => {
      const button = document.querySelector('.adv-config-spend-luck');
      return { text: button && button.textContent, disabled: button && button.disabled,
        total: document.getElementById('rollTotalDisplay').textContent,
        dice: document.querySelectorAll('#rollDiceRow .roll-die').length };
    }), { text: 'Spend Luck (2/2)', disabled: false, total: '2', dice: 3 });
  await page.evaluate(() => document.querySelector('.adv-config-spend-luck').click());
  await page.waitForFunction(() => document.getElementById('rollTotalDisplay').textContent === '18');
  same('Luck rerolls the same complete 3k2 pool and keeps a higher reroll',
    await page.evaluate(() => ({
      total: document.getElementById('rollTotalDisplay').textContent,
      notation: document.getElementById('rollModalNotation').textContent,
      pips: JSON.parse(document.querySelector('#advList .entry').dataset.advConfig).remaining,
      outcome: document.querySelector('.adv-config-luck-outcome').textContent,
    })),
    { total: '18', notation: '3k2', pips: 1, outcome: 'Luck spent — original 2, reroll 18. Kept the higher reroll.' });
  await page.evaluate(() => document.querySelector('.adv-config-spend-luck').click());
  await page.waitForFunction(() => JSON.parse(document.querySelector('#advList .entry').dataset.advConfig).remaining === 0);
  same('Luck preserves the higher original result when a later whole-roll reroll loses',
    await page.evaluate(() => ({
      total: document.getElementById('rollTotalDisplay').textContent,
      pips: JSON.parse(document.querySelector('#advList .entry').dataset.advConfig).remaining,
      outcome: document.querySelector('.adv-config-luck-outcome').textContent,
      disabled: document.querySelector('.adv-config-spend-luck').disabled,
    })),
    { total: '18', pips: 0, outcome: 'Luck spent — original 18, reroll 2. Kept the higher original result.', disabled: true });
  await page.evaluate(() => { Math.random = window.__qaLuckOriginalRandom; });
  await closeResultModal(page);

  // -----------------------------------------------------------------------
  // Great Potential and Magic Resistance deliberately remain informational.
  // The preview speaks truth without inventing an unimplemented Raise or VTT
  // target-tracking system, and Magic Resistance does not alter own casting.
  // -----------------------------------------------------------------------
  await reset(page);
  await configureSkill(page, 'Kenjutsu');
  await page.evaluate(() => { document.getElementById('ring_void').value = '4'; });
  await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    window.__qaGreatPotential = T.rollWithModifiers('Great Potential QA',
      T.makeRollContext(T.ROLL_KINDS.SKILL, { skillName: 'Kenjutsu', traitName: 'Agility', skillRank: 2 }), 4, 2);
  });
  await page.waitForFunction(() => document.getElementById('rollPreviewOverlay').style.display !== 'none');
  truth('Great Potential’s preview shows the calculated Raise cap and both candidate limits',
    await page.evaluate(() => {
      const text = document.getElementById('rollPreviewBody').textContent;
      return text.includes('Great Potential') && text.includes('Raise cap 4') &&
        text.includes('Skill Rank 2; Void Rank 4; use the higher limit');
    }));
  await page.evaluate(() => document.getElementById('rollPreviewGo').click());
  await page.waitForFunction(() => document.getElementById('rollModalOverlay').style.display !== 'none');
  await closeResultModal(page);

  await reset(page);
  await configureRank(page, 'Magic Resistance', 'Rank 2');
  same('Magic Resistance is absent from the player’s own elemental and Maho casting modifier lists',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      const elemental = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SPELL,
        { spellName: 'Sense', element: 'Fire', maho: false }));
      const maho = T.getPreRollModifiers(T.makeRollContext(T.ROLL_KINDS.SPELL,
        { spellName: 'Blood of the Oni', element: 'Fire', maho: true }));
      return [elemental, maho].map((mods) => mods.filter((mod) => mod.label === 'Magic Resistance').length);
    }), [0, 0]);

  // -----------------------------------------------------------------------
  // Sacred Weapon: Clan selection derives an owned base profile, leaves a
  // player-added Katana alone, survives a clan change, and reverses cleanly.
  // -----------------------------------------------------------------------
  await reset(page);
  await setClan(page, 'Crab');
  await page.evaluate(() => {
    const sel = document.getElementById('weaponQuickAdd');
    sel.value = 'Katana';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  });
  const sacredAdded = await addFromLibrary(page, 'Sacred Weapon');
  truth('Sacred Weapon is a no-modal auto-pick from the character Clan', sacredAdded.ok && !(await modalState(page)).visible);
  await page.waitForFunction(() => {
    const entry = document.querySelector('#advList .entry');
    return entry && entry.dataset.advConfig && JSON.parse(entry.dataset.advConfig).value === 'kaiu-blade';
  });
  same('Crab Sacred Weapon has its approved cost, configuration, and one tagged Kaiu Blade',
    await page.evaluate(() => {
      const entry = document.querySelector('#advList .entry');
      const c = JSON.parse(entry.dataset.advConfig);
      const rows = Array.from(document.querySelectorAll('#weaponsBody tr'));
      const owned = rows.filter((row) => row.dataset.advConfigSacredSource === c.sourceId);
      return {
        cost: entry.querySelector('.en-cost').value, id: c.value, clan: c.clan,
        name: owned[0] && owned[0].querySelector('.wp-name').value,
        baseDamage: owned[0] && [owned[0].querySelector('.wp-dmg-roll').value, owned[0].querySelector('.wp-dmg-keep').value],
        rows: rows.length, owned: owned.length,
      };
    }), { cost: '6', id: 'kaiu-blade', clan: 'Crab', name: 'Kaiu Blade', baseDamage: ['5', '3'], rows: 2, owned: 1 });
  await setClan(page, 'Crane');
  same('changing Clan replaces only the owned row with the new Clan’s exact base profile',
    await page.evaluate(() => {
      const entry = document.querySelector('#advList .entry');
      const c = JSON.parse(entry.dataset.advConfig);
      const owned = Array.from(document.querySelectorAll('#weaponsBody tr'))
        .filter((row) => row.dataset.advConfigSacredSource === c.sourceId);
      return { id: c.value, clan: c.clan, cost: entry.querySelector('.en-cost').value,
        owned: owned.length, name: owned[0] && owned[0].querySelector('.wp-name').value,
        totalWeapons: document.querySelectorAll('#weaponsBody tr').length };
    }), { id: 'kakita-blade', clan: 'Crane', cost: '5', owned: 1, name: 'Kakita Blade', totalWeapons: 2 });
  await page.evaluate(() => document.querySelector('#advList .entry .rm-btn').click());
  same('removing Sacred Weapon removes only its tagged row and preserves the manual Katana',
    await page.evaluate(() => ({
      rows: document.querySelectorAll('#weaponsBody tr').length,
      names: Array.from(document.querySelectorAll('#weaponsBody .wp-name')).map((input) => input.value),
      tagged: document.querySelectorAll('#weaponsBody tr[data-adv-config-sacred-source]').length,
    })), { rows: 1, names: ['Katana'], tagged: 0 });
  same('every Clan has exactly the approved Sacred Weapon identity, cost, and row count',
    await page.evaluate(() => {
      const T = window.__L5R_TEST__;
      return Object.keys(T.ADV_CONFIG_SACRED_WEAPON_PROFILES).sort().map((clan) => {
        const profile = T.advConfigSacredWeaponProfileForClan(clan);
        return [clan, profile.id, profile.weaponName, profile.cost, profile.rows.length];
      });
    }), Object.keys(SACRED_WEAPONS).sort().map((clan) => [clan].concat(SACRED_WEAPONS[clan])));

  // -----------------------------------------------------------------------
  // Persistence: full object shapes survive collectData/applyData and their
  // JSON representation; resource pips and Sacred ownership tags come back.
  // -----------------------------------------------------------------------
  await reset(page);
  const persistence = await page.evaluate(() => {
    const T = window.__L5R_TEST__;
    document.getElementById('f_clan').value = 'Crab';
    const add = (name) => {
      const sel = document.getElementById('advQuickAdd');
      sel.value = name;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      const overlay = document.getElementById('advConfigModalOverlay');
      if (overlay && overlay.style.display !== 'none') document.getElementById('advConfigX').click();
      return document.querySelector('#advList .entry:last-child');
    };
    const allies = add('Allies');
    const gentry = add('Gentry');
    const kharmic = add('Kharmic Tie');
    const languages = add('Languages');
    const luck = add('Luck');
    const magic = add('Magic Resistance');
    const sacred = add('Sacred Weapon');
    const potential = add('Great Potential');
    T.writeAdvConfig(allies, 'dualTierPick', { influence: 2, devotion: 4, value: 'Influence 2 / Devotion 4' });
    T.writeAdvConfig(gentry, 'severityTier', 'Town');
    T.writeAdvConfig(kharmic, 'rankPick', { value: 'Rank 4', rank: 4, target: 'Aiko', remaining: 2, sourceId: 'kharmic-persist' });
    T.writeAdvConfig(languages, 'languagePick', { value: 'Human: Rokugani', languageType: 'Human', language: 'Rokugani' });
    T.writeAdvConfig(luck, 'rankPick', { value: 'Rank 3', rank: 3, remaining: 1 });
    T.writeAdvConfig(magic, 'rankPick', { value: 'Rank 1', rank: 1 });
    T.writeAdvConfig(potential, 'skillPick', { value: 'Kenjutsu', skill: 'Kenjutsu' });
    T.recalcAll();
    const saved = JSON.parse(JSON.stringify(T.collectData()));
    T.resetToBaseline();
    T.applyData(saved);
    T.recalcAll();
    const restored = Array.from(document.querySelectorAll('#advList .entry')).map((entry) => ({
      name: entry.querySelector('.en-name').value,
      config: entry.dataset.advConfig ? JSON.parse(entry.dataset.advConfig) : null,
    }));
    return {
      restored,
      savedConfigs: saved.adv.map((entry) => ({ name: entry.name, config: entry.config })),
      resources: document.getElementById('advConfigSessionResources').textContent.replace(/\s+/g, ' ').trim(),
      sacredRows: Array.from(document.querySelectorAll('#weaponsBody tr[data-adv-config-sacred-source]')).map((row) => ({
        source: row.dataset.advConfigSacredSource,
        weapon: row.dataset.advConfigSacredWeapon,
        index: row.dataset.advConfigSacredRow,
      })),
    };
  });
  same('save/load and JSON import/export preserve every advanced config object exactly',
    persistence.restored, persistence.savedConfigs);
  truth('persisted Kharmic and Luck pips reappear in the session-resource sidebar',
    persistence.resources.includes('Luck') && persistence.resources.includes('1/3') &&
      persistence.resources.includes('Kharmic Tie — Aiko') && persistence.resources.includes('2/4'),
    persistence.resources);
  same('Sacred Weapon ownership tags survive save/load with their source identity',
    persistence.sacredRows, [{ source: persistence.restored.find((entry) => entry.name === 'Sacred Weapon').config.sourceId,
      weapon: 'kaiu-blade', index: '0' }]);

  same('the expansion leaves the one Phase 4.5 registry contributor shape intact',
    await page.evaluate(() => window.__L5R_TEST__.PREROLL_MODIFIER_REGISTRY
      .filter((entry) => entry.id === 'adv-config').map((entry) => [entry.id, entry.priority])),
    [['adv-config', 60]]);

  record('no uncaught page errors', pageErrors.length === 0, pageErrors.join('\n'));
  const passed = results.filter((result) => result.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  await browser.close();
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((error) => {
  console.error(error && error.stack || error);
  process.exit(2);
});
