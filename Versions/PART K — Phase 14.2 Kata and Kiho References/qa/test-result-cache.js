'use strict';
const assert = require('assert');
const {reusableResult} = require('./flat-suite-runner');
const invocation = {command:'node',args:['harness.js','<sheet-bytes>'],cwd:'fixture',timeout:60000};
const record = () => ({fingerprint:'same-frozen-inputs',invocation,
  result:{status:0,stdout:'PASS fixture\n2/2 checks passed\n',stderr:''}});
let count=0;
function check(name, test) { test(); count++; console.log('PASS '+name); }
check('same frozen inputs and actual successful output reusable',()=>assert(reusableResult(record(),'same-frozen-inputs',invocation)));
check('changed build/tests/runtime fingerprint refused',()=>assert(!reusableResult(record(),'different-inputs',invocation)));
check('changed invocation refused',()=>assert(!reusableResult(record(),'same-frozen-inputs',{...invocation,timeout:1})));
for (const [name, result] of [
  ['nonzero exit',{status:1}], ['spawn error',{error:'timeout'}],
  ['incomplete checks',{stdout:'1/2 checks passed\n'}], ['zero checks',{stdout:'0/0 checks passed\n'}],
  ['missing summary',{stdout:'PASS fixture\n'}], ['failure despite summary',{stdout:'FAIL fixture\n2/2 checks passed\n'}]
]) check(name+' refused',()=>{const r=record();Object.assign(r.result,result);assert(!reusableResult(r,'same-frozen-inputs',invocation));});
check('missing cache record refused',()=>assert(!reusableResult(null,'same-frozen-inputs',invocation)));
check('missing result refused',()=>assert(!reusableResult({},'same-frozen-inputs',invocation)));
console.log(count+'/'+count+' cache-integrity checks passed');
