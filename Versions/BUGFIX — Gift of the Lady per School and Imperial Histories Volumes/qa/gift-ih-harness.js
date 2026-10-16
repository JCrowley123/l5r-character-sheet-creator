'use strict';
// BUGFIX — Gift of the Lady per School and Imperial Histories Volumes (owner's rulings, 16 October 2026).
// Search shows The Gift of the Lady once per School, each with its own text and page; Hiruma Scout and Yotsu Bushi cite
// Imperial Histories 1. Expectations are the books' pages and BUGFIX — Technique Name Clashes' per-School texts.
const path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const GIFT = 'The Gift of the Lady', DOJI = 'Doji Courtier', MONK = 'The Hitomi Kikage Zumi Order [Monk]';
const WANT_RECORDS = [[GIFT, DOJI + ', Rank 5', 'Core Rulebook p.111'], [GIFT, MONK + ', Rank 1', 'Imperial Histories 1 p.215']];
const HIRUMA = ['Hiruma Scout [Bushi]', 'Imperial Histories 1 p.147 (no outfit specified)'];
const YOTSU = ['Yotsu Bushi School (Heroes of Rokugan) [Bushi]', 'Imperial Histories 1 p.276; Tiger Clan in the Heroes of Rokugan alternate timeline'];
const TAIL = /\s*\(([^()]*\bpp?\.\s?\d[^()]*)\)\s*$/;
const results = [];
function check(id, actual, want = true) {
  if (results.some(x => x.id === id)) throw Error('Duplicate check: ' + id);
  const pass = JSON.stringify(actual) === JSON.stringify(want);
  results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + String(JSON.stringify(actual)).slice(0, 500)));
}
async function section(id, run) { try { await run(); } catch (e) { check(id + '-EXCEPTION', String(e.stack), 'no exception'); } }
const TOTAL = 20;
async function main() {
  const browser = await chromium.launch(), errors = [];
  try {
    const url = pathToFileURL(path.resolve(process.argv[2])).href;
    const open = async () => {
      const context = await browser.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true});
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(url);
      await page.waitForFunction(() => window.__L5R_TEST__ && window.__L5R_TEST__.CL11.ready, null, {timeout:60000});
      return {context, page};
    };
    let {context, page} = await open();
    await page.evaluate(() => {
      window.__giftBefore = JSON.stringify(window.__L5R_TEST__.collectData());
      window.__giftStorage = JSON.stringify(Object.entries(localStorage).sort());
    });
    // The clash fix's own text for each School, its page tail removed (Search shows the page apart).
    const own = await page.evaluate(([G, D, M]) => {
      const B = (window.__L5R_TEST__.TECHNAMES || {}).BY_SCHOOL || {};
      return [(B[G] || {})[D] || '', (B[G] || {})[M] || ''];
    }, [GIFT, DOJI, MONK]);
    const ownText = own.map(t => t.replace(TAIL, ''));
    await section('GIH-DATA', async () => {
      check('GIH-SWITCH', await page.evaluate(() => window.__L5R_TEST__.GIFT_IH_FIX_ENABLED), true);
      // Guard: the per-School texts this release reads exist and differ (BUGFIX — Technique Name Clashes).
      check('GIH-OWN-TEXTS-AVAILABLE', [own[0].endsWith('(Core Rulebook p.111)'), ownText[0] !== ownText[1], ownText[1].length > 0],
        [true, true, true]);
      const d = await page.evaluate(G => {
        const S = window.__L5R_TEST__.SEARCH14;
        const field = (r, label) => { const f = r.fields.find(x => x.label === label); return f ? f.value : ''; };
        const hits = S.query({category:'techniques', text:G, limit:20}).results.filter(h => h.name === G);
        return hits.map(h => { const r = S.get(h.id); return {name:h.name, tags:h.tags, source:h.source, detail:r.source,
          school:field(r, 'School'), text:r.text}; });
      }, GIFT);
      check('GIH-GIFT-TWO-RECORDS', d.map(r => [r.name, r.tags[0], r.source]), WANT_RECORDS);
      check('GIH-GIFT-OWN-SCHOOL', d.map(r => [r.school, r.detail]), WANT_RECORDS.map(w => [w[1], w[2]]));
      check('GIH-GIFT-OWN-TEXT', d.map(r => r.text), ownText.map(t => [t]));
      // Each School's own detail lists its own text and page.
      check('GIH-SCHOOL-DETAIL-TEXT', await page.evaluate(([G, D, M]) => {
        const S = window.__L5R_TEST__.SEARCH14;
        return [[D, 5], [M, 1]].map(([n, rank]) => {
          const h = S.query({category:'schools', text:n, limit:5}).results.find(x => x.name === n);
          const sec = h && (S.get(h.id).sections.find(s => s.title === 'Techniques') || {items:[]});
          const item = sec && sec.items.find(i => i.name === 'Rank ' + rank + ': ' + G);
          return item ? [item.text, item.note] : null;
        });
      }, [GIFT, DOJI, MONK]), [[ownText[0], 'Core Rulebook p.111'], [ownText[1], 'Imperial Histories 1 p.215']]);
      // One more School Technique record than there are names: only the shared name is split.
      check('GIH-ONE-MORE-RECORD', await page.evaluate(() => {
        const T = window.__L5R_TEST__, S = T.SEARCH14, flat = o => Object.values(o).flat();
        const names = new Set(flat(T.SCHOOL_LIBRARY).concat(flat(T.MINOR_CLAN_SCHOOL_LIBRARY), T.BROTHERHOOD_SCHOOL_LIBRARY).flatMap(s => s.tech || []));
        const recs = S.query({category:'techniques', limit:100000}).results.map(h => S.get(h.id)).filter(r => r.type === 'School Technique');
        const multi = recs.filter(r => /;/.test((r.fields.find(f => f.label === 'School') || {}).value || '')).map(r => r.name);
        return [recs.length - names.size, multi];
      }), [1, []]);
      check('GIH-OWN-TEXT-API', await page.evaluate(([G, D, M]) => {
        const A = window.__L5R_TEST__.GIFTIH;
        return A ? [A.ownText(G, D).slice(0, 30), A.ownText(G, M).slice(0, 14), A.ownText(G, 'Akodo Bushi'), A.ownText('Kenjutsu', D),
          A.ownText('__proto__', 'constructor'), A.ownText(G, '__proto__'), A.ownText(null, null)] : [];
      }, [GIFT, DOJI, MONK]), ['After a few minutes’ conversat', 'Gain 1 Tattoo;', '', '', '', '', '']);
      check('GIH-SPLIT-API', await page.evaluate(() => {
        const A = window.__L5R_TEST__.GIFTIH;
        if (!A) return null;
        const rec = (name, type) => ({name, type, tags:['x'], source:'', fields:[{label:'School', value:'x'}], text:['x']});
        const records = [rec('Same', 'School Technique'), rec('Split', 'School Technique'), rec('Page', 'School Technique'),
          rec('Split', 'Advanced School Technique')];
        const rows = [{school:'A', rank:1, name:'Same', text:'t', source:'p.1'}, {school:'A', rank:1, name:'Same', text:'t', source:'p.1'},
          {school:'B', rank:2, name:'Same', text:'t', source:'p.1'}, {school:'A', rank:3, name:'Split', text:'t', source:'p.2'},
          {school:'C', rank:4, name:'Split', text:'u', source:'p.2'}, {school:'D', rank:5, name:'Split', text:'t', source:'p.2'},
          {school:'E', rank:1, name:'Page', text:'t', source:'p.3'}, {school:'F', rank:2, name:'Page', text:'t', source:'p.4'}];
        const out = A.split(records, rows);
        return [out === records, out.map(r => [r.name, r.type, r.tags[0], r.source, r.fields[0].value, r.text[0]])];
      }), [true, [['Same', 'School Technique', 'x', '', 'x', 'x'],
        ['Split', 'School Technique', 'A, Rank 3 and 1 more', 'p.2', 'A, Rank 3; D, Rank 5', 't'],
        ['Split', 'School Technique', 'C, Rank 4', 'p.2', 'C, Rank 4', 'u'],
        ['Page', 'School Technique', 'E, Rank 1', 'p.3', 'E, Rank 1', 't'], ['Page', 'School Technique', 'F, Rank 2', 'p.4', 'F, Rank 2', 't'],
        ['Split', 'Advanced School Technique', 'x', '', 'x', 'x']]]);
      const ih = await page.evaluate(pairs => {
        const T = window.__L5R_TEST__, S = T.SEARCH14;
        return pairs.map(([n, want]) => {
          const s = T.MISSING_BASIC_SCHOOL_DATA.find(x => x.name === n) || {}, h = S.query({category:'schools', text:n, limit:5}).results.find(x => x.name === n);
          return {library:s.source, list:h ? h.source : null, detail:h ? S.get(h.id).source : null,
            techniques:(s.tech || []).map((t, i) => T.techniqueDescription(t) === s.descriptions[i] + ' (' + want + ')')};
        });
      }, [HIRUMA, YOTSU]);
      check('GIH-HIRUMA-IH1', [ih[0].library, ih[0].list, ih[0].detail], [HIRUMA[1], HIRUMA[1], HIRUMA[1]]);
      check('GIH-YOTSU-IH1', [ih[1].library, ih[1].list, ih[1].detail], [YOTSU[1], YOTSU[1], YOTSU[1]]);
      // The sheet appends the School's source to each of its Techniques' text.
      check('GIH-IH1-TECHNIQUE-TEXT', ih.map(x => x.techniques), [[true, true, true, true, true], [true, true, true, true, true]]);
      // Guard: Utaku Mounted Infantry already cites Imperial Histories 2 p.168.
      check('GIH-UTAKU-UNCHANGED', await page.evaluate(() => {
        const S = window.__L5R_TEST__.SEARCH14, h = S.query({category:'schools', text:'Utaku Mounted Infantry', limit:5}).results[0];
        return h ? [h.name, h.source] : null;
      }), ['Utaku Mounted Infantry [Bushi]', 'Imperial Histories 2 p.168']);
    });
    await section('GIH-UI', async () => {
      await page.click('#ab113Bar [data-section="search"]');
      await page.evaluate(G => window.__L5R_TEST__.SEARCHPAGE14.open({category:'techniques', text:G}), GIFT);
      const rows = () => page.evaluate(G => [...document.querySelectorAll('.s14-row')].filter(r => r.querySelector('.s14-name').textContent === G)
        .map(r => r.querySelector('.s14-meta').textContent), GIFT);
      const listed = await rows();
      check('GIH-UI-TWO-ROWS', [listed.length, listed.every((m, i) => m.includes(WANT_RECORDS[i][1])), listed.some(m => m.includes('more'))],
        [2, true, false]);
      // Each row opens its own School's entry.
      const opened = [];
      for (let i = 0; i < 2; i++) {
        const clicked = await page.evaluate(([G, n]) => {
          const row = [...document.querySelectorAll('.s14-row')].filter(r => r.querySelector('.s14-name').textContent === G)[n];
          if (row) row.click();
          return !!row;
        }, [GIFT, i]);
        if (!clicked) { opened.push(null); continue; }
        await page.waitForSelector('.s14-detail h3', {state:'visible'});
        opened.push(await page.evaluate(() => {
          const d = document.querySelector('.s14-detail'), dd = [...d.querySelectorAll('.s14-fields dt')].find(t => t.textContent === 'School');
          return [d.querySelector('h3').textContent, dd ? dd.nextElementSibling.textContent : null, (d.querySelector('.s14-source') || {}).textContent,
            (d.querySelector('.s14-text') || {}).textContent];
        }));
        await page.click('.s14-detail [data-s14="back"]');
        await page.waitForSelector('.s14-row', {state:'visible'});
      }
      check('GIH-UI-OPENS-OWN-SCHOOL', opened, WANT_RECORDS.map((w, i) => [GIFT, w[1], w[2], ownText[i]]));
      // The School filter lists each School's own Gift of the Lady.
      check('GIH-FACET-SCHOOL', await page.evaluate(([G, D, M]) => {
        const F = window.__L5R_TEST__.FACETS141;
        if (!F) return 'no facets';
        return [D, M].map(n => F.query({category:'techniques', text:G, filters:{school:[n]}, limit:20}).results
          .filter(h => h.name === G).map(h => [h.tags[0], h.source]));
      }, [GIFT, DOJI, MONK]), [[WANT_RECORDS[0].slice(1)], [WANT_RECORDS[1].slice(1)]]);
    });
    check('GIH-CHARACTER-UNCHANGED', await page.evaluate(() => JSON.stringify(window.__L5R_TEST__.collectData()) === window.__giftBefore));
    check('GIH-STORAGE-UNCHANGED', await page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()) === window.__giftStorage));
    await context.close();
    // Guard: an older save's Technique row keeps the text it was given; nothing in a save is rewritten.
    ({context, page} = await open());
    await section('GIH-OLD-SAVE', async () => {
      check('GIH-OLD-SAVE-KEEPS-TEXT', await page.evaluate(() => {
        const T = window.__L5R_TEST__, d = T.collectData();
        const old = '[School Technique — Rank 2, Hiruma Scout [Bushi]] Older text. (Imperial Histories p.147 (no outfit specified))';
        d.tech.push({name:'Run Like the Wind', cost:0, desc:old});
        T.applyData(d);
        const row = [...document.querySelectorAll('#techList .entry')].find(e => e.querySelector('.en-name').value === 'Run Like the Wind');
        return row ? row.querySelector('.en-desc').value === old : 'no row';
      }), true);
    });
    await context.close();
    check('GIH-NO-PAGE-ERRORS', errors, []);
  } finally { await browser.close(); }
  const pass = results.filter(r => r.pass).length;
  if (results.length !== TOTAL) console.log('Unexpected check count ' + results.length + ', expected ' + TOTAL);
  console.log(pass + '/' + results.length + ' checks passed');
  process.exitCode = pass === results.length && results.length === TOTAL ? 0 : 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
