'use strict';
// B18 stage 1: the live read. For each size (phone 390×844 touch, scale 2; laptop 1440×1000) and each mode (Manage, Play) it
// reads every tab of the test character, then brings up each window and full-screen page in turn and reads that too.
// Read-only: nothing is saved, no application file is edited. Usage: run.sh scan.cjs <out folder> [devices] [modes] [only ids]
//   devices: "phone,laptop" (default both); modes: "management,play" (default both); only: comma list of scenario ids.
const C=require('./common.cjs');const {readControls}=require('./read-controls.cjs');const F=require('./fixtures.cjs');const SC=require('./scenarios.cjs');
const {chromium,fs,path,sha,tab,mode,wait,settle}=C;
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const devices=(process.argv[3]||'phone,laptop').split(',');
const modes=(process.argv[4]||'management,play').split(',');
const only=process.argv[5]?process.argv[5].split(','):null;
const fx=F.write(out,'sessions');
const R={source_sha256:sha,captured_utc:new Date().toISOString(),records:[],scenarios:[],errors:[]};
const stamp=(recs,meta)=>recs.map(r=>Object.assign({},r,meta));
async function fresh(b,phone,m){
 const {c,p}=await C.open(b,phone,fx.file,fx.name);await mode(p,m);return {c,p};
}
(async()=>{
 const b=await chromium.launch();
 for(const dev of devices){
  const phone=dev==='phone';
  for(const m of modes){
   let {c,p}=await fresh(b,phone,m);
   const meta={device:dev,mode:m};
   // 1. Every tab.
   if(!only){
    const tabs=await p.evaluate(()=>window.__L5R_CAROUSEL__.getTabs().map(t=>t.label));
    for(const t of tabs){await tab(p,t);R.records.push(...stamp(await readControls(p,{openDetails:true,onlyActivePage:true}),Object.assign({state:'tab',scenario:'tab:'+t},meta)));}
   }
   // 2. Windows and full-screen pages.
   for(const s of SC.S){
    if(only&&!only.includes(s.id))continue;
    if(s.modes&&!s.modes.includes(m))continue;
    const info={id:s.id,title:s.title,device:dev,mode:m,opened:null,count:0};
    try{
     await tab(p,s.tab);
     const ctx={p,phone};
     const ok=await s.run(ctx);
     if(!ok){info.opened='control not found';}
     else{
      await wait(300);
      const ov=await SC.openOverlays(p);const v=await SC.viewOpen(p);const mn=await SC.menuOpen(p);
      let targets=[];
      if(s.within)targets=[s.within];else if(ov.length)targets=ov.map(i=>'#'+i);else if(v)targets=['#cl11View'];else if(mn)targets=['#pm128Menu'];
      info.opened=targets.join(' ')||'nothing opened';
      for(const w of targets){
       const recs=await readControls(p,{within:w,openDetails:!!s.view});
       info.count+=recs.length;
       R.records.push(...stamp(recs,Object.assign({state:'window',scenario:s.id,window:w},meta)));
      }
     }
     if(s.reopen){await c.close();({c,p}=await fresh(b,phone,m));R.scenarios.push(info);process.stdout.write(`${dev}/${m}/${s.id}: ${info.opened} (${info.count})
`);continue;}
     const closed=s.close?await s.close(ctx).then(()=>true):await SC.closeAll(p,phone);
     if(!closed||!(await SC.closeAll(p,phone))){R.errors.push(`${dev}/${m}/${s.id}: could not close, page reopened`);await c.close();({c,p}=await fresh(b,phone,m));}
    }catch(e){
     R.errors.push(`${dev}/${m}/${s.id}: ${String(e).split('\n')[0]}`);info.opened='error';
     try{await c.close();}catch(_){}
     ({c,p}=await fresh(b,phone,m));
    }
    R.scenarios.push(info);
    process.stdout.write(`${dev}/${m}/${s.id}: ${info.opened} (${info.count})\n`);
   }
   // Windows that exist in the page but were not brought up above: read as closed (their labels are in the markup).
   if(!only){
    await tab(p,'Skills');
    const recs=await readControls(p,{includeHidden:true,clickables:false,within:'.roll-modal-overlay,#cl11View,#pm128Menu,.vu15-line,.cp7-feedback'});
    const hid=recs.filter(r=>!r.visible);
    R.records.push(...stamp(hid,Object.assign({state:'window-closed',scenario:'closed-windows',window:'closed'},meta)));
    process.stdout.write(`${dev}/${m}/closed-windows: ${hid.length}
`);
   }
   R.errors.push(...p.errors.map(e=>`${dev}/${m}: page error ${e}`));
   await c.close();
  }
 }
 fs.writeFileSync(path.join(out,only?'raw-partial.json':'raw.json'),JSON.stringify(R));
 console.log('records',R.records.length,'errors',R.errors.length);
 for(const e of R.errors.slice(0,20))console.log(' !',e);
 await b.close();
})();
