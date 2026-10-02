'use strict';
const path=require('path'),fs=require('fs'),{spawnSync}=require('child_process');
const sheet=path.resolve(process.argv[2]);
let v=__dirname;while(!fs.existsSync(path.join(v,'BUILD-LEDGER.md'))){const p=path.dirname(v);if(p===v)throw Error('Versions not found');v=p;}
const suites=[path.join(v,'PART I \u2014 Phase 4.5.25 Clan and School Prices','qa','current-suite-runner.js'),path.join(__dirname,'rank-zero-harness.js')];
let passed=0,total=0,failed=0;
for(const file of suites){const r=spawnSync(process.execPath,[file,sheet],{env:process.env,encoding:'utf8',timeout:3600000,maxBuffer:64*1024*1024});const out=(r.stdout||'')+(r.stderr||'');process.stdout.write(out);const counts=[...out.matchAll(/(?:COMBINED )?(\d+)\/(\d+) checks passed/g)];const c=counts.at(-1);if(!c||+c[2]===0)failed++;else{passed+=+c[1];total+=+c[2];}if(r.status!==0)failed++;}
console.log(`COMBINED ${passed}/${total} checks passed across every retained suite plus Rank 0 Explosion Fix`);
process.exitCode=total>0&&passed===total&&failed===0?0:1;
