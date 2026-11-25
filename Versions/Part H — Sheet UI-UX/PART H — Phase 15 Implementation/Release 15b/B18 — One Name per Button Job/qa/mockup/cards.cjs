'use strict';
// B18 mock-ups, round 1 revised (the owner, 25 November 2026: "show me 1 button change at a time with the side by side
// comparison"). For each change and each place it shows, the live sheet on a phone (375 x 812, touch) is opened twice:
// today, and with only that change's ruling drawn in the test browser (proposals.cjs). The changed button is outlined
// and a close-up is cut around it (the width of its card or window, a band around the button), and its words and
// spoken name are read. Scratch only: no application file is edited.
// Usage: run.sh cards.cjs <out folder>   (ONLY=card,card to choose)
const C=require('./common.cjs');const {fs,path,chromium,sha,settle,tab,mode,wait}=C;
const F=require('./fixtures.cjs');const P=require('./proposals.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const R={source_sha256:sha,captured_utc:new Date().toISOString(),cards:{},errors:[]};

async function press(p,sel){const l=p.locator(sel).filter({visible:true}).first();await l.scrollIntoViewIfNeeded();await l.tap();await settle(p);await wait(350);}
const shown=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&getComputedStyle(e).display!=='none'&&e.getClientRects().length>0;},sel);
const openDetails=ids=>async p=>{await p.evaluate(ids=>ids.forEach(i=>{const d=document.getElementById(i);if(d)d.open=true;}),ids);};
const rollResult=async p=>{await p.evaluate(()=>{Math.random=()=>0.05;});await press(p,'#skillsBody tr:nth-child(1) .sk-roll');
 if(await shown(p,'#rollPreviewOverlay'))await press(p,'#rollPreviewGo');
 await p.waitForFunction(()=>getComputedStyle(document.getElementById('rollModalOverlay')).display!=='none');await wait(400);};
// The sheet's one question window, filled the way its own appConfirm and appConfirm3Way fill it (sheet/120-persistence.js):
// the title "Confirm", the message, the first button's words and class, the second button's words, the window shown.
// Used for two questions the test characters cannot reach; the words are the sheet's own.
const question=(msg,ok,cancel)=>async p=>{await p.evaluate(([msg,ok,cancel])=>{
 document.getElementById('appConfirmTitle').textContent='Confirm';document.getElementById('appConfirmMsg').textContent=msg;
 const o=document.getElementById('appConfirmOk');o.textContent=ok;o.className='ghost';
 const c=document.getElementById('appConfirmCancel');c.style.display='';c.textContent=cancel;
 document.getElementById('appConfirmOverlay').style.display='flex';},[msg,ok,cancel]);await settle(p);};
const BONUS='No Earth spell slots remain. Use bonus slot? (shared pool — 2 of 2 remaining across all Elements)';
const ATARASI='Hida Atarasi: this Round’s corruption, +2k0 on the attack. Pay with a Void Point, or take a point of Shadowlands Taint?\n\n✕ cancels the roll.';

