'use strict';
const {open,reset,roll,check,section,finish}=require('./roll-test-utils');
(async()=>{
 const {browser,page}=await open(process.argv[2]);
 try{
  // Expected members are written independently of the implementation.
  const families={
   'Crab Hands':['Cannon','Chain Weapons','Firearms','Heavy Weapons','Kenjutsu','Knives','Kyujutsu','Ninjutsu','Polearms','Spears','Staves','War Fan'],
   Crafty:['Cannon','Firearms','Ninjutsu','Forgery','Intimidation','Sleight of Hand','Stealth','Temptation'],
   Sage:['Lore','Lore: History','Lore (Theology)'],
   Sensation:['Perform','Perform: Song','Perform (Dance)']
  };
  for(const [adv,names]of Object.entries(families))for(const name of names)await section(adv+'-'+name,async()=>{
   await reset(page,[adv]);const r=await roll(page,{name,route:'list'});
   check('LIFT-'+adv.replaceAll(' ','')+'-'+name,r.dice,[25,4,3]);
   check('PREVIEW-'+adv.replaceAll(' ','')+'-'+name,r.preview.includes(adv)&&/Rank 1/.test(r.preview)&&!/Rank 0/.test(r.preview));
  });
  for(const adv of Object.keys(families))await section('table-'+adv,async()=>{
   await reset(page,[adv]);const name=families[adv][1];
   const r=await roll(page,{name});check('TABLE-'+adv,r.dice,[25,4,3]);
   check('BOUGHT-'+adv,await page.evaluate(()=>[...document.querySelectorAll('#skillsBody .sk-rank')].map(e=>e.value)),['0']);
  });
  for(const [name,advs] of [['Ninjutsu',['Crab Hands','Crafty']],['Forgery',['Crafty','Soul of Artistry']],['Perform: Song',['Sensation','Sensation']]])await section('overlap-'+name,async()=>{
   await reset(page,advs.filter(a=>a!=='Soul of Artistry'));
   if(advs.includes('Soul of Artistry'))await page.evaluate(()=>window.__diceQA.add('Soul of Artistry',false,{type:'skillFamilyPick',revision:1,family:'Craft',value:'Craft'}));
   check('ONCE-'+name,(await roll(page,{name,route:'list'})).dice,[25,4,3]);
  });
  for(const [adv,weapon]of [['Crab Hands','Katana'],['Crafty','Shuriken']])await section('weapon-'+adv,async()=>{
   await reset(page,[adv]);const r=await roll(page,{route:'weapon',name:weapon});check('WEAPON-'+adv,r.dice,[25,4,3]);
   check('WEAPON-TITLE-'+adv,!r.title.includes('Unskilled')&&r.title.includes('Rank 1'));
  });
  for(const name of ['Crafty','Lorekeeper','Performance','Artisan: Lore'])await section('false-'+name,async()=>{
   await reset(page,Object.keys(families));check('NO-FALSE-MATCH-'+name,(await roll(page,{name,route:'list'})).dice,[10,10]);
  });
  await section('trained',async()=>{await reset(page,['Sensation']);check('LIFT-TRAINED-UNCHANGED',(await roll(page,{name:'Perform',rank:2})).dice,[25,4,3,2]);});
  const social=['Acting','Courtier','Etiquette','Perform','Sincerity','Intimidation','Temptation','Perform: Song','Perform (Dance)'];
  for(const name of social)await section('gaijin-'+name,async()=>{
   await reset(page,[],['Gaijin Name']);const r=await roll(page,{name,rank:1,route:'direct'});
   check('GN-'+name,r.dice,[20,5,3]);check('GN-NOTE-'+name,/Gaijin Name/.test(r.preview)&&/once/.test(r.preview)&&/once/.test(r.text));
  });
  await section('both',async()=>{
   await reset(page,['Sensation'],['Gaijin Name']);const r=await roll(page,{name:'Perform: Song',route:'list'});check('GN-LIFT',r.dice,[20,5,3]);
  });
  await section('untrained',async()=>{
   await reset(page,[],['Gaijin Name']);check('GN-NO-FORCED-EXPLOSION',(await roll(page,{name:'Courtier',route:'list'})).dice,[10,10]);
   check('GN-VOID',(await roll(page,{name:'Courtier',route:'list',voidLift:true})).dice,[20,5,3]);
  });
  for(const [name,kind]of [['Investigation','SKILL'],['Performative','SKILL'],['Courtier','TRAIT'],['Courtier','MANUAL']])await section('gn-scope-'+name+kind,async()=>{
   await reset(page,[],['Gaijin Name']);check('GN-EXCLUDED-'+name+kind,(await roll(page,{name,kind,rank:1,route:'direct'})).dice,[25,4,3]);
  });
  await section('rerolls',async()=>{
   await reset(page,[],['Gaijin Name']);await roll(page,{name:'Courtier',rank:1,route:'direct'});
   const r=await page.evaluate(()=>{
    const T=window.__L5R_TEST__,out={};const first=window.__lastDice;
    window.__diceQA.rng([10,10,5,3,4,2]);out.luck=T.advConfigLuckRerollResult(first);
    window.__diceQA.rng([10,10,5,3,4,2]);out.twice=T.advConfigLuckRerollResult(out.luck);
    window.__diceQA.rng([10,10,5,3,4,2]);out.ancestor=T.ANC48.rerollPlus(first,1,1);
    return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,{cap:v.maxExplosions,dice:v.sorted.map(d=>d.total),flat:v.bonus}]));
   });
   check('GN-LUCK',r.luck,{cap:1,dice:[20,5,3],flat:0});check('GN-REPEATED-REROLL',r.twice,r.luck);
   check('GN-ANCESTOR',r.ancestor,{cap:1,dice:[20,5,4,3],flat:0});
   const next=await roll(page,{name:'Hunting',rank:1,route:'direct'});check('GN-NO-LEAK',next.dice,[25,4,3]);
  });
  await section('emphasis',async()=>{
   await reset(page,[],['Gaijin Name']);await roll(page,{name:'Courtier',rank:1,route:'direct',rng:[1,3,4]});
   const value=await page.evaluate(()=>{
    const T=window.__L5R_TEST__;const bar=T.attachEmphasisReroll({hasEmphasis:true,owned:['Gossip'],emphasisName:'Gossip',keepDice:2,explodeOn:null});
    const api=bar.__emphasisApi;api.enterMode();api.eligibleDice()[0].classList.add('emph-selected');window.__diceQA.rng([10,10,5]);api.doConfirm();return window.__diceQA.result().dice;
   });check('GN-EMPHASIS',value,[4,3,20]);
  });
  await section('persistence',async()=>{
   await reset(page,['Sensation'],['Gaijin Name']);await page.evaluate(()=>{const T=window.__L5R_TEST__;const save=JSON.parse(JSON.stringify(T.collectData()));T.resetToBaseline();T.applyData(save);T.recalcAll();});
   check('SAVE-LOAD',(await roll(page,{name:'Perform: Song',route:'list'})).dice,[20,5,3]);
   await page.evaluate(()=>{document.getElementById('disadvList').innerHTML='';window.__L5R_TEST__.recalcAll();});
   check('REMOVE-GAIJIN',(await roll(page,{name:'Perform: Song',route:'list'})).dice,[25,4,3]);
  });
  await section('wrong-list',async()=>{
   await reset(page,[],['Sensation']);check('WRONG-LIST-LIFT',(await roll(page,{name:'Perform',route:'list'})).dice,[10,10]);
   await reset(page,['Gaijin Name']);check('WRONG-LIST-GAIJIN',(await roll(page,{name:'Courtier',rank:1,route:'direct'})).dice,[25,4,3]);
  });
  await section('flat-and-ten-dice',async()=>{
   await reset(page,[],['Gaijin Name']);await roll(page,{name:'Courtier',rank:1,route:'direct'});
   const r=await page.evaluate(()=>{
    const T=window.__L5R_TEST__,first=window.__lastDice;
    window.__diceQA.rng([10,10,5]);const input=Object.assign({},first,{rawNumDice:12,rawKeepDice:10,bonus:-8});
    const next=T.advConfigLuckRerollResult(input);
    return {max:Math.max(...next.sorted.map(d=>d.total)),n:next.numDice,k:next.keepDice,bonus:next.bonus,total:next.total};
   });check('GN-TEN-DICE-AND-FLAT',r,{max:20,n:10,k:10,bonus:-8,total:117});
  });
  await section('unchanged-character',async()=>{
   await reset(page,['Sensation'],['Gaijin Name']);
   const before=await page.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData()));
   await roll(page,{name:'Perform: Song',route:'list'});
   check('NO-CHARACTER-MUTATION',await page.evaluate(()=>JSON.stringify(window.__L5R_TEST__.collectData())),before);
  });
  await section('cancel-gaijin',async()=>{
   await reset(page,[],['Gaijin Name']);await roll(page,{name:'Courtier',route:'list',voidLift:true,cancel:true});
   check('CANCEL-NO-GAIJIN-LEAK',(await roll(page,{name:'Hunting',rank:1,route:'direct'})).dice,[25,4,3]);
  });
  finish(page);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
