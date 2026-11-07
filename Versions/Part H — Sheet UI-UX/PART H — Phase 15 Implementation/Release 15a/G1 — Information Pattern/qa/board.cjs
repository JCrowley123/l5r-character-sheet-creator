'use strict';
// Release 15a, group G1: compose the mockup boards (today beside proposed) from prototype.cjs's shots.
// node board.cjs <shots folder> <inventory folder> <out folder>
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [shots, inv, out] = process.argv.slice(2, 5).map(p => path.resolve(p));
fs.mkdirSync(out, {recursive: true});
const img = (dir, f) => fs.existsSync(path.join(dir, f)) ? `<img src="${pathToFileURL(path.join(dir, f)).href}">` : `<div class="missing">${f} missing</div>`;
const S = f => img(shots, f);
const pair = (title, today, proposed, note = '') => `<section><h2>${title}</h2>${note ? `<p class="note">${note}</p>` : ''}
  <div class="pair"><figure><figcaption>Today</figcaption>${today}</figure><figure class="new"><figcaption>Proposed</figcaption>${proposed}</figure></div></section>`;
const css = `body{font:15px/1.4 Georgia,serif;background:#f3ecdc;color:#2a2118;margin:0;padding:24px;width:1100px}
h1{font-size:26px;margin:0 0 4px}.sub{margin:0 0 18px;color:#5a4a36}h2{font-size:18px;margin:18px 0 6px}
.note{margin:0 0 8px;color:#5a4a36;font-size:14px}.pair{display:flex;gap:18px;align-items:flex-start}
figure{margin:0;flex:1;background:#fff;border:1px solid #cdbb94;border-radius:8px;padding:10px}figure.new{border:2px solid #2a2118}
figcaption{font:bold 12px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;color:#7a5c2a}
figure.new figcaption{color:#2a2118}img{max-width:100%;display:block;margin:0 auto 6px}
.three{display:flex;gap:12px;align-items:flex-start}.three figure{flex:1}
table{border-collapse:collapse;font-size:13px;width:100%;background:#fff}td,th{border:1px solid #cdbb94;padding:4px 6px;text-align:left;vertical-align:top}
.tag{display:inline-block;font:bold 11px system-ui;padding:2px 6px;border-radius:9px;background:#2a2118;color:#fff;margin-left:6px}
.opt{background:#7a5c2a}`;

