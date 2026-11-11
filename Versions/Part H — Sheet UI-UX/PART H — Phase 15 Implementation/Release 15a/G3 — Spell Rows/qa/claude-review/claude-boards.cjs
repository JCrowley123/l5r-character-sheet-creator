'use strict';
// Composes the Claude review page and PNG boards from scratch screenshots. No app preloads needed.
// usage: node claude-boards.cjs <claude-shots> <codex-prototype-shots> <output-directory>
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('playwright');
const [shots,codex,out]=process.argv.slice(2).map(p=>path.resolve(p));fs.mkdirSync(out,{recursive:true});
const meta=JSON.parse(fs.readFileSync(path.join(shots,'claude-prototype.json'),'utf8'));
const img=(dir,name,w,alt)=>{const f=path.join(dir,name+'.png');if(!fs.existsSync(f))throw new Error('missing '+f);return `<img alt="${alt||name}" style="width:${w}px" src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}">`;};
const P=(n,alt)=>img(shots,n,344,alt),D=(n,alt)=>img(shots,n,352,alt),L=(n,alt)=>img(shots,n,1134,alt);
const h=(d,k,i)=>meta.devices[d].states[k][i].rowHeight;
const card=(title,note,body,cls='')=>`<figure class="card ${cls}"><figcaption><b>${title}</b>${note?`<span>${note}</span>`:''}</figcaption><div class="shot">${body}</div></figure>`;
const stack=(v)=>[0,2,3].map(i=>L(`laptop-management-${v}-${i}`)).join('');
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>G3 mockups — Claude review</title><style>
:root{--bg:#f4efe6;--card:#fff;--ink:#2a2420;--soft:#6b5d4d;--line:#d8cdb8;--accent:#7a5c1e;--keep:#2f6b4f;--warn:#a3332a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1240px;margin:0 auto;padding:24px 16px 48px}
.eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--soft)}
h1{font:700 1.7rem/1.2 Georgia,serif;margin:.2em 0 .5em}h2{font:700 1.35rem/1.25 Georgia,serif;margin:0 0 .3em}h3{font-size:1rem;margin:1.6em 0 .6em}
p{margin:.4em 0;max-width:74ch}.small{font-size:.85rem;color:var(--soft)}
section{margin-top:28px;padding-top:24px;border-top:1px solid var(--line)}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));align-items:start}
.grid.four{grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr))}
.card{margin:0;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px;min-width:0}
.card figcaption{font-size:.82rem;margin-bottom:8px;display:flex;flex-wrap:wrap;gap:2px 8px;align-items:baseline}
.card figcaption span{color:var(--soft)}
.card.pick{border:2px solid var(--keep)}.card.pick figcaption b{color:var(--keep)}
.shot{display:flex;flex-direction:column;align-items:center;gap:4px;overflow:hidden}.shot img{max-width:100%;height:auto;display:block}
.wide .shot{align-items:stretch}
table{border-collapse:collapse;font-size:.88rem;margin:.6em 0;width:100%;max-width:760px}th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:right}th:first-child,td:first-child{text-align:left}th{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--soft)}
td.best{font-weight:700;color:var(--keep)}
.tw{overflow-x:auto}
.verdict{background:#ebe3d3;border-left:4px solid var(--accent);border-radius:6px;padding:12px 14px;margin:14px 0;max-width:86ch}
.verdict b{font-weight:700}
ul{margin:.4em 0;padding-left:1.2em;max-width:74ch}li{margin:.25em 0}
.decide{background:var(--ink);color:#fff;border-radius:8px;padding:12px 14px;margin-top:16px;max-width:86ch}
footer{margin-top:32px;font-size:.78rem;color:var(--soft)}
</style></head><body><main>
<div class="eyebrow">G3 · Spell rows · Claude review of the scratch mockups · 11 November 2026</div>
<h1>Review of the three G3 mockups</h1>
<p>ChatGPT's boards were read in full and re-measured on the unchanged live build. Each finding below shows today's screen, ChatGPT's proposal and, where I would change it, my alternative. Green border marks the one I recommend. Nothing here is built; these are scratch treatments of the real app in an isolated browser.</p>
<div class="verdict"><b>Short version.</b> 1 — ChatGPT's dialog is right; I add counts that update as you tick. 2 and 3 — I recommend a different spell row (<b>C</b>): the same height as ChatGPT's Quiet option on a phone while still showing "School spell", no extra height at all on a laptop, and Remove stays in the corner where every other card has it.</div>

<section id="ui01"><div class="eyebrow">8b.1-UI-01</div><h2>Review starting spells</h2>
<p>ChatGPT's proposal already uses the option card the app's other pickers use (measured against Paragon's: same border, radius and font), puts Later and Confirm together below a divider, and keeps them in view while a long list scrolls. I would keep all of that.</p>
<p><b>What I add.</b> Today, and in ChatGPT's version, "Given · 3 left" never changes while you tick — you count for yourself and only learn you went over when Confirm refuses. In mine each group shows a running count, turns solid when it is complete and red with "deselect 1" when it is over. The headings use the same serif bold as the pickers and the next screen, and "Given" reads "Given by your School" as that next screen does.</p>
<div class="grid">
${card('Today · live build','Confirm touches the Earth box',D('phone-review-today'))}
${card('ChatGPT proposal','count stays at "3 left"',img(codex,'phone-review-proposed',352))}
${card('Claude · recommended','same layout, live counts',D('phone-review-claude-partial'),'pick')}
</div>
<h3>Long list and laptop, with the counts</h3>
<div class="grid">
${card('Phone · 20 held spells, scrolled to Air','one too many ticked; actions stay put',D('phone-long-review-claude-air'))}
${card('Laptop · two columns','as ChatGPT proposed, plus counts',img(shots,'laptop-review-claude-partial',560))}
</div>
<p class="small">Checked on the scratch build at both widths: Later closes and writes nothing; Confirm with eight spells leaves Jurojin's Balm as a reward and offers only the Earth choice; an over-count Confirm is still refused with nothing written; every option is 44 px tall; the action bar does not move when the list scrolls (754 px on phone before and after).</p>
<div class="decide"><b>Decision 1:</b> approve ChatGPT's layout with the live counts (recommended), approve it without them, or revise.</div>
</section>

<section id="rows"><div class="eyebrow">8b.1-UI-02 and 8b.1-UI-03</div><h2>The spell row</h2>
<p>ChatGPT's two options both fix the problems. My concerns with them, measured:</p>
<ul>
<li><b>Height.</b> Every spell card grows from ${h('phone','management-today',0)} px to ${h('phone','management-codex-quiet',0)} px (A) or ${h('phone','management-codex-badge',0)} px (B) on a phone — and by the same amount on a laptop, where the name already had 775 px and nothing needed to move.</li>
<li><b>Remove moves.</b> On every other card in the app (Techniques, Advantages, Disadvantages) the × sits in the top-right corner. ChatGPT's row gives spells alone a boxed × at the end of the Cast line, which also makes Remove the heaviest control on the card.</li>
<li><b>B spends a whole line</b> on two words.</li>
</ul>
<p><b>Option C.</b> On a phone the name takes the first line with the × beside it in its usual corner; Cast, the help button and Memorised take the second line, and "School spell" sits at the end of that same line as a quiet tag (the app's existing tag style). On a laptop the row stays one line, as today, with the corner kept clear. Rewards show no tag. With more than one School the tag names the School instead.</p>
<h3>Phone · Manage</h3>
<div class="grid four">
${card('Today',`${h('phone','management-today',0)} px · name unreadable`,P('phone-management-today-0'))}
${card('ChatGPT A · Quiet',`${h('phone','management-codex-quiet',0)} px · no cue`,P('phone-management-codex-quiet-0'))}
${card('ChatGPT B · Badge',`${h('phone','management-codex-badge',0)} px`,P('phone-management-codex-badge-0'))}
${card('Claude C · recommended',`${h('phone','management-claude',0)} px · cue kept`,P('phone-management-claude-0'),'pick')}
</div>
<h3>Phone · Play</h3>
<div class="grid four">
${card('Today','',P('phone-play-today-0'))}
${card('ChatGPT A · Quiet','',P('phone-play-codex-quiet-0'))}
${card('ChatGPT B · Badge','',P('phone-play-codex-badge-0'))}
${card('Claude C','name read-only, Memorised locked, no ×',P('phone-play-claude-0'),'pick')}
</div>
<h3>Option C · other cases on a phone</h3>
<div class="grid four">
${card('Reward spell','no tag',P('phone-management-claude-2'))}
${card('Longest catalogue name','fits in full',P('phone-management-claude-3'))}
${card('Two Schools · one School\'s spell','tag names the School',P('phone-multiple-claude-0'))}
${card('Two Schools · credited to both','the tag takes a line of its own only here',P('phone-multiple-claude-1'))}
</div>
<h3>Laptop · Manage · a School spell, a reward and a long name</h3>
<div class="grid" style="grid-template-columns:1fr">
${card('Today',`${h('laptop','management-today',0)} px a card · × sits on Memorised`,stack('today'),'wide')}
${card('ChatGPT B · Badge',`${h('laptop','management-codex-badge',0)} px a School card, ${h('laptop','management-codex-badge',2)} px a reward`,stack('codex-badge'),'wide')}
${card('Claude C · recommended',`${h('laptop','management-claude',0)} px a card · same height as today, corner clear`,stack('claude'),'wide pick')}
</div>
<h3>Measured</h3>
<div class="tw"><table><thead><tr><th></th><th>Today</th><th>ChatGPT A</th><th>ChatGPT B</th><th>Claude C</th></tr></thead><tbody>
<tr><td>Phone · School spell card height</td><td>${h('phone','management-today',0)}</td><td>${h('phone','management-codex-quiet',0)}</td><td>${h('phone','management-codex-badge',0)}</td><td class="best">${h('phone','management-claude',0)}</td></tr>
<tr><td>Laptop · School spell card height</td><td>${h('laptop','management-today',0)}</td><td>${h('laptop','management-codex-quiet',0)}</td><td>${h('laptop','management-codex-badge',0)}</td><td class="best">${h('laptop','management-claude',0)}</td></tr>
<tr><td>Phone · room for the name (Manage)</td><td>0</td><td>298</td><td>298</td><td>${meta.devices.phone.states['management-claude'][0].nameTextWidth}</td></tr>
<tr><td>School cue shown</td><td>yes</td><td>no</td><td>yes</td><td class="best">yes</td></tr>
<tr><td>× and Memorised overlap</td><td>34 × 33</td><td>none</td><td>none</td><td>none</td></tr>
<tr><td>× target on a phone</td><td>40 × 40</td><td>44 × 44</td><td>44 × 44</td><td>44 × 44</td></tr>
<tr><td>× in the same place as other cards</td><td>yes</td><td>no</td><td>no</td><td class="best">yes</td></tr>
</tbody></table></div>
<p class="small">Heights in CSS pixels with a two-line description. C gives the name 42 px less than A/B in Manage (the × sits beside it); the longest name in the spell catalogue, "Wrath of Kaze-no-Kami (Hurricane)", still shows in full, and in Play the name has the full 298 px. A starting Kitsu holds nine spells: on a phone that list is about ${9*h('phone','management-today',0)} px today, ${8*h('phone','management-codex-badge',0)+h('phone','management-codex-badge',2)} px with B and ${9*h('phone','management-claude',0)} px with C.</p>
<p class="small">Checked on the scratch build at both widths: a tap on the Memorised label changes only that spell; a tap on the outer edge of the × removes only that reward; a renamed reward survives save-and-reapply; Play keeps the name read-only, Memorised locked and × hidden; saved spell records are identical before and after every treatment; no page errors.</p>
<h3>The two findings stay separate decisions</h3>
<div class="grid">
${card('UI-03 on its own (if UI-02 were declined)','today\'s School label; corner reserved, Memorised drops below',P('phone-management-claude-rm-0'))}
${card('UI-02 on its own (if UI-03 were declined)','name line and tag; × keeps today\'s 40 px target over the end of the name box, as it sits over the Points box on other cards',P('phone-management-claude-name-0'))}
${card('Both · option C','',P('phone-management-claude-0'),'pick')}
</div>
<div class="decide"><b>Decision 2 (name and School cue):</b> C (recommended), ChatGPT's A, ChatGPT's B, or revise.<br><b>Decision 3 (Remove and Memorised):</b> C — × stays in its corner with the corner kept clear (recommended), ChatGPT's boxed × on the Cast line, or revise.</div>
</section>
<footer>Prepared 11 November 2026 · live G2 source 77936023…82f0, unchanged · scratch screenshots at 390 × 844 and 1440 × 1000 in isolated Chromium · text marked "Layout sample" is filler, not rules text · the red × beside Cast on some cards is the existing casting-help button, not Remove · not a qualification run; native iPhone Safari and Laptop Edge checks come after a build.</footer>
</main></body></html>`;
fs.writeFileSync(path.join(out,'G3-CLAUDE-REVIEW.html'),html);
(async()=>{const b=await chromium.launch();try{
 const p=await b.newPage({viewport:{width:1240,height:900},deviceScaleFactor:1});await p.goto(pathToFileURL(path.join(out,'G3-CLAUDE-REVIEW.html')).href);
 await p.locator('#ui01').screenshot({path:path.join(out,'G3-CLAUDE-UI01.png')});await p.locator('#rows').screenshot({path:path.join(out,'G3-CLAUDE-ROWS.png')});
 const q=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await q.goto(pathToFileURL(path.join(out,'G3-CLAUDE-REVIEW.html')).href);
 const overflow=await q.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 await q.screenshot({path:path.join(out,'G3-CLAUDE-REVIEW-phone-top.png')});
 console.log(JSON.stringify({phoneHorizontalOverflow:overflow,bytes:fs.statSync(path.join(out,'G3-CLAUDE-REVIEW.html')).size}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
