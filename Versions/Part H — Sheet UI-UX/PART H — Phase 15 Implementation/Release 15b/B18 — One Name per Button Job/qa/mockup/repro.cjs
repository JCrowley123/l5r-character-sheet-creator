'use strict';
// B18 mock-ups: today's screens and the rulings drawn in the test browser (proposals.cjs), phone (375 x 812, touch) and
// laptop (1440 x 1000), on the live tree (origin/main 450362b9). Scratch only: no application file is edited.
// Each scene opens its character, brings up its page or window, numbers the controls the rulings touch (a small blue
// disc beside each, drawn only for the picture), photographs it, and reads each numbered control's visible words and
// spoken name (aria-labelledby, then aria-label, then its content, then its title: what a screen reader says).
// Then the same scene with the rulings on. Usage: run.sh repro.cjs <out folder>   (ONLY=scene,scene to choose)
const C=require('./common.cjs');const {fs,path,chromium,sha,settle,tab,mode,wait}=C;
const F=require('./fixtures.cjs');const P=require('./proposals.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const R={source_sha256:sha,captured_utc:new Date().toISOString(),phone:{},laptop:{},errors:[]};

async function press(p,phone,sel){const l=p.locator(sel).filter({visible:true}).first();await l.scrollIntoViewIfNeeded();if(phone)await l.tap();else await l.click();await settle(p);await wait(350);}
const shown=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&getComputedStyle(e).display!=='none'&&e.getClientRects().length>0;},sel);
// The numbered controls: every visible element the scene names, in page order, each with its number.
const MARK=function(sels){
 document.querySelectorAll('.b18-mark').forEach(m=>m.remove());
 const vis=el=>el.checkVisibility({visibilityProperty:true})&&el.getBoundingClientRect().width>0;
 const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
 const acc=n=>{if(n.nodeType===3)return n.nodeValue;if(n.nodeType!==1||n.getAttribute('aria-hidden')==='true')return '';const al=n.getAttribute('aria-label');if(al&&al.trim())return ' '+al+' ';return [...n.childNodes].map(acc).join('');};
 const spoken=el=>{const lb=el.getAttribute('aria-labelledby');if(lb){const t=norm(lb.split(/\s+/).map(i=>document.getElementById(i)).filter(Boolean).map(e=>e.textContent).join(' '));if(t)return t;}
  const al=el.getAttribute('aria-label');if(al&&norm(al))return norm(al);const t=norm([...el.childNodes].map(acc).join(''));if(t)return t;return norm(el.getAttribute('title'));};
 const glyph=el=>{for(const w of ['::after','::before']){const c=getComputedStyle(el,w).content;if(c&&c!=='none'&&c!=='normal'&&c!=='""')return c.replace(/^["']|["']$/g,'');}return '';};
 const els=[];for(const s of sels)for(const el of document.querySelectorAll(s))if(vis(el)&&!els.includes(el))els.push(el);
 els.sort((a,b)=>a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1);
 return els.map((el,i)=>{
  // words: as written in the page; visible: as drawn (the style sheet draws some buttons in capitals; a glyph drawn by
  // the style sheet, such as A04's ring i, is read from ::after).
  const hidden=getComputedStyle(el).fontSize==='0px';
  const shownText=hidden?glyph(el):norm(el.innerText||el.textContent);
  const card=el.closest('.entry');const nm=card&&card.querySelector('.en-name');
  el.dataset.b18n=String(i+1);
  return {n:i+1,words:hidden?(glyph(el)||norm(el.textContent)):norm(el.textContent),visible:shownText||glyph(el),spoken:spoken(el),title:el.getAttribute('title')||'',where:nm?norm(nm.value):''};
 });
};
const DRAW=function(){
 document.querySelectorAll('.b18-mark').forEach(m=>m.remove());
 for(const el of document.querySelectorAll('[data-b18n]')){
  if(!el.getClientRects().length)continue;const r=el.getBoundingClientRect();
  const m=document.createElement('div');m.className='b18-mark';m.textContent=el.dataset.b18n;
  Object.assign(m.style,{position:'fixed',left:Math.max(0,Math.min(innerWidth-18,r.right-9))+'px',top:Math.max(0,r.top-9)+'px',width:'18px',height:'18px',borderRadius:'50%',
   background:'#1d4fd6',color:'#fff',font:'700 11px/18px system-ui,sans-serif',textAlign:'center',zIndex:2147483647,pointerEvents:'none',boxShadow:'0 0 0 2px #fff'});
  document.body.appendChild(m);
 }
};
const clearMarks=p=>p.evaluate(()=>{document.querySelectorAll('.b18-mark').forEach(m=>m.remove());document.querySelectorAll('[data-b18n]').forEach(e=>delete e.dataset.b18n);});
// A window: the whole screen as it opens (phone) or a clip around the window (laptop). A page: a clip around the frame's
// elements at both sizes; on the phone the screen is made taller first when the frame is taller than one screen, so a
// few cards show together at the phone's width (the cards and their layout are unchanged).
async function picture(p,phone,file,frame,{pad=12,window=false}={}){
 const vp=p.viewportSize();
 if(!window){
  const need=await p.evaluate(sels=>{const els=sels.flatMap(s=>[...document.querySelectorAll(s)]).filter(e=>e.getClientRects().length);if(!els.length)return 0;
   const rs=els.map(e=>e.getBoundingClientRect());return Math.ceil(Math.max(...rs.map(r=>r.bottom))-Math.min(...rs.map(r=>r.top)));},frame);
  if(need+260>vp.height)await p.setViewportSize({width:vp.width,height:Math.min(3200,need+300)});
  await settle(p);
  await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return;e.scrollIntoView({block:'start'});let a=e.parentElement;
   while(a&&!(/(auto|scroll)/.test(getComputedStyle(a).overflowY)&&a.scrollHeight>a.clientHeight))a=a.parentElement;(a||document.scrollingElement).scrollTop-=150;},frame[0]);
 }
 await settle(p);await p.evaluate(`(${DRAW.toString()})()`);
 if(phone&&window){await p.screenshot({path:path.join(out,file)});return;}
 const box=await p.evaluate(([sels,pad])=>{const els=sels.flatMap(s=>[...document.querySelectorAll(s)]).filter(e=>e.getClientRects().length);
  const rs=els.map(e=>e.getBoundingClientRect());const x=Math.max(0,Math.min(...rs.map(r=>r.left))-pad),y=Math.max(0,Math.min(...rs.map(r=>r.top))-pad);
  return {x,y,width:Math.min(innerWidth-x,Math.max(...rs.map(r=>r.right))+pad-x),height:Math.min(innerHeight-y,Math.max(...rs.map(r=>r.bottom))+pad-y)};},[frame,pad]);
 await p.screenshot({path:path.join(out,file),clip:box});
 if(p.viewportSize().height!==vp.height)await p.setViewportSize(vp);
}

// ---------------- the scenes ----------------
// Each: fixture, mode, tab, optional open(p,phone), the controls to number, the frame, and the groups it shows.
const openAll=p=>p.evaluate(()=>{document.querySelectorAll('.car-page details').forEach(d=>d.open=true);});
// Each scene: its character, mode and tab, what to open, the controls to number, the frame of the picture, and the groups
// whose rulings the "after" picture applies (only those, so each picture shows one change).
const S=[
 // G01 and G06: the once-a-session buttons (Play, where they are used).
 {id:'resets',fixture:'resets',mode:'play',tab:'Adv & Disadv',marks:['.adv-config-reset-session','.dp4523-reset','.dsx4532-btn','.unlucky-btn'],
  frame:['#advList .entry','#disadvList .entry'],groups:['G01','G06']},
 {id:'ancestor',fixture:'sessions',mode:'play',tab:'Clan & School',marks:['#anc48ResetSession','#anc48Info'],frame:['#anc48Section'],groups:['G01','G12']},
 {id:'ancestor-use',fixture:'imperial',mode:'play',tab:'Clan & School',marks:['#anc48UseNow','#anc48ResetSession'],frame:['#anc48Section'],groups:['G01','G06']},
 {id:'combat-round',fixture:'sessions',mode:'play',tab:'Combat',open:openAll,marks:['#btnResetRounds','#woundStepDown','#woundStepUp'],frame:['.combat-round-box','.wound-controls'],groups:['G01','G14']},
 // G02 and G12: Change, Choose… and the cards' i (Manage).
 {id:'changes',fixture:'changes',mode:'management',tab:'Adv & Disadv',marks:['.adv-config-btn','.adv-config-info','.dp4523-info','.kt15-info'],frame:['#advList .entry'],groups:['G02','G12']},
 // G03: every ✕ on a row, and the words Delete and Remove where they are today.
 {id:'remove-skills',fixture:'sessions',mode:'management',tab:'Skills',marks:['#skillsBody .rm-btn','#skillsBody .emph-item-del'],frame:['#skillsBody tr:nth-child(1)','#skillsBody tr:nth-child(2)'],groups:['G03']},
 {id:'remove-adv',fixture:'changes',mode:'management',tab:'Adv & Disadv',marks:['#advList .rm-btn'],frame:['#advList .entry:nth-child(1)','#advList .entry:nth-child(2)'],groups:['G03']},
 {id:'remove-equip',fixture:'sessions',mode:'management',tab:'Equipment',marks:['#equipBody .rm-btn'],frame:['#equipBody tr:nth-child(1)','#equipBody tr:nth-child(2)','#equipBody tr:nth-child(3)'],groups:['G03']},
 {id:'remove-weapons',fixture:'sessions',mode:'play',tab:'Combat',open:openAll,marks:['#weaponsBody .rm-btn'],frame:['#weaponsDetails'],groups:['G03']},
 {id:'characters-menu',fixture:'sessions',mode:'play',tab:'Skills',open:async(p,phone)=>{await press(p,phone,'#btnSave');await press(p,phone,'.ab113-item:text-is("Characters")');await wait(500);
   await press(p,phone,'#cl11View .cl11-more, #cl11View button[aria-haspopup]');},marks:['#cl11View .cl11-menu button'],frame:['#cl11View .cl11-row','#cl11View .cl11-menu'],window:true,groups:['G16']},
 {id:'court-window',fixture:'court',mode:'management',tab:'Adv & Disadv',open:async(p,phone)=>{await press(p,phone,'#advList .adv-config-btn');},
  marks:['#advConfigModalOverlay .court4514-add','#advConfigModalOverlay .court4514-remove'],frame:['#advConfigModalOverlay .roll-modal'],window:true,groups:['G10']},
 {id:'court-window-delete',fixture:'court',mode:'management',tab:'Adv & Disadv',open:async(p,phone)=>{await press(p,phone,'#advList .adv-config-btn');},
  marks:['#advConfigModalOverlay .court4514-remove'],frame:['#advConfigModalOverlay .roll-modal'],window:true,groups:['G03','G03-delete']},
 // G04 and G05: the corner ✕ and the buttons at a window's foot.
 {id:'kiho-notice',fixture:'sessions',mode:'play',tab:'Techniques',open:async(p,phone)=>{await press(p,phone,'#kihoRulesInfoBtn');},
  marks:['#appConfirmX','#appConfirmOk'],frame:['#appConfirmOverlay .roll-modal'],window:true,groups:['G04','G05']},
 {id:'skill-info',fixture:'sessions',mode:'play',tab:'Skills',open:async(p,phone)=>{await press(p,phone,'#skillsBody .sk-info-btn');},
  marks:['#skillInfoClose'],frame:['#skillInfoModalOverlay .roll-modal'],window:true,groups:['G04']},
 {id:'roll-preview',fixture:'sessions',mode:'play',tab:'Skills',open:async(p,phone)=>{await press(p,phone,'#skillsBody .sk-roll');},
  marks:['#rollPreviewOverlay button'],markText:/^(✕|Cancel|Roll \dk\d)$/,frame:['#rollPreviewOverlay .roll-modal'],window:true,groups:['G04']},
 // G08: the roll result (fixed dice: every die a 1, so the Emphasis reroll is offered).
 {id:'roll-result',fixture:'sessions',mode:'play',tab:'Skills',open:async(p,phone)=>{await p.evaluate(()=>{Math.random=()=>0.05;});await press(p,phone,'#skillsBody tr:nth-child(1) .sk-roll');
   if(await shown(p,'#rollPreviewOverlay'))await press(p,phone,'#rollPreviewGo');await p.waitForFunction(()=>getComputedStyle(document.getElementById('rollModalOverlay')).display!=='none');await wait(400);},
  marks:['#emphasisRerollBtn','.adv-config-spend-luck','.unlucky-invoke'],frame:['#rollModalOverlay .roll-modal'],window:true,groups:['G08']},
 // G09: the dice tray's two Clear buttons.
 {id:'dice-tray',fixture:'sessions',mode:'play',tab:'Skills',open:async(p,phone)=>{await press(p,phone,'#floatingDiceBtn');},
  marks:['#dicePickerClear','#otherDiceClear'],frame:['#manualRollPromptOverlay .roll-modal'],window:true,groups:['G09']},
 // G10: + Emph, +Book.
 {id:'add-emphasis',fixture:'sessions',mode:'management',tab:'Skills',marks:['#skillsBody .emph-add-btn'],frame:['#skillsBody tr:nth-child(1)','#skillsBody tr:nth-child(2)'],groups:['G10']},
 {id:'library',fixture:'sessions',mode:'play',tab:'Skills',open:async(p,phone)=>{await press(p,phone,'.ab113-item:text-is("Library")');await wait(600);},
  marks:['#cl11View button'],markText:/^\+ ?(Add )?Book$/,frame:['#cl11View'],window:true,groups:['G10']},
 // G07 and G11: Lost Love, Touch of the Void, Toshigoku.
 {id:'touch',fixture:'checks',mode:'play',tab:'Adv & Disadv',marks:['#disadvList .chk4531-btn','#disadvList .vi4533-btn','#disadvList .realm4510-check'],frame:['#disadvList .entry'],groups:['G11']},
 // G12: the Combat tab's glyphs, and Release 15b B04's i in Quick Access.
 {id:'combat-info',fixture:'sessions',mode:'play',tab:'Combat',open:async p=>{await p.evaluate(()=>{['weaponsDetails','stanceDetails'].forEach(i=>{const d=document.getElementById(i);if(d)d.open=true;});});},
  marks:['#combatTnInfoBtn','#combatAttackInfoBtn','.wp-info-btn','.stance-info-btn'],frame:['#armorTnDetails','#weaponsDetails','#stanceDetails'],groups:['G12']},
 {id:'quick-access',fixture:'sessions',mode:'play',tab:'Skills',open:async(p,phone)=>{await press(p,phone,'#quickAccessToggleBtn');},marks:['#at15QaInfo','#quickAccessCloseBtn'],frame:['#quickAccessPanel'],window:true,groups:['G12']},
 // G14: + and − read aloud.
 {id:'identity-steppers',fixture:'sessions',mode:'play',tab:'Identity',marks:['button[aria-label$=" points"]'],
  frame:['#cp7-section'],groups:['G14']},
 {id:'void-ring',fixture:'sessions',mode:'management',tab:'Rings & Traits',marks:['.stepbtn[data-ring]'],frame:['#ring_void'],frameClosest:'.ring-card,.ring-row,fieldset,.section',groups:['G14']},
];

async function scene(b,phone,dev,s){
 const r={id:s.id,groups:s.groups};
 const fx=F.write(out,s.fixture);
 for(const state of ['today','after']){
  const {c,p}=await C.open(b,phone,fx.file,fx.name);
  try{
   await mode(p,s.mode);if(state==='after')await P.install(p,s.groups);
   await tab(p,s.tab);
   if(s.open)await s.open(p,phone);
   let frame=s.frame;
   if(s.frameClosest){await p.evaluate(([sels,cl])=>{sels.forEach(s=>{const e=document.querySelector(s);const f=e&&e.closest(cl);if(f)f.dataset.b18frame='1';});},[s.frame,s.frameClosest]);frame=['[data-b18frame]'];}
   if(state==='after')await p.evaluate(()=>window.__B18&&window.__B18.apply());await settle(p);
   r[state]=await p.evaluate(`(${MARK.toString()})(${JSON.stringify(s.marks)})`);
   // markText keeps only the numbered controls whose words match (today's or the ruling's), then numbers them again.
   if(s.markText){await p.evaluate(re=>{const R=new RegExp(re);document.querySelectorAll('[data-b18n]').forEach(e=>{if(!R.test(e.textContent.trim()))delete e.dataset.b18n;});},s.markText.source);
    r[state]=await p.evaluate(`(${MARK.toString()})(${JSON.stringify(['[data-b18n]'])})`);}
   await picture(p,phone,`${s.id}-${dev}-${state}.png`,frame,{window:!!s.window});
   r[state+'Height']=await p.evaluate(sel=>{const e=document.querySelector(sel);return e?Math.round(e.getBoundingClientRect().height):null;},frame[0]);
   r[state+'PageWidth']=await p.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
   await clearMarks(p);
   r[state+'Errors']=p.errors.slice();r[state+'Dialogs']=p.dialogs.slice();
  }catch(e){R.errors.push(`${dev}/${s.id}/${state}: ${String(e).split('\n')[0]}`);r[state+'Failed']=String(e).split('\n')[0];}
  await c.close();
 }
 R[dev][s.id]=r;process.stdout.write(`${dev}/${s.id}: today ${(r.today||[]).length}, after ${(r.after||[]).length}\n`);
}
(async()=>{
 const b=await chromium.launch();const only=process.env.ONLY?process.env.ONLY.split(','):null;
 try{for(const [phone,dev] of [[true,'phone'],[false,'laptop']])for(const s of S){if(only&&!only.includes(s.id))continue;await scene(b,phone,dev,s);}}
 finally{fs.writeFileSync(path.join(out,only?'reproduction-partial.json':'reproduction.json'),JSON.stringify(R,null,1));await b.close();}
 console.log('done',sha,'errors',R.errors.length);for(const e of R.errors)console.log(' !',e);
})().catch(e=>{console.error(e);process.exit(1);});