const boards = {
  'G1-A04-one-information-pattern': `<h1>A04 · One information pattern</h1><p class="sub">Phone, 390 × 844. The upright circled i that Advantages A01–A16 already use (28 px ring in ink, upright serif i) becomes the only information control. Every one has an accessible name and a 44 × 44 px touch area. None sits inside another button. "Why can't I cast this?" (?) stays as it is.</p>` +
    pair('Skills: the eye becomes the circled i <span class="tag">Play</span>', S('phone-play-skill0-today.png'), S('phone-play-skill0-new.png'), 'Same button, same class (.sk-info-btn) and same place A03 gave it, at the end of the card\'s second row. It also gets a name for screen readers ("Calligraphy information").') +
    pair('Advantages and Disadvantages: the gold italic i comes out of the button it sat in <span class="tag">Manage</span>', S('phone-management-choose-today.png'), S('phone-management-choose-new.png'), 'Today the 18 px gold italic i is drawn INSIDE "Choose…". A tap near it is ambiguous. It now sits beside the button, the same as on a configured row.') +
    pair('Techniques: the Kiho note\'s ⓘ in a gold ring', S('phone-play-kiho-today.png'), S('phone-play-kiho-new.png')) +
    pair('Hotei: static explanation behind the i <span class="tag opt">part of A04, your call</span>', S('phone-management-hotei-today.png'), S('phone-management-hotei-new.png'), 'The audit\'s own example. The choice, the price and what it does to your Void stay on the card. The rule and the two instructions (Void card, Dark Paragon and the Ancestor gifts) move behind the i, word for word.') +
    pair('Void Points: the eye <span class="tag opt">optional, outside the four areas</span>', S('phone-void-today.png'), S('phone-void-new.png'), 'Rings & Traits is not Skills, spells or Advantages, but it is the only other eye on the sheet. Include it, or leave it for later.'),
  'G1-A04-desktop': `<h1>A04 · the same on a laptop</h1><p class="sub">1440 × 1000. The Skills table keeps its layout; only the control changes.</p>` +
    pair('Skills table row', S('desktop-play-skill0-today.png'), S('desktop-play-skill0-new.png')) +
    pair('Unconfigured row: "Choose…"', S('desktop-management-choose-today.png'), S('desktop-management-choose-new.png')) +
    pair('Hotei <span class="tag opt">your call</span>', S('desktop-management-hotei-today.png'), S('desktop-management-hotei-new.png')),
  'G1-A15-court-chips': `<h1>A15 · Court badges (revision 2)</h1><p class="sub">Phone, 390 × 844. Your design: each court is its own badge, a gold outline on the page colour. <b>Tap a badge and it fills: that court is in session</b> and the Status readout counts one Rank higher there. Tap it again and it empties: no court in session, no bonus. The blue radio dot and the "Court in session" tick box are gone. No tick symbol and no black. Every badge and + Add court is 44 px tall.</p>` +
    `<section><h2>Manage: today, then the two states</h2><div class="three"><figure><figcaption>Today</figcaption>${S('phone-court-r2-today.png')}</figure>
<figure class="new"><figcaption>No court in session</figcaption>${S('phone-management-court-r2-none.png')}</figure>
<figure class="new"><figcaption>Tap Kyuden Doji: in session</figcaption>${S('phone-management-court-r2-on.png')}</figure></div></section>` +
    `<section><h2>Which fill? <span class="tag opt">your call</span></h2><p class="note">You can be at only one court at a time (the sheet stores one), so tapping another badge moves the session there. Both images show Toshi Ranbo after that tap. The fill colour is the one choice left: the sheet's own two golds. The court name has to stay readable on it.</p><div class="pair"><figure class="new"><figcaption>Deeper gold, as the Cast buttons' text · recommended</figcaption>${S('phone-management-court-r2-moved.png')}<p class="note">Text contrast 4.9 : 1, readable.</p></figure>
<figure><figcaption>Sheet gold, as the roll dice buttons</figcaption>${S('phone-management-court-r2-gold.png')}<p class="note">Text contrast 2.8 : 1, below the 4.5 : 1 readability line.</p></figure></div></section>` +
    `<section><h2>Play</h2><p class="note">The badges still work in Play, because whether court is in session changes during a game. + Add court shows in Manage only, because it changes what you paid (2 XP a court).</p><div class="pair"><figure class="new"><figcaption>No court in session</figcaption>${S('phone-play-court-r2-none.png')}</figure><figure class="new"><figcaption>In session</figcaption>${S('phone-play-court-r2-on.png')}</figure></div></section>` +
    `<section><h2>Laptop, Manage</h2><div class="three"><figure><figcaption>Today</figcaption>${S('desktop-court-r2-today.png')}</figure><figure class="new"><figcaption>None</figcaption>${S('desktop-management-court-r2-none.png')}</figure><figure class="new"><figcaption>In session</figcaption>${S('desktop-management-court-r2-on.png')}</figure></div></section>
<p class="note"><b>What stays the same:</b> the saved character (one chosen court and an in-session flag), so every saved character loads exactly as before. The price, the i and Change. Rename and remove stay in the editor. Screen readers hear each badge as a toggle button ("Kyuden Doji, in session, pressed").</p>`,
};
// A15 revision 3 (owner, 7 Nov): the fill follows the Clan colour.
const CLANS = [['Crane', 6.41], ['Crab', 5.82], ['Dragon', 5.72], ['Lion', 6.08], ['Phoenix', 7.15], ['Scorpion', 9.44], ['Unicorn', 9.11], ['none', 7.91]];
boards['G1-A15-court-badges-clan'] = `<h1>A15 · Court badges in the Clan colour (revision 3)</h1><p class="sub">Phone, 390 × 844. Same design as revision 2: a gold outline on the page colour; tap to fill, which means that court is in session; tap again to empty it. The fill is now <b>the Clan's own colour</b>: the same deep shade the sheet already uses for section headings and reached Masteries (Crane blue below). It changes by itself when the Clan changes. A character with no Great Clan, or a Minor Clan, keeps the sheet's own red.</p>` +
  `<section><h2>Crane</h2><div class="three"><figure class="new"><figcaption>No court in session</figcaption>${S('phone-court-r3-Crane-off.png')}</figure>
<figure class="new"><figcaption>Kyuden Doji in session · Manage</figcaption>${S('phone-court-r3-Crane.png')}</figure>
<figure class="new"><figcaption>In session · Play</figcaption>${S('phone-court-r3-Crane-play.png')}</figure></div></section>` +
  `<section><h2>Every Clan</h2><p class="note">The court name on the fill is readable for every Clan: the contrast is at least 5.7 : 1, above the 4.5 : 1 line. The figure under each image is that Clan's measured contrast.</p><div style="display:flex;flex-wrap:wrap;gap:10px">` +
  CLANS.map(([c, r]) => `<figure style="flex:0 0 255px"><figcaption>${c === 'none' ? 'No Great Clan (sheet red)' : c}</figcaption>${S(`phone-court-r3-${c}.png`)}<p class="note">${r} : 1</p></figure>`).join('') + `</div></section>` +
  pair('Laptop, Crane', S('desktop-court-r2-today.png'), S('desktop-court-r3-Crane.png')) +
  `<p class="note">Unchanged from revision 2: one court in session at a time, saved characters load as before, + Add court in Manage only, and screen readers hear each badge as a toggle button.</p>`;
