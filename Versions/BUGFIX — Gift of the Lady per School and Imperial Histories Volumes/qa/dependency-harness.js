'use strict';
// BUGFIX GIFTIH: the fix off, its Search fragment absent, or with Search, 14.3b, Technique Name Clashes or 4.7.2 off.
// Only the Gift of the Lady records, Doji Courtier's Rank 5 text and the two Schools' sources change.
const fs=require('fs'),{chromium}=require('playwright');
const input=fs.readFileSync(process.argv[2],'utf8'),results=[];
function check(id,actual,want){const pass=JSON.stringify(actual)===JSON.stringify(want);results.push({id,pass});console.log((pass?'PASS ':'FAIL ')+id+(pass?'':' actual='+JSON.stringify(actual).slice(0,400)));}
const CORE='Core Rulebook p.111',IH1='Imperial Histories 1 p.215',DOJI='Doji Courtier, Rank 5',MONK='The Hitomi Kikage Zumi Order [Monk], Rank 1';
const HIRUMA_NOW='Imperial Histories 1 p.147 (no outfit specified)',HIRUMA_WAS='Imperial Histories p.147 (no outfit specified)';
const YOTSU_NOW='Imperial Histories 1 p.276; Tiger Clan in the Heroes of Rokugan alternate timeline';
const YOTSU_WAS='Imperial Histories pp.276–277; Tiger Clan in the Heroes of Rokugan alternate timeline';
const NOW={gift:[[DOJI,CORE,'own'],[MONK,IH1,'monk']],sources:[HIRUMA_NOW,YOTSU_NOW]};
async function main(){
 const browser=await chromium.launch();let control;
 try{
  for(const v of [
   {id:'CONTROL',want:NOW},
   {id:'OFF',off:['GIFT_IH_FIX_ENABLED'],want:{gift:[[DOJI+' and 1 more',CORE,'monk']],sources:[HIRUMA_WAS,YOTSU_WAS]}},
   // The volumes block and the switch live in 4.7.2's fragment; without this fragment Search merges again.
   {id:'FRAGMENT-ABSENT',absent:true,want:{gift:[[DOJI+' and 1 more',CORE,'monk']],sources:[HIRUMA_NOW,YOTSU_NOW]}},
   {id:'SEARCH-OFF',off:['SEARCH_ENABLED'],want:{gift:[],sources:[HIRUMA_NOW,YOTSU_NOW]}},
   // Without 14.3b the monk's record has no page; Doji's page comes from its own text.
   {id:'REF1432-OFF',off:['SEARCH_REFERENCES_1432_ENABLED'],want:{gift:[[DOJI,CORE,'own'],[MONK,'','monk']],sources:[HIRUMA_NOW,YOTSU_NOW]}},
   // Without Technique Name Clashes the sheet itself shows the monk's text for both; the two pages still differ.
   {id:'TECHNAMES-OFF',off:['TECHNAMES_ENABLED'],want:{gift:[[DOJI,CORE,'monk'],[MONK,IH1,'monk']],sources:[HIRUMA_NOW,YOTSU_NOW]}},
   {id:'BASIC-SCHOOLS-OFF',off:['MISSING_BASIC_SCHOOLS_ENABLED'],want:{gift:[[DOJI,CORE,'own'],[MONK,IH1,'monk']],sources:[null,null]}}]){
    let html=input;
    for(const off of v.off||[]){const term='const '+off+' = true;';if(html.split(term).length!==2)throw Error('Non-unique switch '+off);html=html.replace(term,'const '+off+' = false;');}
    if(v.absent){const start='  // ============ BUGFIX GIFTIH — THE GIFT OF THE LADY PER SCHOOL: SEARCH ============',end='  // ============ END GIFTIH ============';
      const a=html.indexOf(start),b=html.indexOf(end);if(a<0||b<a)throw Error('Missing own fragment');html=html.slice(0,a)+html.slice(b+end.length);}
    const context=await browser.newContext(),page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.route('**/*',r=>r.request().url().startsWith('http://giftih.test/')?r.fulfill({contentType:'text/html',body:html}):r.abort());
    await page.goto('http://giftih.test/');await page.waitForFunction(()=>window.__L5R_TEST__&&window.__L5R_TEST__.CL11.ready,null,{timeout:60000});
    const got=await page.evaluate(()=>{
      const T=window.__L5R_TEST__,S=T.SEARCH14,G='The Gift of the Lady',MONK_TEXT='Gain 1 Tattoo;';
      const recs=S.enabled()?S.query({limit:100000}).results.map(r=>S.get(r.id)):[];
      const gift=recs.filter(r=>r.category==='techniques'&&r.name===G).map(r=>[r.tags[0],r.source,r.text[0].indexOf(MONK_TEXT)===0?'monk':'own']);
      const lib=Object.values(T.SCHOOL_LIBRARY).flat().concat(Object.values(T.MINOR_CLAN_SCHOOL_LIBRARY).flat());
      const src=n=>{const s=lib.find(x=>x.name===n);return s?s.source:null;};
      const IH=['Hiruma Scout [Bushi]','Yotsu Bushi School (Heroes of Rokugan) [Bushi]'];
      const ihTech=new Set(T.MISSING_BASIC_SCHOOL_DATA.flatMap(s=>s.tech));
      const changed=new Set(['Doji Courtier'].concat(IH));
      return {want:{gift,sources:IH.map(src)},
        // Everything else Search holds, and every other Technique's text.
        records:recs.filter(r=>!(r.category==='techniques'&&r.name===G)&&!(r.category==='schools'&&changed.has(r.name))),
        texts:Object.keys(T.TECH_DESCRIPTIONS).filter(n=>!ihTech.has(n)).sort().map(n=>[n,T.TECH_DESCRIPTIONS[n]])};
    });
    check('GIH-DEP-'+v.id+'-STATE',got.want,v.want);
    check('GIH-DEP-'+v.id+'-ERRORS',errors,[]);
    if(v.id==='CONTROL')control=got;
    if(v.id==='OFF'){
      check('GIH-OTHER-RECORDS-UNCHANGED',got.records,control.records);
      check('GIH-OTHER-TECHNIQUE-TEXT-UNCHANGED',got.texts,control.texts);
    }
    await context.close();
  }
 }finally{await browser.close();}
 const pass=results.filter(r=>r.pass).length;console.log(pass+'/'+results.length+' checks passed');process.exitCode=pass===results.length&&results.length===16?0:1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
