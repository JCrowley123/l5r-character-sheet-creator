'use strict';
// Advantage Set Rules (Release 7b.2, owner ruling R23; Core p.148). node set-rules-harness.js <sheet.html>
// Rows are held through a save (applyData), as an old character would hold them; adding goes through the real pickers.
const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path');
const results=[];
function check(id,got,want){if(results.some(r=>r.id===id))throw Error('Duplicate check '+id);const ok=JSON.stringify(got)===JSON.stringify(want);results.push({id,ok});console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+String(JSON.stringify(got)).slice(0,500)+' expected='+String(JSON.stringify(want)).slice(0,400)));}
const P='(Core p.148)';
// [name, list, cost, saved choice]
const E={
  'Paragon':['adv',7,{type:'paragonTenet',revision:1,tenet:'Courage',value:'Courage'}],
  'Dark Paragon':['adv',5,{type:'darkParagon',revision:1,precept:'Control',value:'Control',remaining:1}],
  'Seven Fortunes’ Blessing':['adv',4,{type:'fortuneBlessing',revision:1,fortune:'Benten',value:'Benten'}],
  'Touch of the Spirit Realms':['adv',5,{type:'spiritRealmTouch',revision:1,realm:'Chikushudo',value:'Chikushudo'}],
  'Consumed':['disadv',4,{tenet:'Control',type:'tenetPick',value:'Control'}],
  'Failure of Bushido':['disadv',3,{tenet:'Compassion',type:'tenetPick',value:'Compassion'}],
  'Seven Fortunes’ Curse':['disadv',3,{fortune:'Benten',type:'fortunePick',value:'Benten'}],
  'Cursed by the Realm':['disadv',4,{realm:'Chikushudo',type:'realmPick',value:'Chikushudo'}],
};
const PAIRS=[['Paragon','Dark Paragon'],['Consumed','Failure of Bushido'],['Paragon','Failure of Bushido'],['Dark Paragon','Consumed'],['Touch of the Spirit Realms','Cursed by the Realm']];
const slug=n=>n.toUpperCase().replace(/’/g,'').replace(/[^A-Z0-9]+/g,'-');
const picker=n=>E[n][0]==='adv'?'advQuickAdd':'disadvQuickAdd';
const label=(n,reason)=>n+' ('+E[n][1]+' pts)'+(reason?' — '+reason:'');
const HELD_TEXT=' Kept as saved; your GM may allow it under GM overrides, in Management.';
const RULE_LABELS=['Paragon with Dark Paragon','Consumed with Failure of Bushido','Paragon with Failure of Bushido','Dark Paragon with Consumed',
  'Touch of the Spirit Realms with Cursed by the Realm','One Fortune’s Blessing and Curse together'].concat(['Paragon','Failure of Bushido','Dark Paragon',
  'Consumed','Seven Fortunes’ Blessing','Seven Fortunes’ Curse','Touch of the Spirit Realms','Cursed by the Realm'].map(n=>'A second '+n));
