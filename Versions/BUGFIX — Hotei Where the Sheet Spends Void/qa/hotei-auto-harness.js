'use strict';
// Hotei Where the Sheet Spends Void (owner ruling R10, 23 October 2026). node hotei-auto-harness.js <sheet.html>
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const TOTAL=16,results=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,400)+' expected='+String(JSON.stringify(want)).slice(0,300)));}
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(()=>{window.__L5R_TEST__.CL11?.close?.();window.__L5R_TEST__.MODES12?.set('management');});return p;}
async function c(p,id,src,want){let got;try{got=await p.evaluate(async src=>{const T=window.__L5R_TEST__,$=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));return await eval('(async()=>{'+src+'})()');},src);}catch(e){got={error:String(e.message).slice(0,300)};}check(id,got,want);}
const CHECKS=[
[
"HT-CURSED",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));{const lib=T.DISADV_LIBRARY.find(x=>x.name==='Seven Fortunes’ Curse');const d=T.makeEntry({name:lib.name,cost:lib.cost,desc:lib.desc},true);$('disadvList').appendChild(d);T.writeAdvConfig(d,'fortunePick',{type:'fortunePick',fortune:'Hotei',value:'Hotei'});}$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();return [T.HT7.cursed(),T.HOTEI4536.applies()];",
[
true,
true
]
],
[
"HT-PARAGON-PRICE",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));{const lib=T.DISADV_LIBRARY.find(x=>x.name==='Seven Fortunes’ Curse');const d=T.makeEntry({name:lib.name,cost:lib.cost,desc:lib.desc},true);$('disadvList').appendChild(d);T.writeAdvConfig(d,'fortunePick',{type:'fortunePick',fortune:'Hotei',value:'Hotei'});}$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();const p=T.DP4523.payment();return [p.method,p.before,p.after];",
[
"void",
3,
1
]
],
[
"HT-PARAGON-SHORT",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));{const lib=T.DISADV_LIBRARY.find(x=>x.name==='Seven Fortunes’ Curse');const d=T.makeEntry({name:lib.name,cost:lib.cost,desc:lib.desc},true);$('disadvList').appendChild(d);T.writeAdvConfig(d,'fortunePick',{type:'fortunePick',fortune:'Hotei',value:'Hotei'});}$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='1';T.renderVoidPips();T.recalcAll();const p=T.DP4523.payment();return [p.method,/needs 2 Void Points; you have 1/.test(p.reason||'')];",
[
null,
true
]
],
[
"HT-PARAGON-CHARGE",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));{const lib=T.DISADV_LIBRARY.find(x=>x.name==='Seven Fortunes’ Curse');const d=T.makeEntry({name:lib.name,cost:lib.cost,desc:lib.desc},true);$('disadvList').appendChild(d);T.writeAdvConfig(d,'fortunePick',{type:'fortunePick',fortune:'Hotei',value:'Hotei'});}$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();const ok=T.DP4523.charge(T.DP4523.entry(),T.DP4523.payment());return [ok,T.getVoidPoints()];",
[
true,
1
]
],
[
"HT-PARAGON-PLAIN",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();const p=T.DP4523.payment();const ok=T.DP4523.charge(T.DP4523.entry(),p);return [p.after,ok,T.getVoidPoints()];",
[
2,
true,
2
]
],
[
"HT-PARAGON-TEXT",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));{const lib=T.DISADV_LIBRARY.find(x=>x.name==='Seven Fortunes’ Curse');const d=T.makeEntry({name:lib.name,cost:lib.cost,desc:lib.desc},true);$('disadvList').appendChild(d);T.writeAdvConfig(d,'fortunePick',{type:'fortunePick',fortune:'Hotei',value:'Hotei'});}$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();return T.DP4523.priceText(T.DP4523.payment()).includes('two for Hotei’s Curse: 3 → 1');",
true
],
[
"HT-ANC-PAY",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));{const lib=T.DISADV_LIBRARY.find(x=>x.name==='Seven Fortunes’ Curse');const d=T.makeEntry({name:lib.name,cost:lib.cost,desc:lib.desc},true);$('disadvList').appendChild(d);T.writeAdvConfig(d,'fortunePick',{type:'fortunePick',fortune:'Hotei',value:'Hotei'});}$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();return [T.ANC48.payVoid(),T.getVoidPoints()];",
[
true,
1
]
],
[
"HT-ANC-SHORT",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));{const lib=T.DISADV_LIBRARY.find(x=>x.name==='Seven Fortunes’ Curse');const d=T.makeEntry({name:lib.name,cost:lib.cost,desc:lib.desc},true);$('disadvList').appendChild(d);T.writeAdvConfig(d,'fortunePick',{type:'fortunePick',fortune:'Hotei',value:'Hotei'});}$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='1';T.renderVoidPips();T.recalcAll();return [/needs 2 Void Points/.test(T.ANC48.voidProblem()),T.ANC48.payVoid(),T.getVoidPoints()];",
[
true,
false,
1
]
],
[
"HT-ANC-PLAIN",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();return [T.ANC48.payVoid(),T.getVoidPoints()];",
[
true,
2
]
],
[
"HT-ANC-NOTE",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));{const lib=T.DISADV_LIBRARY.find(x=>x.name==='Seven Fortunes’ Curse');const d=T.makeEntry({name:lib.name,cost:lib.cost,desc:lib.desc},true);$('disadvList').appendChild(d);T.writeAdvConfig(d,'fortunePick',{type:'fortunePick',fortune:'Hotei',value:'Hotei'});}$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();return T.ANC48.priceNote({void:true},null);",
"The sheet takes two Void Points when you roll (Hotei’s Curse)."
],
[
"HT-OUTCOME",
"if(!T.HT7||!T.HT7.enabled())return null;return T.HT7Logic.outcome('Kakita’s re-roll: a Void Point spent. First roll 9.');",
"Kakita’s re-roll: two Void Points spent (Hotei’s Curse). First roll 9."
],
[
"HT-ROW-NOTE",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));{const lib=T.DISADV_LIBRARY.find(x=>x.name==='Seven Fortunes’ Curse');const d=T.makeEntry({name:lib.name,cost:lib.cost,desc:lib.desc},true);$('disadvList').appendChild(d);T.writeAdvConfig(d,'fortunePick',{type:'fortunePick',fortune:'Hotei',value:'Hotei'});}$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();const n=document.querySelector('#disadvList .ht7-note');return !!n&&n.textContent.includes('it takes both');",
true
],
[
"HT-STATUS",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));{const lib=T.DISADV_LIBRARY.find(x=>x.name==='Seven Fortunes’ Curse');const d=T.makeEntry({name:lib.name,cost:lib.cost,desc:lib.desc},true);$('disadvList').appendChild(d);T.writeAdvConfig(d,'fortunePick',{type:'fortunePick',fortune:'Hotei',value:'Hotei'});}$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();await T.ANC48.choose('Kuni');T.recalcAll();const ctx=T.makeRollContext(T.ROLL_KINDS.SPELL,{spellName:'Probe'});T.RD4515.start(ctx);T.RD4515.toggle('ancestors:kuni-cast',true);const ok=await T.ANC48.gate({context:ctx});return [ok,T.getVoidPoints(),$('statusMsg').textContent];",
[
true,
1,
"Kuni: two Void Points spent (Hotei’s Curse) for this roll."
]
],
[
"HT-STATUS-PLAIN",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();await T.ANC48.choose('Kuni');T.recalcAll();const ctx=T.makeRollContext(T.ROLL_KINDS.SPELL,{spellName:'Probe'});T.RD4515.start(ctx);T.RD4515.toggle('ancestors:kuni-cast',true);const ok=await T.ANC48.gate({context:ctx});return [ok,T.getVoidPoints(),$('statusMsg').textContent];",
[
true,
2,
"Kuni: a Void Point spent for this roll."
]
],
[
"HT-BUTTON",
"if(!T.HT7||!T.HT7.enabled())return null;T.closeAdvConfigModal?.();T.resetToBaseline();T.MODES12.set('management');T.setVoidPending({});T.resetCombatRound();$('f_clan').value='Crab';T.applyData(Object.assign(T.collectData(),{adv:[{name:'Dark Paragon',cost:'5',desc:'',config:{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}}],disadv:[]}));{const lib=T.DISADV_LIBRARY.find(x=>x.name==='Seven Fortunes’ Curse');const d=T.makeEntry({name:lib.name,cost:lib.cost,desc:lib.desc},true);$('disadvList').appendChild(d);T.writeAdvConfig(d,'fortunePick',{type:'fortunePick',fortune:'Hotei',value:'Hotei'});}$('ring_void').value='3';$('f_honorRank').value='0';$('f_honorPts').value='0';T.setCombatActive(false);T.recalcAll();$('void_current').value='3';T.renderVoidPips();T.recalcAll();return T.ANC48.block('kakita','Kakita','Re-roll with Kakita (a Void Point)','',()=>true).querySelector('button').textContent;",
"Re-roll with Kakita (two Void Points: Hotei’s Curse)"
]
];
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const k of CHECKS){if(k[0]==='@viewport'){await p.setViewportSize({width:k[1],height:k[2]});continue;}await c(p,k[0],k[1],k[2]);}
check('HT-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