// A place: the character, mode, tab and opener; the button (entry: the card's name; sel; text: today's or the ruling's
// words); the box whose width the close-up takes (around); and the groups the "after" draws.
const pl=(name,o)=>Object.assign({name,mode:'play',fixture:'sessions'},o);
const CARDS=[
 {id:'reset',groups:['G01'],places:[
  pl('Kharmic Tie',{fixture:'resets',tab:'Adv & Disadv',entry:'Kharmic Tie',sel:'.adv-config-reset-session',around:'.entry'}),
  pl('Luck',{fixture:'resets',tab:'Adv & Disadv',entry:'Luck',sel:'.adv-config-reset-session',around:'.entry'}),
  pl('Dark Paragon',{fixture:'resets',tab:'Adv & Disadv',entry:'Dark Paragon',sel:'.dp4523-reset',around:'.entry'}),
  pl('Great Destiny',{fixture:'resets',tab:'Adv & Disadv',entry:'Great Destiny',sel:'.dsx4532-btn',text:'^Reset',around:'.entry'}),
  pl('Haunted',{fixture:'resets',tab:'Adv & Disadv',entry:'Haunted',sel:'.dsx4532-btn',text:'^Reset',around:'.entry'}),
  pl('Unlucky',{fixture:'resets',tab:'Adv & Disadv',entry:'Unlucky',sel:'.unlucky-btn',text:'^Reset',around:'.entry'}),
  pl('Ancestor card',{tab:'Clan & School',sel:'#anc48ResetSession',around:'#anc48Card'}),
  pl('Combat round counter',{tab:'Combat',open:openDetails(['voidDetails']),sel:'#btnResetRounds',around:'.combat-round-box'})]},
 {id:'use',groups:['G06'],places:[
  pl('Seppun Ancestor card',{fixture:'imperial',tab:'Clan & School',sel:'#anc48UseNow',around:'#anc48Card'}),
  pl('Great Destiny',{fixture:'resets',tab:'Adv & Disadv',entry:'Great Destiny',sel:'.dsx4532-btn',text:'^Use$',around:'.entry'})]},
 {id:'gotit',groups:['G05'],places:[
  pl('Kiho rules (Techniques, its i)',{tab:'Techniques',open:async p=>press(p,'#kihoRulesInfoBtn'),sel:'#appConfirmOk',around:'#appConfirmOverlay .roll-modal',above:90,below:24})]},
 {id:'yesno',groups:['G05'],places:[
  pl('Casting with no Earth slot left',{tab:'Spell Slots',open:question(BONUS,'Yes','No'),sel:'#appConfirmOk',also:'#appConfirmCancel',around:'#appConfirmOverlay .roll-modal',above:150,below:24})]},
 {id:'reroll',groups:['G08'],places:[
  pl('A Skill roll with an Emphasis',{tab:'Skills',open:rollResult,sel:'#emphasisRerollBtn',around:'#rollModalOverlay .roll-modal',above:70,below:70}),
  pl('The same, after pressing it',{tab:'Skills',open:async p=>{await rollResult(p);await press(p,'#emphasisRerollBtn');},sel:'#rollModalOverlay button',text:'selected$',around:'#rollModalOverlay .roll-modal',above:70,below:40})]},
 {id:'luck',groups:['G08'],places:[
  pl('A roll’s result, with Luck',{tab:'Skills',open:rollResult,sel:'.adv-config-spend-luck',around:'#rollModalOverlay .roll-modal',above:70,below:30})]},
 {id:'emph',groups:['G10'],places:[
  pl('Calligraphy (has an Emphasis)',{mode:'management',tab:'Skills',sel:'#skillsBody tr:nth-child(1) .emph-add-btn',around:'#skillsBody tr:nth-child(1)',above:110,below:60}),
  pl('Defense (no Emphasis yet)',{mode:'management',tab:'Skills',sel:'#skillsBody tr:nth-child(2) .emph-add-btn',around:'#skillsBody tr:nth-child(2)',above:110,below:90})]},
 {id:'book',groups:['G10'],places:[
  pl('The Library page',{tab:'Skills',open:async p=>{await press(p,'.ab113-item:text-is("Library")');await wait(500);},sel:'#cl11View button',text:'^\\+ ?(Add )?Book$',around:'#cl11View',above:60,below:30})]},
 {id:'court',groups:['G10'],places:[
  pl('Darling of the Court’s window',{fixture:'court',mode:'management',tab:'Adv & Disadv',open:async p=>press(p,'#advList .adv-config-btn'),sel:'.court4514-add',around:'#advConfigModalOverlay .roll-modal',above:150,below:30})]},
 {id:'spendvoid',groups:['G07'],places:[
  pl('A roll with Hida Atarasi’s strike declared',{tab:'Skills',open:question(ATARASI,'Spend a Void Point','Take a point of Taint'),sel:'#appConfirmOk',also:'#appConfirmCancel',around:'#appConfirmOverlay .roll-modal',above:200,below:24})]},
 {id:'combati',groups:['G12'],places:[
  pl('Armor & TN',{tab:'Combat',sel:'#combatTnInfoBtn',around:'#armorTnDetails',above:30,below:30}),
  pl('Weapons',{tab:'Combat',sel:'#combatAttackInfoBtn',around:'#weaponsDetails',above:30,below:30}),
  pl('A weapon',{tab:'Combat',open:openDetails(['weaponsDetails']),sel:'.wp-info-btn',around:'#weaponsBody tr',above:50,below:40}),
  pl('A stance',{tab:'Combat',open:openDetails(['stanceDetails']),sel:'.stance-info-btn',around:'#stanceTiles',above:170,below:20})]},
 {id:'pdf',groups:['G16'],places:[
  pl('A saved character’s ⋯ menu (Characters)',{tab:'Skills',open:async p=>{await press(p,'#btnSave');await press(p,'.ab113-item:text-is("Characters")');await wait(500);await press(p,'#cl11View .cl11-more, #cl11View button[aria-haspopup]');},
   sel:'.pdf111-export',around:'#cl11View .cl11-menu',above:60,below:60})]},
 // ---- heard only: the button looks the same ----
 {id:'rowx',groups:['G03'],places:[
  pl('A Skill',{mode:'management',tab:'Skills',sel:'#skillsBody tr:nth-child(1) > td > .rm-btn, #skillsBody tr:nth-child(1) .rm-btn:not(.emph-item-del)',around:'#skillsBody tr:nth-child(1)',above:60,below:20}),
  pl('An Emphasis',{mode:'management',tab:'Skills',sel:'#skillsBody tr:nth-child(1) .emph-item-del',around:'#skillsBody tr:nth-child(1)',above:40,below:40}),
  pl('An Advantage',{fixture:'changes',mode:'management',tab:'Adv & Disadv',entry:'Wealthy',sel:'.rm-btn',around:'.entry',above:30,below:60}),
  pl('An item',{mode:'management',tab:'Equipment',sel:'#equipBody tr:nth-child(1) .rm-btn',around:'#equipBody tr:nth-child(1)',above:60,below:20})]},
 {id:'cornerx',groups:['G04'],places:[
  pl('A Skill’s i window',{tab:'Skills',open:async p=>press(p,'#skillsBody .sk-info-btn'),sel:'#skillInfoClose',around:'#skillInfoModalOverlay .roll-modal',above:20,below:60}),
  pl('A roll preview',{tab:'Skills',open:async p=>press(p,'#skillsBody .sk-roll'),sel:'#rollPreviewClose',around:'#rollPreviewOverlay .roll-modal',above:20,below:60}),
  pl('A notice (the Kiho rules)',{tab:'Techniques',open:async p=>press(p,'#kihoRulesInfoBtn'),sel:'#appConfirmX',around:'#appConfirmOverlay .roll-modal',above:20,below:60})]},
 {id:'changechoose',groups:['G02'],places:[
  pl('Wealthy, not chosen yet',{fixture:'changes',mode:'management',tab:'Adv & Disadv',entry:'Wealthy',sel:'.adv-config-btn',around:'.entry',above:30,below:40}),
  pl('Luck, chosen',{fixture:'changes',mode:'management',tab:'Adv & Disadv',entry:'Luck',sel:'.adv-config-btn',around:'.entry',above:30,below:40})]},
 {id:'info',groups:['G12'],places:[
  pl('Luck’s i',{fixture:'changes',mode:'management',tab:'Adv & Disadv',entry:'Luck',sel:'.adv-config-info',around:'.entry',above:30,below:40}),
  pl('The Ancestor section’s i',{tab:'Clan & School',sel:'#anc48Info',around:'#anc48Section',above:20,below:40}),
  pl('Armor TN’s i (Quick Access)',{tab:'Skills',open:async p=>press(p,'#quickAccessToggleBtn'),sel:'#at15QaInfo',around:'#quickAccessPanel',above:30,below:30})]},
 {id:'steppers',groups:['G14'],places:[
  pl('Honour (Identity)',{tab:'Identity',sel:'button[aria-label$="Honour points"]',around:'.cp7-card',above:120,below:20}),
  pl('The Void Ring (Rings & Traits, Manage)',{mode:'management',tab:'Rings & Traits',sel:'.stepbtn[data-ring="void"]',around:'.ring-val',above:30,below:30})]},
 {id:'clear',groups:['G09'],places:[
  pl('The dice tray',{tab:'Skills',open:async p=>press(p,'#floatingDiceBtn'),sel:'#dicePickerClear',around:'#manualRollPromptOverlay .roll-modal',above:60,below:40})]},
 // ---- the question: Touch of the Void ----
 {id:'touch',groups:['G11'],places:[
  pl('Touch of the Void',{fixture:'checks',tab:'Adv & Disadv',entry:'Touch of the Void',sel:'.vi4533-btn',around:'.entry',above:50,below:40})]},
];