async function open(b){const p=await b.newPage({viewport:{width:1280,height:960}});p.setDefaultTimeout(8000);p.errors=[];p.on('pageerror',e=>p.errors.push(String(e)));p.on('dialog',d=>d.dismiss().catch(()=>{}));
await p.route('https://fonts.googleapis.com/**',r=>r.abort());await p.route('https://fonts.gstatic.com/**',r=>r.abort());
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href,{waitUntil:'domcontentloaded',timeout:60000});
await p.waitForFunction(()=>{const T=window.__L5R_TEST__;return !!T&&!!window.__L5R_CAROUSEL__?.isReady?.()&&(!T.CL11||T.CL11.ready||T.CL11.enabled()===false)&&!document.querySelector('[id^=l5r-splash]');},null,{timeout:60000});
await p.evaluate(E=>{const T=window.__L5R_TEST__;T.CL11?.close?.();T.MODES12?.set('management');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  window.__sr={E,sleep,
    // A character holding these rows, loaded as a save; extra fields merged in.
    hold(names,fields){T.resetToBaseline();const d=T.collectData();d.adv=[];d.disadv=[];
      names.forEach(x=>{const [n,c]=Array.isArray(x)?x:[x,{}];const e=E[n];const cfg=Object.assign({},e[2],c);
        const k=['tenet','precept','fortune','realm'].find(k=>k in c);if(k)cfg.value=c[k];(e[0]==='adv'?d.adv:d.disadv).push({name:n,cost:e[1],desc:'',config:cfg});});
      if(fields)Object.assign(d.fields,fields);T.applyData(d);T.recalcAll();return d;},
    opt(sel,name){const o=[...document.getElementById(sel).options].find(o=>o.value===name);return o?[o.disabled,o.textContent]:null;},
    flags(){return [...document.querySelectorAll('#advList .entry, #disadvList .entry')].flatMap(e=>[...e.querySelectorAll('.sr7-flags p')].map(p=>[e.querySelector('.en-name').value,p.className,p.textContent]));},
    // Adds through the sheet's picker; the choice dialog is left open.
    async pick(sel,name){const s=document.getElementById(sel);s.value=name;s.dispatchEvent(new Event('change',{bubbles:true}));await sleep(30);},
    radios(){return [...document.querySelectorAll('#advConfigGrid input[type=radio]')];},
    disabled(){return window.__sr.radios().filter(r=>r.disabled).map(r=>r.value);},
    reason(v){const r=window.__sr.radios().find(r=>r.value===v);const s=r&&r.closest('label')&&r.closest('label').querySelector('.sr7-reason');return s?s.textContent:null;},
    close(){if(document.getElementById('advConfigModalOverlay').style.display!=='none')document.getElementById('advConfigX').click();},
    finding(){const f=(T.validateCharacter?T.validateCharacter().findings:[]).filter(f=>f.id==='set-rules');return f.map(x=>[x.severity,x.title,x.detail]);},
    box(id){return document.querySelector('#sr7Overrides input[value="'+id+'"]');},
    async tick(id,on){const b=window.__sr.box(id);if(!b)return false;if(b.checked!==on)b.click();await sleep(20);return true;},
    field(){const f=document.getElementById('f_setRuleOverrides');return f?f.value:null;}};},E);
return p;}
const S=(p,fn,arg)=>p.evaluate(fn,arg);
const CASES=[];
CASES.push(['SR-ENABLED',p=>S(p,()=>{const T=window.__L5R_TEST__;return !!T.SR7&&T.SR7.enabled();}),true]);
// Every exclusion, in both directions: the held entry greys its partner, with the reason.
PAIRS.forEach(([a,b])=>[[a,b],[b,a]].forEach(([held,other])=>CASES.push(['SR-EX-'+slug(held)+'-'+slug(other),
  p=>S(p,([held,sel,other])=>{window.__sr.hold([held]);return window.__sr.opt(sel,other);},[held,picker(other),other]),
  [true,label(other,'ruled out by '+held+' '+P)]])));
// A second row of each set.
Object.keys(E).forEach(n=>CASES.push(['SR-ONE-'+slug(n),p=>S(p,([n,sel])=>{window.__sr.hold([n]);return window.__sr.opt(sel,n);},[n,picker(n)]),[true,label(n,'one only '+P)]]));
// Unchanged: entries no held entry rules out stay open.
CASES.push(['SR-OTHERS-OPEN',p=>S(p,()=>{window.__sr.hold(['Paragon']);const o=window.__sr.opt;
  return [o('disadvQuickAdd','Consumed'),o('advQuickAdd','Touch of the Spirit Realms'),o('disadvQuickAdd','Cursed by the Realm'),o('advQuickAdd','Seven Fortunes’ Blessing'),o('disadvQuickAdd','Seven Fortunes’ Curse'),o('advQuickAdd','Luck')].map(x=>x[0]);}),
  [false,false,false,false,false,false]]);
