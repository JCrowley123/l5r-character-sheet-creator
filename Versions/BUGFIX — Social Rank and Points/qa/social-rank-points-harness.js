'use strict';
const path = require('path'), {pathToFileURL} = require('url'), {chromium} = require('playwright');
const results = [], TOTAL = 30;
function check(id, got, want) {
  const pass = JSON.stringify(got) === JSON.stringify(want); results.push({id, pass});
  console.log((pass ? 'PASS ' : 'FAIL ') + id + (pass ? '' : ' actual=' + JSON.stringify(got) + ' expected=' + JSON.stringify(want)));
}
async function main() {
  const browser = await chromium.launch(), errors = [];
  try {
    const page = await browser.newPage({viewport:{width:390,height:844}});
    page.on('pageerror', e => {errors.push(String(e));console.error('PAGE ERROR '+e.stack);});
    await page.goto(pathToFileURL(path.resolve(process.argv[2])).href);
    await page.waitForFunction(() => window.__L5R_TEST__?.CL11?.ready, null, {timeout:60000});
    await page.evaluate(async () => {
      const T = window.__L5R_TEST__; if(T.CL11.isOpen()) T.CL11.close();
      T.MODES12.set('management'); T.resetToBaseline(); await document.fonts.ready;
      window.__L5R_CAROUSEL__?.goToTab?.('Identity');
    });
    async function feature(id, expression, expected) {
      let got;
      try { got = await page.evaluate(source => {
        const T = window.__L5R_TEST__;
        if(!T.RP7?.enabled()) return null;
        const R = T.RP7, L = T.RP7Logic;
        return eval(source);
      }, expression); } catch(e) { got = String(e); }
      check(id, got, expected);
    }
    await feature('RP-DEFAULT', "['honor','glory','status'].map(n => R.read(n))", [{rank:5,points:0},{rank:1,points:0},{rank:1,points:0}]);
    await feature('RP-HONOUR-CARRY', "L.normalize('honor',6,10)", {rank:7,points:0});
    await feature('RP-HONOUR-LOSS', "L.normalize('honor',6,-2)", {rank:5,points:8});
    await feature('RP-PENDING', "L.normalize('glory',6,21)", {rank:6,points:21});
    await feature('RP-RECOGNIZE-19', "L.recognize('glory',{rank:6,points:19})", {rank:7,points:9});
    await feature('RP-RECOGNIZE-21', "L.recognize('status',{rank:6,points:21})", {rank:8,points:1});
    await feature('RP-IMMEDIATE-LOSS', "L.normalize('status',6,-1)", {rank:5,points:9});
    await feature('RP-INVALID', "[L.normalize('honor',6,1.5),L.normalize('honor','',1),L.normalize('status',11,0)]", [null,null,null]);
    await feature('RP-BOUNDS', "[L.normalize('honor',0,-1),L.normalize('honor',10,1),L.recognize('status',{rank:10,points:25})]", [{rank:0,points:0},{rank:10,points:0},{rank:10,points:25}]);
    await feature('RP-MIGRATION-C2', "(() => {const d=L.migrate({fields:{f_honorRank:'5',f_honorPts:'6.5',f_gloryRank:'6',f_gloryPts:'8.9',f_statusRank:'3',f_statusPts:'4.1'}});return [d.fields,d.socialRankMigration.notice]})()", [{f_honorRank:'6',f_honorPts:'5',f_gloryRank:'6',f_gloryPts:'9',f_statusRank:'3',f_statusPts:'1'},['honor','glory','status']]);
    await feature('RP-MONK-MIGRATION', "(() => {const d=L.migrate({fields:{f_schoolApplied:JSON.stringify({monk:{priorGloryRank:'6',priorGloryPts:'6.9',priorStatusRank:'3',priorStatusPts:'4.1'}})}});return JSON.parse(d.fields.f_schoolApplied).monk})()", {priorGloryRank:'6',priorGloryPts:'9',priorStatusRank:'3',priorStatusPts:'1'});
    await feature('RP-SAVE-VERSION', "T.VersionManager.current()", await page.evaluate(()=>window.__L5R_TEST__.WM7?.enabled()?7:6));
    await feature('RP-LOAD-OLD', "(() => {const old=T.collectData();old.schemaVersion=5;Object.assign(old.fields,{f_honorRank:'5',f_honorPts:'6.5',f_gloryRank:'6',f_gloryPts:'8.9'});T.applyData(old);return [R.read('honor'),R.read('glory'),old.fields.f_honorPts]})()", [{rank:6,points:5},{rank:6,points:9},'6.5']);
    await feature('RP-SAVE-ROUNDTRIP', "(() => {R.write('status',6,21);const saved=T.collectData();T.resetToBaseline();T.applyData(saved);return [saved.schemaVersion,R.read('status'),saved.fields.f_statusPts]})()", [await page.evaluate(()=>window.__L5R_TEST__.WM7?.enabled()?7:6),{rank:6,points:21},'21']);
    await feature('RP-SHARED-HONOUR', "(() => {R.write('honor',6,5);return [T.ANC48.honor(),T.AP46.honor(),T.R456.honorRank(),T.SIT4528.value('honor'),T.CHK4531.honorRank()]})()", [6.5,6.5,6,6.5,6]);
    await feature('RP-SHARED-STATUS', "(() => {R.write('status',3,29);R.write('glory',6,19);return [T.D45.state().status,T.CS4514.statusRank(),T.SIT4528.value('status'),T.AP46.glory()]})()", [3,3,3,6]);
    await feature('RP-DARK-PARAGON-QUOTE', "(() => {R.write('honor',6,2);const pay=T.DP4523.payment();return [pay.method,pay.after,T.DP4523.priceText(pay).includes('update together')]})()", ['honor',5.7,true]);
    await feature('RP-PLAY-GATE', "(() => {R.write('glory',6,21);T.MODES12.set('play');const denied=R.recognize('glory');return [denied,R.read('glory'),document.querySelector('[data-rp7=glory] .rp7-recognition').disabled,document.getElementById('f_gloryPts').readOnly]})()", [false,{rank:6,points:21},true,false]);
    await feature('RP-UI-RECOGNITION', "(() => {T.MODES12.set('management');document.querySelector('[data-rp7=glory] .rp7-recognition').click();return R.read('glory')})()", {rank:8,points:1});
    await feature('RP-LABEL-ISOLATED', "(() => {const old=R.labels.recognize;R.labels.recognize='Audience with your lord';R.renderAll();const result=document.querySelector('[data-rp7=glory] .rp7-recognition').textContent;R.labels.recognize=old;R.renderAll();return result})()", 'Audience with your lord');
    await feature('RP-PIPS-KEEP-BANK', "(() => {R.write('status',6,21);document.querySelectorAll('[data-rp7=status] .rp7-pips button')[8].click();return R.read('status')})()", {rank:6,points:29});
    await feature('RP-PIPS-CLEAR', "(() => {document.querySelectorAll('[data-rp7=status] .rp7-pips button')[8].click();return R.read('status')})()", {rank:6,points:20});
    await feature('RP-PIP-A11Y', "(() => {R.write('honor',6,5);return [...document.querySelectorAll('[data-rp7=honor] .rp7-pips button')].map(b => [b.textContent,b.getAttribute('aria-pressed'),!!b.getAttribute('aria-label')])})()", Array.from({length:9},(_,i)=>[String(i+1),String(i<5),true]));
    await feature('RP-INPUT-NORMALIZES', "(() => {const p=document.getElementById('f_honorPts');p.value='-1';p.dispatchEvent(new Event('change',{bubbles:true}));return R.read('honor')})()", {rank:5,points:9});
    await page.setViewportSize({width:320,height:800});
    await page.evaluate(async () => {await document.fonts.ready;await new Promise(requestAnimationFrame);});
    await feature('RP-PHONE-ONE-ROW', "(() => {const compact=!!T.CP7?.enabled(),box=document.querySelector(compact?'[data-cp7=honor]':'[data-rp7=honor]'),pips=[...box.querySelectorAll(compact?'.cp7-pips span':'.rp7-pips button')].map(b=>b.getBoundingClientRect()),rank=box.querySelector(compact?'.cp7-values':'.rp7-rank-row').getBoundingClientRect();return pips.length===9&&pips.every(p=>p.width>0&&p.height>=(compact?13:44)&&(!compact||p.width===p.height)&&Math.abs(p.y-pips[0].y)<1)&&rank.bottom<=pips[0].top&&pips[8].right<=box.getBoundingClientRect().right+1})()", true);
    await feature('RP-RESET', "(() => {T.resetToBaseline();return [R.read('honor'),R.read('glory'),R.read('status')]})()", [{rank:5,points:0},{rank:1,points:0},{rank:1,points:0}]);
    await feature('RP-MISSING-FIELDS', "L.migrate({fields:{f_name:'Untouched'}}).fields", {f_name:'Untouched'});
    await feature('RP-RECALC-REFRESH', "(() => {document.getElementById('f_gloryRank').value='3';document.getElementById('f_gloryPts').value='4';T.recalcAll();return document.querySelector('[data-rp7=glory] .rp7-score').textContent})()", '3.4');
    await feature('RP-NOTICE-ONCE', "(() => {const d=T.collectData();d.schemaVersion=5;Object.assign(d.fields,{f_name:'Migration notice fixture',f_honorRank:'5',f_honorPts:'7.1'});T.applyData(d);const first=document.getElementById('statusMsg').textContent.includes('Older save reconciled:');document.getElementById('statusMsg').textContent='cleared';T.applyData(d);return [first,document.getElementById('statusMsg').textContent.includes('Older save reconciled:'),T.collectData().socialRankMigration===undefined]})()", [true,false,true]);
    check('RP-NO-PAGE-ERRORS', errors, []);
  } finally {await browser.close();}
  const passed=results.filter(r=>r.pass).length;
  console.log(passed+'/'+TOTAL+' checks passed');process.exit(results.length===TOTAL&&passed===TOTAL?0:1);
}
main().catch(e=>{console.error(e);process.exit(1);});