const FIND=function(t){
 const vis=el=>el.checkVisibility({visibilityProperty:true})&&el.getBoundingClientRect().width>0;
 let root=document;
 if(t.entry){root=[...document.querySelectorAll('.entry')].find(d=>{const n=d.querySelector('.en-name');return n&&n.value===t.entry;});if(!root)return null;}
 const re=t.text?new RegExp(t.text):null;
 const el=[...root.querySelectorAll(t.sel)].find(e=>vis(e)&&(!re||re.test(e.textContent.trim())));
 if(!el)return null;
 document.querySelectorAll('[data-b18t]').forEach(e=>delete e.dataset.b18t);
 el.dataset.b18t='1';if(t.also){const a=document.querySelector(t.also);if(a&&vis(a))a.dataset.b18t='2';}
 return true;
};
const READ=function(){
 const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
 const acc=n=>{if(n.nodeType===3)return n.nodeValue;if(n.nodeType!==1||n.getAttribute('aria-hidden')==='true')return '';const al=n.getAttribute('aria-label');if(al&&al.trim())return ' '+al+' ';return [...n.childNodes].map(acc).join('');};
 const spoken=el=>{const al=el.getAttribute('aria-label');if(al&&norm(al))return norm(al);const t=norm([...el.childNodes].map(acc).join(''));return t||norm(el.getAttribute('title'));};
 const glyph=el=>{const c=getComputedStyle(el,'::after').content;return c&&c!=='none'&&c!=='normal'&&c!=='""'?c.replace(/^["']|["']$/g,''):'';};
 return [...document.querySelectorAll('[data-b18t]')].sort((a,b)=>a.dataset.b18t-b.dataset.b18t).map(el=>({
  words:getComputedStyle(el).fontSize==='0px'?(glyph(el)||norm(el.textContent)):norm(el.textContent),drawn:norm(el.innerText),spoken:spoken(el),title:el.getAttribute('title')||''}));
};
async function shot(p,t,file){
 await p.evaluate(()=>{const e=document.querySelector('[data-b18t="1"]');e.scrollIntoView({block:'center'});});await settle(p);
 const box=await p.evaluate(([around,above,below])=>{
  const t=document.querySelector('[data-b18t="1"]');const a=t.closest(around)||document.querySelector(around)||t.parentElement;
  const tr=t.getBoundingClientRect(),ar=a.getBoundingClientRect();
  const ts=[...document.querySelectorAll('[data-b18t]')].map(e=>e.getBoundingClientRect());
  // The outline drawn round each changed button, for the picture only.
  document.querySelectorAll('.b18-ring').forEach(m=>m.remove());
  for(const r of ts){const m=document.createElement('div');m.className='b18-ring';
   Object.assign(m.style,{position:'fixed',left:(r.left-5)+'px',top:(r.top-5)+'px',width:(r.width+10)+'px',height:(r.height+10)+'px',border:'2.5px solid #1d4fd6',borderRadius:'9px',zIndex:2147483647,pointerEvents:'none'});
   document.body.appendChild(m);}
  const top=Math.min(...ts.map(r=>r.top)),bot=Math.max(...ts.map(r=>r.bottom));
  const x=Math.max(0,Math.min(ar.left,tr.left)-8),right=Math.min(innerWidth,Math.max(ar.right,tr.right)+8);
  const y=Math.max(0,Math.max(ar.top-8,top-above)),b=Math.min(innerHeight,Math.min(ar.bottom+8,bot+below));
  return {x,y,width:right-x,height:Math.max(20,b-y)};},[t.around,t.above||44,t.below||44]);
 await p.screenshot({path:path.join(out,file),clip:box});
 await p.evaluate(()=>document.querySelectorAll('.b18-ring').forEach(m=>m.remove()));
 return {width:Math.round(box.width),height:Math.round(box.height)};
}
async function place(b,card,i,t){
 const r={name:t.name};const fx=F.write(out,t.fixture);
 for(const state of ['now','after']){
  const {c,p}=await C.open(b,true,fx.file,fx.name);
  try{
   await mode(p,t.mode);if(state==='after')await P.install(p,card.groups);
   await tab(p,t.tab);if(t.open)await t.open(p);
   if(state==='after')await p.evaluate(()=>window.__B18&&window.__B18.apply());await settle(p);
   // Today's words or the ruling's: find the button in either state.
   const found=await p.evaluate(`(${FIND.toString()})(${JSON.stringify(t)})`);
   if(!found)throw new Error('button not found');
   r[state]=await p.evaluate(`(${READ.toString()})()`);
   r[state+'Box']=await shot(p,t,`${card.id}-${i}-${state}.png`);
   r[state+'Errors']=p.errors.slice();
  }catch(e){R.errors.push(`${card.id}/${i}/${state}: ${String(e).split('\n')[0]}`);r[state+'Failed']=String(e).split('\n')[0];}
  await c.close();
 }
 return r;
}
(async()=>{
 const b=await chromium.launch();const only=process.env.ONLY?process.env.ONLY.split(','):null;
 try{for(const card of CARDS){if(only&&!only.includes(card.id))continue;R.cards[card.id]={groups:card.groups,places:[]};
  for(let i=0;i<card.places.length;i++){const r=await place(b,card,i+1,card.places[i]);R.cards[card.id].places.push(r);
   process.stdout.write(`${card.id}/${i+1} ${r.name}: ${JSON.stringify((r.now||[]).map(x=>x.words))} -> ${JSON.stringify((r.after||[]).map(x=>x.words))}\n`);}}}
 finally{fs.writeFileSync(path.join(out,only?'cards-partial.json':'cards.json'),JSON.stringify(R,null,1)+'\n');await b.close();}
 console.log('done',sha,'errors',R.errors.length);for(const e of R.errors)console.log(' !',e);
})().catch(e=>{console.error(e);process.exit(1);});