// The Fortunes are exempt: a Blessing and a Curse may be held together.
CASES.push(['SR-FORTUNE-PAIR-OPEN',p=>S(p,()=>{window.__sr.hold(['Seven Fortunes’ Blessing']);const a=window.__sr.opt('disadvQuickAdd','Seven Fortunes’ Curse');
  window.__sr.hold(['Seven Fortunes’ Curse']);return [a,window.__sr.opt('advQuickAdd','Seven Fortunes’ Blessing')];}),[[false,'Seven Fortunes’ Curse (3 pts)'],[false,'Seven Fortunes’ Blessing (4 pts)']]]);
// But not the same Fortune (the owner's answer to Q1): greyed in the choice, both ways.
CASES.push(['SR-FORTUNE-CURSE-CHOICE',p=>S(p,async()=>{window.__sr.hold(['Seven Fortunes’ Blessing']);await window.__sr.pick('disadvQuickAdd','Seven Fortunes’ Curse');
  const r=[window.__sr.disabled(),window.__sr.reason('Benten')];window.__sr.close();return r;}),[['Benten'],' — ruled out by Benten’s Blessing '+P]]);
CASES.push(['SR-FORTUNE-BLESSING-CHOICE',p=>S(p,async()=>{window.__sr.hold([['Seven Fortunes’ Curse',{fortune:'Bishamon'}]]);await window.__sr.pick('advQuickAdd','Seven Fortunes’ Blessing');
  const r=[window.__sr.disabled(),window.__sr.reason('Bishamon')];window.__sr.close();return r;}),[['Bishamon'],' — ruled out by Bishamon’s Curse '+P]]);
// Unchanged: a different Fortune is chosen and confirmed as before, with no flag.
CASES.push(['SR-FORTUNE-DIFFERENT',p=>S(p,async()=>{window.__sr.hold(['Seven Fortunes’ Blessing']);await window.__sr.pick('disadvQuickAdd','Seven Fortunes’ Curse');
  window.__sr.radios().find(r=>r.value==='Bishamon').click();document.getElementById('advConfigConfirm').click();await window.__sr.sleep(30);
  const row=document.getElementById('disadvList').lastElementChild;return [JSON.parse(row.dataset.advConfig||'{}').fortune||null,window.__sr.flags().length];}),['Bishamon',0]]);
// A ruled-out choice forced on is refused at Confirm: the dialog stays open and nothing is saved.
CASES.push(['SR-CONFIRM-REFUSED',p=>S(p,async()=>{window.__sr.hold(['Seven Fortunes’ Blessing']);await window.__sr.pick('disadvQuickAdd','Seven Fortunes’ Curse');
  const r=window.__sr.radios().find(r=>r.value==='Benten');r.checked=true;document.getElementById('advConfigConfirm').click();await window.__sr.sleep(30);
  const out=[document.getElementById('advConfigModalOverlay').style.display,document.getElementById('disadvList').lastElementChild.dataset.advConfig||null];window.__sr.close();return out;}),['flex',null]]);
// An old save holding a pair: both rows flagged, nothing changed.
CASES.push(['SR-OLD-PAIR-FLAGGED',p=>S(p,()=>{window.__sr.hold(['Paragon','Dark Paragon']);return window.__sr.flags();}),
  [['Paragon','sr7-flag','Core p.148: Paragon and Dark Paragon cannot both be held.'+HELD_TEXT],['Dark Paragon','sr7-flag','Core p.148: Paragon and Dark Paragon cannot both be held.'+HELD_TEXT]]]);
CASES.push(['SR-OLD-PAIR-UNCHANGED',p=>S(p,()=>{const T=window.__L5R_TEST__;const d=window.__sr.hold(['Paragon','Dark Paragon','Consumed','Failure of Bushido']);T.recalcAll();const s=T.collectData();
  const rows=x=>x.map(r=>[r.name,String(r.cost),JSON.stringify(r.config)]);return JSON.stringify([rows(s.adv),rows(s.disadv)])===JSON.stringify([rows(d.adv),rows(d.disadv)]);}),true]);
