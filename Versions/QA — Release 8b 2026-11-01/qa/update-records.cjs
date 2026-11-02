'use strict';
// Replaces only Release 8b's marked record blocks; never rewrites CLAUDE.md.
const fs=require('fs'),path=require('path');
const V=path.resolve(__dirname,'../..'),state=JSON.parse(fs.readFileSync(path.join(__dirname,'record-state.json'),'utf8'));
const link='[Release 8b handover](<QA — Release 8b 2026-11-01/HANDOVER.md>)';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function block(text,key,body,anchor){
  const begin='<!-- release8b-'+key+' -->',end='<!-- end-release8b-'+key+' -->';
  const value=begin+'\n'+body+'\n'+end;
  const first=text.indexOf(begin),last=text.indexOf(end);
  if(first>=0){if(last<first)throw Error('Unclosed '+key);return text.slice(0,first)+value+text.slice(last+end.length);}
  const at=text.indexOf(anchor);if(at<0)throw Error('Missing anchor '+anchor);
  return text.slice(0,at+anchor.length)+'\n\n'+value+'\n'+text.slice(at+anchor.length);
}
let md=fs.readFileSync(path.join(V,'BUILD-LEDGER.md'),'utf8');
const parts=[['1','Where things stand',state.status+' '+state.qa],['2','What is left, the estimate and the build order',state.order],['3','What has been built, and what each step cost',state.usage],['4','Parked items, waiting for review',state.parked],['6','The update log, newest first',state.status+' '+state.qa+' '+state.usage]];
for(const [n,title,value] of parts)md=block(md,'part'+n,'**Release 8b, 2 November 2026 (Codex).** '+value+' '+link+'.','## '+n+'. '+title);
md=md.replace(/^- \*\*Next:\*\* Audit delivered;[^\n]+/m,'- **Next:** '+state.order);
fs.writeFileSync(path.join(V,'BUILD-LEDGER.md'),md);
let html=fs.readFileSync(path.join(V,'BUILD-LEDGER.html'),'utf8');
for(const [n,,value] of parts){const id={'1':'now','2':'left','3':'costs','4':'parked','6':'history'}[n];const cls=n==='6'?'s-hist':'s-sum';html=block(html,'part'+n,'<p class="lead"><strong>Release 8b, 2 November 2026 (Codex).</strong> '+esc(value)+' <a href="QA%20%E2%80%94%20Release%208b%202026-11-01/HANDOVER.md">Release 8b handover</a>.</p>','<section class="'+cls+'" id="'+id+'">');}
fs.writeFileSync(path.join(V,'BUILD-LEDGER.html'),html);
const road=path.join(V,'L5R Character Sheet Phased Roadmap reorder.md');
let text=fs.readFileSync(road,'utf8');
text=block(text,'roadmap','**Release 8b, 2 November 2026 (Codex).** '+state.status+' '+state.order+' '+state.qa+' '+link+'.',text.split('\n')[0]);
fs.writeFileSync(road,text);
console.log('Release 8b record blocks updated in ledger parts 1-4/6 (MD/HTML) and roadmap.');
