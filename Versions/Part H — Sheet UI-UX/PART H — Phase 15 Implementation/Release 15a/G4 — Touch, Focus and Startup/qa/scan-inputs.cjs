'use strict';
// Every editable control in the app at phone width, rendered or not, with its computed font size. node scan-inputs.cjs <sheet> <fixture> <name>
const path=require('path'),{pathToFileURL}=require('url');const {chromium}=require('playwright');
const [sheet,fixture,name]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();
p.on('dialog',d=>d.accept().catch(()=>{}));
await p.goto(pathToFileURL(path.resolve(sheet)).href,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready,null,{timeout:60000});
await p.waitForFunction(()=>!document.getElementById('l5rSplash'));
await p.locator('#fileImport').setInputFiles(path.resolve(fixture));await p.waitForFunction(n=>document.getElementById('f_name').value===n,name);await p.waitForTimeout(500);
await p.evaluate(()=>window.__L5R_TEST__.MODES12.set('management'));
const scan=()=>p.evaluate(()=>{const out={};const sel='input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]):not([type=range]):not([type=button]):not([type=submit]):not([type=color]),textarea,select,[contenteditable=""],[contenteditable=true]';
 document.querySelectorAll(sel).forEach(e=>{const fs=parseFloat(getComputedStyle(e).fontSize);const r=e.getBoundingClientRect();const shown=r.width>0&&r.height>0;
  const anc=e.closest('[id]');const key=e.tagName.toLowerCase()+(e.type&&e.tagName==='INPUT'?'['+e.type+']':'')+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).join('.'):'')+' in #'+(anc&&anc!==e?anc.id:(e.parentElement.closest('[id]')||{}).id);
  const k=key.replace(/\d+/g,'N');out[k]=out[k]||{fs:[],n:0,shown:0};out[k].n++;if(shown)out[k].shown++;if(!out[k].fs.includes(fs))out[k].fs.push(fs);});return out;});
const all={};const merge=o=>{for(const[k,v]of Object.entries(o)){all[k]=all[k]||{fs:[],n:0,shown:0};all[k].n=Math.max(all[k].n,v.n);all[k].shown=Math.max(all[k].shown,v.shown);v.fs.forEach(f=>{if(!all[k].fs.includes(f))all[k].fs.push(f)});}};
merge(await scan());
// open the Search page and the Characters list, and a few pickers, then scan again
for(const label of ['Search','Characters','Library']){await p.locator('.ab113-item',{hasText:label}).first().click().catch(()=>{});await p.waitForTimeout(600);merge(await scan());}
await p.locator('.ab113-item',{hasText:'Sheet'}).first().click().catch(()=>{});await p.waitForTimeout(400);
const labels=await p.evaluate(()=>[...document.querySelectorAll('.car-tab')].map(t=>t.textContent));
for(const l of labels){await p.evaluate(async l=>{const C=window.__L5R_CAROUSEL__;C.goToTab(l);await C.whenSettled();},l);
 const n=await p.evaluate(()=>{const pg=document.querySelector('.car-page:not([inert])');const bs=[...pg.querySelectorAll('button')].filter(b=>b.offsetParent&&/^(\+|add|choose|pick)/i.test(b.textContent.trim()));bs.forEach((b,i)=>b.dataset.g4scan=i);return bs.length;});
 for(let i=0;i<n;i++){try{await p.locator(`.car-page:not([inert]) [data-g4scan="${i}"]`).click({timeout:1500});await p.waitForTimeout(350);merge(await scan());}catch(e){}
  await p.keyboard.press('Escape');await p.waitForTimeout(150);
  await p.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());});}}
for(const fn of ['openSkillPicker','openAdvPicker','openDisadvPicker','openSpellPicker','openKataPicker','openKihoPicker','openWeaponPicker','openArmorPicker','openItemPicker']){
 const ok=await p.evaluate(f=>{try{if(typeof window[f]==='function'){window[f]();return true}}catch(e){}return false},fn);if(ok){await p.waitForTimeout(300);merge(await scan());await p.keyboard.press('Escape');}}
const small=Object.entries(all).filter(([k,v])=>v.fs.some(f=>f!=16)).sort();
console.log('editable kinds',Object.keys(all).length,'with some size under 16:',small.length);
for(const [k,v] of small)console.log(v.fs.map(f=>f.toFixed(2)).join('/'),'n',v.n,'shown',v.shown,k);
await b.close();})().catch(e=>{console.error(e);process.exitCode=1;});
