/* Real-browser acceptance tests for Phase 14 Search, first release (Part K).
 * Oracles come from the catalogues on the test seam, the Phase 4.5 sourcebook audit's tables (AUDIT.md) and the
 * Characters screen (CL11), never from SEARCH14's own records.
 * node search-harness.js <sheet.html>
 */
'use strict';
const fs = require('fs');
const path = require('path');
const {chromium} = require('playwright');
const {pathToFileURL} = require('url');
const results = [];
function check(id, actual, expected = true) {
  if (results.some(r => r.id === id)) throw Error('Duplicate check ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, pass});
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id}${pass ? '' : ` actual=${JSON.stringify(actual).slice(0, 600)} expected=${JSON.stringify(expected).slice(0, 600)}`}`);
}
async function section(id, fn) {
  try { await fn(); } catch (error) { check(id + '-EXCEPTION', String(error.stack || error), 'no exception'); }
}

// Book pages for the 139 catalogue entries, read from the audit's own tables.
function auditPages() {
  const md = fs.readFileSync(path.resolve(__dirname, '../../PART I — Phase 4.5 Sourcebook Audit of Advantages and Disadvantages/AUDIT.md'), 'utf8');
  const out = {}; let on = false;
  for (const line of md.split('\n')) {
    if (/^### (Advantages|Disadvantages) \(\d+\)/.test(line)) { on = true; continue; }
    if (/^## Missing/.test(line)) on = false;
    if (!on || !line.startsWith('| ') || line.startsWith('| Entry') || line.startsWith('| ---')) continue;
    const c = line.split('|').map(x => x.trim());
    const m = c[4].match(/^(.+?) (pp?\.\d+)$/);
    const book = {Core:'Core Rulebook', 'Great Clans':'The Great Clans'}[m[1]] || m[1];
    out[c[1]] = book + ' ' + m[2];
  }
  return out;
}

// Test-only term for Phase 11.3 (Part K), 9 October 2026: while the app bar is present it hides ⋯ → Search and the Characters screen's ‹ Sheet; the bar's
// own item does the same thing, so the tap goes there. Without the bar, the original control is tapped.
const BAR = '#ab113Bar';
async function openSearch(page) {
  if (await page.$(BAR)) { await page.keyboard.press('Escape'); await page.click(BAR + ' [data-section="search"]'); }
  else await page.click('#s14MenuItem');
}
async function toSheet(page) { await page.click((await page.$(BAR)) ? BAR + ' [data-section="sheet"]' : '.cl11-back'); }
const withSearch = async (page, items) => (await page.$(BAR)) ? items : ['Search'].concat(items);

const CATEGORY_ORDER = ['skills', 'advantages', 'disadvantages', 'schools', 'advanced', 'paths', 'techniques', 'kata', 'kiho',
  'spells', 'weapons', 'clans', 'ancestors'];

async function main() {
  const sheet = path.resolve(process.argv[2]);
  const browser = await chromium.launch();
  const errors = [];
  try {
    const context = await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto(pathToFileURL(sheet).href);
    await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11 && window.__L5R_TEST__.CL11.ready &&
      document.getElementById('pm128More'), null, {timeout:60000});
    const PAGES = auditPages();

    await section('S14-DATA', async () => {
      check('S14-SEAM', await page.evaluate(() => [typeof window.__L5R_TEST__.SEARCH14, typeof window.__L5R_TEST__.SEARCHPAGE14]), ['object', 'object']);
      const d = await page.evaluate(() => {
        const T = window.__L5R_TEST__, S = T.SEARCH14;
        const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['’‘`]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
        const flat = o => Object.values(o).flat();
        const schools = flat(T.SCHOOL_LIBRARY).concat(flat(T.MINOR_CLAN_SCHOOL_LIBRARY), T.BROTHERHOOD_SCHOOL_LIBRARY);
        const schoolNames = [...new Set(schools.map(s => s.name))];
        const techNames = [...new Set(schools.flatMap(s => s.tech || []))];
        const adv = T.ADVANCED_SCHOOL_LIBRARY;
        const clans = [...new Set(Object.keys(T.FAMILY_LIBRARY).concat(Object.keys(T.MINOR_CLAN_LIBRARY)))];
        const famPairs = new Set();
        [T.FAMILY_LIBRARY, T.MINOR_CLAN_LIBRARY].forEach(lib => Object.keys(lib).forEach(c => lib[c].forEach(f => famPairs.add(c + '|' + f[0]))));
        const oracle = {
          skills:T.SKILL_LIBRARY.map(x => x.name), advantages:T.ADV_LIBRARY.map(x => x.name), disadvantages:T.DISADV_LIBRARY.map(x => x.name),
          schools:schoolNames, advanced:adv.map(x => x.name), paths:T.ALTERNATE_PATH_LIBRARY.map(x => x.name),
          techniques:techNames.concat(adv.flatMap(a => (a.techniques || []).map(t => t.name))),
          kata:T.KATA_LIBRARY.map(x => x.name), kiho:T.KIHO_LIBRARY.map(x => x.name), spells:T.SPELL_LIBRARY.map(x => x.name),
          weapons:T.WEAPON_LIBRARY.map(x => x.name).concat(T.ARROW_LIBRARY.map(x => x.name)),
          clans:clans.map(c => c + ' Clan').concat([...famPairs].map(p => p.split('|')[1])),
          ancestors:T.ANC48.LIBRARY.map(x => x.name)};
        const cats = S.categories();
        const missing = {};
        Object.keys(oracle).forEach(cat => {
          missing[cat] = oracle[cat].filter(name => {
            const r = S.query({text:name, category:cat, limit:5}).results;
            return !r.length || norm(r[0].name) !== norm(name);
          });
        });
        return {ids:cats.map(c => c.id), counts:cats.map(c => c.count), expected:Object.keys(oracle).map(k => oracle[k].length), missing,
          groups:[...new Set(cats.map(c => c.group))]};
      });
      check('S14-CATEGORY-ORDER', d.ids, CATEGORY_ORDER);
      check('S14-CATEGORY-GROUPS', d.groups, ['Character', 'Schools', 'Techniques', 'Equipment', 'Clans']);
      CATEGORY_ORDER.forEach((id, i) => check('S14-COUNT-' + id.toUpperCase(), d.counts[i], d.expected[i]));
      check('S14-EVERY-NAME-FOUND-FIRST', Object.entries(d.missing).filter(e => e[1].length).map(e => [e[0], e[1].slice(0, 5)]), []);

      const q = await page.evaluate(() => {
        const S = window.__L5R_TEST__.SEARCH14;
        const names = o => S.query(o).results.map(r => r.name);
        const full = S.query({category:'spells', limit:1000}).results.map(r => r.name);
        const norm = s => S.normalise(s);
        return {
          quick:names({text:'quick', limit:2}),
          kihoInNames:[...window.__L5R_TEST__.SPELL_LIBRARY, ...window.__L5R_TEST__.KIHO_LIBRARY, ...window.__L5R_TEST__.ALTERNATE_PATH_LIBRARY].filter(x => /kiho/i.test(x.name)).length,
          kihoFirstType:S.query({text:'kiho', limit:1}).results[0].type,
          hida:names({text:'hida bushi', limit:1}),
          inari:S.query({text:'inaris', limit:1}).results.map(r => [r.name, r.category]),
          apostrophe:S.query({text:"arrow's flight", category:'spells', limit:1}).results.map(r => r.name),
          accent:[S.query({text:'kákita'}).total, S.query({text:'kakita'}).total],
          accentNorm:S.normalise('Hídá Búshi'), accentFirst:S.query({text:'Hídá Búshi', limit:1}).results.map(r => r.name),
          upper:S.query({text:'QUICK'}).total === S.query({text:'quick'}).total,
          fireKata:S.query({text:'striking fire', limit:1}).results.map(r => [r.name, r.type]),
          andTerms:S.query({text:'striking fire'}).total < Math.min(S.query({text:'striking'}).total, S.query({text:'fire'}).total),
          spellsAll:[full.length, full.every((n, i) => i === 0 || norm(full[i - 1]) <= norm(n))],
          page:JSON.stringify(S.query({category:'spells', offset:50, limit:10}).results.map(r => r.name)) === JSON.stringify(full.slice(50, 60)),
          defaultLimit:S.query({category:'spells'}).results.length,
          none:S.query({text:'zzqqxx'}).total, nothing:S.get('spells:no-such-entry'),
          summaryKeys:Object.keys(S.query({text:'katana', limit:1}).results[0]).sort()};
      });
      check('S14-RANK-NAME-FIRST', q.quick, ['Quick', 'Quick Healer']);
      check('S14-RANK-TYPE-BEFORE-TEXT', [q.kihoInNames, q.kihoFirstType], [0, 'Kiho']);
      check('S14-RANK-EXACT', q.hida, ['Hida Bushi']);
      check('S14-APOSTROPHE-IGNORED', q.inari, [['Inari’s Blessing', 'advantages']]);
      check('S14-APOSTROPHE-TYPED', q.apostrophe, ["Arrow's Flight"]);
      check('S14-ACCENT-IGNORED', [q.accent[0] === q.accent[1] && q.accent[0] > 0, q.accentNorm, q.accentFirst], [true, 'hida bushi', ['Hida Bushi']]);
      check('S14-CASE-IGNORED', q.upper);
      check('S14-ALL-TERMS', [q.fireKata, q.andTerms], [[['Striking as Fire', 'Kata']], true]);
      check('S14-CATEGORY-A-Z', q.spellsAll, [await page.evaluate(() => window.__L5R_TEST__.SPELL_LIBRARY.length), true]);
      check('S14-OFFSET-LIMIT', q.page);
      check('S14-DEFAULT-LIMIT', q.defaultLimit, 50);
      check('S14-NO-MATCH', [q.none, q.nothing], [0, null]);
      check('S14-SUMMARY-SHAPE', q.summaryKeys, ['category', 'categoryLabel', 'id', 'name', 'source', 'tags', 'type']);
    });

    await section('S14-RECORDS', async () => {
      const r = await page.evaluate(PAGES => {
        const T = window.__L5R_TEST__, S = T.SEARCH14;
        const bad = {};
        const flag = (k, name) => { (bad[k] = bad[k] || []).length < 5 && bad[k].push(name); };
        const rec = (cat, name) => { const h = S.query({text:name, category:cat, limit:1}).results[0]; return h && S.get(h.id); };
        const field = (r, label) => { const f = r.fields.find(x => x.label === label); return f ? f.value : ''; };
        const tail = /\s*\(([^()]*\bpp?\.\s?\d[^()]*)\)\s*$/;
        const split = t => { const m = String(t || '').match(tail); return m ? [String(t).replace(tail, ''), m[1]] : [String(t || ''), '']; };
        T.SPELL_LIBRARY.forEach(s => { const r = rec('spells', s.name);
          if (!r || field(r, 'Element') !== s.element || field(r, 'Mastery') !== String(s.mastery) || r.text[0] !== s.desc || r.source !== '') flag('spells', s.name); });
        T.KIHO_LIBRARY.forEach(k => { const r = rec('kiho', k.name);
          if (!r || field(r, 'Ring') !== k.ring || field(r, 'Type') !== k.type || field(r, 'Mastery') !== String(k.mastery) || r.text[0] !== k.desc) flag('kiho', k.name); });
        T.KATA_LIBRARY.forEach(k => { const r = rec('kata', k.name);
          if (!r || field(r, 'Ring') !== k.ring || field(r, 'Schools') !== k.schools || r.text[0] !== k.desc) flag('kata', k.name); });
        T.ADV_LIBRARY.forEach(a => { const r = rec('advantages', a.name);
          if (!r || field(r, 'Cost') !== a.cost + ' points' || r.text[0] !== a.desc || r.source !== PAGES[a.name]) flag('advantages', a.name); });
        T.DISADV_LIBRARY.forEach(a => { const r = rec('disadvantages', a.name);
          if (!r || field(r, 'Value') !== a.cost + ' points' || r.text[0] !== a.desc || r.source !== PAGES[a.name]) flag('disadvantages', a.name); });
        T.WEAPON_LIBRARY.forEach(w => { const r = rec('weapons', w.name);
          if (!r || field(r, 'Skill') !== w.skill || field(r, 'Damage') !== w.damage.roll + 'k' + w.damage.keep || (r.text[0] || '') !== (w.notes || '')) flag('weapons', w.name); });
        T.SKILL_LIBRARY.forEach(s => { const r = rec('skills', s.name);
          const m = (r && r.sections.find(x => x.title === 'Mastery Abilities')) || {items:[]};
          if (!r || field(r, 'Trait') !== s.trait || m.items.length !== Object.keys(s.m || {}).length) flag('skills', s.name); });
        const flat = o => Object.values(o).flat();
        flat(T.SCHOOL_LIBRARY).concat(flat(T.MINOR_CLAN_SCHOOL_LIBRARY), T.BROTHERHOOD_SCHOOL_LIBRARY).forEach(s => {
          const r = rec('schools', s.name), sec = r && r.sections.find(x => x.title === 'Techniques');
          const ok = r && sec && sec.items.length === s.tech.length && s.tech.every((t, i) => {
            const own = Array.isArray(s.descriptions) && s.descriptions[i];
            const [text, src] = own ? [own, ''] : split(T.techniqueDescription(t));
            return sec.items[i].name === 'Rank ' + (i + 1) + ': ' + t && sec.items[i].text === text && sec.items[i].note === src; })
            && (r.source === (s.source || '')) && field(r, 'Honor') === (s.honor != null ? String(s.honor) : (s.honorChoices || []).join(' or '));
          if (!ok) flag('schools', s.name); });
        T.ADVANCED_SCHOOL_LIBRARY.forEach(a => { const r = rec('advanced', a.name), sec = r && r.sections[0];
          if (!r || r.source !== a.source || !sec || sec.items.length !== a.techniques.length ||
            !a.techniques.every((t, i) => sec.items[i].text === t.desc && sec.items[i].note === (t.source || ''))) flag('advanced', a.name); });
        T.ALTERNATE_PATH_LIBRARY.forEach(p => { const r = rec('paths', p.name);
          if (!r || r.source !== p.source || r.sections[0].items[0].name !== p.tech || r.sections[0].items[0].text !== split(T.techniqueDescription(p.tech))[0]) flag('paths', p.name); });
        T.ANC48.LIBRARY.forEach(a => { const r = rec('ancestors', a.name);
          if (!r || r.source !== T.ANC48.bookPage(a) || r.text[0] !== a.about || field(r, 'Cost') !== a.cost + ' points') flag('ancestors', a.name); });
        Object.keys(T.FAMILY_LIBRARY).forEach(c => T.FAMILY_LIBRARY[c].forEach(f => {
          const hit = S.query({text:f[0], category:'clans', limit:20}).results.map(x => S.get(x.id)).find(x => x.type === 'Family' && field(x, 'Clan') === c);
          if (!hit || field(hit, 'Trait bonus') !== '+1 ' + f[1]) flag('families', c + ' ' + f[0]); }));
        // Pages only where the catalogue holds one.
        const all = S.query({limit:5000}).results;
        const noPage = ['skills', 'kata', 'kiho', 'spells', 'weapons', 'clans'];
        const withPage = all.filter(x => noPage.includes(x.category) && x.source).map(x => x.id);
        const json = all.map(x => JSON.stringify(S.get(x.id))).join('\n');
        const plain = all.every(x => { const g = S.get(x.id); return JSON.stringify(JSON.parse(JSON.stringify(g))) === JSON.stringify(g); });
        const copy = (() => { const g = S.get(all[0].id); g.name = 'changed'; return S.get(all[0].id).name !== 'changed'; })();
        return {bad, withPage, junk:/undefined|NaN|\bnull\b|\[object Object\]/.test(json), plain, copy, total:all.length};
      }, PAGES);
      check('S14-RECORDS-MATCH-CATALOGUES', r.bad, {});
      check('S14-PAGES-ONLY-WHERE-HELD', r.withPage, []);
      check('S14-NO-JUNK-VALUES', r.junk, false);
      check('S14-RECORDS-PLAIN-DATA', r.plain);
      check('S14-GET-RETURNS-COPY', r.copy);
      check('S14-AUDIT-PAGES-COUNT', Object.keys(PAGES).length, 139);
    });

    await section('S14-UI', async () => {
      // The element that scrolls the Search page, read from computed styles rather than from the page's own code.
      await page.evaluate(() => { window.__s14Scroller = () => { for (let n = document.querySelector('.s14-page').parentElement; n; n = n.parentElement) {
        const y = getComputedStyle(n).overflowY; if (y === 'auto' || y === 'scroll') return n; } return null; }; });
      const frames = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const before = await page.evaluate(() => ({data:JSON.stringify(window.__L5R_TEST__.collectData()), writes:window.__L5R_TEST__.CL11.writes,
        tab:window.__L5R_CAROUSEL__.getActiveTab().slug}));
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('management'));
      await page.click('#pm128More');
      check('S14-MENU-ITEMS-MANAGE', await page.$$eval('#pm128Menu [role=menuitem]', b => b.filter(x => x.offsetParent).map(x => x.textContent)),
        await withSearch(page, ['Save As a copy', 'Print', 'Export JSON']));
      await openSearch(page);
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden && document.querySelector('.s14-page'));
      check('S14-OPENS-SEARCH-TAB', await page.evaluate(() => [document.querySelector('.cl11-tab.active').dataset.tab,
        !document.querySelector('[data-panel="search"]').hidden, /Phase 14/.test(document.querySelector('[data-panel="search"]').textContent),
        document.getElementById('pm128Menu').hidden]), ['search', true, false, true]);
      check('S14-HOME-CATEGORIES', await page.evaluate(() => [...document.querySelectorAll('.s14-cat')].map(b =>
        [b.dataset.category, +b.querySelector('.s14-cat-count').textContent])),
        await page.evaluate(() => window.__L5R_TEST__.SEARCH14.categories().map(c => [c.id, c.count])));
      check('S14-INPUT-16PX', await page.$eval('#s14Input', i => [getComputedStyle(i).fontSize, i.type, i.placeholder]), ['16px', 'search', 'Search everything']);
      await page.click('#s14Input');
      await page.keyboard.type('kat');
      const typed = await page.evaluate(() => ({rows:[...document.querySelectorAll('.s14-row .s14-name')].slice(0, 3).map(n => n.textContent),
        count:document.querySelector('.s14-count').textContent, total:window.__L5R_TEST__.SEARCH14.query({text:'kat'}).total,
        shown:document.querySelectorAll('.s14-row').length, homeHidden:document.querySelector('.s14-home').hidden}));
      check('S14-TYPING-FILTERS', [typed.rows[0], typed.count, typed.shown, typed.homeHidden], ['Katana', typed.total + ' matches', Math.min(50, typed.total), true]);
      await page.fill('#s14Input', '');
      check('S14-CLEARED-HOME', await page.evaluate(() => [document.querySelector('.s14-home').hidden, document.querySelector('.s14-list').hidden]), [false, true]);
      await page.click('[data-category="spells"]');
      const spells = await page.evaluate(() => ({crumb:document.querySelector('.s14-crumb-title').textContent, ph:document.getElementById('s14Input').placeholder,
        rows:[...document.querySelectorAll('.s14-row .s14-name')].map(n => n.textContent), more:!document.querySelector('.s14-more').hidden,
        // Test-only term for Phase 14.1 (Part K), 9 October 2026: with its facets present, Spells list by Element (Air, Earth, Fire,
        // Water, Void, then others), then Mastery, then A to Z.
        oracle:(() => { const T = window.__L5R_TEST__, n = s => T.SEARCH14.normalise(s), R = ['Air', 'Earth', 'Fire', 'Water', 'Void'];
          const p = e => R.indexOf(e) < 0 ? 99 : R.indexOf(e);
          const g = T.FACETPAGE141 ? (a, b) => p(a.element) - p(b.element) || (a.element < b.element ? -1 : a.element > b.element ? 1 : 0) ||
            a.mastery - b.mastery : () => 0;
          return T.SPELL_LIBRARY.slice().sort((a, b) => g(a, b) || (n(a.name) < n(b.name) ? -1 : n(a.name) > n(b.name) ? 1 : 0)).map(s => s.name).slice(0, 50); })(),
        count:document.querySelector('.s14-count').textContent}));
      check('S14-CATEGORY-PAGE', [spells.crumb, spells.ph, spells.rows, spells.more, spells.count],
        ['Spells', 'Search Spells', spells.oracle, true, await page.evaluate(() => window.__L5R_TEST__.SPELL_LIBRARY.length) + ' entries']);
      await page.click('.s14-more');
      check('S14-SHOW-MORE', await page.$$eval('.s14-row', r => r.length), 100);
      await page.fill('#s14Input', 'fire');
      check('S14-CATEGORY-SCOPED', await page.evaluate(() => [...document.querySelectorAll('.s14-row')].every(b => b.dataset.id.startsWith('spells:')) &&
        document.querySelectorAll('.s14-row').length > 0));
      const target = await page.$eval('.s14-row', b => b.dataset.id);
      await page.evaluate(() => { window.__s14Scroller().scrollTop = 120; });
      const listScroll = await page.evaluate(() => window.__s14Scroller().scrollTop);
      // Safari keeps focus in the field when a row is tapped (Chromium moves it, or drops it once the field is hidden),
      // so the check records the page's own blur() call: it must come before the entry is shown.
      check('S14-KEYBOARD-CLOSES-FIRST', await page.evaluate(() => { const i = document.getElementById('s14Input'); let first = null;
        i.focus({preventScroll:true});
        i.blur = function () { if (first === null) first = document.querySelector('.s14-detail').hidden; return HTMLElement.prototype.blur.call(this); };
        document.querySelector('.s14-row').click(); delete i.blur; return first; }), true);
      const detail = await page.evaluate(id => {
        const r = window.__L5R_TEST__.SEARCH14.get(id), d = document.querySelector('.s14-detail');
        return {visible:!d.hidden, listHidden:document.querySelector('.s14-list').hidden, inputHidden:document.getElementById('s14Input').hidden,
          name:d.querySelector('h3').textContent === r.name, focus:document.activeElement === d.querySelector('h3'),
          fields:JSON.stringify([...d.querySelectorAll('dt')].map((dt, i) => ({label:dt.textContent, value:d.querySelectorAll('dd')[i].textContent}))) === JSON.stringify(r.fields),
          text:[...d.querySelectorAll('.s14-text')].map(p => p.textContent).join('|') === r.text.join('|'),
          top:window.__s14Scroller().scrollTop};
      }, target);
      check('S14-DETAIL', detail, {visible:true, listHidden:true, inputHidden:true, name:true, focus:true, fields:true, text:true, top:0});
      await page.click('.s14-detail [data-s14="back"]');
      check('S14-BACK-RESTORES', await page.evaluate(() => [document.querySelector('.s14-detail').hidden, document.querySelector('.s14-list').hidden,
        document.getElementById('s14Input').value, window.__s14Scroller().scrollTop]), [true, false, 'fire', listScroll]);
      await page.click('.s14-row');
      await page.keyboard.press('Escape');
      check('S14-ESCAPE-DETAIL-TO-LIST', await page.evaluate(() => [document.querySelector('.s14-detail').hidden, document.getElementById('cl11View').hidden]), [true, false]);
      await page.keyboard.press('Escape');
      check('S14-ESCAPE-CLOSES', await page.evaluate(() => document.getElementById('cl11View').hidden));
      await page.evaluate(() => window.__L5R_TEST__.MODES12.set('play'));
      await page.click('#pm128More');
      check('S14-MENU-ITEMS-PLAY', await page.$$eval('#pm128Menu [role=menuitem]', b => b.filter(x => x.offsetParent).map(x => x.textContent)),
        await withSearch(page, ['Print', 'Export JSON']));
      await openSearch(page);
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
      const keptList = await page.evaluate(() => [document.querySelector('.s14-crumb-title').textContent, document.getElementById('s14Input').value,
        document.querySelector('.s14-detail').hidden]);
      // ⋯ → Search returns to an open entry, then Back to the same list at the same place.
      await page.evaluate(() => { window.__s14Scroller().scrollTop = 90; });
      await frames();
      const listTop = await page.evaluate(() => window.__s14Scroller().scrollTop);
      const entryId = await page.locator('.s14-row').nth(1).getAttribute('data-id');
      await page.locator('.s14-row').nth(1).click();
      await page.evaluate(() => { window.__s14Scroller().scrollTop = 30; });
      await frames();
      const entryTop = await page.evaluate(() => window.__s14Scroller().scrollTop);
      await toSheet(page);
      await page.click('#pm128More');
      await openSearch(page);
      await page.waitForFunction(() => !document.getElementById('cl11View').hidden);
      const entry = await page.evaluate(id => [!document.querySelector('.s14-detail').hidden,
        document.querySelector('.s14-detail h3').textContent === window.__L5R_TEST__.SEARCH14.get(id).name, window.__s14Scroller().scrollTop], entryId);
      if (entry[0]) await page.click('.s14-detail [data-s14="back"]');
      const back = await page.evaluate(() => [!document.querySelector('.s14-list').hidden, document.querySelector('.s14-crumb-title').textContent,
        document.getElementById('s14Input').value, window.__s14Scroller().scrollTop]);
      check('S14-STATE-KEPT', {list:keptList, entry, back, scrolled:listTop > 0},
        {list:['Spells', 'fire', true], entry:[true, true, entryTop], back:[true, 'Spells', 'fire', listTop], scrolled:true});
      await page.fill('#s14Input', '');
      await page.click('.s14-up');
      check('S14-UP-TO-HOME', await page.evaluate(() => [document.querySelector('.s14-home').hidden, document.querySelector('.s14-crumb').hidden]), [false, true]);
      const ok = await page.evaluate(() => window.__L5R_TEST__.SEARCHPAGE14.open({category:'schools', text:'hida bushi'}));
      await page.click('.s14-row');
      check('S14-OPEN-API', [ok, await page.$eval('.s14-detail h3', h => h.textContent)], [true, 'Hida Bushi']);
      for (const [w, h] of [[320, 700], [375, 812], [390, 844]]) {
        await page.setViewportSize({width:w, height:h});
        const fits = await page.evaluate(async () => {
          const v = document.getElementById('cl11View'), out = [];
          const P = window.__L5R_TEST__.SEARCHPAGE14;
          const measure = () => { const s = window.__s14Scroller();
            out.push(document.documentElement.scrollWidth <= innerWidth && v.scrollWidth <= v.clientWidth && s.scrollWidth <= s.clientWidth); };
          measure();
          await P.open({category:null, text:''}); measure();
          await P.open({category:'paths', text:''}); measure();
          document.querySelector('.s14-row').click(); measure();
          return out;
        });
        check('S14-NO-SIDEWAYS-SCROLL-' + w, fits, [true, true, true, true]);
      }
      await page.setViewportSize({width:390, height:844});
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', {rate:4});
      const ms = await page.evaluate(async () => {
        await window.__L5R_TEST__.SEARCHPAGE14.open({category:null, text:''});
        const input = document.getElementById('s14Input'), times = [];
        for (const v of ['k', 'ka', 'kat', 'kata', 'fire', 'the']) { const t = performance.now(); input.value = v;
          input.dispatchEvent(new Event('input', {bubbles:true})); times.push(performance.now() - t); }
        return Math.max(...times);
      });
      await cdp.send('Emulation.setCPUThrottlingRate', {rate:1});
      check('S14-KEYSTROKE-UNDER-50MS', ms < 50);
      await toSheet(page);
      const after = await page.evaluate(() => ({data:JSON.stringify(window.__L5R_TEST__.collectData()), writes:window.__L5R_TEST__.CL11.writes,
        tab:window.__L5R_CAROUSEL__.getActiveTab().slug}));
      check('S14-SHEET-UNCHANGED', [after.data === before.data, after.writes - before.writes, after.tab === before.tab], [true, 0, true]);
      check('S14-STYLED', await page.evaluate(async () => { await window.__L5R_TEST__.SEARCHPAGE14.open({category:null, text:''});
        const c = getComputedStyle(document.querySelector('.s14-cats')); return [c.display, getComputedStyle(document.querySelector('.s14-page')).display]; }), ['grid', 'flex']);
    });

    await section('S14-REGISTER', async () => {
      const r = await page.evaluate(() => {
        const S = window.__L5R_TEST__.SEARCH14;
        const ok = S.registerSource({id:'zz-test', label:'Test', group:'Test', read:() => [{name:'Zebra Lantern', type:'Test', tags:['One'], text:['Plain words.']}]});
        const dup = S.registerSource({id:'zz-test', read:() => []});
        const badDef = [S.registerSource(null), S.registerSource({id:'x'}), S.registerSource({read:() => []})];
        const hit = S.query({text:'zebra lantern', limit:1}).results[0];
        const throwing = S.registerSource({id:'zz-throws', label:'Broken', read:() => { throw Error('boom'); }});
        return {ok, dup, badDef, hit:hit && [hit.name, hit.category, hit.type, hit.tags],
          last:S.categories().slice(-2).map(c => [c.id, c.count]), stillWorks:S.query({text:'katana', limit:1}).results[0].name};
      });
      check('S14-REGISTER-SOURCE', r, {ok:true, dup:false, badDef:[false, false, false], hit:['Zebra Lantern', 'zz-test', 'Test', ['One']],
        last:[['zz-test', 1], ['zz-throws', 0]], stillWorks:'Katana'});
    });
  } finally {
    check('S14-NO-PAGE-ERRORS', errors, []);
    await browser.close();
  }
}
main().catch(error => check('S14-FATAL', String(error.stack || error), 'no exception')).finally(() => {
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = results.length > 0 && passed === results.length ? 0 : 1;
});
