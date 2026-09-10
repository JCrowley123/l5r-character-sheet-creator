  // ============ PART C FEATURE 4: VOID POINT AUTOMATION ============
  // RAW (Void Points): "A player may declare he is spending a Void Point any time when it would
  // be applicable... A character may normally only spend one Void Point per Round."
  //
  // All three figures are RAW. An earlier draft of the brief specified +1 for the Armor TN and
  // Initiative bonuses; that was corrected to RAW's +10 on review.
  const VOID_EFFECT_VALUES = Object.freeze({
    tnBonus: 10,          // RAW: "Increase his Armor TN by 10 for one round."
    initiativeBonus: 10,  // RAW: "Increase his Initiative Score by 10 for the duration of the current skirmish."
    damageReduction: 10,  // RAW: "Reduce the amount of Wounds suffered from one source of damage by 10."
  });
  // The five RAW expenditures. `oneRoll` effects are consumed by the very next roll; `combatOnly`
  // effects need an active combat round; `immediate` resolves at once and modifies no roll.
  //
  // BUGFIX (see BUGFIX -- Void One-Roll Effects Not Mutually Exclusive): this used to list a
  // sixth entry, 'trait' ("+1 Trait for one roll"), as a separate RAW choice from 'k1'. RAW does
  // not contain a "+1 Trait" power at all -- the actual text is "Gain a bonus of +1k1 to a
  // Skill, Trait, Ring, or Spell Casting roll", one single effect naming which roll types it
  // applies to, not a menu of per-roll-type bonuses. The two were arithmetically identical
  // anyway (see the comment above voidPreRollModifiers) but being offered as separate options
  // let a player tick both and double the bonus for two Void Points, which RAW's own "one of
  // the following effects" framing forbids. Merged into the one entry below.
  const VOID_SPEND_LIBRARY = [
    { key:'k1',     label:'+1k1 to a Skill, Trait, Ring, or Spell Casting roll',
                                                   bar:'Void: +1k1',           oneRoll:true,  combatOnly:false },
    // The label states the restriction because this card arms effects without knowing which
    // roll is coming, so unlike the roll preview it cannot hide the option when it would not
    // apply -- see voidSkillRankApplies(). Armed here and then spent on a trained roll, the
    // point buys nothing, so the constraint has to be legible at arming time.
    { key:'skill',  label:'Make an Unskilled roll Skilled (Rank 0 → 1) — 10s explode',
                                                   bar:'Void: +1 Skill',       oneRoll:true,  combatOnly:false },
    { key:'tn',     label:'+' + VOID_EFFECT_VALUES.tnBonus + ' TN to be hit',
                                                   bar:'Void: +' + VOID_EFFECT_VALUES.tnBonus + ' TN to be hit',
                                                                               oneRoll:false, combatOnly:true },
    { key:'init',   label:'+' + VOID_EFFECT_VALUES.initiativeBonus + ' Initiative (skirmish)',
                                                   bar:'Void: +' + VOID_EFFECT_VALUES.initiativeBonus + ' Initiative',
                                                                               oneRoll:false, combatOnly:true },
    { key:'damage', label:'Reduce damage by ' + VOID_EFFECT_VALUES.damageReduction,
                                                   bar:null,                   oneRoll:false, combatOnly:false, immediate:true },
    // A seventh expenditure, and the only one that is not one of the six RAW general uses:
    // activating a Kiho (Core Rulebook p.261). Not combatOnly - plenty of Kiho are activated
    // outside a skirmish - and it modifies no roll, so the sheet just spends the point and
    // says so. Which Kiho, and what it then does, stays with the player: this sheet does not
    // track active Kiho (see the note in the Techniques panel).
    { key:'kiho',   label:'Activate a Kiho',       bar:null,                   oneRoll:false, combatOnly:false, immediate:true },
  ];
  function findVoidOption(key){ return VOID_SPEND_LIBRARY.find(o=>o.key===key) || null; }
  // Core Rulebook p.261: "Spending Void Points to activate Kiho in this manner is considered a
  // School Technique for Brotherhood Schools, and thus does not count against the once-per-round
  // restriction governing Void Points."
  //
  // Read that sentence carefully, because it is easy to over-apply in both directions:
  //   - It is written for BROTHERHOOD Schools, so it gates on brotherhood:true and NOT on
  //     monk:true. A Togashi Tattooed Order or Kuni Witch-Hunter character may buy and use Kiho
  //     (at 1.5x, see kihoAcquisition), but pays the ordinary one-Void-Point-per-Round price to
  //     activate them. Gating this on monk-ness would hand a Clan [Monk] School a Brotherhood
  //     School Technique it does not have.
  //   - "Does not count against" cuts both ways, so this does two things below, not one: a Kiho
  //     activation is never BLOCKED by a Void Point already spent this Round, and it does not
  //     itself CONSUME the Round's allowance, leaving an ordinary Void spend still available.
  function kihoVoidExemption(){ return activeSchoolIsBrotherhood(); }

  // ---- Ephemeral state. Every id below deliberately lacks the "f_" prefix, so collectData()
  // ---- never persists any of it -- this feature contributes nothing to the saved field set.
  function voidPendingEl(){ return document.getElementById('voidPendingEffects'); }
  function getVoidPending(){
    const el = voidPendingEl();
    if(!el || !el.value) return {};
    try { const o = JSON.parse(el.value); return (o && typeof o === 'object') ? o : {}; }
    catch(e){ return {}; }
  }
  function setVoidPending(obj){
    const el = voidPendingEl();
    if(el) el.value = JSON.stringify(obj || {});
    renderVoidPanel();
  }
  function clearVoidPending(){ setVoidPending({}); }
  // BUGFIX (Void One-Roll Effects Not Mutually Exclusive): RAW allows spending a Void Point on
  // only ONE of the "following effects" per expenditure -- not one of the one-roll effects AND
  // a second one stacked onto the same roll. Centralised here, rather than left to each caller,
  // so both spendVoid() below (the Void card's own buttons) and the roll preview
  // (208-feat-roll-preview.js, which arms these directly via setVoidPending() so Cancel stays
  // free -- see that phase's own header comment) enforce the identical rule from one place, and
  // can never drift apart into two different definitions of "mutually exclusive."
  function clearOneRollVoidPending(pending){
    const next = Object.assign({}, pending);
    VOID_SPEND_LIBRARY.forEach(o=>{ if(o.oneRoll) delete next[o.key]; });
    return next;
  }
  function armOneRollVoidPending(pending, key){
    const next = clearOneRollVoidPending(pending);
    next[key] = true;
    return next;
  }
  // Out-of-combat Void spending is explicitly allowed by the brief, so the round ledger is only
  // consulted while combat is active. Outside combat there is no Round, so there is nothing for a
  // once-per-Round rule to be measured against.
  function isCombatActive(){
    const el = document.getElementById('isCombatActive');
    return !!el && el.value === '1';
  }
  function setCombatActive(on){
    const el = document.getElementById('isCombatActive');
    if(el) el.value = on ? '1' : '0';
    renderVoidPanel();
  }
  function getVoidPoints(){
    const el = document.getElementById('void_current');
    return el ? Math.max(0, parseInt(el.value||'0',10) || 0) : 0;
  }
  // Spends one pip from the existing Void Points tracker and re-renders it, so the pips on screen
  // and the automation can never disagree.
  function consumeVoidPoint(){
    const el = document.getElementById('void_current');
    if(!el) return false;
    const current = getVoidPoints();
    if(current <= 0) return false;
    el.value = current - 1;
    renderVoidPips();
    return true;
  }

  // ---- Spending -------------------------------------------------------------------------
  // Returns {ok:boolean, reason:string}. Refusals are explained rather than silently ignored.
  function canSpendVoid(key){
    const opt = findVoidOption(key);
    if(!opt) return { ok:false, reason:'Unknown Void option.' };
    if(opt.combatOnly && !isCombatActive()){
      return { ok:false, reason:opt.label + ' is a combat effect. Start a combat round first.' };
    }
    if(getVoidPoints() <= 0){
      return { ok:false, reason:'No Void Points remaining.' };
    }
    // Kiho activation is only offered to a character who may actually have Kiho at all -
    // same four-way entitlement test the quick-add uses, so the two can never disagree.
    if(key === 'kiho' && kihoAcquisition().mode === 'none'){
      return { ok:false, reason:'Only a Monk or Shugenja character can activate Kiho.' };
    }
    // RAW: "A character may normally only spend one Void Point per Round." Enforced in combat only.
    // The Brotherhood Kiho exemption (see kihoVoidExemption) is the one documented way past it.
    if(isCombatActive() && hasSpentThisRound('void') && !(key === 'kiho' && kihoVoidExemption())){
      return { ok:false, reason:'You have already spent a Void Point this Round. RAW allows only one per Round.' };
    }
    return { ok:true, reason:'' };
  }
  function spendVoid(key){
    const check = canSpendVoid(key);
    if(!check.ok){ appAlert(check.reason); return false; }
    const opt = findVoidOption(key);
    if(!consumeVoidPoint()){ appAlert('No Void Points remaining.'); return false; }
    // An exempt Kiho activation is deliberately NOT written to the round ledger: it must not
    // consume the Round's single allowed Void Point, or the second half of "does not count
    // against the once-per-round restriction" would go unimplemented.
    const kihoExempt = (opt.key === 'kiho') && kihoVoidExemption();
    if(isCombatActive() && !kihoExempt) recordRoundSpend('void', opt.key);
    if(opt.key === 'kiho'){
      setStatus(kihoExempt
        ? 'Void spent: activating a Kiho \u2014 exempt from the once-per-Round limit (Brotherhood School Technique).'
        : 'Void spent: activating a Kiho.');
    } else if(opt.oneRoll){
      setVoidPending(armOneRollVoidPending(getVoidPending(), opt.key));
      setStatus('Void spent: ' + opt.label + ' — applies to your next roll.');
    } else if(opt.key === 'tn'){
      // RAW: "Increase his Armor TN by 10 FOR ONE ROUND." The P1 ledger is keyed BY ROUND, so
      // this expires on its own when the round advances -- no explicit teardown needed.
      recordRoundSpend('voidTN', true);
      recalcAll();
      setStatus('Void spent: ' + opt.label + ' — until the end of this Round.');
    } else if(opt.key === 'init'){
      // RAW: "...for the duration of the CURRENT SKIRMISH." Deliberately NOT round-keyed: it must
      // survive advanceCombatRound() and is cleared only when the whole skirmish resets.
      const el = document.getElementById('voidInitSkirmish');
      if(el) el.value = '1';
      recalcAll();
      setStatus('Void spent: ' + opt.label + ' — for the duration of this skirmish.');
    }
    renderVoidPanel();
    return true;
  }
  // V6. Deliberately NOT implemented by intercepting rollWeaponDamage(): Part B's damage path is
  // off limits, and more importantly the brief requires this to work for falling and environmental
  // damage, which produce no damage roll to intercept at all. Asking for the announced damage
  // total covers every source with no change to Part B.
  function applyVoidDamageReduction(rawDamage){
    const check = canSpendVoid('damage');
    if(!check.ok){ appAlert(check.reason); return null; }
    const total = Math.max(0, parseInt(rawDamage,10) || 0);
    if(total <= 0){ appAlert('Enter the damage total that was announced, then spend the Void Point.'); return null; }
    if(!consumeVoidPoint()){ appAlert('No Void Points remaining.'); return null; }
    if(isCombatActive()) recordRoundSpend('void', 'damage');
    const finalDamage = Math.max(0, total - VOID_EFFECT_VALUES.damageReduction);
    const woundsEl = document.getElementById('f_woundsTaken');
    const before = Math.max(0, parseInt(woundsEl.value||'0',10) || 0);
    woundsEl.value = before + finalDamage;
    recalcAll();                    // wound penalties (Feature 3) update immediately
    renderVoidPanel();
    setStatus('Void spent: ' + total + ' damage reduced to ' + finalDamage + ' Wounds.');
    return { rawDamage: total, finalDamage, woundsBefore: before, woundsAfter: before + finalDamage };
  }

  // ---- Derived values consumed by recalcAll ----------------------------------------------
  function getVoidArmorTNBonus(){
    if(!isCombatActive()) return 0;
    return getRoundSpend('voidTN') ? VOID_EFFECT_VALUES.tnBonus : 0;
  }
  // Skirmish-wide, so this reads a flag rather than the round ledger. Still gated on combat being
  // active: outside a skirmish there is no skirmish for the bonus to belong to.
  function getVoidInitiativeBonus(){
    if(!isCombatActive()) return 0;
    const el = document.getElementById('voidInitSkirmish');
    return (el && el.value === '1') ? VOID_EFFECT_VALUES.initiativeBonus : 0;
  }
  // Clears every skirmish-scoped Void effect. A named function rather than inline teardown so the
  // combat-reset button and the test harness clear it the same way.
  function clearVoidSkirmishEffects(){
    const el = document.getElementById('voidInitSkirmish');
    if(el) el.value = '0';
  }

  // ---- P2 contributor ---------------------------------------------------------------------
  // Priority 50, so the breakdown bar reads range (20) -> stance (30) -> wounds (40) -> void (50),
  // matching the order the brief specifies. Addition is commutative; this is presentation order.
  //
  // pending.k1 is the only one-roll bonus that adds dice, and it reads (Trait + Rank)k(Trait) on
  // a Skill roll or XkX on a Trait/Ring/Spell Casting roll either way -- RAW names all four roll
  // types under this ONE effect, not a menu of per-roll-type bonuses (see BUGFIX -- Void One-Roll
  // Effects Not Mutually Exclusive for the "+1 Trait" entry this used to also carry, and why
  // that was wrong: it was arithmetically identical to this one but offered as a second, separate
  // option, letting a player tick both and double the bonus for two Void Points).
  // RAW: "Temporarily increase his rank in a Skill FROM 0 TO 1, avoiding Unskilled Roll
  // penalties." Both halves of that sentence restrict it to the same case. "From 0" is the
  // whole effect -- there is no rank to raise unless the roll is being made at rank 0 -- and
  // there is no Unskilled penalty to avoid unless the roll is unskilled. So it applies to a
  // skill-based roll being made unskilled and to nothing else.
  //
  // That includes an unskilled weapon ATTACK: an attack with its weapon skill at rank 0 is an
  // Unskilled Roll in every mechanical sense, and performWeaponAttack() already flags it. It
  // excludes Ring, Trait, Spell Casting, Initiative and manual rolls outright -- none of them
  // has a Skill Rank for this to touch. Before this gate existed the option applied to every
  // roll kind except Damage, which is how it came to be offered on an Earth Ring Roll.
  function voidSkillRankApplies(ctx){
    if(!ctx) return false;
    if(ctx.kind !== ROLL_KINDS.SKILL && ctx.kind !== ROLL_KINDS.ATTACK) return false;
    return ctx.unskilled === true || (parseInt(ctx.skillRank, 10) || 0) <= 0;
  }
  function voidPreRollModifiers(ctx){
    if(!ctx) return null;
    if(ctx.kind === ROLL_KINDS.DAMAGE) return null;   // RAW: "Damage Rolls may not be enhanced"
    const out = [];
    const pending = getVoidPending();
    if(pending.k1){
      out.push({ source:'void', label:'Void: +1k1', rolledDelta:1, keptDelta:1 });
    }
    if(pending.skill && voidSkillRankApplies(ctx)){
      // +1 Skill Rank adds a rolled die only. When the Rank was 0 it also lifts the Unskilled
      // penalty, which is a change to how the dice EXPLODE rather than to how many there are --
      // hence explodeOverride, honoured by rollWithModifiers().
      // WARNING: this label is matched by consumeVoidOneRollEffects()'s regex below. Renaming
      // it without updating that regex stops the effect being consumed after the roll, so it
      // would silently carry over to the player's NEXT roll. The wording the player actually
      // reads lives on VOID_SPEND_LIBRARY's `label`, which is free to change; this one is not.
      out.push({ source:'void', label:'Void: +1 Skill', rolledDelta:1, keptDelta:0,
                 explodeOverride:true,
                 note:'now a Rank 1 Skilled roll, so 10s explode' });
    }
    if(ctx.kind === ROLL_KINDS.INITIATIVE && getVoidInitiativeBonus()){
      out.push({ source:'void', label:'Void: +' + VOID_EFFECT_VALUES.initiativeBonus + ' Initiative',
                 totalDelta: VOID_EFFECT_VALUES.initiativeBonus });
    }
    return out.length ? out : null;
  }
  registerPreRollModifier('void', 50, voidPreRollModifiers);
  // Called by rollWithModifiers once a roll has actually happened. One-roll Void effects are spent
  // by that roll and by nothing else -- a cancelled roll never reaches this, so the Void survives.
  function consumeVoidOneRollEffects(adj){
    if(!adj || !adj.applied || !adj.applied.length) return false;
    // Matches the modifier LABELS set in voidPreRollModifiers() above -- see the warning there
    // before renaming either of them.
    const usedOneRoll = adj.applied.some(m =>
      m.source === 'void' && /Void: \+1(k1| Skill)/.test(m.label));
    if(!usedOneRoll) return false;
    setVoidPending(clearOneRollVoidPending(getVoidPending()));
    return true;
  }

  // ---- UI ------------------------------------------------------------------------------------
  function renderVoidPanel(){
    const wrap = document.getElementById('voidSpendButtons');
    if(!wrap) return;
    const points = getVoidPoints();
    wrap.innerHTML = VOID_SPEND_LIBRARY.map(o=>{
      const check = canSpendVoid(o.key);
      return '<button type="button" class="void-spend-btn" data-void="' + escAttr(o.key) + '"' +
        (check.ok ? '' : ' disabled title="' + escAttr(check.reason) + '"') +
        '>Spend Void: ' + escHtml(o.label) + '</button>';
    }).join('');
    wrap.querySelectorAll('.void-spend-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if(btn.dataset.void === 'damage'){ toggleVoidDamageRow(true); return; }
        spendVoid(btn.dataset.void);
      });
    });
    const toggle = document.getElementById('combatActiveToggle');
    if(toggle){
      toggle.checked = isCombatActive();
      toggle.setAttribute('aria-checked', isCombatActive() ? 'true' : 'false');
    }
    // PART H PHASE 1.6: the reason every button is disabled now renders in its own line
    // ABOVE the button list (voidDisabledReason), not folded into voidPanelNote below all
    // seven of them where a player had to scroll past the buttons to find out why none of
    // them worked. canSpendVoid()'s own per-button disabled/title logic is untouched --
    // this is a second, blanket explanation for the common case where every button is
    // disabled for the same reason.
    const reasonEl = document.getElementById('voidDisabledReason');
    if(reasonEl){
      reasonEl.textContent = !isCombatActive() ? 'out of combat — combat-only options disabled'
        : hasSpentThisRound('void') ? 'Void already spent this Round'
        : '';
    }
    const note = document.getElementById('voidPanelNote');
    if(note){
      const bits = [];
      bits.push(points + ' Void Point' + (points === 1 ? '' : 's') + ' remaining');
      const pending = getVoidPending();
      const active = [];
      if(pending.k1) active.push('+1k1');
      if(pending.skill) active.push('+1 Skill');
      if(active.length) bits.push('next roll: ' + active.join(', '));
      if(getVoidArmorTNBonus()) bits.push('Armor TN +' + getVoidArmorTNBonus() + ' this round');
      if(getVoidInitiativeBonus()) bits.push('Initiative +' + getVoidInitiativeBonus() + ' this round');
      note.textContent = bits.join(' · ');
    }
  }
  function toggleVoidDamageRow(show){
    const row = document.getElementById('voidDamageRow');
    if(!row) return;
    row.style.display = show ? 'flex' : 'none';
    if(show){ const i = document.getElementById('voidDamageInput'); if(i){ i.value=''; i.focus(); } }
  }
  // ============ END PART C FEATURE 4 ============
