'use strict';
// Phase 7.1 Audit Log (Release 7c). node audit-harness.js <sheet.html>
// Phase 7's test list: entries correct and immutable. The Crab test character, changed through the sheet's own fields.
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
const CRAB=JSON.parse(fs.readFileSync(path.join(__dirname,'7b1-checks-crab.l5r.json'),'utf8'));
const TOTAL=17,results=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,600)+' expected='+String(JSON.stringify(want)).slice(0,400)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{window.__L5R_TEST__.CL11?.close?.();});return p;}
// Loads the character; the first look after the load only sets the starting point.
async function load(p){await p.evaluate(d=>{const T=window.__L5R_TEST__,$=id=>document.getElementById(id);const o=$('al71Overlay');if(o)o.style.display='none';
T.resetToBaseline();T.applyData(d);T.recalcAll();T.AL71.check();},CRAB);}
// Types into a field as the sheet sees it, then looks; returns what the look added, as text.
const edit=(p,id,value)=>p.evaluate(([i,v])=>{const T=window.__L5R_TEST__,el=document.getElementById(i);el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));
 el.dispatchEvent(new Event('change',{bubbles:true}));T.recalcAll();return T.AL71.check().map(e=>T.AL71Logic.text(e));},[id,value]);
const look=p=>p.evaluate(()=>{const T=window.__L5R_TEST__;return T.AL71.check().map(e=>T.AL71Logic.text(e));});
const CASES=[
['AL-ENABLED',async p=>p.evaluate(()=>{const T=window.__L5R_TEST__;return !!T.AL71&&T.AL71.enabled();}),true],
['AL-LOAD-QUIET',async p=>{await load(p);return [await look(p),await p.evaluate(()=>window.__L5R_TEST__.AL71.entries().length)];},[[],0]],
['AL-XP-AWARDED',async p=>{await load(p);const x=await p.evaluate(()=>document.getElementById('f_xpTotal').value);const got=await edit(p,'f_xpTotal',String(Number(x)+5));
 return got.filter(t=>/^XP total/.test(t)).concat(got.filter(t=>!/^XP /.test(t)));},'__XP__'],
['AL-HONOR-TAINT',async p=>{await load(p);const a=await edit(p,'f_honorPts','4');const b=await edit(p,'f_taint','1');return [a,b];},[['Honor: 0.0 → 0.4'],['Taint: 0 → 1']]],
['AL-ADV-ADDED-REMOVED',async p=>{await load(p);const a=await p.evaluate(()=>{const T=window.__L5R_TEST__;document.getElementById('advList').appendChild(T.makeEntry({name:'Luck',cost:'3',desc:''},true));
 return T.AL71.check().map(e=>e.what+'|'+e.from+'|'+e.to);});const b=await p.evaluate(()=>{const T=window.__L5R_TEST__;document.querySelector('#advList .entry').remove();
 return T.AL71.check().map(e=>e.what+'|'+e.from+'|'+e.to);});return [a,b];},[['Advantage added|null|Luck'],['Advantage removed|Luck|null']]],
['AL-VOID-SPENT-BACK',async p=>{await load(p);const a=await p.evaluate(()=>{const T=window.__L5R_TEST__;T.consumeVoidPoint();return T.AL71.check().map(e=>T.AL71Logic.text(e));});
 const v=await p.evaluate(()=>document.getElementById('void_current').value);const b=await edit(p,'void_current',String(Number(v)+1));return [a,b];},[['Void Points: 3 → 2'],['Void Points: 2 → 3']]],
['AL-SCHOOL-FIELD-TECH',async p=>{await load(p);return p.evaluate(()=>{const T=window.__L5R_TEST__;document.getElementById('techList').appendChild(T.makeEntry({name:'Test Technique',cost:'0',desc:''},true,'XP'));
 return T.AL71.check().map(e=>T.AL71Logic.text(e));});},['Technique added: Test Technique']],
// Not every keystroke: typing 4 then 45 in quick succession is one entry, made once the sheet is still.
['AL-QUIET-TYPING',async p=>{await load(p);const n=await p.evaluate(async()=>{const T=window.__L5R_TEST__,el=document.getElementById('f_xpTotal'),before=T.AL71.entries().length;
 for(const v of ['4','45']){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));T.recalcAll();await new Promise(r=>setTimeout(r,200));}
 const mid=T.AL71.entries().length-before;await new Promise(r=>setTimeout(r,2200));
 return [mid,T.AL71.entries().slice(before).filter(e=>e.what==='XP total').map(e=>e.to)];});return n;},[0,['45']]],
['AL-IMMUTABLE',async p=>{await load(p);await edit(p,'f_taint','2');return p.evaluate(()=>{'use strict';const T=window.__L5R_TEST__,log=T.AL71.entries(),e=log[log.length-1],out=[];
 out.push(Object.isFrozen(log),Object.isFrozen(e));try{log.push({at:'x'});out.push('pushed');}catch(x){out.push('refused');}
 try{e.to='9';out.push('changed');}catch(x){out.push('refused');}out.push(T.AL71.entries()[T.AL71.entries().length-1].to,T.AL71.entries().length===log.length);return out;});},
 [true,true,'refused','refused','2',true]],