CASES.push(['SR-OLD-FORTUNE-FLAGGED',p=>S(p,()=>{window.__sr.hold(['Seven Fortunes’ Blessing','Seven Fortunes’ Curse']);return window.__sr.flags().map(f=>f[2]);}),
  ['Core p.148: Benten cannot both bless and curse one character.'+HELD_TEXT,'Core p.148: Benten cannot both bless and curse one character.'+HELD_TEXT]]);
CASES.push(['SR-OLD-SECOND-FLAGGED',p=>S(p,()=>{window.__sr.hold(['Paragon',['Paragon',{tenet:'Duty',value:'Duty'}]]);return window.__sr.flags().map(f=>f[0]+': '+f[2]);}),
  ['Paragon: Core p.148: only one Paragon may be held.'+HELD_TEXT,'Paragon: Core p.148: only one Paragon may be held.'+HELD_TEXT]]);
CASES.push(['SR-OLD-DIFFERENT-FORTUNES',p=>S(p,()=>{window.__sr.hold(['Seven Fortunes’ Blessing',['Seven Fortunes’ Curse',{fortune:'Jurojin'}]]);return window.__sr.flags().length;}),0]);
// A name typed by hand is a held entry too.
CASES.push(['SR-TYPED-PAIR',p=>S(p,async()=>{window.__sr.hold(['Paragon']);document.getElementById('addAdv').click();await window.__sr.sleep(20);
  const n=document.getElementById('advList').lastElementChild.querySelector('.en-name');n.value='Dark Paragon';n.dispatchEvent(new Event('input',{bubbles:true}));n.dispatchEvent(new Event('change',{bubbles:true}));await window.__sr.sleep(20);
  return window.__sr.flags().map(f=>f[0]+' '+f[1]);}),['Paragon sr7-flag','Dark Paragon sr7-flag']]);
// A set row renamed away frees the lists at once (review finding 2).
CASES.push(['SR-RENAMED-AWAY',p=>S(p,async()=>{window.__sr.hold([]);document.getElementById('addAdv').click();await window.__sr.sleep(20);
  const n=document.querySelector('#advList .entry .en-name'),type=v=>{n.value=v;n.dispatchEvent(new Event('input',{bubbles:true}));n.dispatchEvent(new Event('change',{bubbles:true}));};
  type('Paragon');await window.__sr.sleep(20);const held=window.__sr.opt('advQuickAdd','Dark Paragon')[0];type('An oath of my own');await window.__sr.sleep(20);
  if(!held)return 'the typed Paragon greyed nothing';
  return [window.__sr.opt('advQuickAdd','Dark Paragon'),window.__sr.opt('advQuickAdd','Paragon')];}),[[false,'Dark Paragon (5 pts)'],[false,'Paragon (7 pts)']]]);
// Reopening a row of a held same-Fortune pair keeps its saved Fortune choosable; nothing else is greyed.
CASES.push(['SR-REOPEN-SAVED',p=>S(p,async()=>{window.__sr.hold(['Seven Fortunes’ Blessing','Seven Fortunes’ Curse']);
  document.querySelector('#disadvList .entry .adv-config-btn').click();await window.__sr.sleep(30);
  const b=window.__sr.radios().find(r=>r.value==='Benten');const r=[window.__sr.disabled(),!!b&&b.checked];window.__sr.close();return r;}),[[],true]]);
// Reopening a held row with its own Change button greys the other's Fortune, both ways (found by variant no-saved-exemption).
CASES.push(['SR-CHANGE-GREYS',p=>S(p,async()=>{window.__sr.hold(['Seven Fortunes’ Blessing',['Seven Fortunes’ Curse',{fortune:'Jurojin'}]]);const out=[];
  for(const list of ['disadvList','advList']){document.querySelector('#'+list+' .entry .adv-config-btn').click();await window.__sr.sleep(30);out.push(window.__sr.disabled());window.__sr.close();}
  return out;}),[['Benten'],['Jurojin']]]);
