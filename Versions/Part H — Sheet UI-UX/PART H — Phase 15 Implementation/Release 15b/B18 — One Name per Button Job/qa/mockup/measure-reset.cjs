'use strict';
// B18, the owner's Reset answer (25 November 2026): "the buttons seem to change in size" and the i "seems to either be
// right next to the reset button or all the way to the right". Measures today's sheet (no change drawn) on a phone and a
// laptop: each Reset button's look (class, size, letters) and, on every card of the Play tabs, where its i sits (at the
// card's right edge, or straight after the buttons). Scratch only: no application file is edited.
// Usage: run.sh measure-reset.cjs <out folder>
const C=require('./common.cjs');const {fs,path,chromium,sha,settle,tab,mode,wait}=C;
const F=require('./fixtures.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});

const RESETS=[
 {name:'Kharmic Tie',fixture:'resets',tab:'Adv & Disadv',entry:'Kharmic Tie',sel:'.adv-config-reset-session'},
 {name:'Luck',fixture:'resets',tab:'Adv & Disadv',entry:'Luck',sel:'.adv-config-reset-session'},
 {name:'Dark Paragon',fixture:'resets',tab:'Adv & Disadv',entry:'Dark Paragon',sel:'.dp4523-reset'},
 {name:'Great Destiny',fixture:'resets',tab:'Adv & Disadv',entry:'Great Destiny',sel:'.dsx4532-btn',text:'^Reset'},
 {name:'Haunted',fixture:'resets',tab:'Adv & Disadv',entry:'Haunted',sel:'.dsx4532-btn',text:'^Reset'},
 {name:'Unlucky',fixture:'resets',tab:'Adv & Disadv',entry:'Unlucky',sel:'.unlucky-btn',text:'^Reset'},
 {name:'Ancestor card',fixture:'sessions',tab:'Clan & School',sel:'#anc48ResetSession'},
 {name:'Combat round counter',fixture:'sessions',tab:'Combat',sel:'#btnResetRounds',open:['voidDetails']},
];
const TABS=['Adv & Disadv','Clan & School','Combat'];

const LOOK=function(t){
 const vis=el=>el.checkVisibility({visibilityProperty:true})&&el.getBoundingClientRect().width>0;
 let root=document;
 if(t.entry){root=[...document.querySelectorAll('.entry')].find(d=>{const n=d.querySelector('.en-name');return n&&n.value===t.entry;});if(!root)return null;}
 const re=t.text?new RegExp(t.text):null;
 const el=[...root.querySelectorAll(t.sel)].find(e=>vis(e)&&(!re||re.test(e.textContent.trim())));
 if(!el)return null;
 const s=getComputedStyle(el),r=el.getBoundingClientRect();
 // Its neighbours on the same line inside the card, left to right, and the card's i.
 const card=el.closest('.entry,#anc48Card,.combat-round-box')||el.parentElement;const cr=card.getBoundingClientRect();
 const btns=[...card.querySelectorAll('button')].filter(vis).filter(b=>{const q=b.getBoundingClientRect();return q.top<r.bottom&&q.bottom>r.top;})
  .sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left)
  .map(b=>{const q=b.getBoundingClientRect();return {words:b.innerText.trim()||b.getAttribute('aria-label'),cls:b.className,left:Math.round(q.left-cr.left),right:Math.round(cr.right-q.right),w:Math.round(q.width),h:Math.round(q.height)};});
 return {cls:el.className,words:el.innerText.trim(),width:Math.round(r.width),height:Math.round(r.height),
  fontSize:s.fontSize,fontFamily:s.fontFamily.split(',')[0],fontWeight:s.fontWeight,textTransform:s.textTransform,letterSpacing:s.letterSpacing,
  padding:s.padding,minHeight:s.minHeight,borderRadius:s.borderRadius,border:s.borderTopWidth+' '+s.borderTopColor,
  cardWidth:Math.round(cr.width),sameLine:btns};
};
// Every visible i on the tab: the card it belongs to, its gap to the card's right edge, and the nearest button to its left.
const INFOS=function(){
 const vis=el=>el.checkVisibility({visibilityProperty:true})&&el.getBoundingClientRect().width>0;
 const isI=b=>{const t=b.innerText.trim();const a=(b.getAttribute('aria-label')||'');return t==='i'||t==='ⓘ'||/information$|^Explain/.test(a);};
 return [...document.querySelectorAll('button')].filter(vis).filter(isI).map(b=>{
  const card=b.closest('.entry,.card,section,fieldset,details')||b.parentElement;const cr=card.getBoundingClientRect(),q=b.getBoundingClientRect();
  const name=(card.querySelector('.en-name')||{}).value||(card.querySelector('h2,h3,h4,summary,legend')||{}).innerText||'';
  const left=[...card.querySelectorAll('button')].filter(vis).filter(x=>x!==b).filter(x=>{const z=x.getBoundingClientRect();return z.top<q.bottom&&z.bottom>q.top&&z.right<=q.left+1;})
   .sort((x,y)=>y.getBoundingClientRect().right-x.getBoundingClientRect().right)[0];
  return {card:String(name).trim().split('\n')[0].slice(0,40),label:b.getAttribute('aria-label')||'',cls:b.className,
   toRightEdge:Math.round(cr.right-q.right),cardWidth:Math.round(cr.width),
   leftNeighbour:left?{words:left.innerText.trim().slice(0,30),gap:Math.round(q.left-left.getBoundingClientRect().right)}:null};
 });
};

(async()=>{
 const b=await chromium.launch();const R={source_sha256:sha,captured_utc:new Date().toISOString(),resets:{},infos:{},errors:[]};
 try{
  for(const [dev,phone] of [['phone',true],['laptop',false]]){
   R.resets[dev]=[];R.infos[dev]={};
   for(const fxName of ['resets','sessions']){
    const fx=F.write(out,fxName);const {c,p}=await C.open(b,phone,fx.file,fx.name);
    try{
     await mode(p,'play');
     for(const t of RESETS.filter(x=>x.fixture===fxName)){
      await tab(p,t.tab);if(t.open)await p.evaluate(ids=>ids.forEach(i=>{const d=document.getElementById(i);if(d)d.open=true;}),t.open);await settle(p);
      const m=await p.evaluate(`(${LOOK.toString()})(${JSON.stringify(t)})`);
      if(!m)R.errors.push(`${dev}/${t.name}: not found`);else R.resets[dev].push(Object.assign({name:t.name},m));
     }
     for(const tb of TABS){await tab(p,tb);await settle(p);await wait(200);
      R.infos[dev][fxName+' / '+tb]=await p.evaluate(`(${INFOS.toString()})()`);}
     if(p.errors.length)R.errors.push(...p.errors.map(e=>`${dev}/${fxName}: ${e}`));
    }finally{await c.close();}
   }
  }
 }finally{fs.writeFileSync(path.join(out,'reset-measures.json'),JSON.stringify(R,null,1)+'\n');await b.close();}
 for(const dev of Object.keys(R.resets)){console.log('==',dev);
  for(const m of R.resets[dev])console.log(`${m.name.padEnd(22)} ${String(m.width).padStart(4)}x${m.height} ${m.fontSize} ${m.textTransform} ls=${m.letterSpacing} pad=${m.padding} cls=${m.cls}`);}
 console.log('errors',R.errors.length);for(const e of R.errors)console.log(' !',e);
})().catch(e=>{console.error(e);process.exit(1);});
