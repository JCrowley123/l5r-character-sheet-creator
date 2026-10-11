'use strict';
const {chromium}=require('playwright'),path=require('path'),{pathToFileURL}=require('url');
let passed=0,total=0;
function check(id,actual,expected=true){total++;const ok=JSON.stringify(actual)===JSON.stringify(expected);passed+=ok;console.log(`${ok?'PASS':'FAIL'} ${id}${ok?'':` actual=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`}`);}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  page.setDefaultTimeout(5000);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
  await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11.ready);
  await page.evaluate(()=>{
   const base=window.__L5R_TEST__.collectData();
   const chars=[['pdf-alpha','Akemi','Crane','Kakita'],['pdf-beta','Benji','Crab','Hida']];
   for(const [id,name,clan,family] of chars){const data=JSON.parse(JSON.stringify(base));Object.assign(data.fields,{f_name:name,f_clan:clan,f_family:family});localStorage.setItem('l5r-sheet:local:l5r-char:'+id,JSON.stringify(data));}
   localStorage.setItem('l5r-sheet:local:l5r-char-index',JSON.stringify(chars.map(([id,name,clan],i)=>({id,name,clan,updatedAt:i+1}))));
  });
  await page.reload();
  await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11.ready&&document.querySelectorAll('.cl11-row').length===2);
  await page.evaluate(()=>{window.pdfCalls=[];window.print=()=>window.pdfCalls.push({name:document.getElementById('f_name').value,clan:document.getElementById('f_clan').value,open:window.__L5R_TEST__.CL11.isOpen()});});
  check('PDF-ENABLED',await page.evaluate(()=>!!window.__L5R_TEST__.PDF111&&window.__L5R_TEST__.PDF111.enabled()));
  check('PDF-MENU-COUNT',await page.locator('.pdf111-export').count(),2);
  check('PDF-MENU-ORDER',await page.evaluate(()=>Array.from(document.querySelectorAll('.cl11-menu')).every(m=>Array.from(m.children).map(x=>x.textContent).join('|')==='Export JSON|Export to PDF|Save As a copy|Delete')));
  await page.evaluate(async()=>{await window.__L5R_TEST__.CL11.render();await window.__L5R_TEST__.CL11.render();});
  check('PDF-NO-DUPLICATES',await page.locator('.pdf111-export').count(),2);
  if(await page.locator('.pdf111-export').count()){
   await page.locator('[data-id="pdf-alpha"] .cl11-more').click();
   await page.locator('[data-id="pdf-alpha"] .pdf111-export').click();
   await page.waitForFunction(()=>window.pdfCalls.length===1);
   check('PDF-SELECTED-CHARACTER',await page.evaluate(()=>window.pdfCalls[0]),{name:'Akemi',clan:'Crane',open:false});
   check('PDF-LEAVES-SELECTED-OPEN',await page.evaluate(()=>document.getElementById('charSelect').value),'pdf-alpha');
   await page.evaluate(()=>{const n=document.getElementById('f_name');n.value='Akemi pending';n.dispatchEvent(new Event('input',{bubbles:true}));});
   const snapshot=await page.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));
   await page.evaluate(()=>window.__L5R_TEST__.PDF111.exportCharacter('pdf-alpha'));
   check('PDF-CURRENT-PENDING-EDIT',await page.evaluate(()=>window.pdfCalls.at(-1).name),'Akemi pending');
   check('PDF-PRINT-DOES-NOT-REWRITE',await page.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData())),snapshot);
   await page.evaluate(()=>window.__L5R_TEST__.PDF111.exportCharacter('pdf-beta'));
   check('PDF-OTHER-CHARACTER',await page.evaluate(()=>window.pdfCalls.at(-1).name),'Benji');
   check('PDF-PREVIOUS-EDITS-SAVED',await page.evaluate(()=>JSON.parse(localStorage.getItem('l5r-sheet:local:l5r-char:pdf-alpha')).fields.f_name),'Akemi pending');
   const count=await page.evaluate(()=>window.pdfCalls.length);
   check('PDF-MISSING-LOAD-REFUSED',await page.evaluate(()=>window.__L5R_TEST__.PDF111.exportCharacter('missing')),false);
   check('PDF-MISSING-LOAD-NO-PRINT',await page.evaluate(()=>window.pdfCalls.length),count);
   await page.evaluate(()=>{window.pdfBeforePrint=window.print;window.print=()=>{throw Error('fixture print unavailable');};});
   check('PDF-PRINT-ERROR-HANDLED',await page.evaluate(()=>Promise.race([window.__L5R_TEST__.PDF111.exportCharacter('pdf-beta'),new Promise(r=>setTimeout(()=>r('blocked'),300))])),false);
   check('PDF-BUSY-RESET-AFTER-ERROR',await page.evaluate(()=>window.__L5R_TEST__.PDF111.busy),false);
   await page.evaluate(()=>{window.print=window.pdfBeforePrint;window.pdfOriginalOpen=window.__L5R_TEST__.CL11.openCharacter;window.__L5R_TEST__.CL11.openCharacter=async function(id){await new Promise(r=>{(window.pdfReleases||(window.pdfReleases=[])).push(r);});return window.pdfOriginalOpen.call(this,id);};window.pdfPending=window.__L5R_TEST__.PDF111.exportCharacter('pdf-beta');});
   check('PDF-CONCURRENT-REFUSED',await page.evaluate(()=>Promise.race([window.__L5R_TEST__.PDF111.exportCharacter('pdf-beta'),new Promise(r=>setTimeout(()=>r('blocked'),300))])),false);
   await page.evaluate(async()=>{window.pdfReleases.forEach(r=>r());await window.pdfPending;window.__L5R_TEST__.CL11.openCharacter=window.pdfOriginalOpen;});
   check('PDF-ONE-PRINT-PER-REQUEST',await page.evaluate(()=>window.pdfCalls.length),count+1);
   // A real unsaved sheet uses the existing discard prompt, not a stubbed success flag.
   await page.evaluate(()=>document.getElementById('btnNew').click());
   const prompt=await page.locator('#appConfirmOverlay').evaluate(el=>getComputedStyle(el).display==='flex');
   if(prompt)await page.locator('#appConfirmOk').click();
   await page.waitForFunction(()=>document.getElementById('charSelect').value==='');
   await page.evaluate(()=>{document.getElementById('f_name').value='Unsaved work';window.pdfPending=window.__L5R_TEST__.PDF111.exportCharacter('pdf-alpha');});
   await page.waitForFunction(()=>document.getElementById('appConfirmOverlay').style.display==='flex');
   await page.locator('#appConfirmCancel').click();
   check('PDF-DISCARD-CANCELLED',await page.evaluate(()=>window.pdfPending),false);
   check('PDF-DISCARD-NO-PRINT',await page.evaluate(()=>window.pdfCalls.length),count+1);
   check('PDF-UNSAVED-PRESERVED',await page.inputValue('#f_name'),'Unsaved work');
  }
  // Structural print geometry is independent of which fallback font this host can load.
  const screen=await page.evaluate(()=>({picker:getComputedStyle(document.querySelector('#cfsSection > .grid')).display,info:getComputedStyle(document.getElementById('cfs_schoolInfo')).display}));
  await page.setViewportSize({width:1000,height:1000});
  await page.emulateMedia({media:'print'});
  check('PDF-PICKERS-HIDDEN',await page.evaluate(()=>getComputedStyle(document.querySelector('#cfsSection > .grid')).display),'none');
  check('PDF-UNAPPLIED-SCHOOL-INFO-HIDDEN',await page.evaluate(()=>getComputedStyle(document.getElementById('cfs_schoolInfo')).display),'none');
  const geometry=await page.evaluate(()=>Array.from(document.querySelectorAll('.car-page[data-tab-label="Identity"] .grid > .field')).map(f=>{const label=f.querySelector('label'),input=f.querySelector('input');if(!label||!input)return true;return label.getBoundingClientRect().bottom<=input.getBoundingClientRect().top+0.5;}));
  check('PDF-IDENTITY-LABELS-NO-OVERLAP',geometry.length>=12&&geometry.every(Boolean));
  check('PDF-IDENTITY-TWO-COLUMNS',await page.evaluate(()=>getComputedStyle(document.querySelector('.car-page[data-tab-label="Identity"] .grid')).gridTemplateColumns.split(' ').length),2);
  await page.emulateMedia({media:'screen'});
  check('PDF-SCREEN-PICKERS-UNCHANGED',await page.evaluate(()=>({picker:getComputedStyle(document.querySelector('#cfsSection > .grid')).display,info:getComputedStyle(document.getElementById('cfs_schoolInfo')).display})),screen);
  check('PDF-EXISTING-PRINT-BUTTON',await page.locator('#btnPrint').count(),1);
  check('PDF-NO-PAGE-ERRORS',errors,[]);
 }catch(error){check('PDF-EXCEPTION',String(error.stack),'no exception');}finally{await browser.close();}
 console.log(`${passed}/${total} checks passed`);process.exitCode=passed===total&&total>0?0:1;
})();
