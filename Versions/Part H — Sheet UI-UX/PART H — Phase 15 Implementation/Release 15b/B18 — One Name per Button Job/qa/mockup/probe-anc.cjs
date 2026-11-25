'use strict';
// B18 round 2: the i's ancestors on each card (display, flex settings, width) so the "after" can move it. Read only.
const C=require('./common.cjs');const {fs,path,chromium,settle,tab,mode,wait}=C;const F=require('./fixtures.cjs');
const out=path.resolve(process.argv[2]);
(async()=>{const b=await chromium.launch();
 for(const [fx,m] of [['sessions','play'],['sessions','management']]){const w=F.write(out,fx);const {c,p}=await C.open(b,true,w.file,w.name);
  await mode(p,m);await tab(p,'Adv & Disadv');
  const r=await p.evaluate(()=>{const vis=el=>el.checkVisibility({visibilityProperty:true})&&el.getBoundingClientRect().width>0;
   const isI=b=>{const t=b.innerText.trim();const a=(b.getAttribute('aria-label')||'');return t==='i'||/information$|^Explain/.test(a);};
   return [...document.querySelectorAll('.entry')].filter(vis).flatMap(e=>[...e.querySelectorAll('button')].filter(vis).filter(isI).map(b=>{
    const chain=[];let x=b;while(x&&x!==e){const s=getComputedStyle(x);chain.push(`${x.tagName.toLowerCase()}.${String(x.className).trim().split(/\s+/).join('.')} [${s.display}${s.display.includes('flex')?' wrap='+s.flexWrap+' just='+s.justifyContent:''} w=${Math.round(x.getBoundingClientRect().width)} ml=${s.marginLeft}]`);x=x.parentElement;}
    return {card:e.querySelector('.en-name').value,chain,rowKids:[...b.closest('.adv-config-row')?.children||[]].map(k=>`${k.tagName.toLowerCase()}.${String(k.className).split(' ')[0]}`)};}));});
  console.log('==',fx,m);for(const x of r){console.log(' ',x.card);x.chain.forEach(s=>console.log('    ',s));console.log('     row kids:',x.rowKids.join(' , '));}
  await c.close();}
 await b.close();})().catch(e=>{console.error(e);process.exit(1);});
