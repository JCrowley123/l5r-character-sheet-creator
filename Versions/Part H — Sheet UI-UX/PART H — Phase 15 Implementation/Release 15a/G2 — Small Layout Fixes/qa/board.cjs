'use strict';
// Release 15a, group G2: compose the mockup boards (today beside proposed) from prototype.cjs's shots (G1's board.cjs pattern).
// node board.cjs <shots folder> <out folder>      (PW_CHANNEL=msedge while the bundled Chromium crashes)
const fs = require('fs'), path = require('path'), {pathToFileURL} = require('url');
const {chromium} = require('playwright');
const [shots, out] = process.argv.slice(2, 4).map(p => path.resolve(p));
fs.mkdirSync(out, {recursive: true});
const meta = JSON.parse(fs.readFileSync(path.join(shots, 'prototype-meta.json'), 'utf8')).pickers;
const S = f => fs.existsSync(path.join(shots, f)) ? `<img src="${pathToFileURL(path.join(shots, f)).href}">` : `<div class="missing">${f} missing</div>`;
const pair = (title, today, proposed, note = '') => `<section><h2>${title}</h2>${note ? `<p class="note">${note}</p>` : ''}
  <div class="pair"><figure><figcaption>Today</figcaption>${today}</figure><figure class="new"><figcaption>Proposed</figcaption>${proposed}</figure></div></section>`;
const css = `body{font:15px/1.4 Georgia,serif;background:#f3ecdc;color:#2a2118;margin:0;padding:24px;width:1100px}
h1{font-size:26px;margin:0 0 4px}.sub{margin:0 0 18px;color:#5a4a36}h2{font-size:18px;margin:18px 0 6px}
.note{margin:0 0 8px;color:#5a4a36;font-size:14px}.pair{display:flex;gap:18px;align-items:flex-start}
figure{margin:0;flex:1;background:#fff;border:1px solid #cdbb94;border-radius:8px;padding:10px}figure.new{border:2px solid #2a2118}
figcaption{font:bold 12px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;color:#7a5c2a}
figure.new figcaption{color:#2a2118}img{max-width:100%;display:block;margin:0 auto 6px}
.row{display:flex;gap:12px;align-items:flex-start}.row figure{flex:1}
table{border-collapse:collapse;font-size:13px;width:100%;background:#fff}td,th{border:1px solid #cdbb94;padding:4px 6px;text-align:left;vertical-align:top}
.tag{display:inline-block;font:bold 11px system-ui;padding:2px 6px;border-radius:9px;background:#2a2118;color:#fff;margin-left:6px}.opt{background:#7a5c2a}`;
const both = (mode, slug, title, note) => pair(`${title} <span class="tag">${mode === 'play' ? 'Play' : 'Manage'}</span>`, S(`phone-${mode}-${slug}-today.png`), S(`phone-${mode}-${slug}-new.png`), note);
const H = k => meta[k] || {};

