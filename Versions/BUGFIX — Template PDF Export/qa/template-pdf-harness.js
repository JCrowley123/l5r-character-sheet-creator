const {chromium}=require('playwright'),{pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
const results=[];function check(id,got,want=true){const ok=JSON.stringify(got)===JSON.stringify(want);results.push(ok);console.log((ok?'PASS ':'FAIL ')+id+(ok?'':' actual='+JSON.stringify(got)+' expected='+JSON.stringify(want)));}
(async()=>{const browser=await chromium.launch(),errors=[];try{const page=await browser.newPage();page.on('pageerror',e=>errors.push(String(e)));await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);await page.waitForFunction(()=>window.__L5R_TEST__?.CL11?.ready);
await page.evaluate(()=>{const T=window.__L5R_TEST__;T.CL11.close();T.resetToBaseline();T.clearAllRows();T.MODES12.set('management');document.getElementById('f_name').value='Sairyū';document.getElementById('f_notes').value='Last line of the background';T.recalcAll();if(T.PX7?.enabled()){window.pxSnapshot=T.PX7.snapshot();Object.assign(window.pxSnapshot.fields,{f_xpSpent:'112',f_xpTotal:'140',f_family:'Kakita'});window.pxSnapshot.social.glory={rank:6,points:21};window.pxSnapshot.skills=Array.from({length:75},(_,i)=>({name:'Skill '+i,rank:2,trait:'Agility',pool:'5k3',emph:'Focus',school:i===0}));window.pxSnapshot.weapons=Array.from({length:13},(_,i)=>({name:'Weapon '+i,roll:'6k3',dmg:'5k2',notes:'Weapon notes'}));window.pxSnapshot.tech=[{name:'Technique',desc:'[School Technique — Rank 1, Kakita Bushi School] Test description.'},{name:'Invocation',desc:'A prayer.',spellElement:'Air',spellMastery:'1',spellKeywords:''},{name:'Custom ability',desc:'UNIQUE CUSTOM TEXT'}];window.pxSnapshot.schools=[{name:'Kakita Bushi School',kind:'bushi'}];window.pxPlan=T.PX7Logic.plan(window.pxSnapshot);}});
async function f(id,code,want=true){check(id,await page.evaluate(async code=>{const T=window.__L5R_TEST__,A=T.PX7,L=T.PX7Logic,W=T.PX7Writer;if(!A?.enabled())return null;const s=window.pxSnapshot,p=window.pxPlan;return await eval(code);},code),want);}
await f('PX-ENABLED','A.enabled()');
await f('PX-NAME','p.pages[0].values.NAME','Sairyū');
await f('PX-XP','p.pages[0].values.EXP','112 / 140');
await f('PX-APPROVED-RANK','p.pages[0].values.GLORY','6');
await f('PX-PENDING-POINTS','p.extra.some(x=>x.label.includes("awaiting recognition")&&x.text.includes("21 points"))');
await f('PX-SKILL-PAGES','p.pages.filter(x=>x.template==="skill").length',2);
await f('PX-WEAPON-PAGES','p.pages.filter(x=>x.template==="weapons").length',2);
await f('PX-ABILITY-PAGES','["bushi","spells"].every(k=>p.pages.some(x=>x.template===k))');
await f('PX-CUSTOM-TEXT','p.extra.some(x=>x.text==="UNIQUE CUSTOM TEXT")');
await f('PX-NOTES','p.extra.some(x=>x.text==="Last line of the background")');
await f('PX-FILENAME','L.filename("A/B: Sairyū")','A_B_ Sairyū.pdf');
await f('PX-SNAPSHOT-INDEPENDENT','(()=>{const a=A.snapshot();document.getElementById("f_name").value="Later edit";return a.fields.f_name==="Sairyū";})()');
await f('PX-WOUNDS','s.wounds.length',8);
await f('PX-SKILL-POOL','p.pages[0].values["SKILL_ROLL.1"]','5k3');
await f('PX-GENERATE','(async()=>{window.pxResult=await W.generate(s);return String.fromCharCode(...window.pxResult.bytes.slice(0,5));})()','%PDF-');
await f('PX-PAGE-COUNT','window.pxResult.pages>=9');
await f('PX-FLAT','(async()=>{const d=await T.PX7Dependencies.pdf().PDFDocument.load(window.pxResult.bytes);return !d.catalog.has(T.PX7Dependencies.pdf().PDFName.of("AcroForm"))&&d.getPages().every(p=>!p.node.has(T.PX7Dependencies.pdf().PDFName.of("Annots")));})()');
await f('PX-LONG-TEXT','(async()=>{const copy=JSON.parse(JSON.stringify(s));copy.fields.f_name="Long name ".repeat(40);copy.fields.f_notes="OVERFLOW ".repeat(1800)+"FINAL SENTINEL";const result=await W.generate(copy);window.pxLong=result;return result.pages>window.pxResult.pages;})()');
await f('PX-UNSUPPORTED-REFUSED','(async()=>{const copy=JSON.parse(JSON.stringify(s));copy.fields.f_name="\\u{10FFFF}";try{await W.generate(copy);return false;}catch(e){return /U\\+10FFFF/.test(e.message);}})()');
await f('PX-NO-EDIT-REWRITE','document.getElementById("f_name").value','Later edit');
await f('PX-NATIVE-PRINT','(()=>{let calls=0;const old=window.print;window.print=()=>calls++;document.getElementById("btnPrint").click();window.print=old;return calls;})()',1);
if(process.env.PX7_OUTPUT&&await page.evaluate(()=>!!window.pxResult)){fs.mkdirSync(process.env.PX7_OUTPUT,{recursive:true});for(const [name,key]of[['sample','pxResult'],['overflow','pxLong']]){const data=await page.evaluate(key=>Array.from(window[key].bytes),key);fs.writeFileSync(path.join(process.env.PX7_OUTPUT,name+'.pdf'),Buffer.from(data));}}
check('PX-NO-ERRORS',errors,[]);
}finally{await browser.close();}const passed=results.filter(Boolean).length;console.log(passed+'/'+results.length+' checks passed');process.exitCode=passed===22&&results.length===22?0:1;})().catch(e=>{console.error(e);process.exitCode=1;});