// A16: the seven pickers.
const SEVEN = ['A01', 'A03', 'A04', 'A09', 'A12', 'A13', 'A14'];
const NAMES = {A01: 'Seven Fortunes’ Blessing', A03: 'Dark Paragon', A04: 'Darling of the Court', A09: 'Paragon', A12: 'Soul of Artistry', A13: 'Touch of the Spirit Realms', A14: 'Void Versatility'};
const invJson = JSON.parse(fs.readFileSync(path.join(inv, 'inventory.json'), 'utf8'));
const only = {A01: 'Nothing that matters: the picker’s note gives the Clan discount and each Fortune’s Rule disclosure gives its rule.',
  A03: 'The price (5 XP, 4 Spider); payment on confirm; the reroll stands; Reset each session. The note already gives "once per session: 5 Honor points, or a Void Point only without them".',
  A04: 'The fuller rule wording (Status counts one Rank higher while in session), the examples and the Courtier test. The note already gives "2 XP each, 1 XP for a Courtier" and "a court can be listed only once".',
  A09: 'The price (7 XP, 6 Lion). The note already gives the core rule and "reminder only".',
  A12: 'The price (4 XP, 3 Crane or Courtier) and the Artisan and Craft examples. The note already gives the core rule.',
  A13: 'Per-Realm "added automatically" and "reminder" notes. Each Realm lists its own rule and price, and the note gives the Shugenja prices.',
  A14: 'The slot-choice detail (the sheet asks which slot pays; ✕ spends nothing) and who may take it. The note already gives the core rule and this character’s eligibility.'};
boards['G1-A16-bottom-i'] = `<h1>A16 · The bottom i in the seven pickers</h1><p class="sub">The 24 September device pass (S1, S2) named seven pickers: A01, A03, A04, A09, A12, A13 and A14, all confirmed in today's build. Each one adds its own i at the foot of the picker. <b>Measured on today's build:</b> in all seven the picker's own note already states the core rule, and after Confirm the row's i opens every sentence the bottom i holds (checked for all seven: nothing is lost). While you are choosing, the bottom i adds only detail, listed below, chiefly the price in A03, A09 and A12.</p>
<div class="three"><figure><figcaption>Today (A14 Void Versatility)</figcaption>${S('phone-picker-A14-today.png')}</figure>
<figure class="new"><figcaption>Option 1 · Remove, as ruled</figcaption>${S('phone-picker-A14-remove.png')}</figure>
<figure class="new"><figcaption>Option 2 · Move it beside the title</figcaption>${S('phone-picker-A14-move.png')}</figure></div>
<h2>What only the bottom i says, picker by picker</h2><table><tr><th>ID</th><th>Picker</th><th>Found only behind the bottom i while choosing</th></tr>` +
  SEVEN.map(id => `<tr><td>${id}</td><td>${NAMES[id]}</td><td>${only[id]}</td></tr>`).join('') + `</table>
<p class="note" style="margin-top:10px"><b>Recommended: Option 1</b>, as Q3 ruled. The detail is one tap away on the row after Confirm, and Cancel costs nothing. Option 2 is the alternative if you want the detail reachable while choosing too: the same circled i in the same place in all seven, beside the title instead of after the options. Either way, nothing else in the pickers changes.</p>`;
boards['G1-A16-seven-today'] = `<h1>A16 · the seven pickers today</h1><p class="sub">Phone, Management. The bottom i is the last item in each.</p><div style="display:flex;flex-wrap:wrap;gap:10px">` +
  SEVEN.map(id => `<figure style="flex:0 0 340px"><figcaption>${id} · ${NAMES[id]}</figcaption>${S(`phone-picker-${id}-today.png`)}</figure>`).join('') + '</div>';
boards['G1-extra-skill-info'] = `<h1>A03.1 · Masteries in the Skill information</h1><p class="sub">Your A03 idea, now G1's fourth unit (its own folder, switch and removal; about 2–3 points). The Skill window (opened by the i under A04) gains a <b>Mastery Abilities</b> list after the Emphases. Each Mastery shows the Rank that grants it; those you have reached are marked in the Clan colour, as on the Skill card, and the rest in grey. It uses the same data as the card's Mastery notes, so the two always agree. The Debug buttons below are unchanged.</p>` +
  pair('A Skill with Masteries reached (Defense, raised to Rank 5 for this picture)', S('phone-skillinfo-today.png'), S('phone-skillinfo-reached.png')) +
  `<section><h2>The other two cases</h2><div class="pair"><figure class="new"><figcaption>None reached yet (Calligraphy, Rank 1)</figcaption>${S('phone-skillinfo-notYet.png')}</figure><figure class="new"><figcaption>A Skill with no Masteries (Lore: Shadowlands)</figcaption>${S('phone-skillinfo-none.png')}</figure></div></section>` +
  pair('Laptop', S('desktop-skillinfo-today.png'), S('desktop-skillinfo-reached.png'));

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport: {width: 1148, height: 800}});
    for (const [name, body] of Object.entries(boards)) {
      const file = path.join(out, name + '.html');
      fs.writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${css}</style>${body}`);
      await page.goto(pathToFileURL(file).href); await page.waitForLoadState('load');
      await page.screenshot({path: path.join(out, name + '.png'), fullPage: true});
      console.log(name + '.png');
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
