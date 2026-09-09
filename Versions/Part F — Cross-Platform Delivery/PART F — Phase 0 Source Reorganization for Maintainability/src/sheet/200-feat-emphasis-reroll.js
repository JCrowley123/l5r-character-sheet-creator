  // ================= PART C FEATURE 0: EMPHASIS RE-ROLL =================
  // RAW: "When making a Skill Roll, if the character has an Emphasis that applies to the
  // situation requiring the roll, he may immediately re-roll any dice that result in a 1.
  // This may only be done once per roll." The rulebook's worked example (Kenjutsu (Katana) 3,
  // Agility 2, rolling 5k2) makes the details explicit: BOTH 1s are re-rolled in a single
  // action, the re-roll that comes up 1 again STANDS, and the player then keeps the best dice.
  //
  // Encoded consequences:
  //   * ANY NUMBER of dice showing 1 may be re-rolled, and WHICH of them is the player's choice.
  //   * The whole thing is ONE once-per-roll action, not one action per die.
  //   * A re-rolled die showing 1 is never re-rolled again.
  //   * A re-rolled die is a fresh die, so a 10 explodes normally.
  //
  // SCOPE — an Emphasis modifies a SKILL ROLL. A damage roll is not a Skill Roll, so the
  // control is deliberately NOT offered on weapon damage rolls, Spell Casting Rolls, the
  // manual dice tray, or Unskilled rolls (an Emphasis cannot be owned at Rank 0).
  //
  // ARCHITECTURE — POST-RENDER DECORATOR. showRollResult() runs completely untouched and
  // paints the modal; attachEmphasisReroll() then injects its control into the already-
  // rendered body, mutates die elements in place, and calls the existing updateRollKeepState()
  // to recompute the total, the keep-note and the TN pass/fail readout. rollDicePool(),
  // rollExplodingD10() and showRollResult() are not modified, called differently, or wrapped.
  // This is the same isolation pattern Part B used for rollWeaponDicePool().

  // ---- BUILD MODE — the ONLY line that differs between Version A and Version B ----------
  // false = VERSION A (Unconditional): a generic Skill Roll always offers the re-roll when the
  //         skill has any owned Emphasis. The control names them; the player judges relevance.
  // true  = VERSION B (Require Selection): a generic Skill Roll first requires the player to
  //         pick WHICH owned Emphasis applies. The re-roll control unlocks only after that.
  // Weapon attack rolls ignore this flag entirely: the wielded weapon resolves the Emphasis
  // unambiguously (see findMatchingEmphasis), so there is nothing to disambiguate.
  const EMPHASIS_REQUIRE_SELECTION = false;

  // ---- Step 1: documented match strategy ------------------------------------------------
  // Weapon names in WEAPON_LIBRARY were deliberately spelled to match the Emphasis lists in
  // SKILL_LIBRARY, so `exact` resolves 40 of 48 weapons on its own. `baseName` exists for the
  // parenthetical variants the equipment tables print as one entry but the sheet splits into
  // two rows (Sang Kauw (Crescent Blade) / (Shield) -> the single "Sang Kauw" Emphasis).
  // Anything still unresolved returns null, which is the RULES-CORRECT answer for weapons that
  // genuinely have no Emphasis: Nunchaku is absent from the Staves list, neither Nageteppo is a
  // Ninjutsu Emphasis, and Unarmed is not one of Jiujutsu's. Two skills (War Fan, Cannon) print
  // no Emphasis list at all. Audit: 40 exact / 2 baseName / 4 unmatched / 2 no-list.
  const EMPHASIS_MATCH_STRATEGY = Object.freeze({
    order: ['exact','baseName'],
    exact: name => normaliseEmphasisName(name),
    baseName: name => normaliseEmphasisName(name).replace(/\s*\([^)]*\)\s*$/, ''),
  });

  // ---- Step 2: pure lookup functions ----------------------------------------------------
  function normaliseEmphasisName(s){
    return String(s === null || s === undefined ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');
  }
  // Every Emphasis the character actually owns for a skill, read straight off the Skill rows
  // (DOM-as-model), de-duplicated. Reuses the existing getEmphValues() so it sees <select> and
  // free-text Emphasis widgets identically.
  function getOwnedEmphases(skillName){
    if(!skillName) return [];
    const target = normaliseEmphasisName(skillName);
    const out = [];
    document.querySelectorAll('#skillsBody tr').forEach(tr=>{
      const nameEl = tr.querySelector('.sk-name');
      if(!nameEl || normaliseEmphasisName(nameEl.value) !== target) return;
      getEmphValues(tr).forEach(v=>{
        if(v && !out.some(x => normaliseEmphasisName(x) === normaliseEmphasisName(v))) out.push(v);
      });
    });
    return out;
  }
  // Does the character own an Emphasis that covers THIS weapon? Exact first, then base-name.
  function findMatchingEmphasis(weaponEntry, skillName){
    if(!weaponEntry) return null;
    const skill = skillName || weaponEntry.skill || '';
    const owned = getOwnedEmphases(skill);
    if(!owned.length) return null;
    const wName = weaponEntry.name || '';
    for(let i=0;i<EMPHASIS_MATCH_STRATEGY.order.length;i++){
      const key = EMPHASIS_MATCH_STRATEGY[EMPHASIS_MATCH_STRATEGY.order[i]];
      const hit = owned.find(o => key(o) && key(o) === key(wName));
      if(hit) return hit;
    }
    return null;
  }
  // Static-data-only audit of WEAPON_LIBRARY against the SKILL_LIBRARY Emphasis lists. Pure:
  // reads no character state. Exists so the harness can assert the 40/2/4/2 shape directly.
  function emphasisLibraryAudit(){
    const res = { exact:0, baseName:0, unmatched:0, noEmphasisList:0, detail:[] };
    WEAPON_LIBRARY.forEach(w=>{
      const opts = relevantEmphOptions(findSkill(w.skill));
      let kind;
      if(!opts.length) kind = 'noEmphasisList';
      else if(opts.some(o => EMPHASIS_MATCH_STRATEGY.exact(o) === EMPHASIS_MATCH_STRATEGY.exact(w.name))) kind = 'exact';
      else if(opts.some(o => EMPHASIS_MATCH_STRATEGY.baseName(o) === EMPHASIS_MATCH_STRATEGY.baseName(w.name))) kind = 'baseName';
      else kind = 'unmatched';
      res[kind]++;
      res.detail.push({ weapon:w.name, skill:w.skill, kind });
    });
    return res;
  }
  // Context for a generic Skills-tab roll. The sheet cannot judge whether an Emphasis "applies
  // to the situation", so Version A hands that judgement to the player and Version B makes them
  // name it. Rank 0 never qualifies: you cannot buy an Emphasis below Rank 1.
  function skillRollEmphasisContext(skillName, rankOverride, keepDice){
    const rank = (rankOverride === undefined || rankOverride === null)
      ? getCharacterSkillRank(skillName)
      : (parseInt(rankOverride, 10) || 0);
    const owned = rank > 0 ? getOwnedEmphases(skillName) : [];
    return {
      source: 'skill',
      skillName: skillName || '',
      skillRank: rank,
      owned,
      hasEmphasis: rank > 0 && owned.length > 0,
      // Version A auto-resolves a single owned Emphasis for display; Version B always asks.
      emphasisName: (!EMPHASIS_REQUIRE_SELECTION && owned.length === 1) ? owned[0] : null,
      requiresSelection: EMPHASIS_REQUIRE_SELECTION && rank > 0 && owned.length > 0,
      keepDice: keepDice,
      explodeOn: null, // attack/skill rolls always use the ordinary explode-on-10
    };
  }
  // Context for a Part B weapon attack. Unambiguous, so it never requires selection.
  function weaponAttackEmphasisContext(weaponEntry, skillName, keepDice){
    const skill = skillName || (weaponEntry && weaponEntry.skill) || '';
    const rank = getCharacterSkillRank(skill);
    const matched = rank > 0 ? findMatchingEmphasis(weaponEntry, skill) : null;
    return {
      source: 'weapon',
      skillName: skill,
      skillRank: rank,
      owned: rank > 0 ? getOwnedEmphases(skill) : [],
      hasEmphasis: !!matched,
      emphasisName: matched,
      requiresSelection: false,
      keepDice: keepDice,
      explodeOn: null,
    };
  }

  // ---- Step 3: pure re-roll engine ------------------------------------------------------
  // A private exploding-die generator with an INJECTABLE rng, so rerollEmphasisDice() is
  // deterministic under test. It deliberately does NOT call rollExplodingD10() or
  // rollExplodingD10At(): both are frozen (dice engine / Part B), neither accepts an rng, and
  // adding a parameter to either would modify code this feature is not allowed to touch.
  function emphasisRollOneDie(explodeOn, rng){
    const rand = (typeof rng === 'function') ? rng : Math.random;
    const explodeAt = (explodeOn === null || explodeOn === undefined) ? 10 : Math.max(2, Math.min(10, explodeOn));
    let total = 0, chain = [], r;
    do {
      r = 1 + Math.floor(rand() * 10);
      chain.push(r);
      total += r;
    } while (r >= explodeAt);
    return { total, chain };
  }
  // Returns a NEW array; never mutates the input. Only entries whose index was selected AND
  // whose total is exactly 1 are replaced — anything else is passed through by identity, which
  // is what makes "a re-rolled 1 stands" fall out for free: the replacement is not re-examined.
  function rerollEmphasisDice(sortedDice, indicesToReroll, explodeOn, rng){
    const src = Array.isArray(sortedDice) ? sortedDice : [];
    const want = new Set((indicesToReroll || []).map(i => parseInt(i, 10)).filter(i => !isNaN(i)));
    return src.map((die, i) => {
      if(!want.has(i)) return die;
      if(!die || die.total !== 1) return die;
      const fresh = emphasisRollOneDie(explodeOn, rng);
      return { total: fresh.total, chain: fresh.chain, rerolledFrom: 1 };
    });
  }

  // ---- Step 4: once-per-roll flag -------------------------------------------------------
  // Hidden input, per the sheet's DOM-as-model convention. DELIBERATELY NOT named with the
  // "f_" prefix: collectData() serialises every [id^="f_"] element, so an f_-prefixed id would
  // add a key to the save file and break this feature's "save/load byte-identical to Part B"
  // requirement. This is transient per-roll state and is never persisted.
  function emphasisRerollFlagEl(){ return document.getElementById('emphasisRerollUsed'); }
  function isEmphasisRerollUsed(){ const el = emphasisRerollFlagEl(); return !!el && el.value === '1'; }
  function setEmphasisRerollUsed(used){ const el = emphasisRerollFlagEl(); if(el) el.value = used ? '1' : '0'; }

  // Re-applies the modal's own "pre-select the top N" starting point after dice have changed,
  // matching what showRollResult() does on first render. Reads and writes only DOM classes.
  function applyTopNKeepSuggestion(keepDice){
    const diceRow = document.getElementById('rollDiceRow');
    if(!diceRow) return;
    const dice = Array.from(diceRow.querySelectorAll('.roll-die'));
    const n = Math.max(0, parseInt(keepDice, 10) || 0);
    const ranked = dice.slice().sort((a,b)=>parseInt(b.dataset.total,10) - parseInt(a.dataset.total,10));
    const keep = new Set(ranked.slice(0, n));
    dice.forEach(el => el.classList.toggle('kept', keep.has(el)));
  }

  // ---- Step 5: the decorator ------------------------------------------------------------
  let emphasisRerollMode = false;
  function attachEmphasisReroll(ctx){
    ctx = ctx || {};
    // Every call is a NEW roll: showRollResult() has just rebuilt #rollModalBody, so the
    // previous bar and its listeners are already gone with it. Reset the once-per-roll flag.
    setEmphasisRerollUsed(false);
    emphasisRerollMode = false;
    const body = document.getElementById('rollModalBody');
    const diceRow = document.getElementById('rollDiceRow');
    if(!body || !diceRow) return null;
    if(!ctx.hasEmphasis) return null;
    if(!diceRow.querySelector('.roll-die')) return null;

    let chosen = ctx.emphasisName || null;
    const owned = ctx.owned || [];
    const bar = document.createElement('div');
    bar.className = 'emph-reroll-bar';
    bar.id = 'emphasisRerollBar';
    body.insertBefore(bar, diceRow.nextSibling);

    const eligibleDice = () => Array.from(diceRow.querySelectorAll('.roll-die'))
      .filter(el => el.dataset.total === '1' && el.dataset.emphRerolled !== '1');
    const selectedDice = () => Array.from(diceRow.querySelectorAll('.roll-die.emph-selected'));

    function labelText(){
      if(chosen) return 'Emphasis (' + chosen + ')';
      if(owned.length) return 'Emphasis (' + owned.join(', ') + ')';
      return 'Emphasis';
    }
    function enterMode(){
      if(isEmphasisRerollUsed()) return false;
      if(ctx.requiresSelection && !chosen) return false;
      if(!eligibleDice().length) return false;
      emphasisRerollMode = true;
      diceRow.classList.add('emph-reroll-mode');
      eligibleDice().forEach(el => el.classList.add('emph-eligible'));
      render();
      return true;
    }
    function exitMode(){
      emphasisRerollMode = false;
      diceRow.classList.remove('emph-reroll-mode');
      diceRow.querySelectorAll('.roll-die').forEach(el => el.classList.remove('emph-eligible','emph-selected'));
    }
    function doCancel(){ exitMode(); render(); }
    function doConfirm(){
      if(isEmphasisRerollUsed()) return false;      // hard guard: once per roll, full stop
      const dice = Array.from(diceRow.querySelectorAll('.roll-die'));
      const indices = dice.map((el,i)=> el.classList.contains('emph-selected') ? i : -1).filter(i => i >= 0);
      if(!indices.length) return false;
      const model = dice.map(el => ({
        total: parseInt(el.dataset.total, 10),
        chain: (el.dataset.chain || el.dataset.total || '').split(',').map(Number),
      }));
      const next = rerollEmphasisDice(model, indices, ctx.explodeOn);
      dice.forEach((el, i) => {
        const d = next[i];
        if(!d || d.rerolledFrom === undefined) return;
        el.dataset.total = d.total;
        el.dataset.chain = d.chain.join(',');
        el.dataset.emphRerolled = '1';
        el.classList.add('emph-rerolled');
        const chainNote = d.chain.length > 1 ? '<span class="chain">' + d.chain.join('→') + '</span>' : '';
        el.innerHTML = d.total + chainNote + '<span class="emph-history" title="Re-rolled from 1">1→' + d.total + '</span>';
      });
      setEmphasisRerollUsed(true);
      exitMode();
      applyTopNKeepSuggestion(ctx.keepDice);
      updateRollKeepState(ctx.keepDice);   // existing function: total, keep-note, TN pass/fail
      render();
      return true;
    }
    function render(){
      if(isEmphasisRerollUsed()){
        bar.innerHTML = '<span class="emph-reroll-label">' + escHtml(labelText()) + '</span>' +
          '<span class="emph-reroll-note">Emphasis re-roll used — once per roll.</span>';
        return;
      }
      if(emphasisRerollMode){
        const n = selectedDice().length, elig = eligibleDice().length;
        bar.innerHTML =
          '<span class="emph-reroll-label">' + escHtml(labelText()) + '</span>' +
          '<span class="emph-reroll-note">Click the dice showing 1 that you want to re-roll. Selected ' + n + ' of ' + elig + '.</span>' +
          '<button type="button" class="ghost" id="emphasisRerollConfirm"' + (n ? '' : ' disabled') + '>Re-roll selected</button>' +
          '<button type="button" class="ghost" id="emphasisRerollCancel">Cancel</button>';
        bar.querySelector('#emphasisRerollConfirm').addEventListener('click', doConfirm);
        bar.querySelector('#emphasisRerollCancel').addEventListener('click', doCancel);
        return;
      }
      const elig = eligibleDice().length;
      let pickHtml = '';
      if(ctx.requiresSelection){
        pickHtml = '<select id="emphasisRerollSelect" class="emph-reroll-select">' +
          '<option value="">— which Emphasis applies? —</option>' +
          owned.map(o => '<option value="' + escAttr(o) + '"' + (o === chosen ? ' selected' : '') + '>' + escHtml(o) + '</option>').join('') +
          '</select>';
      }
      const canStart = elig > 0 && (!ctx.requiresSelection || !!chosen);
      const why = elig === 0
        ? 'No dice showing 1 — nothing to re-roll.'
        : (ctx.requiresSelection && !chosen
            ? 'Select which Emphasis applies to this roll.'
            : elig + (elig === 1 ? ' die' : ' dice') + ' showing 1.');
      bar.innerHTML =
        '<span class="emph-reroll-label">' + escHtml(labelText()) + '</span>' + pickHtml +
        '<button type="button" class="ghost" id="emphasisRerollBtn"' + (canStart ? '' : ' disabled') + '>Re-roll 1s</button>' +
        '<span class="emph-reroll-note">' + escHtml(why) + '</span>';
      const sel = bar.querySelector('#emphasisRerollSelect');
      if(sel) sel.addEventListener('change', ()=>{ chosen = sel.value || null; render(); });
      const btn = bar.querySelector('#emphasisRerollBtn');
      if(btn) btn.addEventListener('click', enterMode);
    }

    // Capture-phase listener on the dice row. While re-roll selection is active it swallows the
    // click BEFORE it reaches the per-die keep handler showRollResult() attached, which is how
    // normal keep-clicking is suspended without touching (or removing) that handler.
    diceRow.addEventListener('click', function(e){
      if(!emphasisRerollMode) return;
      e.stopPropagation();
      e.preventDefault();
      const die = e.target && e.target.closest ? e.target.closest('.roll-die') : null;
      if(!die || !diceRow.contains(die)) return;
      if(die.dataset.total !== '1' || die.dataset.emphRerolled === '1') return;
      die.classList.toggle('emph-selected');
      render();
    }, true);

    render();
    // Programmatic handle for the automated harness (and nothing else) to drive the flow
    // without synthesising pointer events.
    bar.__emphasisApi = {
      enterMode, exitMode, doCancel, doConfirm, render,
      eligibleDice, selectedDice,
      getChosen: ()=>chosen,
      setChosen: v => { chosen = v || null; render(); },
      ctx,
    };
    return bar;
  }
  // ================= END PART C FEATURE 0 =================
