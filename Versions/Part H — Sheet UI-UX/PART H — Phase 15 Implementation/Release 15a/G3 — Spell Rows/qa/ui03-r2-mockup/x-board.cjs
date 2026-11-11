'use strict';
// Comparison board for the 8b.1-UI-03 revision 2 mock-up.   node x-board.cjs <shots> <out-dir>
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');const {chromium}=require('playwright');
const [shots,outDir]=process.argv.slice(2).map(p=>path.resolve(p));fs.mkdirSync(outDir,{recursive:true});
const img=(n,w)=>`<img style="width:${w}px;max-width:100%" src="data:image/png;base64,${fs.readFileSync(path.join(shots,n+'.png')).toString('base64')}">`;
const pair=(title,a,b,w,c)=>`<h3>${title}</h3><div class="row"><figure><figcaption>Today</figcaption>${img(a,w)}</figure><figure><figcaption>First mock-up</figcaption>${img(b,w)}</figure><figure class="pick"><figcaption>Narrower number box (52 px)</figcaption>${img(c,w)}</figure></div>`;
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UI-03 revision 2</title><style>
body{margin:0;background:#f4efe6;color:#2a2420;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:1240px;margin:0 auto;padding:24px 16px 40px}
h1{font:700 1.5rem Georgia,serif;margin:.2em 0 .4em}h3{font-size:1rem;margin:1.4em 0 .5em}p{max-width:76ch;margin:.4em 0}
.row{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));align-items:start}
figure{margin:0;background:#fff;border:1px solid #d8cdb8;border-radius:10px;padding:10px}figure.pick{border:2px solid #2f6b4f}
figcaption{font-size:.82rem;font-weight:700;margin-bottom:6px}.pick figcaption{color:#2f6b4f}
.eyebrow{font-size:.72rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#6b5d4d}
.decide{background:#2a2420;color:#fff;border-radius:8px;padding:12px 14px;margin-top:18px;max-width:86ch}
</style></head><body><main>
<div class="eyebrow">G3 · 8b.1-UI-03 revision 2 · scratch mock-up · 11 November 2026</div>
<h1>The × in its own corner on every card</h1>
<p>Today the × sits on top of the right end of the XP or Points box on every Technique, Advantage and Disadvantage card (34 × 36 px of overlap on a phone). Proposed: the same corner the spell cards now use. The number box moves left to make room, the × gets a 44 px target, and no card gets taller. In Play, where there is no ×, nothing changes.</p>
<p><b>Owner's follow-up:</b> the number box is narrowed from 70 to 52 px, centred, so the name gets most of its room back: on a phone the name box is 238 px today, 196 with the first mock-up and 214 with the narrower box. 52 px still shows three digits, or a negative number, on the laptop with the browser's up/down arrows showing; 44 px would not.</p>
${pair('Phone · School Technique','phone-today-techList0','phone-proposed-techList0',344,'phone-narrow-techList0')}
${pair('Phone · a configured Disadvantage','phone-today-disadvList0','phone-proposed-disadvList0',344,'phone-narrow-disadvList0')}
${pair('Phone · an Advantage','phone-today-advList1','phone-proposed-advList1',344,'phone-narrow-advList1')}
${pair('Laptop · an Advantage with its badge','laptop-today-advList1','laptop-proposed-advList1',560,'laptop-narrow-advList1')}
<div class="decide"><b>Decision:</b> approve the narrower version for every card in Techniques, Kata &amp; Spells and in Advantages &amp; Disadvantages, or ask for changes.</div>
</main></body></html>`;
fs.writeFileSync(path.join(outDir,'G3-UI03-R2-MOCKUP.html'),html);
(async()=>{const b=await chromium.launch();try{const p=await b.newPage({viewport:{width:1100,height:900}});await p.goto(pathToFileURL(path.join(outDir,'G3-UI03-R2-MOCKUP.html')).href);
await p.screenshot({path:path.join(outDir,'G3-UI03-R2-MOCKUP.png'),fullPage:true});console.log('ok');}finally{await b.close();}})();
