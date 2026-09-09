  // ============ PART C FEATURE 2: STANCE SYSTEM ============
  // RAW (Stances chapter). Each Stance is tied to a Ring and is declared at the start of a Turn.
  //
  // WHERE EACH EFFECT LIVES — the Stances split across three mechanisms, which is why this
  // feature touches more than the P2 pipeline:
  //   * dice-pool effects  (Full Attack +2k1, Center's next-round +1k1) -> P2 contributor
  //   * Armor TN effects   (Full Attack -10, Defense, Full Defense)     -> recalcAll()
  //   * Initiative effect  (Center's next-round +10)                    -> recalcAll() + the roll
  // Treating all of it as "a P2 modifier" would be wrong: Armor TN is character state, not a roll.
  //
  // ROUNDING CONVENTION: Full Defense adds half its roll ROUNDED UP, matching the ceil-based
  // convention Feature 1 established for distance penalties. Where a Center bonus and a Feature 1
  // range penalty apply to the same attack, both are collected by P2 and summed additively — the
  // range penalty is still ceil-derived and is not re-rounded here.
  const STANCE_LIBRARY = [
    {
      key:'attack', name:'Attack', ring:'Water',
      summary:'Default stance. No restrictions, no bonuses, no penalties.',
      desc:'Attack is the standard Stance adopted by most bushi, tied to the Ring of Water in that '
         + 'it is fluid and versatile. A character in the Attack Stance has no restrictions on the '
         + 'kind of Actions he may take.\n\nMechanically: no modifiers of any kind.',
    },
    {
      key:'fullAttack', name:'Full Attack', ring:'Fire',
      summary:'+2k1 to attack rolls, Armor TN −10. No ranged attacks.',
      desc:'Full Attack is the Ring of Fire, raging and consuming all in its path. A character may '
         + 'take no Simple or Complex Actions other than those used to make attacks, and may only '
         + 'use Move Actions to get closer to his enemies.\n\n'
         + '• +2k1 to attack rolls made that round\n'
         + '• Armor TN reduced by 10\n'
         + '• May NOT deliver ranged attacks\n'
         + '• +5 ft bonus movement once per round (not tracked by this sheet)\n'
         + '• May not be used while mounted',
    },
    {
      key:'defense', name:'Defense', ring:'Air',
      summary:'Armor TN + Air Ring + Defense Skill Rank. May not attack.',
      desc:'Defense is the Ring of Air, adaptable and reactive. Characters add their Air Ring plus '
         + 'their Defense Skill Rank to their Armor TN. There are no restrictions on what kind of '
         + 'Actions they may take, other than that they may not attack.\n\n'
         + 'Useful for making oneself less vulnerable while making Skill Rolls or Spell Casting '
         + 'Rolls during a skirmish.',
    },
    {
      key:'fullDefense', name:'Full Defense', ring:'Earth',
      summary:'Roll Defense / Reflexes; add half (round up) to Armor TN.',
      desc:'The Full Defense Stance is the Ring of Earth, reserved, unmoving, and unassailable. '
         + 'Upon declaring this Stance the character makes a Defense / Reflexes roll and adds half '
         + 'of the total (rounding up) to his Armor TN until his following Turn.\n\n'
         + 'That Skill Roll is a Complex Action, so a character in this Stance may only take Free '
         + 'Actions afterward.',
    },
    {
      key:'center', name:'Center', ring:'Void',
      summary:'No actions. Next round: +1k1 + Void Ring on one roll, +10 Initiative.',
      desc:'The Center Stance is the Ring of Void. Characters take no Actions, instead focusing '
         + 'their energy in preparation for action the following round.\n\n'
         + '• This round: forfeits all Actions\n'
         + '• Next round: +1k1 plus your Void Ring on any ONE roll\n'
         + '• Next round: +10 to your Initiative Score for that round only',
    },
  ];
  const DEFAULT_STANCE = 'Attack';
  // Placeholder icons: inline SVG, one distinct glyph per Ring. Deliberately abstract geometry --
  // no L5R artwork is reproduced. Swap in your own images by replacing the returned markup with
  // <img src="..."> ; nothing else reads these.
  const STANCE_ICONS = {
    attack:      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20 L20 4 M14 4h6v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    fullAttack:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L15 9 L22 9 L16.5 13.5 L18.5 21 L12 16.5 L5.5 21 L7.5 13.5 L2 9 L9 9 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    defense:     '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L20 6 v6 c0 5-4 8-8 10 -4-2-8-5-8-10 V6 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    fullDefense: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L20 6 v6 c0 5-4 8-8 10 -4-2-8-5-8-10 V6 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 12.5 l2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    center:      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
  };
  function findStance(nameOrKey){
    if(!nameOrKey) return null;
    const n = String(nameOrKey).trim().toLowerCase();
    return STANCE_LIBRARY.find(s=>s.name.toLowerCase()===n || s.key.toLowerCase()===n) || null;
  }

  // ---- State (all non-"f_", so collectData() never persists any of it) -------------------
  function stanceEl(){ return document.getElementById('combatStance'); }
  function getCurrentStance(){
    const el = stanceEl();
    const s = el ? findStance(el.value) : null;
    return s ? s.name : DEFAULT_STANCE;
  }
  // Full Defense's bonus lasts "until his following Turn", so it is stamped with the round it was
  // rolled in and simply stops counting once the round advances -- no P1 changes required.
  function getFullDefenseBonus(){
    const v = document.getElementById('fullDefenseBonus');
    const r = document.getElementById('fullDefenseRound');
    if(!v || !r) return 0;
    if((parseInt(r.value,10)||0) !== getCombatRound()) return 0;
    return parseInt(v.value,10) || 0;
  }
  function setFullDefenseBonus(value){
    const v = document.getElementById('fullDefenseBonus');
    const r = document.getElementById('fullDefenseRound');
    if(v) v.value = Math.max(0, parseInt(value,10) || 0);
    if(r) r.value = getCombatRound();
  }
  function clearFullDefenseBonus(){
    const v = document.getElementById('fullDefenseBonus');
    const r = document.getElementById('fullDefenseRound');
    if(v) v.value = '0';
    if(r) r.value = '0';
  }

  // ---- Center's next-round bonus --------------------------------------------------------
  // "On the round FOLLOWING his adoption of the Center Stance" -- so the trigger is the stance
  // recorded in the PREVIOUS round's ledger entry (P1 already stores it per round).
  function centerWasLastRound(){
    return getRoundSpend('stance', getCombatRound() - 1) === 'Center';
  }
  // The +1k1 applies to ONE roll. hasSpentThisRound('centerBonusUsed') is what stops it stacking
  // across several attacks in the same round, and the per-round ledger is what stops it leaking
  // into later rounds.
  function centerBonusAvailable(){
    return centerWasLastRound() && !hasSpentThisRound('centerBonusUsed');
  }
  function consumeCenterBonus(){ recordRoundSpend('centerBonusUsed', true); }

  // ---- Armor TN and Initiative (recalcAll's half of the feature) ------------------------
  function getStanceArmorTNBonus(){
    const stance = getCurrentStance();
    if(stance === 'Full Attack') return -10;
    if(stance === 'Defense')     return getRingValueByName('air') + getCharacterSkillRank('Defense');
    if(stance === 'Full Defense') return getFullDefenseBonus();
    return 0;
  }
  // Center's +10 Initiative is granted for the round AFTER Center, and unlike the +1k1 it is not
  // "one roll" -- it applies to the Initiative Score for that whole round, so it is deliberately
  // NOT gated on centerBonusUsed.
  function getStanceInitiativeBonus(){ return centerWasLastRound() ? 10 : 0; }

  // ---- P2 contributor --------------------------------------------------------------------
  // Attack rolls carry the stance dice modifiers. Initiative additionally carries Center's +10,
  // which section 4 of the brief requires and which has no other honest home once the Initiative
  // button routes through the pipeline. Every other roll kind is refused here, which is what
  // keeps damage / skill / spell / manual rolls provably stance-free.
  function stancePreRollModifiers(ctx){
    if(!ctx) return null;
    const out = [];
    if(ctx.kind === ROLL_KINDS.ATTACK){
      if(getCurrentStance() === 'Full Attack'){
        out.push({ source:'stance', label:'Full Attack stance', rolledDelta:2, keptDelta:1 });
      }
      if(centerBonusAvailable()){
        const voidRing = getRingValueByName('void');
        // RAW: "a bonus of 1k1 plus his Void Ring". Read as two components -- +1k1 to the dice
        // pool AND the Void Ring added to the total -- which is how the brief writes it too
        // ("+1k1 + Void Ring"). The alternative reading, (1+Void)k1 in dice, is noted here
        // deliberately: switching to it means moving voidRing from totalDelta to rolledDelta.
        out.push({ source:'stance', label:'Center stance (previous round)',
          rolledDelta:1, keptDelta:1, totalDelta:voidRing,
          note:'+1k1 plus your Void Ring (' + voidRing + ')' });
      }
    } else if(ctx.kind === ROLL_KINDS.INITIATIVE){
      const bonus = getStanceInitiativeBonus();
      if(bonus) out.push({ source:'stance', label:'Center stance (previous round)', totalDelta:bonus });
    }
    return out.length ? out : null;
  }
  registerPreRollModifier('stance', 30, stancePreRollModifiers);
  // Called by the attack orchestrator once a roll has actually happened, so a cancelled attack
  // never burns the bonus.
  function consumeCenterBonusIfApplied(rolled){
    if(!rolled || !rolled.mods) return false;
    const used = rolled.mods.some(m => m.source === 'stance' && /Center stance/.test(m.label));
    if(used) consumeCenterBonus();
    return used;
  }

  // ---- Full Defense declaration roll ------------------------------------------------------
  // Declaring Full Defense IS a Defense / Reflexes roll. The player may re-pick kept dice inside
  // the modal, so the stored bonus is taken from closeRollModal()'s onClose callback -- the one
  // reliable "the player is finished" moment -- reading the final displayed total.
  function rollFullDefenseDeclaration(){
    const rank = getCharacterSkillRank('Defense');
    const trait = getTraitValueByName('Reflexes');
    const numDice = rank > 0 ? trait + rank : trait;
    const keepDice = trait;
    if(numDice <= 0){ setStatus('Set Reflexes before declaring Full Defense.'); return; }
    // PART C FEATURE 3 - the declaration is a Defense / Reflexes SKILL ROLL, so it takes wound
    // penalties like any other. The stored Armor TN bonus is therefore half the PENALISED total,
    // which is the correct reading: a wounded character defends less well.
    rollWithModifiers('Full Defense — Defense / Reflexes',
      makeRollContext(ROLL_KINDS.SKILL, { skillName:'Defense', fullDefenseDeclaration:true }),
      numDice, keepDice, { tnConfig: {
      onClose: ()=>{
        const el = document.getElementById('rollTotalDisplay');
        const total = el ? (parseInt(el.textContent, 10) || 0) : 0;
        const bonus = Math.ceil(total / 2);      // "half the total, rounding up"
        setFullDefenseBonus(bonus);
        recalcAll();
        renderStanceTiles();
        setStatus('Full Defense: +' + bonus + ' Armor TN until your next Turn.');
      },
    } });
  }

  // ---- Selection ---------------------------------------------------------------------------
  function setCurrentStance(nameOrKey, opts){
    opts = opts || {};
    const stance = findStance(nameOrKey) || findStance(DEFAULT_STANCE);
    const previous = getCurrentStance();
    const el = stanceEl();
    if(el) el.value = stance.name;
    // Leaving Full Defense drops its Armor TN bonus immediately.
    if(previous === 'Full Defense' && stance.name !== 'Full Defense') clearFullDefenseBonus();
    // P1's ledger is the stance history: one entry per round, which is what Center reads back.
    recordRoundSpend('stance', stance.name);
    if(stance.name === 'Full Defense' && !opts.silent) rollFullDefenseDeclaration();
    recalcAll();
    renderStanceTiles();
    return stance.name;
  }

  // ---- Tiles ---------------------------------------------------------------------------------
  function renderStanceTiles(){
    const wrap = document.getElementById('stanceTiles');
    if(!wrap) return;
    const current = getCurrentStance();
    wrap.innerHTML = STANCE_LIBRARY.map(s=>{
      const selected = s.name === current;
      return '<div class="stance-tile' + (selected ? ' selected' : '') + '" data-stance="' + escAttr(s.key) + '">' +
        '<button type="button" class="stance-tile-btn" data-stance="' + escAttr(s.key) + '" ' +
          'aria-pressed="' + (selected ? 'true' : 'false') + '" title="' + escAttr(s.summary) + '">' +
          '<span class="stance-icon">' + STANCE_ICONS[s.key] + '</span>' +
          '<span class="stance-name">' + escHtml(s.name) + '</span>' +
          '<span class="stance-ring">' + escHtml(s.ring) + '</span>' +
        '</button>' +
        '<button type="button" class="stance-info-btn" data-stance="' + escAttr(s.key) + '" ' +
          'aria-label="' + escAttr(s.name + ' stance rules') + '" title="Stance rules">ⓘ</button>' +
      '</div>';
    }).join('');
    wrap.querySelectorAll('.stance-tile-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>setCurrentStance(btn.dataset.stance));
    });
    // The info button must never change the stance, so its click is stopped before it bubbles.
    wrap.querySelectorAll('.stance-info-btn').forEach(btn=>{
      btn.addEventListener('click', e=>{ e.stopPropagation(); showStanceInfo(btn.dataset.stance); });
    });
    const note = document.getElementById('stanceNote');
    if(note){
      const bits = [];
      const tn = getStanceArmorTNBonus();
      if(tn) bits.push('Armor TN ' + (tn > 0 ? '+' : '') + tn);
      if(current === 'Full Attack') bits.push('no ranged attacks');
      if(current === 'Defense' || current === 'Full Defense') bits.push('may not attack');
      if(current === 'Center') bits.push('no Actions this round');
      if(centerBonusAvailable()) bits.push('Center bonus ready: +1k1 + Void on one attack');
      if(getStanceInitiativeBonus()) bits.push('Initiative +10 this round');
      note.textContent = bits.length ? bits.join(' · ') : 'No stance modifiers.';
    }
  }
  function showStanceInfo(key){
    const s = findStance(key);
    if(!s) return;
    const overlay = document.getElementById('stanceInfoOverlay');
    document.getElementById('stanceInfoTitle').textContent = s.name;
    document.getElementById('stanceInfoRing').textContent = 'Ring of ' + s.ring;
    document.getElementById('stanceInfoBody').textContent = s.desc;
    overlay.style.display = 'flex';
  }
  function closeStanceInfo(){
    const overlay = document.getElementById('stanceInfoOverlay');
    if(overlay) overlay.style.display = 'none';
  }
  // ============ END PART C FEATURE 2 ============
