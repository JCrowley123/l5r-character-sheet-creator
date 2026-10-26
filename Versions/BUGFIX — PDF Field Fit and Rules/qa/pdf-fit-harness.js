const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
const results=[];function check(id,got,want){const ok=JSON.stringify(got)===JSON.stringify(want);results.push(ok);console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+JSON.stringify(got)+' expected='+JSON.stringify(want)));}
(async()=>{const b=await chromium.launch(),errors=[];try{const page=await b.newPage();page.on('pageerror',e=>errors.push(String(e)));await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready);
await page.evaluate(()=>{const T=window.__L5R_TEST__;T.CL11.close();T.resetToBaseline();T.clearAllRows();if(!T.PX7)return;window.sample=T.PX7.snapshot();const s=window.sample;s.fields.f_name='Sairyū';s.fields.f_notes='Campaign note preserved.';s.skills=Array.from({length:24},(_,i)=>({name:i===0?'Etiquette':'Skill '+i,rank:1,trait:i===0?'Awareness':i===23?'Perception':'Reflexes',pool:'4k3',emph:'',school:false}));s.tech=[{name:'The Way of the Crane',desc:'[School Technique — Rank 1, Kakita Bushi] Add twice your Iaijutsu Skill to Initiative rolls; while in the Center Stance (and the Round after), gain +1k1 plus your School Rank to attack and Focus rolls.'}];s.schools=[{name:'Kakita Bushi',kind:'bushi'}];window.original=JSON.stringify(s);});
async function f(id,code,want=true){let got;try{got=await page.evaluate(async code=>{const T=window.__L5R_TEST__,L=T.PF7Logic,W=T.PF7Writer,s=window.sample;if(!W?.enabled())return null;const p=L.plan(s);return await eval(code);},code);}catch(e){got={error:e.message};}check(id,got,want);}
await f('PF-ENABLED','W.enabled()');
await f('PF-MISC','p.pages[0].values.MISCELLANEOUS','');
await f('PF-TRAITS','[p.pages[0].values["SKILL_TRAIT.1"],p.pages[0].values["SKILL_TRAIT.2"]]',['Aware','Ref']);
await f('PF-OVERFLOW-TRAIT','p.pages.find(x=>x.template==="skill").values["SKILL_TRAIT.1"]','Perc');
await f('PF-CUSTOM-TRAIT','(()=>{const c=JSON.parse(JSON.stringify(s));c.skills[0].trait="Custom Trait";return L.plan(c).pages[0].values["SKILL_TRAIT.1"];})()','Custom Trait');
await f('PF-MULTIPLIER','(()=>{const c=JSON.parse(JSON.stringify(s));c.fields.f_woundMultiplier=4;return L.plan(c).woundMultiplier;})()',4);
await f('PF-LINE-AREAS','L.lineFields("bushi",[{name:"KATA_TEXT.1"},{name:"KATA_NM.1"}]).every(x=>!x.name.startsWith("KATA_TEXT"))');
await f('PF-UNCHANGED','JSON.stringify(s)===window.original');
await f('PF-GENERATE','(async()=>{const lib=T.PX7Dependencies.pdf(),old=lib.PDFPage.prototype.drawLine;window.ruleCount=0;lib.PDFPage.prototype.drawLine=function(...a){window.ruleCount++;return old.apply(this,a);};try{window.result=await T.PX7Writer.generate(s);}finally{lib.PDFPage.prototype.drawLine=old;}return String.fromCharCode(...window.result.bytes.slice(0,5));})()','%PDF-');
await f('PF-FLAT','(async()=>{const lib=T.PX7Dependencies.pdf(),d=await lib.PDFDocument.load(window.result.bytes);return !d.catalog.has(lib.PDFName.of("AcroForm"))&&d.getPages().every(p=>!p.node.has(lib.PDFName.of("Annots")));})()');
await f('PF-RULES','window.ruleCount>=60');
await f('PF-FRIENDLY','L.label("SKILL_EMPH_MA.4")','Skill 4 emphases and mastery');
await f('PF-UNSUPPORTED','(async()=>{const c=JSON.parse(JSON.stringify(s));c.fields.f_name="\\u{10FFFF}";try{await W.generate(c);return false;}catch(e){return /U\\+10FFFF/.test(e.message);}})()');
if(process.env.PF7_OUTPUT&&await page.evaluate(()=>!!window.result)){fs.mkdirSync(process.env.PF7_OUTPUT,{recursive:true});fs.writeFileSync(path.join(process.env.PF7_OUTPUT,'sample.pdf'),Buffer.from(await page.evaluate(()=>Array.from(window.result.bytes))));}
check('PF-NO-ERRORS',errors,[]);
}finally{await b.close();}const n=results.filter(Boolean).length;console.log(n+'/14 checks passed');process.exitCode=n===14&&results.length===14?0:1;})().catch(e=>{console.error(e);process.exitCode=1;});
