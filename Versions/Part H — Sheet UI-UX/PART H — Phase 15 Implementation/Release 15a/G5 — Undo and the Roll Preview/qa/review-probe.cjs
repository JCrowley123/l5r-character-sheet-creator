'use strict';
// Code-review probe (G5): spaced taps (2 s) on every card, Play and Manage, phone; does any other layer end the group early?
const {fs,path,chromium,DENSE,settle,tab,open}=require('./mockup/common.cjs');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const fx=path.join(out,'dense.l5r.json');fs.writeFileSync(fx,JSON.stringify(DENSE));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const TITLE={honor:'Honour',glory:'Glory',status:'Status',taint:'Taint'};
(async()=>{
 const b=await chromium.launch();
 const R=[];
 for(const mode of ['play','management']){
  const {c,p}=await open(b,true,fx,DENSE.fields.f_name);
  await p.evaluate(m=>window.__L5R_TEST__.MODES12.set(m),mode);await tab(p,'Identity');
  for(const name of ['honor','glory','status','taint']){
   await p.evaluate(()=>window.__L5R_TEST__.CP7.clear());
   const btn=p.locator('[data-cp7='+name+'] button[aria-label="Add '+TITLE[name]+' points"]');
   const before=await p.evaluate(n=>JSON.stringify(window.__L5R_TEST__.CP7.read(n)),name);
   for(let i=0;i<3;i++){await btn.tap();if(i<2)await wait(2000);}
   const st=await p.evaluate(()=>window.__L5R_TEST__.QT15.state());
   await p.locator('#cp7-undo').tap();await settle(p);
   const after=await p.evaluate(n=>JSON.stringify(window.__L5R_TEST__.CP7.read(n)),name);
   R.push({mode,name,taps:st.taps,undoTaps:st.undoTaps,backToStart:before===after,before,after});
   await wait(5500);
  }
  R.push({mode,errors:p.errors});
  await c.close();
 }
 await b.close();
 console.log(JSON.stringify(R,null,1));
})().catch(e=>{console.error(e);process.exit(1);});