// Cost per recalculation (review finding 1): names are normalised about once per row, not per pair and rule.
CASES.push(['SR-NORM-COST',p=>S(p,()=>{const T=window.__L5R_TEST__;window.__sr.hold(['Paragon','Dark Paragon']);
  for(let i=1;i<=18;i++)document.getElementById('advList').appendChild(T.makeEntry({name:'Custom '+i,cost:1,desc:''},true));
  const L=T.SR7Logic,norm=L.norm;let n=0;L.norm=s=>{n++;return norm(s);};try{T.SR7.paint();}finally{L.norm=norm;}
  return [n<=45,window.__sr.flags().length];}),[true,2]]);
// The validator: one warning for a held pair, none without one.
CASES.push(['SR-VALIDATOR-WARNING',p=>S(p,()=>{window.__sr.hold(['Touch of the Spirit Realms','Cursed by the Realm']);return window.__sr.finding();}),
  [['warning','Advantage and Disadvantage sets (Core p.148)','Core p.148: Touch of the Spirit Realms and Cursed by the Realm cannot both be held.'+HELD_TEXT]]]);
CASES.push(['SR-VALIDATOR-CLEAN',p=>S(p,()=>{window.__sr.hold(['Paragon','Consumed','Seven Fortunes’ Blessing',['Seven Fortunes’ Curse',{fortune:'Hotei'}]]);return window.__sr.finding();}),[]]);
// The GM overrides.
CASES.push(['SR-OVERRIDE-LIST',p=>S(p,()=>[...document.querySelectorAll('#sr7Overrides .sr7-override')].map(l=>l.textContent)),RULE_LABELS]);
CASES.push(['SR-OVERRIDE-ON',p=>S(p,async()=>{window.__sr.hold(['Paragon','Dark Paragon']);await window.__sr.tick('paragon+dark-paragon',true);
  return [window.__sr.field(),window.__sr.flags().map(f=>f[1]+' '+f[2]),window.__sr.finding(),window.__sr.opt('advQuickAdd','Dark Paragon')];}),
  ['["paragon+dark-paragon"]',['sr7-note GM override: Paragon with Dark Paragon (Core p.148).','sr7-note GM override: Paragon with Dark Paragon (Core p.148).'],[],[true,'Dark Paragon (5 pts) — one only (Core p.148)']]]);
CASES.push(['SR-OVERRIDE-OFF',p=>S(p,async()=>{window.__sr.hold(['Paragon','Dark Paragon']);await window.__sr.tick('paragon+dark-paragon',true);await window.__sr.tick('paragon+dark-paragon',false);
  return [window.__sr.field(),window.__sr.flags().map(f=>f[1]),window.__sr.finding().length,window.__sr.opt('advQuickAdd','Dark Paragon')[0]];}),['',['sr7-flag','sr7-flag'],1,true]]);
CASES.push(['SR-OVERRIDE-ONLY-ITS-RULE',p=>S(p,async()=>{window.__sr.hold(['Paragon']);await window.__sr.tick('paragon+dark-paragon',true);
  return [window.__sr.opt('advQuickAdd','Dark Paragon')[0],window.__sr.opt('disadvQuickAdd','Failure of Bushido')[0],window.__sr.opt('advQuickAdd','Paragon')[0]];}),[false,true,true]]);
CASES.push(['SR-OVERRIDE-SECOND',p=>S(p,async()=>{window.__sr.hold(['Paragon']);await window.__sr.tick('second-paragon',true);return [window.__sr.field(),window.__sr.opt('advQuickAdd','Paragon')];}),
  ['["second-paragon"]',[false,'Paragon (7 pts)']]]);
CASES.push(['SR-OVERRIDE-FORTUNE',p=>S(p,async()=>{window.__sr.hold(['Seven Fortunes’ Blessing']);await window.__sr.tick('seven-fortunes-blessing+seven-fortunes-curse',true);
  await window.__sr.pick('disadvQuickAdd','Seven Fortunes’ Curse');const r=[window.__sr.field(),window.__sr.disabled()];window.__sr.close();return r;}),['["seven-fortunes-blessing+seven-fortunes-curse"]',[]]]);
