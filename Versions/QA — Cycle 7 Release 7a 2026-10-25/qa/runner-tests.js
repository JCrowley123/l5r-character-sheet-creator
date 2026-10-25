'use strict';
// Isolated orchestration tests. Stub outputs below are fixtures, never full-suite evidence.
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert');
const qa=process.argv[2]||__dirname;
const {runSuite,main}=require(path.join(qa,'flat-suite-runner.js'));
const root=fs.mkdtempSync(path.join(os.tmpdir(),'l5r-runner-unit-'));
const entry=path.join(root,'release','qa','current-suite-runner.js');fs.mkdirSync(path.dirname(entry),{recursive:true});
let count=0;
function source(expected=2,duplicate=false){
  fs.writeFileSync(entry,`const p=require('path'),{spawnSync}=require('child_process');
let sum=0,ok=true;
for(let i=0;i<${duplicate?2:1};i++){
 const r=spawnSync(process.execPath,[p.resolve(__dirname,'../../leaf.js'),process.argv[2]],{timeout:12345,maxBuffer:98765});
 const m=(r.stdout||'').match(/(\\d+)\\/(\\d+) checks passed/);ok=ok&&r.status===0&&m&&m[1]===m[2];sum+=m?Number(m[2]):0;
 process.stdout.write(r.stdout||'');
}
console.log('COMBINED '+(ok?sum:0)+'/'+sum+' checks passed');process.exitCode=ok?0:1;
module.exports.changedHarnesses={'leaf.js':${expected}};`);
}
function run(result,options={}){return runSuite({entry,sheet:path.join(root,'sheet.html'),expected:options.expected||2,
 launch:(command,args,opts)=>{assert.equal(opts.timeout,12345);assert.equal(opts.maxBuffer,98765);assert.equal(args[1],path.join(root,'sheet.html'));return result;}});}
const good={status:0,stdout:'2/2 checks passed\n',stderr:''};
try{
 assert.equal(main(['unused.html','--resume']),2);console.log('PASS refuses cached-result resume');count++;
 source();assert(run(good).pass);console.log('PASS accepts matching real-leaf contract and preserves invocation limits');count++;
 source(3);assert(!run(good).pass);console.log('PASS rejects changed harness count mismatch');count++;
 source();assert(!run({status:1,stdout:'1/2 checks passed\n',stderr:''}).pass);console.log('PASS rejects failing leaf and wrapper');count++;
 assert(!run({status:null,stdout:'',stderr:'timeout',error:Error('timeout')}).pass);console.log('PASS rejects timeout');count++;
 source(2,true);assert(!run(good,{expected:4}).pass);console.log('PASS rejects duplicate changed harness');count++;
 source();fs.writeFileSync(entry,fs.readFileSync(entry,'utf8').replace("{'leaf.js':2}","{'missing.js':2}"));assert(!run(good).pass);console.log('PASS rejects missing changed harness');count++;
 assert(run(good).run.exports.changedHarnesses['missing.js']===2);console.log('PASS preserves wrapper metadata');count++;
}finally{
 const resolved=path.resolve(root);assert(path.dirname(resolved)===path.resolve(os.tmpdir())&&path.basename(resolved).startsWith('l5r-runner-unit-'));
 fs.rmSync(resolved,{recursive:true});
}
console.log(`${count}/8 orchestration unit checks passed`);
