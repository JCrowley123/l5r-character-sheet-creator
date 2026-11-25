'use strict';
// B18 round 2: which cards have an i or a Reset, and how their rows are built (Play and Manage, phone and laptop).
// Read only. Usage: run.sh probe-rows.cjs <out folder>
const C=require('./common.cjs');const {fs,path,chromium,sha,settle,tab,mode,wait}=C;
const F=require('./fixtures.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const PROBE=function(){
 const vis=el=>el.checkVisibility({visibilityProperty:true})&&el.getBoundingClientRect().width>0;
 const isI=b=>{const t=b.innerText.trim();const a=(b.getAttribute('aria-label')||'');return t==='i'||t==='ⓘ'||/information$|^Explain/.test(a);};
 const isReset=b=>/^reset/i.test(b.innerText.trim());
 const desc=el=>el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\s+/).join('.'):'');
 const res=[];
 const roots=[...document.querySelectorAll('.entry'),document.getElementById('anc48Card')].filter(Boolean).filter(vis);
 for(const card of roots){
  const btns=[...card.querySelectorAll('button')].filter(vis);
  const is=btns.filter(isI),rs=btns.filter(isReset);
  if(!is.length&&!rs.length)continue;
  const cr=card.getBoundingClientRect();
  const name=(card.querySelector('.en-name')||{}).value||card.id;
  const row=el=>{const q=el.getBoundingClientRect();return {el:desc(el),parent:desc(el.parentElement),grand:desc(el.parentElement.parentElement),
   left:Math.round(q.left-cr.left),right:Math.round(cr.right-q.right),top:Math.round(q.top-cr.top),h:Math.round(q.height)};};
  // Every visible control and text block on the i's line and the Reset's line, left to right.
  const line=el=>{const q=el.getBoundingClientRect();return [...card.querySelectorAll('button,.adv-badge,[class*="badge"],[class*="pip"],span,select')].filter(vis)
   .filter(x=>{const z=x.getBoundingClientRect();return z.height<60&&z.top<q.bottom-2&&z.bottom>q.top+2&&!x.querySelector('button')&&x.children.length===0;})
   .sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left)
   .map(x=>{const z=x.getBoundingClientRect();return `${(x.innerText||x.getAttribute('aria-label')||'').trim().slice(0,24)}[${Math.round(z.left-cr.left)}-${Math.round(z.right-cr.left)}]`;}).join(' | ');};
  res.push({card:name,width:Math.round(cr.width),i:is.map(b=>Object.assign(row(b),{label:b.getAttribute('aria-label'),line:line(b)})),
   reset:rs.map(b=>Object.assign(row(b),{line:line(b)}))});
 }
 return res;
};
(async()=>{
 const b=await chromium.launch();const R={source_sha256:sha,captured_utc:new Date().toISOString(),runs:{}};
 try{for(const [dev,phone] of [['phone',true],['laptop',false]])for(const fx of ['sessions','changes'])for(const m of ['play','management']){
  const w=F.write(out,fx);const {c,p}=await C.open(b,phone,w.file,w.name);
  try{await mode(p,m);const k=`${dev}/${fx}/${m}`;R.runs[k]=[];
   for(const t of ['Adv & Disadv','Clan & School']){await tab(p,t);await settle(p);await wait(250);R.runs[k].push(...(await p.evaluate(`(${PROBE.toString()})()`)).map(x=>Object.assign({tab:t},x)));}
   if(p.errors.length)R.runs[k+'/errors']=p.errors;}
  finally{await c.close();}}}
 finally{fs.writeFileSync(path.join(out,'probe-rows.json'),JSON.stringify(R,null,1)+'\n');await b.close();}
 for(const [k,v] of Object.entries(R.runs)){console.log('==',k);if(!Array.isArray(v)){console.log(v);continue;}
  const seen=new Set();for(const r of v){const key=r.card;if(seen.has(key))continue;seen.add(key);
   console.log(` ${r.card} (w${r.width})`);for(const i of r.i)console.log(`   i  edge ${i.right} top ${i.top} parent ${i.parent}\n      line: ${i.line}`);
   for(const x of r.reset)console.log(`   R  edge ${x.right} top ${x.top} h ${x.h} parent ${x.parent}`);}}
})().catch(e=>{console.error(e);process.exit(1);});
