'use strict';
const path=require('path'),{spawnSync}=require('child_process');
const sheet=path.resolve(process.argv[2]);let passed=0,total=0,failed=0;
for(const file of [path.resolve(__dirname,'../../PART I — Phase 4.7.2 Missing Basic Schools/qa/current-suite-runner.js'),path.join(__dirname,'paragon-gate-harness.js')]){
 const r=spawnSync(process.execPath,[file,sheet],{env:process.env,encoding:'utf8',timeout:3600000,maxBuffer:64*1024*1024});
 const out=(r.stdout||'')+(r.stderr||'');process.stdout.write(out);
 const counts=[...out.matchAll(/(?:COMBINED )?(\d+)\/(\d+) checks passed/g)],c=counts.at(-1);
 if(!c||+c[2]===0)failed++;else{passed+=+c[1];total+=+c[2];}if(r.status!==0)failed++;
}
console.log('COMBINED '+passed+'/'+total+' checks passed');process.exitCode=total>0&&passed===total&&failed===0?0:1;
