  // ============ PART C PREREQUISITE P1: COMBAT ROUND CONTEXT ============
  // Three later features need to know "which Round is it" and "what has already been spent this
  // Round": Stances (persistence + Center's "on the round following"), Void Points (RAW: "a
  // character may normally only spend one Void Point per Round"), and School Techniques ("once
  // per Round / once per encounter"). Implementing that three times guarantees divergence, so it
  // lives here once.
  //
  // STATE: two hidden inputs, deliberately WITHOUT the "f_" prefix, because collectData()
  // serialises every [id^="f_"] element and is frozen. Combat state is therefore transient and
  // the feature is removable with no save migration, exactly like Feature 0's re-roll flag.
  const COMBAT_ROUND_DEFAULTS = Object.freeze({
    startRound: 1,
    historyLimit: 20,   // keep the last N rounds of ledger; Center only needs 1, techniques may want more
  });
  function combatRoundEl(){ return document.getElementById('combatRoundNumber'); }
  function combatLedgerEl(){ return document.getElementById('combatRoundLedger'); }
  function getCombatRound(){
    const el = combatRoundEl();
    const n = el ? parseInt(el.value, 10) : NaN;
    return (isNaN(n) || n < 1) ? COMBAT_ROUND_DEFAULTS.startRound : n;
  }
  function setCombatRound(n){
    const el = combatRoundEl();
    if(el) el.value = Math.max(1, parseInt(n, 10) || COMBAT_ROUND_DEFAULTS.startRound);
    renderCombatRoundUI();
  }
  // Ledger shape: { "<roundNumber>": { "<key>": <value> } }. Keyed by round (not just "current")
  // so Center's next-round bonus and any technique history can look backwards.
  function getRoundLedger(){
    const el = combatLedgerEl();
    if(!el || !el.value) return {};
    try { const o = JSON.parse(el.value); return (o && typeof o === 'object') ? o : {}; }
    catch(e){ return {}; }
  }
  function saveRoundLedger(ledger){
    const el = combatLedgerEl();
    if(!el) return;
    // Trim to the most recent N rounds so a long skirmish cannot grow this unbounded.
    const rounds = Object.keys(ledger).map(Number).filter(n=>!isNaN(n)).sort((a,b)=>a-b);
    while(rounds.length > COMBAT_ROUND_DEFAULTS.historyLimit){ delete ledger[rounds.shift()]; }
    el.value = JSON.stringify(ledger);
  }
  function getRoundSpend(key, round){
    const r = (round === undefined || round === null) ? getCombatRound() : round;
    const entry = getRoundLedger()[String(r)];
    return entry ? entry[key] : undefined;
  }
  function hasSpentThisRound(key, round){ return getRoundSpend(key, round) !== undefined; }
  function recordRoundSpend(key, value, round){
    const r = (round === undefined || round === null) ? getCombatRound() : round;
    const ledger = getRoundLedger();
    if(!ledger[String(r)]) ledger[String(r)] = {};
    ledger[String(r)][key] = (value === undefined) ? true : value;
    saveRoundLedger(ledger);
    renderCombatRoundUI();
  }
  function clearRoundSpend(key, round){
    const r = (round === undefined || round === null) ? getCombatRound() : round;
    const ledger = getRoundLedger();
    if(ledger[String(r)]){ delete ledger[String(r)][key]; saveRoundLedger(ledger); renderCombatRoundUI(); }
  }
  function advanceCombatRound(){ setCombatRound(getCombatRound() + 1); return getCombatRound(); }
  function resetCombatRound(){
    const el = combatLedgerEl();
    if(el) el.value = '{}';
    setCombatRound(COMBAT_ROUND_DEFAULTS.startRound);
    return getCombatRound();
  }
  function renderCombatRoundUI(){
    const label = document.getElementById('combatRoundLabel');
    if(label) label.textContent = 'Round ' + getCombatRound();
    const note = document.getElementById('combatRoundNote');
    if(note){
      const spent = getRoundLedger()[String(getCombatRound())] || {};
      const keys = Object.keys(spent);
      note.textContent = keys.length
        ? 'This round: ' + keys.map(k=>k + (spent[k]===true ? '' : ' (' + spent[k] + ')')).join(', ')
        : 'Nothing spent this round.';
    }
  }
  // ============ END P1 ============

  // ============ PART C PREREQUISITE P2: PRE-ROLL MODIFIER PIPELINE ============
  // WHY THIS EXISTS. Feature 0 could be a post-render decorator because re-rolling operates on
  // dice that already exist. Adding dice cannot work that way, because of the Ten Dice Rule:
  //
  //   Kenjutsu 7 + Agility 3 in Full Attack  ->  10k3 raw, +2k1  ->  12k4  ->  RULE  ->  10k4 +2
  //   Post-render "bolt two dice on"         ->  10k3 rendered, then 12k4, rule NEVER applied
  //
  // RAW agrees: a Void Point "must be declared prior to the roll being made". So dice-pool
  // modifiers have to be resolved BEFORE rollDicePool() sees the pool.
  //
  // NOTHING FROZEN IS TOUCHED. rollDicePool(), rollExplodingD10() and showRollResult() are called
  // exactly as before; the pipeline lives in the ORCHESTRATION WRAPPERS, which were never frozen
  // and are already where Feature 0's hook sits.
  //
  // TWO KINDS OF MODIFIER, deliberately distinguished:
  //   * dice modifiers  (rolledDelta / keptDelta) — resolved pre-roll, so the Ten Dice Rule sees
  //     the true raw pool. Full Attack +2k1, Void +1k1, Center +1k1+Void, bow range -1k0.
  //   * total modifiers (totalDelta) — a flat adjustment to the roll's total. Wound penalties,
  //     firing into melee -10.
  //
  // HOW totalDelta REACHES THE TOTAL. updateRollKeepState() recomputes the displayed total as
  // (sum of kept dice + currentRollBonus) on EVERY die click, and currentRollBonus is set by
  // showRollResult() from result.bonus. A post-render tweak to the total would therefore be
  // wiped by the next click. Folding totalDelta into result.bonus is the only place it survives.
  // The side effect is that showRollResult()'s hard-coded "Ten Dice Rule bonus: +N" note becomes
  // inaccurate whenever a non-Ten-Dice modifier is present, so attachRollModifierBreakdown()
  // hides that one note and renders an honest itemised breakdown in its place. That is DOM
  // decoration after the fact — showRollResult() itself is untouched.
  //
  // REGISTRY. Each later feature registers its own contributor and never edits this pipeline.
  // With an EMPTY registry the pipeline is a mathematical no-op and every roll is byte-identical
  // to Part B / Feature 0 — which is what makes the regression gate meaningful.
  const PREROLL_MODIFIER_REGISTRY = [];
  // Lower priority runs first. Only affects the order modifiers are listed and summed; addition
  // is commutative, so this is purely for a readable breakdown.
  function registerPreRollModifier(id, priority, fn){
    if(typeof fn !== 'function') return false;
    const existing = PREROLL_MODIFIER_REGISTRY.findIndex(m => m.id === id);
    const entry = { id, priority: priority || 0, fn };
    if(existing >= 0) PREROLL_MODIFIER_REGISTRY[existing] = entry;
    else PREROLL_MODIFIER_REGISTRY.push(entry);
    PREROLL_MODIFIER_REGISTRY.sort((a,b)=>a.priority - b.priority);
    return true;
  }
  function unregisterPreRollModifier(id){
    const i = PREROLL_MODIFIER_REGISTRY.findIndex(m => m.id === id);
    if(i >= 0){ PREROLL_MODIFIER_REGISTRY.splice(i, 1); return true; }
    return false;
  }
  // A roll context. `kind` is what modifiers filter on, and is the mechanism by which negative
  // scope rules ("wounds never affect damage rolls") are enforced in one place rather than
  // re-litigated per feature.
  const ROLL_KINDS = Object.freeze({
    SKILL:'skill', ATTACK:'attack', DAMAGE:'damage', SPELL:'spell',
    TRAIT:'trait', RING:'ring', INITIATIVE:'initiative', MANUAL:'manual',
  });
  function makeRollContext(kind, extra){
    return Object.assign({ kind, round: getCombatRound() }, extra || {});
  }
  // Pure: asks every registered contributor for its modifiers, drops empty ones, returns a flat
  // list. A contributor returning null/undefined/[] contributes nothing. A contributor that
  // throws is skipped rather than breaking the roll.
  function getPreRollModifiers(context){
    const out = [];
    PREROLL_MODIFIER_REGISTRY.forEach(m=>{
      let mods;
      try { mods = m.fn(context); }
      catch(e){ return; }
      if(!mods) return;
      (Array.isArray(mods) ? mods : [mods]).forEach(mod=>{
        if(!mod) return;
        // PART C FEATURE 6 - an INFORMATIONAL modifier documents where a number in the pool
        // came from without changing it (a bow's damage pool already contains the arrow's DR).
        // Its three deltas are forced to zero right here, so no informational contributor can
        // move a die whatever it returns, and applyPreRollModifiers() needs no new case at all.
        const informational = !!mod.informational;
        const norm = {
          source: mod.source || m.id,
          label: mod.label || m.id,
          rolledDelta: informational ? 0 : (parseInt(mod.rolledDelta, 10) || 0),
          keptDelta: informational ? 0 : (parseInt(mod.keptDelta, 10) || 0),
          totalDelta: informational ? 0 : (parseInt(mod.totalDelta, 10) || 0),
          note: mod.note || '',
          // PART C FEATURE 4 - a modifier may also force exploding dice on (Void's +1 Skill Rank
          // lifts the Unskilled penalty). undefined means "do not care", which is the default.
          explodeOverride: (mod.explodeOverride === undefined) ? undefined : !!mod.explodeOverride,
          informational,
          // PART C FEATURE 6 - what the breakdown bar prints when there is no delta to print.
          display: mod.display || '',
        };
        if(norm.rolledDelta || norm.keptDelta || norm.totalDelta ||
           norm.explodeOverride !== undefined || norm.informational) out.push(norm);
      });
    });
    return out;
  }
  // Pure: folds a modifier list onto a base pool. Never returns a pool below 0k0.
  function applyPreRollModifiers(baseRolled, baseKept, mods){
    let rolled = Math.max(0, parseInt(baseRolled, 10) || 0);
    let kept = Math.max(0, parseInt(baseKept, 10) || 0);
    let totalDelta = 0;
    let explodeOverride;                          // PART C FEATURE 4 - last explicit wins
    (mods || []).forEach(m=>{
      rolled += m.rolledDelta; kept += m.keptDelta; totalDelta += m.totalDelta;
      if(m.explodeOverride !== undefined) explodeOverride = m.explodeOverride;
    });
    rolled = Math.max(0, rolled);
    kept = Math.max(0, Math.min(kept, rolled));   // can never keep more dice than are rolled
    return { rolled, kept, totalDelta, explodeOverride, applied: (mods || []).slice() };
  }
  // Orchestration. Thin: resolve modifiers, adjust the pool, hand off to the FROZEN dice engine,
  // hand the result to the FROZEN modal, then decorate. Returns everything a caller needs to
  // chain further decorators (Feature 0 needs the final kept count for its keep-suggestion).
  async function rollWithModifiers(title, context, baseRolled, baseKept, opts){
    opts = opts || {};
    // PART G PHASE 3 - the preview gate. Guarded, so deleting 208-feat-roll-preview.js leaves
    // every roll firing immediately exactly as it did before that phase. Returning null means
    // the player cancelled: the two callers that read this function's result treat null as
    // "no roll happened", the same contract a cancelled range prompt already had.
    // Awaiting here is what makes this function async. That costs nothing if this phase is
    // removed later -- `await` on a plain object is a no-op, so the two `await` call sites stay
    // correct against a synchronous rollWithModifiers().
    if(typeof rollPreviewGate === 'function'){
      const proceed = await rollPreviewGate({ title, context, baseRolled, baseKept, opts });
      if(!proceed) return null;
    }
    // Resolved AFTER the gate on purpose: the player may have armed a Void effect inside the
    // preview, and these two lines are what read it.
    const mods = getPreRollModifiers(context);
    const adj = applyPreRollModifiers(baseRolled, baseKept, mods);
    // PART C FEATURE 4 - a modifier may override the caller's explode setting (Void's +1 Skill
    // Rank lifting the Unskilled penalty). Absent an override the caller's own value is used.
    const explodeSetting = (adj.explodeOverride === undefined) ? opts.explode : adj.explodeOverride;
    const result = opts.explodeOn
      ? rollWeaponDicePool(adj.rolled, adj.kept, opts.explodeOn)
      : rollDicePool(adj.rolled, adj.kept, explodeSetting);
    // Fold the flat modifier into `bonus` so it survives every die click (see block comment).
    const composed = (adj.totalDelta === 0)
      ? result
      : Object.assign({}, result, {
          bonus: result.bonus + adj.totalDelta,
          total: result.total + adj.totalDelta,
        });
    showRollResult(title, composed, opts.tnConfig);
    // PART G PHASE 4 - the context and the pre-modifier pool travel through so the breakdown
    // can lead with where the base pool came from, not just what was added to it.
    attachRollModifierBreakdown(adj, result.bonus, context, baseRolled, baseKept);
    // PART C FEATURE 4 - one-roll Void effects are spent by the roll that just happened. This is
    // the only place every roll kind passes through, which is why the consumption lives here
    // rather than in each orchestrator. Guarded so P2 stays usable without Feature 4.
    if(typeof consumeVoidOneRollEffects === 'function') consumeVoidOneRollEffects(adj);
    return {
      result: composed, adj, mods,
      finalRolled: adj.rolled, finalKept: adj.kept,
      tenDiceBonus: result.bonus, totalDelta: adj.totalDelta,
    };
  }
  // Post-render honesty pass.
  // PART G PHASE 4 - the two extra arguments are optional: called with two, this behaves
  // exactly as it did before that phase (Feature 6's damage decorator still calls it that way).
  function attachRollModifierBreakdown(adj, tenDiceBonus, context, baseRolled, baseKept){
    const hasMods = !!(adj && adj.applied && adj.applied.length);
    // PART G PHASE 4 - the base-pool rows, when that phase is present and the caller declared
    // enough for it to speak. Guarded, so deleting its fragment leaves an empty list and the
    // pre-Phase-4 behaviour below.
    const baseRows = (typeof buildRollBasePoolRows === 'function')
      ? buildRollBasePoolRows(context, baseRolled, baseKept)
      : [];
    // Before Phase 4 there was nothing to say without a modifier. There is now: "why is this
    // 5k3" is worth answering on a roll nothing modified at all.
    if(!hasMods && !baseRows.length) return null;
    const body = document.getElementById('rollModalBody');
    const diceRow = document.getElementById('rollDiceRow');
    if(!body || !diceRow) return null;
    // showRollResult() hard-codes "Ten Dice Rule bonus: +N". Once totalDelta has been folded into
    // `bonus` that label is wrong, so hide that ONE note and replace it with an itemised list.
    if(hasMods && adj.totalDelta !== 0){
      Array.from(body.querySelectorAll('.roll-note')).forEach(el=>{
        if(/^Ten Dice Rule bonus:/.test((el.textContent||'').trim())) el.style.display = 'none';
      });
    }
    const bar = document.createElement('div');
    bar.className = 'roll-mod-bar';
    bar.id = 'rollModifierBar';
    // PART G PHASE 4 - Phase 3 built buildRollModifierRows() as the one renderer for exactly
    // this data, and until now this function kept a verbatim copy of it. It calls the shared
    // one when present, so the preview and the result cannot drift apart, and falls back to the
    // copy below when Phase 3 is absent. That fallback is why this is a soft dependency rather
    // than a hard one -- both directions are declared in both phases' ROLLBACK.md.
    let rows;
    if(hasMods && typeof buildRollModifierRows === 'function'){
      rows = buildRollModifierRows(adj, tenDiceBonus);
    } else if(hasMods){
      rows = [];
      if(tenDiceBonus) rows.push({ label:'Ten Dice Rule', txt:'+' + tenDiceBonus + ' to total' });
      adj.applied.forEach(m=>{
        const bits = [];
        if(m.rolledDelta || m.keptDelta){
          bits.push((m.rolledDelta >= 0 ? '+' : '') + m.rolledDelta + 'k' + (m.keptDelta >= 0 ? '' : '') + m.keptDelta);
        }
        if(m.totalDelta) bits.push((m.totalDelta >= 0 ? '+' : '') + m.totalDelta + ' to total');
        // PART C FEATURE 6 - an informational modifier has no delta to print, so it prints itself.
        if(!bits.length && m.display) bits.push(m.display);
        rows.push({ label:m.label, txt:bits.join(', ') + (m.note ? ' — ' + m.note : '') });
      });
    } else {
      rows = [];
    }
    const net = (tenDiceBonus || 0) + (hasMods ? adj.totalDelta : 0);
    const renderRows = (list) => list.map(r=>
      '<span class="roll-mod-item"><b>' + escHtml(r.label) + ':</b> ' + escHtml(r.txt) + '</span>').join('');
    // PART G PHASE 4 - two labelled groups in one bar: where the pool came from, then what
    // moved it. The modifier group keeps its original title and markup exactly, so a build
    // without Phase 4 renders byte-for-byte what it always did.
    //
    // "Base pool", not "Pool": these rows describe the pool BEFORE any modifier, and a modifier
    // can leave one of them no longer true of the roll that actually happens -- an Unskilled
    // row sitting above a Void spend that lifted the Unskilled penalty, most visibly. Naming
    // the group for the starting state resolves that without either group having to know
    // anything about the other, which a "this row was superseded" marking would have required.
    // It also matches the "base 4k3" already shown beside the final pool, so "base" means the
    // same thing everywhere in this UI.
    bar.innerHTML =
      (baseRows.length
        ? '<span class="roll-mod-title">Base pool</span>' + renderRows(baseRows)
        : '') +
      (rows.length
        ? '<span class="roll-mod-title">Roll modifiers</span>' + renderRows(rows)
        : '') +
      (net ? '<span class="roll-mod-net">Net ' + (net >= 0 ? '+' : '') + net + ' — already included in the total</span>' : '');
    body.insertBefore(bar, diceRow);
    return bar;
  }
  // ============ END P2 ============