const boards = {
  'G2-A05-missing-limb': `<h1>A05 · Missing Limb's picker</h1><p class="sub">Phone, 390 × 844. It stays a native select, as ruled: a short fixed list, so no custom menu. It gets the shared field: the field label above it ("MISSING LIMB", the same small label every field on the sheet has), the field font and border, and a 44 px touch height. Today it is 25 px tall, in the browser's own Arial. The note sits below it with the shared helper gap.</p>` +
    both('management', 'Missing-Limb', 'The row') + both('play', 'Missing-Limb', 'The row') +
    pair('Laptop <span class="tag">Manage</span>', S('desktop-management-Missing-Limb-today.png'), S('desktop-management-Missing-Limb-new.png'), 'Today the note runs on beside the select. Proposed: label, select, note, top to bottom, the same as on the phone.'),
  'G2-A06-grant-actions': `<h1>A06 · Grant actions and their state (revision 2)</h1><p class="sub">Phone, 390 × 844. One compact group with a clear 10 px gap. The <b>primary</b> action is filled (Add N koku) and the <b>secondary</b> is outlined (Already added). Both are 44 px tall, and the state sits beside them ("Not recorded yet"). Once recorded, the buttons go and the state line says so in plain text: <b>no tick</b> (your round-1 change). The wording ("1.5 koku from Zakyo Toshi Citizen recorded on your Koku.") and the missing Add button already show it was added. Unchanged: the one-time guard (money moves only on a tap, recorded in the row), the reversal on removal, Return / Keep, and every wording.</p>` +
    both('management', 'Zakyo-Toshi-Citizen', 'Zakyo Toshi Citizen: before the tap') +
    pair('Zakyo Toshi Citizen: after Add 1.5 koku <span class="tag">Manage</span>', S('phone-management-Zakyo-Toshi-Citizen-today-done.png'), S('phone-management-Zakyo-Toshi-Citizen-new-done.png')) +
    both('management', 'Wealthy', 'Wealthy: an older save with no record of its koku', 'This is the state in which Wealthy shows its grant buttons today. The same group and state apply when you raise your Rank (Add the difference) and when you lower it (Return / Keep: Return is the primary).') +
    pair('Laptop <span class="tag">Manage</span>', S('desktop-management-Zakyo-Toshi-Citizen-today.png'), S('desktop-management-Zakyo-Toshi-Citizen-new.png')) +
    `<section><h2>Wealthy's picker <span class="tag opt">no change proposed</span></h2><p class="note">Inside the picker the two answers are a choice confirmed with Confirm, so they stay radio options, the same as every other picker.</p><div class="row"><figure style="flex:0 0 360px"><figcaption>Today and proposed</figcaption>${S('phone-picker-Wealthy-today.png')}</figure></div></section>`,
  'G2-A07-moon-row': `<h1>A07 · The Moon row</h1><p class="sub">Phone, 390 × 844. Three lines on one left edge. <b>1</b> A labelled severity row: "SEVERITY Medium — 5 points", then Change. <b>2</b> The full-moon toggle on its own line, a 22 px box in a 44 px row, in the sheet's body text rather than tiny capitals. Today it starts 10 px right of the line above. <b>3</b> "Resist Lord Moon (TN 20)" at 44 px. Unchanged: the wording, the tick's state and what it does, the extra Void pip and its order, and every rule.</p>` +
    both('management', 'Lord-Moon-s-Curse', 'The row') + both('play', 'Lord-Moon-s-Curse', 'The row') +
    pair('Laptop <span class="tag">Manage</span>', S('desktop-management-Lord-Moon-s-Curse-today.png'), S('desktop-management-Lord-Moon-s-Curse-new.png')),
  'G2-A11-text-edges': `<h1>A11 · Explanatory text: gaps and one left edge</h1><p class="sub"><b>1 · Your Advantage card point.</b> In Play the name and description are plain text, but each keeps its box's 10 px inner padding, so both start 10 px right of every line between them. This is measured the same on every Advantage and Disadvantage card, on the phone and the laptop. Proposed: in Play they lose that padding, so every line starts on one edge. In Manage they stay editable boxes, and text inside a box is inset by design, so Manage is unchanged.</p>` +
    both('play', 'Sworn-Enemy', 'Sworn Enemy (unconfigured)') + both('play', 'Paragon', 'Paragon (summary, reminder and description)') +
    pair('Laptop, Wealthy <span class="tag">Play</span>', S('desktop-play-Wealthy-today.png'), S('desktop-play-Wealthy-new.png')) +
    `<section><h2>2 · Insight and Spent XP (the audit's case) <span class="tag">Laptop</span></h2><p class="note">On the laptop both notes are pulled 4 px up into the fields above them. Proposed: the shared helper gap (6 px below the fields) and a readable 1.5 line height. On the phone the gap is already 14 px; there, only the line height changes.</p>
<div class="pair"><figure><figcaption>Today</figcaption>${S('desktop-management-hint-Insight-today.png')}${S('desktop-management-hint-SpentX-today.png')}</figure></div><div class="pair" style="margin-top:10px"><figure class="new"><figcaption>Proposed</figcaption>${S('desktop-management-hint-Insight-new.png')}${S('desktop-management-hint-SpentX-new.png')}</figure></div></section>` +
    `<section><h2>3 · What the whole-app read found (step 1) <span class="tag opt">your call</span></h2><table><tr><th>Where</th><th>What</th><th>Proposed</th></tr>
<tr><td>Every Adv/Disadv card, Play</td><td>name and description 10 px in from the lines between them</td><td><b>In A11</b> (above)</td></tr>
<tr><td>Identity, laptop</td><td>Insight and Spent XP notes 4 px over the fields</td><td><b>In A11</b> (above)</td></tr>
<tr><td>Lord Moon's Curse</td><td>the full-moon tick 10 px in</td><td>Fixed by A07</td></tr>
<tr><td>Six Disadvantage cards (Missing Limb, Lost Love, …)</td><td>the description box 2 px under the row's controls</td><td>Add to A11 (the same 6 px gap), or leave</td></tr>
<tr><td>Rings, laptop</td><td>"Ring = lower of its two traits" 12 px right of its label</td><td>Leave for later</td></tr>
<tr><td>Combat, Play</td><td>"Armor &amp; TN ⓘ" 15 px right of its heading; the bonus note 3 px under its field</td><td>Leave for later</td></tr>
<tr><td>Wounds</td><td>the table's first column 8 px right of its caption</td><td>Leave (a table cell's own padding)</td></tr></table></section>`,
  'G2-A04.1-pickers': `<h1>A04.1 · One way to show choices in pickers</h1><p class="sub">Phone, 390 × 844, the first screen of each picker. As you chose: each option shows its rule in full, in Paragon's option card. The "▶ Rule" disclosure (Seven Fortunes' Blessing) and the i on each option (Consumed, Failure of Bushido, Cursed by the Realm, Seven Fortunes' Curse) go. After you choose, the row's i keeps the text. <b>The inventory found exactly these five</b>: four pickers are already inline (Paragon, Dark Paragon, Touch of the Spirit Realms, Soul of Artistry), and the other 47 show only names and costs, so they have nothing to move.</p>` +
    `<section><h2>The reference: Paragon today</h2><div class="row"><figure style="flex:0 0 360px"><figcaption>Paragon (unchanged)</figcaption>${S('phone-picker-Paragon-today-screen.png')}</figure></div></section>` +
    ['Seven-Fortunes-Blessing', 'Consumed', 'Failure-of-Bushido', 'Seven-Fortunes-Curse', 'Cursed-by-the-Realm'].map(s =>
      `<section><h2>${s.replace(/-/g, ' ').replace('Fortunes', 'Fortunes’')}</h2><div class="pair"><figure><figcaption>Today</figcaption>${S(`phone-picker-${s}-today-screen.png`)}</figure><figure class="new"><figcaption>Proposed</figcaption>${S(`phone-picker-${s}-new-screen.png`)}</figure></div></section>`).join(''),
  'G2-A04.1-long-windows': `<h1>A04.1 · The long cases, in full</h1><p class="sub">Phone, 390 px wide. The whole window, scrolled top to bottom, with every rule shown. Heights are the window's content in px: today, then proposed. For comparison, Touch of the Spirit Realms, inline today with 10 rules, is 976 px.</p>
<table><tr><th>Picker</th><th>Today</th><th>Proposed</th></tr>` +
    ['Seven Fortunes’ Blessing', 'Seven Fortunes’ Curse', 'Cursed by the Realm', 'Failure of Bushido', 'Consumed'].map(n => `<tr><td>${n}</td><td>${H('phone:' + n).todayH}</td><td><b>${H('phone:' + n).newH}</b></td></tr>`).join('') + `</table>
<p class="note" style="margin-top:8px">Seven Fortunes' Blessing is the longest: seven full rules make it about 1.6 phone screens. Each rule is the text its "▶ Rule" shows today, word for word. Shortening the rules is not proposed, because rules copy was deferred by the owner in Phase 4.54 (Part I).</p>
<div class="row"><figure class="new"><figcaption>Seven Fortunes' Blessing</figcaption>${S('phone-picker-Seven-Fortunes-Blessing-new-full.png')}</figure><figure class="new"><figcaption>Cursed by the Realm</figcaption>${S('phone-picker-Cursed-by-the-Realm-new-full.png')}</figure><figure class="new"><figcaption>Seven Fortunes' Curse</figcaption>${S('phone-picker-Seven-Fortunes-Curse-new-full.png')}</figure></div>
<section><h2>Laptop</h2><div class="pair"><figure><figcaption>Blessing today</figcaption>${S('desktop-picker-Seven-Fortunes-Blessing-today-screen.png')}</figure><figure class="new"><figcaption>Blessing proposed</figcaption>${S('desktop-picker-Seven-Fortunes-Blessing-new-screen.png')}</figure></div></section>`,
};

(async () => {
  const browser = await chromium.launch(process.env.PW_CHANNEL ? {channel: process.env.PW_CHANNEL} : {});
  try {
    const page = await browser.newPage({viewport: {width: 1148, height: 800}});
    for (const [name, body] of Object.entries(boards)) {
      const file = path.join(out, name + '.html');
      fs.writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${css}</style>${body}`);
      await page.goto(pathToFileURL(file).href); await page.waitForLoadState('load');
      await page.screenshot({path: path.join(out, name + '.png'), fullPage: true});
      console.log(name + '.png ' + (await page.evaluate(() => document.querySelectorAll('.missing').length)) + ' missing');
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
