/* Cross-build fingerprint. Runs on Part B, Version A and Version B and returns a
 * deterministic signature of everything that MUST NOT differ between them. */
(function buildSignature(){
  'use strict';
  const T = window.__L5R_TEST__;
  const seq = a => { let i=0; return ()=>a[Math.min(i++,a.length-1)]; };
  const sBody=()=>document.getElementById('skillsBody');
  const wBody=()=>document.getElementById('weaponsBody');
  const TRAITS=['agility','reflexes','strength','stamina','perception','awareness','intelligence','willpower'];

  // --- identical fixture character in every build -------------------------------
  sBody().innerHTML=''; wBody().innerHTML='';
  TRAITS.forEach(k=>document.getElementById('trait_'+k).value=3);
  document.getElementById('f_name').value='Fixture Bushi';
  [['Kenjutsu',7,'Katana'],['Kyujutsu',4,'Yumi'],['Heavy Weapons',3,'Tetsubo']]
    .forEach(([n,r,e])=>sBody().appendChild(T.makeSkillRow({name:n,trait:(T.findSkill(n)||{}).trait||'',rank:r,emph:e})));
  ['Katana','Yumi','Tetsubo','Pistol','Blowgun'].forEach(n=>{
    const L=T.findWeapon(n);
    wBody().appendChild(T.makeWeaponRow({key:L.name,name:L.name,skill:L.skill,size:L.size,
      keywords:(L.keywords||[]).join(', '),notes:L.notes||'',roll:'',dmg:'',manualAttack:false,manualDamage:false}));
  });
  T.recalcAll();

  // --- R18: save/load shape ------------------------------------------------------
  const save = T.collectData();
  const saveSig = JSON.stringify(save);

  // --- R20: attack rolls ---------------------------------------------------------
  const attackSig = ['Kenjutsu','Kyujutsu','Heavy Weapons','Ninjutsu','Firearms'].map(s=>{
    const a=T.getWeaponAttackDice(s); return s+':'+a.numDice+'k'+a.keepDice+'/'+a.traitName+a.traitValue+'/'+a.unskilled;
  }).join(' | ');

  // --- R19: Part B damage + mastery ----------------------------------------------
  const dmgSig = [['Katana',7],['Katana',3],['Tetsubo',7],['Tetsubo',3],['Yumi',4],
                  ['Blowgun',7],['Blowgun',3],['Pistol',0],['Cannon',0],['Shuriken',7]]
    .map(([w,r])=>{ const d=T.getWeaponDamageDice(T.findWeapon(w),r);
      return w+'@'+r+':'+d.numDice+'k'+d.keepDice+'/e'+d.explodeOn+'/r'+d.reductionMod+'/'+d.source; }).join(' | ');

  // --- dice engine arithmetic -----------------------------------------------------
  const tdrSig = [[12,12],[13,4],[11,3],[6,3],[10,10],[15,2]]
    .map(([r,k])=>{const a=T.applyTenDiceRule(r,k);return r+'k'+k+'->'+a.rolled+'k'+a.kept+'+'+a.bonus;}).join(' | ');

  // --- row-level derived values ----------------------------------------------------
  const rowSig = Array.from(wBody().querySelectorAll('tr')).map(tr=>
    tr.querySelector('.wp-name').value+':'+tr.querySelector('.wp-roll').value+'/'+
    tr.querySelector('.wp-dmg').value+'/'+tr.querySelector('.wp-skill').value).join(' | ');

  // --- Feature 0 (absent on the Part B build) -----------------------------------
  let f0Sig = 'ABSENT';
  if (typeof T.rerollEmphasisDice === 'function') {
    const D=t=>({total:t,chain:[t]});
    const a=T.emphasisLibraryAudit();
    f0Sig = [
      'audit='+[a.exact,a.baseName,a.unmatched,a.noEmphasisList].join('/'),
      'raw='+T.rerollEmphasisDice([D(1),D(1),D(4),D(6),D(8)],[0,1],null,seq([0.0,0.6])).map(d=>d.total).join(','),
      'explode='+JSON.stringify(T.rerollEmphasisDice([D(1)],[0],null,seq([0.95,0.3]))[0]),
      'match='+T.findMatchingEmphasis(T.findWeapon('Katana'),'Kenjutsu'),
      'base='+T.findMatchingEmphasis(T.findWeapon('Sang Kauw (Shield)'),'Staves'),
      'mode='+T.EMPHASIS_REQUIRE_SELECTION,
    ].join(' | ');
  }

  sBody().innerHTML=''; wBody().innerHTML='';
  return { saveSig, attackSig, dmgSig, tdrSig, rowSig, f0Sig,
           fieldCount: Object.keys(save.fields).length,
           topKeys: Object.keys(save).sort().join(',') };
})();
