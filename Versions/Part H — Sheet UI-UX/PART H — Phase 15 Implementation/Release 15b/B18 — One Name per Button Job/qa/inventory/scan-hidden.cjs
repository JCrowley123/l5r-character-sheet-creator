'use strict';
// B18 stage 1: the buttons that are in the page but never shown (the older toolbar, the Rank settings steppers and so on).
// Read-only. Usage: run.sh scan-hidden.cjs <out folder>   Writes hidden.json: one record per hidden control, per size and mode.
const C=require('./common.cjs');const {readControls}=require('./read-controls.cjs');const F=require('./fixtures.cjs');
const {chromium,fs,path,sha,tab,mode,wait}=C;
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const fx=F.write(out,'sessions');
(async()=>{
 const b=await chromium.launch();const R={source_sha256:sha,captured_utc:new Date().toISOString(),records:[]};
 for(const dev of ['laptop','phone']){
  const {c,p}=await C.open(b,dev==='phone',fx.file,fx.name);
  for(const m of ['management','play']){
   await mode(p,m);
   const tabs=await p.evaluate(()=>window.__L5R_CAROUSEL__.getTabs().map(t=>t.label));
   for(const t of tabs){await tab(p,t);
    const all=await readControls(p,{includeHidden:true,clickables:false});
    for(const r of all)if(!r.visible&&!r.inOverlay&&!r.win)R.records.push(Object.assign({},r,{device:dev,mode:m,state:'hidden',scenario:'hidden:'+t}));}
  }
  await c.close();
 }
 fs.writeFileSync(path.join(out,'hidden.json'),JSON.stringify(R));
 console.log('hidden records',R.records.length);
 await b.close();
})();