['AL-SAVED-ROUND-TRIP',async p=>{await load(p);await edit(p,'f_taint','3');return p.evaluate(()=>{const T=window.__L5R_TEST__,data=JSON.parse(JSON.stringify(T.collectData()));
 const saved=data.auditLog.map(e=>[e.what,e.from,e.to]);T.resetToBaseline();const cleared=T.AL71.entries().length;T.applyData(data);T.recalcAll();
 return [saved.slice(-1),cleared,T.AL71.entries().map(e=>[e.what,e.from,e.to]).length===saved.length,T.AL71.check().length];});},[[['Taint','0','3']],0,true,0]],
['AL-OLD-SAVE-EMPTY',async p=>{await load(p);await edit(p,'f_taint','4');await load(p);return p.evaluate(()=>[window.__L5R_TEST__.AL71.entries().length,'auditLog' in window.__L5R_TEST__.collectData()]);},[0,false]],
// Review finding 3: History joins the ⋯ menu whenever the toolbar is built, however late.
['AL-MENU-LATE',async p=>{return p.evaluate(()=>{const T=window.__L5R_TEST__,h=document.getElementById('al71SheetHistory');if(h)h.remove();
 T.CL11.addToolbarButton();return !!document.querySelector('#pm128Menu #al71SheetHistory');});},true],
// Review finding 5: a field's own input event, which reaches the sheet's first recalcAll, is logged once the sheet is still.
['AL-FIELD-EVENT',async p=>{await load(p);return p.evaluate(async()=>{const T=window.__L5R_TEST__,el=document.getElementById('f_taint'),before=T.AL71.entries().length;
 el.value='6';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,2200));
 return T.AL71.entries().slice(before).map(e=>T.AL71Logic.text(e));});},['Taint: 0 → 6']],
['AL-LOGIC',async p=>p.evaluate(()=>{const L=window.__L5R_TEST__.AL71Logic;if(!L)return null;const at='2026-10-29T12:00:00.000Z';
 const many=L.append([],Array.from({length:600},(_, i)=>L.entry(at,'n',null,String(i))));
 const d=L.diff({values:{a:'1'},lists:{X:['p','p']}},{values:{a:'2'},lists:{X:['p','q']}},at).map(L.text);
 return [many.length,many[0].to,many[499].to,L.load([{at:'bad'},{at,what:'Taint',from:'0',to:'1'},null]).length,d];}),
 [500,'100','599',1,['a: 1 → 2','X added: q','X removed: p']]],
// Read-only, newest first, from the sheet's ⋯ menu.
['AL-SHEET-HISTORY',async p=>{await load(p);await edit(p,'f_taint','1');await edit(p,'f_taint','2');await p.locator('#pm128More').click();
 const inMenu=await p.evaluate(()=>!!document.querySelector('#pm128Menu #al71SheetHistory'));await p.locator('#al71SheetHistory').click();
 const got=await p.evaluate(()=>{const o=document.getElementById('al71Overlay'),items=Array.from(o.querySelectorAll('.al71-what')).map(x=>x.textContent);
 return [getComputedStyle(o).display,items.slice(0,2),o.querySelectorAll('input,textarea,select,[contenteditable]').length];});
 await p.locator('#al71Close').click();return [inMenu].concat(got);},[true,'flex',['Taint: 1 → 2','Taint: 0 → 1'],0]],
// From each character's menu in the Characters list, without opening the sheet. Create New opens the wizard, closed first.
['AL-LIST-HISTORY',async p=>{await load(p);await p.evaluate(()=>{window.__al71New=window.__L5R_TEST__.CL11.createNew();});await p.waitForTimeout(400);
 await p.evaluate(()=>{const o=document.getElementById('appConfirmOverlay');if(o&&getComputedStyle(o).display!=='none')document.getElementById('appConfirmOk').click();});
 const got=await p.evaluate(async()=>{const T=window.__L5R_TEST__,C=T.CL11,$=id=>document.getElementById(id);await window.__al71New;T.CW112.close();
 const el=$('f_taint');el.value='5';el.dispatchEvent(new Event('input',{bubbles:true}));T.recalcAll();T.AL71.check();await C.flush();await C.open();
 await new Promise(r=>setTimeout(r,300));return !!C.view.querySelector('.cl11-row .al71-item');});
 await p.locator('.cl11-row').first().locator('.cl11-more').click();await p.locator('.cl11-row').first().locator('.al71-item').click();
 const shown=await p.evaluate(()=>{const o=document.getElementById('al71Overlay');return [getComputedStyle(o).display,Array.from(o.querySelectorAll('.al71-what')).map(x=>x.textContent)[0]];});
 await p.locator('#al71Close').click();await p.evaluate(()=>window.__L5R_TEST__.CL11.close());return [got].concat(shown);},[true,'flex','Taint: 0 → 5']],
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want0] of CASES){let got,want=want0;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}
 if(want==='__XP__'){const x=Number(CRAB.fields.f_xpTotal||0);want=['XP total: '+x+' → '+(x+5)];}check(id,got,want);}
check('AL-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
