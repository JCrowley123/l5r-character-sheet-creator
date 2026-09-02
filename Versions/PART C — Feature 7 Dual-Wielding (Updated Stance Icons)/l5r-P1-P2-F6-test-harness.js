/* =============================================================================
 * L5R 4e — COMBINED HARNESS: Feature 6 (Ammo) + F4 + F3 + F2 + F1 + P1/P2 + F0 + Part B
 * =============================================================================
 *   fetch('/l5r-P1-P2-F6-test-harness.js').then(r=>r.text()).then(s=>(0,eval)(s))
 * DESTRUCTIVE: clears Skills/Weapons/Equipment, resets stance, rounds, wounds, Void and ammo.
 * ============================================================================= */
(async function runF6Harness(){
  'use strict';
  const T = window.__L5R_TEST__;
  if(!T){ console.error('__L5R_TEST__ seam not found.'); return {total:1,passed:0,failed:1,results:[]}; }

  const results=[];
  const rec=(s,id,n,p,d)=>results.push({section:s,id,name:n,pass:!!p,detail:d||''});
  const eq=(s,id,n,a,e)=>{const x=JSON.stringify(a),y=JSON.stringify(e);rec(s,id,n,x===y,x===y?'':'got '+x+' want '+y);};
  const ok=(s,id,n,v)=>rec(s,id,n,!!v,v?'':'expected truthy');
  const no=(s,id,n,v)=>rec(s,id,n,!v,v?'expected falsy, got '+JSON.stringify(v):'');
  const tick=()=>new Promise(r=>setTimeout(r,0));

  const sB=()=>document.getElementById('skillsBody');
  const wB=()=>document.getElementById('weaponsBody');
  const eB=()=>document.getElementById('equipBody');
  const setAllTraits=v=>['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower']
    .forEach(k=>document.getElementById('trait_'+k).value=v);
  const addSkill=(n,r,e)=>sB().appendChild(T.makeSkillRow({name:n,trait:(T.findSkill(n)||{}).trait||'',rank:r,emph:e||''}));
  const addWeapon=n=>{const L=T.findWeapon(n);
    return wB().appendChild(T.makeWeaponRow({key:L.name,name:L.name,skill:L.skill,size:L.size,
      keywords:'',notes:'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));};
  const addItem=(name,qty)=>eB().appendChild(T.makeEquipRow({name:name,qty:qty,notes:''}));
  const modBar=()=>document.getElementById('rollModifierBar');
  const barText=()=>modBar()?modBar().textContent:'';
  const notation=()=>document.getElementById('rollModalNotation').textContent;
  const closeRoll=()=>{document.getElementById('rollModalOverlay').style.display='none';
                       document.getElementById('rollModalBody').innerHTML='';};
  const rollOpen=()=>document.getElementById('rollModalOverlay').style.display==='flex';
  const ammoOpen=()=>document.getElementById('arrowPickModalOverlay').style.display==='flex';
  const rangeOpen=()=>document.getElementById('rangePickModalOverlay').style.display==='flex';
  const optBtn=name=>document.getElementById('arrowOpt_'+T.findArrow(name).key);
  const qty=n=>T.getArrowQuantity(n);
  const eqRows=()=>Array.from(eB().querySelectorAll('tr'));

  // Every arrow row and every trace of ammo state, gone. Called by reset() AND before the
  // regression suites: a leftover arrow row would switch ammo tracking on for the Yumi that
  // Features 1-4 fire through the range prompt, and their harnesses know nothing about the
  // ammunition popup — so leaking one row would hang three suites. (Same lesson Feature 4
  // learned with clearVoidSkirmishEffects.)
  const clearAmmo=()=>{eB().innerHTML='';T.clearLastArrowUsed();
    wB().querySelectorAll('.wp-arrow-type').forEach(el=>el.value='');};
  const reset=()=>{sB().innerHTML='';wB().innerHTML='';clearAmmo();setAllTraits(3);
    T.resetCombatRound();T.clearFullDefenseBonus();T.setCurrentStance('Attack',{silent:true});
    T.clearVoidPending();T.clearVoidSkirmishEffects();T.setCombatActive(false);
    document.getElementById('f_woundsTaken').value=0;
    document.getElementById('ring_void').value=5;document.getElementById('void_current').value=5;
    T.recalcAll();closeRoll();};

  // Starts an attack and clears the range prompt, leaving the ammunition popup on screen (if the
  // build decided to show one). NOT async on purpose: an async function would await the returned
  // promise instead of handing it back, and the whole point is to inspect the popup mid-flight.
  const beginAttack=row=>{
    const p=T.rollWeaponAttack(row);
    if(rangeOpen()) document.getElementById('rangeOptWithin').click();
    return p;
  };
  // Full attack: range 'within', then either pick `arrowName` or (null) cancel the ammo popup.
  const attackWith=async(row,arrowName)=>{
    const p=beginAttack(row);
    await tick();
    if(ammoOpen()){
      if(arrowName===null) document.getElementById('arrowPickClose').click();
      else { const b=optBtn(arrowName); if(b && !b.disabled) b.click();
             else document.getElementById('arrowPickClose').click(); }
    }
    await p;
  };
  reset();

  // =====================================================================
  // F6-A — arrow library integrity
  // =====================================================================
  eq('F6-A','A1','All five RAW arrow types present, in library order',
     T.ARROW_LIBRARY.map(a=>a.name),
     ['Willow Leaf','Armor Piercing','Flesh Cutter','Humming Bulb','Rope Cutter']);
  eq('F6-A','A2','Every printed DR matches the rulebook table',
     T.ARROW_LIBRARY.map(a=>a.name+' '+a.damage.roll+'k'+a.damage.keep),
     ['Willow Leaf 2k2','Armor Piercing 1k1','Flesh Cutter 2k3','Humming Bulb 0k1','Rope Cutter 1k1']);
  eq('F6-A','A3','Every cost matches the equipment table (bu)',
     T.ARROW_LIBRARY.map(a=>a.name+' '+a.cost),
     ['Willow Leaf 1','Armor Piercing 2','Flesh Cutter 5','Humming Bulb 5','Rope Cutter 3']);
  eq('F6-A','A4','Every arrow states its special rules',
     T.ARROW_LIBRARY.filter(a=>typeof a.special!=='string'||!a.special.trim()).map(a=>a.name),[]);
  eq('F6-A','A5','Special-rule text matches the brief',
     T.ARROW_LIBRARY.map(a=>a.special),
     ['None','Ignores armor TN bonus','Doubles armor TN bonus, 1/2 range',
      'Loud whistling sound','2 Free Raises vs objects, 1/2 range']);
  eq('F6-A','A6','Every arrow has a DOM-safe key',
     T.ARROW_LIBRARY.filter(a=>!/^[A-Za-z][A-Za-z0-9]*$/.test(a.key||'')).map(a=>a.name),[]);
  eq('F6-A','A7','Every arrow has a unique key',
     T.ARROW_LIBRARY.length, new Set(T.ARROW_LIBRARY.map(a=>a.key)).size);
  eq('F6-A','A8','Every arrow has an inline-SVG icon',
     T.ARROW_LIBRARY.filter(a=>!/^<svg[\s\S]*<\/svg>$/.test(T.arrowIcon(a)||'')).map(a=>a.name),[]);
  // "No unicode escapes": no \uXXXX (or \xNN) sequence survives anywhere in the arrow data or
  // its icons — every character is a real character, exactly as the sheet stores its own text.
  eq('F6-A','A9','No unicode escape sequences anywhere in the arrow library',
     (()=>{const s=T.ARROW_LIBRARY.map(a=>[a.name,a.special,a.notes,T.arrowIcon(a)].join(' ')).join(' ');
           return (s.match(/\\u[0-9a-fA-F]{4}|\\x[0-9a-fA-F]{2}/g)||[]);})(),[]);
  eq('F6-A','A10','Icons carry no external asset references',
     T.ARROW_LIBRARY.filter(a=>/(http|url\(|<image|xlink)/i.test(T.arrowIcon(a))).map(a=>a.name),[]);
  ok('F6-A','A11','findArrow is case-insensitive', !!T.findArrow('wILLOw lEAF'));
  eq('F6-A','A12','DEFAULT_ARROW is the Willow Leaf', (T.findArrow(T.DEFAULT_ARROW)||{}).name,'Willow Leaf');
  ok('F6-A','A13','The arrow contributor is registered at priority 25',
     T.PREROLL_MODIFIER_REGISTRY.some(m=>m.id==='arrow' && m.priority===25));
  eq('F6-A','A14','Registry stays sorted by priority',
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.priority),
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.priority).slice().sort((a,b)=>a-b));
  // FEATURE 7 SNAPSHOT UPDATE. Same whole-registry photograph as F4-A3; Feature 7 registers
  // offhand@35. Arrow's own placement between range (20) and stance (30) is what this test is
  // really about, and it is unchanged.
  eq('F6-A','A15','Arrow sits between range and stance',
     T.PREROLL_MODIFIER_REGISTRY.map(m=>m.id+'@'+m.priority),
     ['range@20','arrow@25','stance@30','offhand@35','wounds@40','void@50']);
  eq('F6-A','A16','A tooltip states DR, cost and special rules',
     T.arrowTooltip('Flesh Cutter').split('\n'),
     ['Flesh Cutter','DR: 2k3','Cost: 5 bu','Special: Doubles armor TN bonus, 1/2 range']);

  // =====================================================================
  // F6-B — equipment integration
  // =====================================================================
  reset();
  T.addArrowToEquipment('Willow Leaf',5);
  eq('F6-B','B1','Adding arrows creates exactly one equipment row',eqRows().length,1);
  eq('F6-B','B2','...with the requested quantity',eqRows()[0].querySelector('.eq-qty').value,'5');
  eq('F6-B','B3','...under the Arrow label convention',
     eqRows()[0].querySelector('.eq-name').value,'Arrow — Willow Leaf');
  eq('F6-B','B4','...and getArrowQuantity reads it back',qty('Willow Leaf'),5);
  T.addArrowToEquipment('Willow Leaf',7);
  eq('F6-B','B5','Adding the same type again merges instead of duplicating',eqRows().length,1);
  eq('F6-B','B6','...raising the quantity to 12',qty('Willow Leaf'),12);
  T.addArrowToEquipment('Armor Piercing',3);
  eq('F6-B','B7','A different type gets its own row',eqRows().length,2);
  eq('F6-B','B8','...counted separately',[qty('Willow Leaf'),qty('Armor Piercing')],[12,3]);
  eq('F6-B','B9','An unknown arrow type is refused',T.addArrowToEquipment('Moon Arrow',4),null);
  eq('F6-B','B10','...and adds no row',eqRows().length,2);
  // label parsing, forwards and back
  eq('F6-B','B11','Label round-trips',
     (T.arrowFromEquipLabel(T.arrowEquipLabel('Rope Cutter'))||{}).name,'Rope Cutter');
  eq('F6-B','B12','Plural, lowercase and a plain hyphen all parse',
     ['arrows - willow leaf','Arrow – Willow Leaf','ARROW — WILLOW LEAF']
       .map(s=>(T.arrowFromEquipLabel(s)||{}).name||null),
     ['Willow Leaf','Willow Leaf','Willow Leaf']);
  eq('F6-B','B13','A non-arrow item is not an arrow',T.arrowFromEquipLabel('Travelling Pack'),null);
  eq('F6-B','B14','...nor is an arrow-shaped name for a type that does not exist',
     T.arrowFromEquipLabel('Arrow — Moon'),null);
  // tooltip + icon on the row itself
  const wlRow=T.arrowEquipRows('Willow Leaf')[0];
  ok('F6-B','B15','An arrow row carries the shared tooltip',
     wlRow.querySelector('.eq-name').getAttribute('title')===T.arrowTooltip('Willow Leaf'));
  ok('F6-B','B16','...and shows its icon',
     /^<svg/.test(wlRow.querySelector('.eq-arrow-icon').innerHTML));
  // Rendered width, not just markup: the icon slot rests at display:none in the stylesheet, so
  // an implementation that only writes innerHTML leaves an invisible icon and B16 alone lies.
  ok('F6-B','B17','...and the icon is actually visible',
     wlRow.querySelector('.eq-arrow-icon').offsetWidth > 0);
  eq('F6-B','B18','...and is tagged with its type',wlRow.dataset.arrowType,'Willow Leaf');
  const plain=addItem('Travelling Pack',1);
  eq('F6-B','B19','An ordinary item shows no icon',plain.querySelector('.eq-arrow-icon').innerHTML,'');
  eq('F6-B','B19b','...and its icon slot stays collapsed',plain.querySelector('.eq-arrow-icon').offsetWidth,0);
  no('F6-B','B19c','...and it has no tooltip',plain.querySelector('.eq-name').getAttribute('title'));
  // live re-decoration as the name is edited
  plain.querySelector('.eq-name').value='Arrow — Humming Bulb';
  plain.querySelector('.eq-name').dispatchEvent(new Event('input'));
  ok('F6-B','B20','Renaming a row into an arrow decorates it immediately',
     /^<svg/.test(plain.querySelector('.eq-arrow-icon').innerHTML) &&
     plain.querySelector('.eq-arrow-icon').offsetWidth > 0);
  eq('F6-B','B21','...and it now counts',qty('Humming Bulb'),1);
  plain.querySelector('.eq-name').value='Travelling Pack';
  plain.querySelector('.eq-name').dispatchEvent(new Event('input'));
  eq('F6-B','B22','Renaming it back removes the decoration',
     plain.querySelector('.eq-arrow-icon').innerHTML,'');
  // zero-quantity removal, scoped to arrows
  const apRow=T.arrowEquipRows('Armor Piercing')[0];
  apRow.querySelector('.eq-qty').value='0';
  apRow.querySelector('.eq-qty').dispatchEvent(new Event('change'));
  eq('F6-B','B23','An arrow row committed at 0 removes itself',qty('Armor Piercing'),0);
  eq('F6-B','B24','...leaving the other rows alone',qty('Willow Leaf'),12);
  plain.querySelector('.eq-qty').value='0';
  plain.querySelector('.eq-qty').dispatchEvent(new Event('change'));
  ok('F6-B','B25','An ordinary item at 0 is NOT removed',eB().contains(plain));
  // the Add Arrows picker and its ticker
  T.openArrowsPicker();
  eq('F6-B','B26','The picker lists every arrow type',
     document.querySelectorAll('#arrowsPickerList .arrow-pick-row').length,5);
  eq('F6-B','B27','...each with a ticker',
     document.querySelectorAll('#arrowsPickerList .arrow-tick-input').length,5);
  eq('F6-B','B28','...each with a visibly rendered icon',
     Array.from(document.querySelectorAll('#arrowsPickerList .arrow-pick-icon'))
       .filter(el=>!/^<svg/.test(el.innerHTML) || el.offsetWidth===0).length,0);
  ok('F6-B','B29','...each with the shared tooltip',
     document.querySelector('#arrowsPickerList .arrow-pick-row').getAttribute('title')
       ===T.arrowTooltip('Willow Leaf'));
  const tickInput=document.getElementById('arrowQty_ropeCutter');
  document.querySelector('.arrow-tick-btn[data-key="ropeCutter"][data-step="1"]').click();
  document.querySelector('.arrow-tick-btn[data-key="ropeCutter"][data-step="1"]').click();
  eq('F6-B','B30','The + ticker counts up',tickInput.value,'3');
  document.querySelector('.arrow-tick-btn[data-key="ropeCutter"][data-step="-1"]').click();
  eq('F6-B','B31','The - ticker counts down',tickInput.value,'2');
  for(let i=0;i<5;i++) document.querySelector('.arrow-tick-btn[data-key="ropeCutter"][data-step="-1"]').click();
  eq('F6-B','B32','...and never below one',tickInput.value,'1');
  document.getElementById('arrowQty_ropeCutter').value='9';
  document.querySelector('.arrow-pick-add[data-key="ropeCutter"]').click();
  eq('F6-B','B33','Add honours the ticker quantity',qty('Rope Cutter'),9);
  document.querySelector('.arrow-pick-add[data-key="ropeCutter"]').click();
  eq('F6-B','B34','...and a second Add merges into the same row',
     [qty('Rope Cutter'),T.arrowEquipRows('Rope Cutter').length],[10,1]);
  T.closeArrowsPicker();
  eq('F6-B','B35','Closing the picker hides it',
     document.getElementById('arrowsPickerOverlay').style.display,'none');

  // =====================================================================
  // F6-C — the ammunition popup
  // =====================================================================
  reset(); addSkill('Kenjutsu',7,'Katana'); addSkill('Kyujutsu',3);
  const katana=addWeapon('Katana'); const yumi=addWeapon('Yumi'); T.recalcAll();
  // melee never asks
  T.addArrowToEquipment('Willow Leaf',5);
  await attackWith(katana,'Willow Leaf');
  no('F6-C','C1','A melee attack never opens the ammunition popup',ammoOpen());
  ok('F6-C','C2','...and rolls normally',rollOpen());
  eq('F6-C','C3','...spending nothing',qty('Willow Leaf'),5);
  closeRoll();
  // dormant when the character owns no ammunition at all
  clearAmmo();
  await attackWith(yumi,'Willow Leaf');
  no('F6-C','C4','With no arrows owned the popup stays dormant',ammoOpen());
  ok('F6-C','C5','...and the bow fires exactly as it did before Feature 6',rollOpen());
  closeRoll();
  // active once arrows exist
  T.addArrowToEquipment('Willow Leaf',5);
  let p=beginAttack(yumi); await tick();
  ok('F6-C','C6','Owning arrows opens the popup on a bow attack',ammoOpen());
  ok('F6-C','C7','...naming the bow and its Strength',
     /Yumi/.test(document.getElementById('arrowPickSubtitle').textContent) &&
     /bow Strength 3/.test(document.getElementById('arrowPickSubtitle').textContent));
  eq('F6-C','C8','Every arrow type is listed',
     document.querySelectorAll('#arrowPickBody .arrow-opt').length,5);
  eq('F6-C','C9','Owned arrows are clickable',optBtn('Willow Leaf').disabled,false);
  eq('F6-C','C10','Arrows you do not own are visible but disabled',
     ['Armor Piercing','Flesh Cutter','Humming Bulb','Rope Cutter'].map(n=>optBtn(n).disabled),
     [true,true,true,true]);
  eq('F6-C','C11','Each option shows the quantity held',
     optBtn('Willow Leaf').querySelector('.arrow-opt-qty').textContent,'5');
  eq('F6-C','C12','...and a zero count is flagged',
     optBtn('Flesh Cutter').querySelector('.arrow-opt-qty').className,'arrow-opt-qty zero');
  eq('F6-C','C13','Each option carries the shared tooltip',
     optBtn('Rope Cutter').getAttribute('title'),T.arrowTooltip('Rope Cutter'));
  eq('F6-C','C14','Each option carries its own visibly rendered icon',
     Array.from(document.querySelectorAll('#arrowPickBody .arrow-opt-icon'))
       .filter(el=>!/^<svg/.test(el.innerHTML) || el.offsetWidth===0).length,0);
  ok('F6-C','C15','Options name their DR and special rules',
     /2k2/.test(optBtn('Willow Leaf').textContent) &&
     /Ignores armor TN bonus/.test(optBtn('Armor Piercing').textContent));
  // cancel
  document.getElementById('arrowPickClose').click(); await p;
  no('F6-C','C16','Cancelling closes the popup',ammoOpen());
  no('F6-C','C17','...rolls no dice',rollOpen());
  eq('F6-C','C18','...and spends no ammunition',qty('Willow Leaf'),5);
  // out of arrows, but this bow has fired before: the popup still appears, fully disabled
  await attackWith(yumi,'Willow Leaf'); closeRoll();
  eq('F6-C','C19','Firing spends one arrow',qty('Willow Leaf'),4);
  T.arrowEquipRows('Willow Leaf')[0].remove(); T.recalcAll();
  p=beginAttack(yumi); await tick();
  ok('F6-C','C20','An empty quiver still opens the popup for a bow that has fired',ammoOpen());
  eq('F6-C','C21','...with every option disabled',
     T.ARROW_LIBRARY.filter(a=>!optBtn(a.name).disabled).map(a=>a.name),[]);
  ok('F6-C','C22','...and says why',
     /no arrows/i.test(document.querySelector('#arrowPickBody .arrow-opt-empty').textContent));
  document.getElementById('arrowPickClose').click(); await p;
  no('F6-C','C23','...so the shot cannot be taken',rollOpen());

  // =====================================================================
  // F6-D — ammunition spending
  // =====================================================================
  reset(); addSkill('Kyujutsu',3); const bow=addWeapon('Yumi'); T.recalcAll();
  T.addArrowToEquipment('Willow Leaf',3);
  T.addArrowToEquipment('Flesh Cutter',2);
  await attackWith(bow,'Willow Leaf');
  eq('F6-D','D1','An attack spends exactly one arrow',qty('Willow Leaf'),2);
  eq('F6-D','D2','...of the chosen type only',qty('Flesh Cutter'),2);
  eq('F6-D','D3','...recorded as the arrow in flight',T.getLastArrowUsed(),'Willow Leaf');
  eq('F6-D','D4','...and stamped on the row',T.getRowArrowType(bow),'Willow Leaf');
  closeRoll();
  // missed shot: no damage roll, another attack — the first arrow stays spent
  await attackWith(bow,'Flesh Cutter');
  eq('F6-D','D5','A missed shot is never refunded',qty('Willow Leaf'),2);
  eq('F6-D','D6','...and the new shot spends its own arrow',qty('Flesh Cutter'),1);
  eq('F6-D','D7','...replacing the arrow in flight',T.getLastArrowUsed(),'Flesh Cutter');
  closeRoll();
  // a skill roll in between does not lose the shot
  T.rollSkill(sB().querySelector('tr')); closeRoll();
  eq('F6-D','D8','An unrelated roll does not discard the arrow in flight',T.getLastArrowUsed(),'Flesh Cutter');
  T.rollWeaponDamage(bow);
  eq('F6-D','D9','The damage roll releases the arrow in flight',T.getLastArrowUsed(),null);
  eq('F6-D','D10','...refunding nothing',qty('Flesh Cutter'),1);
  eq('F6-D','D11','...and leaving the row loaded for the record',T.getRowArrowType(bow),'Flesh Cutter');
  closeRoll();
  // cancelling spends nothing
  const beforeCancel=qty('Willow Leaf');
  await attackWith(bow,null);
  eq('F6-D','D12','Cancelling the popup spends nothing',qty('Willow Leaf'),beforeCancel);
  eq('F6-D','D13','...and leaves no arrow in flight',T.getLastArrowUsed(),null);
  // the last arrow of a type removes its row
  reset(); addSkill('Kyujutsu',3); const bow2=addWeapon('Yumi'); T.recalcAll();
  T.addArrowToEquipment('Rope Cutter',1);
  await attackWith(bow2,'Rope Cutter'); closeRoll();
  eq('F6-D','D14','Spending the last arrow empties the count',qty('Rope Cutter'),0);
  eq('F6-D','D15','...and removes the equipment row entirely',T.arrowEquipRows('Rope Cutter').length,0);
  eq('F6-D','D16','spendArrow refuses what you do not have',T.spendArrow('Rope Cutter',1),false);
  T.addArrowToEquipment('Willow Leaf',2);
  eq('F6-D','D17','...and refuses a partial spend without consuming anything',
     [T.spendArrow('Willow Leaf',5),qty('Willow Leaf')],[false,2]);
  eq('F6-D','D18','An unknown arrow can never be spent',T.spendArrow('Moon Arrow',1),false);

  // =====================================================================
  // F6-E — damage pipeline
  // =====================================================================
  reset();
  const D=(w,r,o)=>T.getWeaponDamageDice(T.findWeapon(w),r,o).notation;
  setAllTraits(4);
  eq('F6-E','E1','Yumi (bow Strength 3) + Willow Leaf 2k2 = 5k2',D('Yumi',0),'5k2');
  eq('F6-E','E2','Dai-kyu (bow Strength 4) + Willow Leaf = 6k2',D('Dai-kyu',0),'6k2');
  eq('F6-E','E3','Han-kyu (bow Strength 1) + Willow Leaf = 3k2',D('Han-kyu',0),'3k2');
  eq('F6-E','E4','Armor Piercing 1k1 on a Yumi = 4k1',D('Yumi',0,{arrow:'Armor Piercing'}),'4k1');
  eq('F6-E','E5','Flesh Cutter 2k3 on a Yumi = 5k3',D('Yumi',0,{arrow:'Flesh Cutter'}),'5k3');
  eq('F6-E','E6','Humming Bulb 0k1 on a Yumi = 3k1',D('Yumi',0,{arrow:'Humming Bulb'}),'3k1');
  eq('F6-E','E7','Rope Cutter 1k1 on a Yumi = 4k1',D('Yumi',0,{arrow:'Rope Cutter'}),'4k1');
  setAllTraits(2);
  eq('F6-E','E8','Weak user: Strength 2 caps the Yumi rating 3',D('Yumi',0),'4k2');
  eq('F6-E','E9','...and the cap applies whatever the arrow',D('Yumi',0,{arrow:'Flesh Cutter'}),'4k3');
  setAllTraits(5);
  eq('F6-E','E10','A strong archer never exceeds the bow rating',D('Yumi',0),'5k2');
  setAllTraits(3);
  eq('F6-E','E11','An unknown arrow falls back to the default',D('Yumi',0,{arrow:'Moon Arrow'}),'5k2');
  eq('F6-E','E12','The result names the arrow it used',
     T.getWeaponDamageDice(T.findWeapon('Yumi'),0,{arrow:'Rope Cutter'}).arrow,'Rope Cutter');
  eq('F6-E','E13','A melee weapon ignores opts.arrow entirely',
     D('Katana',0,{arrow:'Flesh Cutter'}),D('Katana',0));
  // contributor scope
  eq('F6-E','E14','The contributor is silent on every non-damage roll kind',
     ['attack','skill','spell','trait','ring','initiative','manual']
       .map(k=>T.arrowPreRollModifiers(T.makeRollContext(k,{weaponEntry:T.findWeapon('Yumi'),arrow:'Willow Leaf'}))),
     [null,null,null,null,null,null,null]);
  eq('F6-E','E15','...silent on damage when no arrow was selected',
     T.arrowPreRollModifiers(T.makeRollContext('damage',{weaponEntry:T.findWeapon('Yumi')})),null);
  eq('F6-E','E16','...silent on damage for a weapon that fires no ammunition',
     T.arrowPreRollModifiers(T.makeRollContext('damage',{weaponEntry:T.findWeapon('Katana'),arrow:'Willow Leaf'})),null);
  eq('F6-E','E17','...and speaks exactly once for a bow with an arrow',
     (()=>{const m=T.arrowPreRollModifiers(T.makeRollContext('damage',
        {weaponEntry:T.findWeapon('Yumi'),arrow:'Willow Leaf'}));
       return [m.length,m[0].label,m[0].display,m[0].informational];})(),
     [1,'Arrow','Willow Leaf (+2k2)',true]);
  // an informational modifier can never move a die
  eq('F6-E','E18','An informational modifier is normalised to zero deltas',
     (()=>{T.registerPreRollModifier('t_info',99,()=>({label:'T',informational:true,display:'x',
              rolledDelta:5,keptDelta:5,totalDelta:5}));
       const m=T.getPreRollModifiers(T.makeRollContext('skill'));
       T.unregisterPreRollModifier('t_info');
       const it=m.filter(x=>x.label==='T')[0];
       return [it.rolledDelta,it.keptDelta,it.totalDelta];})(),[0,0,0]);
  eq('F6-E','E19','...so the pool it decorates is unchanged',
     (()=>{const a=T.applyPreRollModifiers(6,3,[{label:'T',informational:true,rolledDelta:0,
              keptDelta:0,totalDelta:0}]);return [a.rolled,a.kept,a.totalDelta];})(),[6,3,0]);
  // end to end on a real row
  reset(); addSkill('Kyujutsu',3); const bow3=addWeapon('Yumi'); T.recalcAll();
  T.addArrowToEquipment('Flesh Cutter',4);
  await attackWith(bow3,'Flesh Cutter'); closeRoll();
  T.rollWeaponDamage(bow3);
  eq('F6-E','E20','A fired Flesh Cutter rolls 5k3 damage',notation(),'5k3');
  ok('F6-E','E21','...and the modifier bar names the arrow',
     /Arrow:\s*Flesh Cutter \(\+2k3\)/.test(barText()));
  closeRoll();
  // no arrow selected -> no bar at all (the zero-change guarantee)
  reset(); addSkill('Kyujutsu',3); const bow4=addWeapon('Yumi'); T.recalcAll();
  T.rollWeaponDamage(bow4);
  eq('F6-E','E22','With no arrow selected the pool is the Feature 4 default 5k2',notation(),'5k2');
  no('F6-E','E23','...and there is no modifier bar at all',modBar());
  closeRoll();
  // the row preview follows the loaded arrow
  T.setRowArrowType(bow4,'Humming Bulb'); T.refreshWeaponRow(bow4);
  eq('F6-E','E24','The row previews the loaded arrow',bow4.querySelector('.wp-dmg').value,'3k1');
  ok('F6-E','E25','...and says so in the row note',
     /Arrow: Humming Bulb/.test(bow4.querySelector('.wp-link-note').textContent));
  T.setRowArrowType(bow4,''); T.refreshWeaponRow(bow4);
  eq('F6-E','E26','Clearing it restores the default preview',bow4.querySelector('.wp-dmg').value,'5k2');

  // =====================================================================
  // F6-F — save / load
  // =====================================================================
  reset(); addSkill('Kyujutsu',3); const bow5=addWeapon('Yumi'); T.recalcAll();
  T.addArrowToEquipment('Willow Leaf',12);
  T.addArrowToEquipment('Armor Piercing',6);
  await attackWith(bow5,'Armor Piercing'); closeRoll();
  const save=T.collectData();
  eq('F6-F','F1','Arrow items are saved as ordinary equipment rows',
     save.equip.map(e=>e.name+' x'+e.qty),['Arrow — Willow Leaf x12','Arrow — Armor Piercing x5']);
  eq('F6-F','F2','The weapon row saves wp_arrowType',save.weapons[0].arrowType,'Armor Piercing');
  eq('F6-F','F3','The save still has exactly 42 fields',Object.keys(save.fields).length,42);
  eq('F6-F','F4','No lastArrowUsed anywhere in the save',
     (JSON.stringify(save).match(/lastArrowUsed/g)||[]),[]);
  eq('F6-F','F5','No ammo keys leaked into the f_ fields',
     Object.keys(save.fields).filter(k=>/arrow|ammo|quiver/i.test(k)),[]);
  const sig=JSON.stringify(save);
  T.applyData(JSON.parse(sig));
  eq('F6-F','F6','Quantities survive the round trip',
     [qty('Willow Leaf'),qty('Armor Piercing')],[12,5]);
  eq('F6-F','F7','...in one row per type',
     [T.arrowEquipRows('Willow Leaf').length,T.arrowEquipRows('Armor Piercing').length],[1,1]);
  eq('F6-F','F8','The loaded arrow type is restored',
     T.getRowArrowType(wB().querySelector('tr')),'Armor Piercing');
  eq('F6-F','F9','...and drives the reloaded row preview',
     wB().querySelector('tr').querySelector('.wp-dmg').value,'4k1');
  eq('F6-F','F10','The arrow in flight does NOT survive a load',T.getLastArrowUsed(),null);
  eq('F6-F','F11','save -> load -> save is stable',JSON.stringify(T.collectData()),sig);
  eq('F6-F','F12','Arrow rows keep their visible icon after a load',
     Array.from(eB().querySelectorAll('tr'))
       .filter(tr=>tr.dataset.arrowType &&
         (!/^<svg/.test(tr.querySelector('.eq-arrow-icon').innerHTML) ||
          tr.querySelector('.eq-arrow-icon').offsetWidth===0)).length,0);
  // a pre-Feature-6 save has no arrowType at all
  reset();
  const legacy=wB().appendChild(T.makeWeaponRow({key:'Yumi',name:'Yumi',skill:'Kyujutsu',size:'Large',
    keywords:'',notes:'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));
  eq('F6-F','F13','A pre-Feature-6 weapon row loads with no arrow',T.getRowArrowType(legacy),null);
  eq('F6-F','F14','...and rolls the Feature 4 default',legacy.querySelector('.wp-dmg').value,'5k2');
  eq('F6-F','F15','...and saves an empty arrowType',T.collectData().weapons[0].arrowType,'');

  // =====================================================================
  // F6-G — zero-change guarantee, then the regression suites
  // =====================================================================
  reset(); addSkill('Kenjutsu',7,'Katana'); addSkill('Kyujutsu',3);
  const kat=addWeapon('Katana'); const yum=addWeapon('Yumi'); T.recalcAll();
  await attackWith(kat,null);
  eq('F6-G','G1','No ammunition anywhere: melee attack is untouched 10k3',notation(),'10k3');
  no('F6-G','G2','...with no modifier bar',modBar());
  closeRoll();
  T.rollWeaponDamage(kat);
  eq('F6-G','G3','...and melee damage is untouched',notation(),
     T.getWeaponDamageDice(T.findWeapon('Katana'),7).notation);
  no('F6-G','G4','...with no modifier bar',modBar());
  closeRoll();
  await attackWith(yum,null);
  no('F6-G','G5','A bow with no ammunition never opens the popup',ammoOpen());
  eq('F6-G','G6','...and rolls the Feature 4 pool',notation(),'6k3');
  closeRoll();
  eq('F6-G','G7','A bare damage context still yields no modifiers',
     T.getPreRollModifiers(T.makeRollContext('damage')).length,0);
  eq('F6-G','G8','No test contributors left registered',
     T.PREROLL_MODIFIER_REGISTRY.filter(m=>/^t_/.test(m.id)).map(m=>m.id),[]);
  eq('F6-G','G9','Ammo tracking is dormant with an empty quiver',T.ammoTrackingActive(yum),false);
  T.addArrowToEquipment('Willow Leaf',1);
  eq('F6-G','G10','...and active the moment an arrow is owned',T.ammoTrackingActive(yum),true);
  reset();

  // Nothing below this line may see an arrow row: Features 1-4 fire a Yumi through the range
  // prompt and know nothing about the ammunition popup, so a leaked arrow would hang them.
  clearAmmo();
  eq('F6-G','G11','Equipment is clear before the regression suites',eqRows().length,0);

  const suites={};
  async function runSuite(name,urls){
    for(const url of urls){
      try{
        const res=await fetch(url+(url.indexOf('?')>=0?'&':'?')+'cb='+Date.now());
        if(!res.ok) continue;
        const o0=(0,eval)(await res.text());
        const o=(o0&&typeof o0.then==='function')?await o0:o0;
        suites[name]={total:o.total,passed:o.passed,failed:o.failed,
                      fails:o.results.filter(r=>!r.pass).map(r=>r.id+' '+r.name)};
        rec('REG',name,name+' suite passes unchanged',o.failed===0,
            o.failed?('failed '+o.failed+': '+suites[name].fails.join('; ')):'');
        clearAmmo();
        return;
      }catch(e){ suites[name]={error:String(e)};
        rec('REG',name,name+' suite passes unchanged',false,'could not run: '+e); return; }
    }
    suites[name]={error:'not found'};
    rec('REG',name,name+' suite passes unchanged',false,'could not fetch any of: '+urls.join(', '));
  }
  await runSuite('Feature4',['/l5r-P1-P2-F4-test-harness.js','/f4-harness.js']);
  await runSuite('Feature3',['/l5r-P1-P2-F3-test-harness.js','/f3-harness.js']);
  await runSuite('Feature2',['/l5r-P1-P2-F2-test-harness.js','/f2-harness.js']);
  await runSuite('Feature1',['/l5r-P1-P2-F1-test-harness.js','/f1-harness.js']);
  await runSuite('P1P2',['/l5r-P1-P2-test-harness.js','/p12-harness.js']);
  await runSuite('Feature0',['/l5r-feature0-test-harness.js','/f0-harness.js']);
  await runSuite('PartB',['/l5r-partB-test-harness.js','/partB-harness.js']);
  await runSuite('SchoolFix',['/l5r-schoolfree-bugfix-harness.js','/schoolfree-harness.js']);

  const fails=results.filter(r=>!r.pass);
  const by={};results.forEach(r=>{by[r.section]=by[r.section]||{pass:0,fail:0};by[r.section][r.pass?'pass':'fail']++;});
  console.log('%c PART C — FEATURE 6: AMMO TRACKING ','background:#7b1113;color:#fff;font-weight:bold;padding:3px 6px;');
  console.table(Object.keys(by).sort().map(s=>({Section:s,Pass:by[s].pass,Fail:by[s].fail})));
  console.table(Object.keys(suites).map(k=>({Suite:k,
    Total:suites[k].total===undefined?'-':suites[k].total,
    Passed:suites[k].passed===undefined?'-':suites[k].passed,
    Failed:suites[k].failed===undefined?'ERR':suites[k].failed})));
  if(fails.length) console.table(fails.map(f=>({ID:f.id,Test:f.name,Detail:f.detail})));
  console.log('%c '+(fails.length?'FAILURES':'ALL PASS')+' — '+(results.length-fails.length)+'/'+results.length+' ',
    'background:'+(fails.length?'#b00':'#1b7')+';color:#fff;font-weight:bold;padding:3px 6px;');
  return {total:results.length,passed:results.length-fails.length,failed:fails.length,results,suites};
})();
