'use strict';
// Book rule oracle: no explosion without training; a Void rank lift restores it.
const {open,reset,roll,check,section,finish}=require('./roll-test-utils');
(async()=>{
  const {browser,page}=await open(process.argv[2]);
  try{
    for(const route of ['table','list','direct'])await section(route,async()=>{
      await reset(page);const r=await roll(page,{route});
      check('R0-'+route+'-DICE',r.dice,[10,10]);
      check('R0-'+route+'-NOTE',r.text.includes('10s do not explode'));
    });
    await section('attack',async()=>{
      await reset(page);const r=await roll(page,{route:'weapon',name:'Katana'});
      check('R0-ATTACK-DICE',r.dice,[10,10]);
    });
    await section('trained',async()=>{
      await reset(page);const r=await roll(page,{rank:1});check('R0-TRAINED-DICE',r.dice,[25,4,3]);
    });
    for(const route of ['table','list','weapon'])await section('void-'+route,async()=>{
      await reset(page);const r=await roll(page,{route,name:route==='weapon'?'Katana':'Hunting',voidLift:true});
      check('R0-VOID-'+route,r.dice,[25,4,3]);
    });
    await section('soul',async()=>{
      await reset(page);await page.evaluate(()=>window.__diceQA.add('Soul of Artistry',false,{type:'skillFamilyPick',revision:1,family:'Craft',value:'Craft'}));
      const r=await roll(page,{name:'Forgery',trait:'Intelligence'});check('R0-SOUL',r.dice,[25,4,3]);
    });
    await section('cancel',async()=>{
      await reset(page);const before=await page.evaluate(()=>window.__L5R_TEST__.getVoidPoints());
      await roll(page,{voidLift:true,cancel:true});check('R0-CANCEL-VOID',await page.evaluate(()=>window.__L5R_TEST__.getVoidPoints()),before);
    });
    for(const kind of ['TRAIT','RING','SPELL','MANUAL'])await section(kind,async()=>{
      await reset(page);const r=await roll(page,{route:'direct',kind});check('R0-OTHER-'+kind,r.dice,[25,3]);
    });
    await section('damage',async()=>{
      await reset(page);const d=await page.evaluate(()=>{const T=window.__L5R_TEST__;window.__diceQA.rng([10,10,5]);return T.rollDicePool(1,1).sorted[0];});
      check('R0-DAMAGE-UNCHANGED',d,{total:25,chain:[10,10,5]});
    });
    finish(page);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