CASES.push(['SR-OVERRIDE-SAVED',p=>S(p,async()=>{const T=window.__L5R_TEST__;window.__sr.hold(['Paragon','Dark Paragon']);await window.__sr.tick('paragon+dark-paragon',true);
  const saved=T.collectData();T.resetToBaseline();const cleared=window.__sr.field();T.applyData(saved);T.recalcAll();
  return [saved.fields.f_setRuleOverrides,cleared,window.__sr.box('paragon+dark-paragon').checked,window.__sr.flags().map(f=>f[1])];}),['["paragon+dark-paragon"]','',true,['sr7-note','sr7-note']]]);
CASES.push(['SR-OVERRIDE-NO-LEAK',p=>S(p,async()=>{const T=window.__L5R_TEST__;window.__sr.hold(['Paragon','Dark Paragon']);await window.__sr.tick('paragon+dark-paragon',true);
  const old=JSON.parse(JSON.stringify(T.collectData()));delete old.fields.f_setRuleOverrides;T.applyData(old);T.recalcAll();
  return [window.__sr.field(),window.__sr.box('paragon+dark-paragon').checked,window.__sr.flags().map(f=>f[1])];}),['',false,['sr7-flag','sr7-flag']]]);
CASES.push(['SR-OVERRIDE-PLAY',p=>S(p,async()=>{const T=window.__L5R_TEST__;window.__sr.hold(['Paragon','Dark Paragon']);T.MODES12.set('play');await window.__sr.sleep(20);
  try{const b=window.__sr.box('paragon+dark-paragon'),panel=document.getElementById('sr7Overrides');
  const r=[b.disabled,getComputedStyle(panel).display,T.SR7.setOverride('paragon+dark-paragon',true),window.__sr.field()];T.MODES12.set('management');await window.__sr.sleep(20);r.push(b.disabled);return r;}
  finally{T.MODES12.set('management');}}),[true,'none',false,'',false]]);
// Through the real controls: add from the list, then remove the row.
CASES.push(['SR-UI-ADD',async p=>{await S(p,()=>{window.__L5R_TEST__.MODES12.set('management');window.__L5R_TEST__.resetToBaseline();window.__L5R_TEST__.recalcAll();});
  await S(p,async()=>{const c=window.__L5R_CAROUSEL__;c.goToTab('Adv & Disadv');await c.whenSettled();});
  await p.locator('#advQuickAdd').selectOption('Paragon');await p.locator('#advConfigGrid input[value="Courage"]').check();await p.locator('#advConfigConfirm').click();
  return S(p,()=>window.__sr.opt('advQuickAdd','Dark Paragon'));},[true,'Dark Paragon (5 pts) — ruled out by Paragon (Core p.148)']]);
CASES.push(['SR-UI-REMOVE',async p=>{await p.locator('#advList .entry .rm-btn').first().click();
  return S(p,()=>[document.querySelectorAll('#advList .entry').length,window.__sr.opt('advQuickAdd','Dark Paragon')]);},[0,[false,'Dark Paragon (5 pts)']]]);
// The wizard's pickers copy the sheet's.
CASES.push(['SR-WIZARD',p=>S(p,async()=>{const T=window.__L5R_TEST__;window.__sr.hold(['Dark Paragon']);T.CW112.start();T.CW112.index=T.CW112.steps.findIndex(s=>s.id==='advantages');T.CW112.render();await window.__sr.sleep(30);
  const o=[...document.querySelectorAll('#cw1121AdvPick option')].find(o=>o.value==='Paragon');const r=o?[o.disabled,o.textContent]:null;T.CW112.close();return r;}),[true,'Paragon (7 pts) — ruled out by Dark Paragon (Core p.148)']]);
const TOTAL=50;
(async()=>{const b=await chromium.launch();try{const p=await open(b);
for(const [id,fn,want] of CASES){let got;try{got=await fn(p);}catch(e){got={error:String(e.message).slice(0,300)};}await S(p,()=>window.__sr.close()).catch(()=>{});check(id,got,want);}
check('SR-NO-ERRORS',p.errors,[]);}finally{await b.close();}
const n=results.filter(r=>r.ok).length;console.log(n+'/'+results.length+' checks passed');process.exitCode=n===TOTAL&&results.length===TOTAL?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
