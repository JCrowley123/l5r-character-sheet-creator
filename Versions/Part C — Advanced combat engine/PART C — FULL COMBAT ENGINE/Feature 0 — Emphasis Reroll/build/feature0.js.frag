  // ================= PART C — FEATURE 0: EMPHASIS RE-ROLL =================
  // RAW: "When making a Skill Roll, if the character has an Emphasis that applies to the
  // situation requiring the roll, he may immediately re-roll any dice that result in a 1.
  // This may only be done once per roll." The PLAYER chooses which of the 1s to re-roll; a
  // die that comes up 1 on the re-roll stands and is never re-rolled again; re-rolled dice
  // are fresh exploding dice.
  //
  // SCOPE — Skill Rolls and weapon ATTACK rolls only. Explicitly NOT weapon Damage rolls
  // (a damage roll is not a Skill Roll), NOT Spell Casting Rolls, NOT the manual dice tray,
  // and NOT Unskilled rolls (Rank 0 — you cannot own an Emphasis you have no ranks in).
  //
  // ARCHITECTURE — post-render decorator. showRollResult() is fenced off and is never edited.
  //   1. showRollResult() runs untouched and paints the modal.
  //   2. attachEmphasisReroll() injects its own control bar into the rendered body.
  //   3. Confirming a re-roll mutates the affected die elements' data-total/text in place.
  //   4. updateRollKeepState() recomputes total, keep-note and TN pass/fail.
  // This works precisely because the modal is already DOM-as-model: updateRollKeepState()
  // derives every displayed number by READING data-total off the dice, so mutating the dice
  // is both necessary and sufficient. No engine function is touched.
  //
  // rollSkill() and rollWeaponAttack() are likewise NOT edited — their bindings are wrapped
  // at the bottom of this block, so both functions' source stays byte-identical to Part A/B.

  // Build marker. THIS IS THE ONLY LINE THAT DIFFERS between the Version A and Version B
  // builds of the sheet:
  //   'A' — generic Skill Rolls always offer the re-roll and list every owned Emphasis in
  //         the control text; the player decides whether one applies.
  //   'B' — generic Skill Rolls require the player to pick WHICH owned Emphasis applies from
  //         a dropdown first; the re-roll control only appears once a selection is confirmed.
  // Weapon attacks auto-detect the Emphasis from the weapon in both builds, so they are
  // byte-for-byte identical in behaviour regardless of this setting.
  const EMPHASIS_SELECTION_MODE = '__EMPHASIS_MODE__';

  // How a weapon name is matched against an Emphasis name. Documented as data rather than
  // buried in the matcher so the audit and the tests can cite the same contract.
  const EMPHASIS_MATCH_STRATEGY = Object.freeze({
    order: ['exact', 'base'],
    exact: 'Case-, whitespace- and punctuation-normalised equality of the full names.',
    base:  'Same comparison after stripping a trailing parenthetical qualifier, so "Sang Kauw (Shield)" resolves to "sang kauw".',
    fallback: null,
    audit: 'Against the published SKILL_LIBRARY emphasis lists this resolves 40 weapons exactly and 2 by base name. 4 weapons (Nunchaku, Nageteppo x2, Unarmed) have no corresponding Emphasis, and 2 Skills (War Fan, Cannon) publish no Emphasis list at all. All 6 are rules-correct "no Emphasis available" outcomes, not coverage gaps.',
  });

  // ---- pure lookup functions -------------------------------------------------------------
  function normaliseEmphasisName(s){
    return String(s === null || s === undefined ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');
  }
  // "Sang Kauw (Shield)" -> "sang kauw". Only a TRAILING parenthetical is stripped.
  function baseEmphasisName(s){
    return normaliseEmphasisName(s).replace(/\s*\([^)]*\)\s*$/, '');
  }
  // Every Emphasis the character actually OWNS for a Skill, read straight off the Skills
  // table (DOM-as-model). Deduplicated, original casing preserved for display. Returns []
  // for an unknown skill, which is the same "no Emphasis" answer as owning none.
  function getOwnedEmphases(skillName){
    const target = normaliseEmphasisName(skillName);
    if(!target) return [];
    const out = [], seen = new Set();
    document.querySelectorAll('#skillsBody tr').forEach(tr=>{
      const nameEl = tr.querySelector('.sk-name');
      if(!nameEl || normaliseEmphasisName(nameEl.value) !== target) return;
      tr.querySelectorAll('.emph-container .sk-emph-select, .emph-container .sk-emph-text').forEach(w=>{
        const v = (w.value || '').trim();
        if(!v) return;
        const k = normaliseEmphasisName(v);
        if(seen.has(k)) return;
        seen.add(k);
        out.push(v);
      });
    });
    return out;
  }
  // Which Emphasis (if any) covers this weapon. `candidates` lets auditWeaponEmphasisCoverage()
  // run the identical matcher against SKILL_LIBRARY's full published list instead of against
  // what the character happens to own — one matcher, two callers, no drift.
  function findMatchingEmphasis(weaponEntry, skillName, candidates){
    if(!weaponEntry || !weaponEntry.name) return null;
    const list = candidates || getOwnedEmphases(skillName || weaponEntry.skill);
    if(!list || !list.length) return null;
    const wExact = normaliseEmphasisName(weaponEntry.name);
    const exact = list.find(o => normaliseEmphasisName(o) === wExact);
    if(exact) return exact;
    const wBase = baseEmphasisName(weaponEntry.name);
    return list.find(o => baseEmphasisName(o) === wBase) || null;
  }
  // Library-wide coverage audit. Pure; used by the validation suite to pin the 40/2/4/2 split.
  function auditWeaponEmphasisCoverage(){
    const out = { exact:0, base:0, unmatched:0, noEmphList:0,
                  details:{ exact:[], base:[], unmatched:[], noEmphList:[] } };
    WEAPON_LIBRARY.forEach(w=>{
      const opts = relevantEmphOptions(findSkill(w.skill));
      if(!opts.length){ out.noEmphList++; out.details.noEmphList.push(w.name); return; }
      const wExact = normaliseEmphasisName(w.name);
      if(opts.some(o => normaliseEmphasisName(o) === wExact)){ out.exact++; out.details.exact.push(w.name); return; }
      const wBase = baseEmphasisName(w.name);
      if(opts.some(o => baseEmphasisName(o) === wBase)){ out.base++; out.details.base.push(w.name); return; }
      out.unmatched++; out.details.unmatched.push(w.name);
    });
    return out;
  }

  // ---- roll context ----------------------------------------------------------------------
  // Both context builders answer one question: may this roll offer an Emphasis re-roll, and
  // under what label. `applies:false` means no control is rendered at all; blockedReason says
  // why, purely so the tests (and a future UI hint) can distinguish the cases.
  function skillRollEmphasisContext(skillName, rank){
    const owned = getOwnedEmphases(skillName);
    const effRank = (rank === undefined || rank === null) ? getCharacterSkillRank(skillName) : parseInt(rank, 10);
    const skilled = !(effRank <= 0);
    return {
      source: 'skill',
      skillName: skillName || '',
      owned,
      matched: null,                                    // a generic Skill Roll has no weapon to match against
      requiresSelection: EMPHASIS_SELECTION_MODE === 'B',
      applies: skilled && owned.length > 0,
      blockedReason: !skilled ? 'unskilled' : (owned.length ? null : 'no-emphasis'),
    };
  }
  function weaponAttackEmphasisContext(weaponEntry, skillName, rank){
    const skill = skillName || (weaponEntry && weaponEntry.skill) || '';
    const owned = getOwnedEmphases(skill);
    const matched = findMatchingEmphasis(weaponEntry, skill);
    const effRank = (rank === undefined || rank === null) ? getCharacterSkillRank(skill) : parseInt(rank, 10);
    const skilled = !(effRank <= 0);
    return {
      source: 'weapon',
      skillName: skill,
      owned,
      matched,
      requiresSelection: false,                         // auto-detected from the weapon: never a dropdown
      applies: skilled && !!matched,
      blockedReason: !skilled ? 'unskilled' : (matched ? null : 'no-matching-emphasis'),
    };
  }

  // ---- pure re-roll engine ---------------------------------------------------------------
  // A fresh exploding die for a re-roll. Deliberately NOT rollExplodingD10At(): that is Part B
  // code which must stay byte-identical, and this needs an injectable RNG so the harness can
  // assert exact dice outcomes instead of sampling a distribution.
  function rollEmphasisDie(explodeOn, rng){
    const rand = (typeof rng === 'function') ? rng : Math.random;
    const explodeAt = (explodeOn === null || explodeOn === undefined) ? 10 : Math.max(2, Math.min(10, explodeOn));
    let total = 0, chain = [], r;
    do {
      r = 1 + Math.floor(rand() * 10);
      chain.push(r);
      total += r;
    } while(r >= explodeAt);
    return { total, chain };
  }
  // PURE. Returns a NEW array and never mutates its input or its elements. Only entries whose
  // index was selected AND which actually show a 1 are replaced; everything else is passed
  // through by identity. A re-rolled die landing on 1 simply IS the new value — it is never
  // reconsidered, which is exactly what "only once per roll" means.
  function rerollEmphasisDice(sortedDice, indicesToReroll, explodeOn, rng){
    const src = Array.isArray(sortedDice) ? sortedDice : [];
    const want = new Set((indicesToReroll || []).map(n => parseInt(n, 10)));
    return src.map((die, i)=>{
      if(!want.has(i)) return die;
      if(!die || die.total !== 1) return die;
      const fresh = rollEmphasisDie(explodeOn, rng);
      return { total: fresh.total, chain: fresh.chain, rerolledFrom: 1 };
    });
  }

  // ---- once-per-roll flag (hidden input; DOM-as-model) ------------------------------------
  // NOTE ON THE ID: this input is deliberately NOT named "f_emphasisRerollUsed". collectData()
  // serialises EVERY element matching [id^="f_"] into the save file, so an f_-prefixed id would
  // add a new persisted field and break the "save/load byte-identical to Part B" requirement.
  // The un-prefixed id keeps this state in the DOM, exactly as specified, while remaining
  // invisible to save/load. See the Feature 0 report for the full rationale.
  function emphasisRerollUsed(){
    const el = document.getElementById('emphasisRerollUsed');
    return !!el && el.value === '1';
  }
  function setEmphasisRerollUsed(v){
    const el = document.getElementById('emphasisRerollUsed');
    if(el) el.value = v ? '1' : '0';
  }

  // ---- the decorator ---------------------------------------------------------------------
  // Re-applies the modal's own "suggest the top N" convention after a re-roll, so the player
  // sees the same starting selection showRollResult() would have given them for these values.
  function applyTopNKeepSuggestion(diceEls, keepDice){
    const n = Math.max(0, parseInt(keepDice, 10) || 0);
    const ranked = diceEls.slice().sort((a,b)=>parseInt(b.dataset.total,10) - parseInt(a.dataset.total,10));
    diceEls.forEach(el => el.classList.remove('kept'));
    ranked.slice(0, n).forEach(el => el.classList.add('kept'));
  }
  // Injects the Emphasis control into an ALREADY-RENDERED roll modal. Returns a small handle
  // used by the test harness to drive the flow without synthesising pointer events; returns
  // null when no control was rendered (no Emphasis applies, or the modal isn't open).
  function attachEmphasisReroll(opts){
    opts = opts || {};
    setEmphasisRerollUsed(false);            // every new roll starts with the re-roll unspent
    const overlay = document.getElementById('rollModalOverlay');
    const body = document.getElementById('rollModalBody');
    const diceRow = document.getElementById('rollDiceRow');
    // Guard: only decorate a modal that is actually open with dice in it. This is what keeps
    // the decorator off the rollNotation() fallback path used by manual-override weapon rows,
    // and off any roll that bailed out via setStatus() before opening the modal.
    if(!overlay || !body || !diceRow) return null;
    if(overlay.style.display !== 'flex') return null;
    if(!diceRow.querySelectorAll('.roll-die').length) return null;
    const staleBar = body.querySelector('.emph-reroll-bar');
    if(staleBar) staleBar.remove();           // idempotent: attaching twice replaces, never stacks

    const ctx = opts.context || (opts.weaponEntry
      ? weaponAttackEmphasisContext(opts.weaponEntry, opts.skillName, opts.rank)
      : skillRollEmphasisContext(opts.skillName, opts.rank));
    if(!ctx.applies) return null;

    const keepDice = (opts.keepDice === undefined || opts.keepDice === null)
      ? diceRow.querySelectorAll('.roll-die.kept').length   // == result.keepDice, post-Ten-Dice-Rule
      : parseInt(opts.keepDice, 10) || 0;
    const explodeOn = (opts.explodeOn === undefined) ? null : opts.explodeOn;

    const bar = document.createElement('div');
    bar.className = 'emph-reroll-bar';
    diceRow.parentNode.insertBefore(bar, diceRow.nextSibling);

    let mode = 'idle';                        // 'idle' | 'picking' | 'selecting' | 'used'
    let chosen = ctx.matched || null;         // weapon attacks arrive pre-matched
    const needsPick = ctx.requiresSelection && ctx.source === 'skill' && !chosen;
    if(needsPick) mode = 'picking';

    const allDice = () => Array.from(diceRow.querySelectorAll('.roll-die'));
    const eligible = () => allDice().filter(el => el.dataset.total === '1' && !el.classList.contains('emph-rerolled'));
    const selected = () => allDice().filter(el => el.classList.contains('emph-selected'));
    const emphLabel = () => chosen ? chosen : ctx.owned.join(', ');

    function clearSelection(){
      allDice().forEach(el => el.classList.remove('emph-selected', 'emph-eligible'));
    }
    function markEligible(){
      eligible().forEach(el => el.classList.add('emph-eligible'));
    }
    function enterSelection(){
      if(mode === 'used' || emphasisRerollUsed()) return false;
      if(!eligible().length) return false;
      mode = 'selecting';
      markEligible();
      render();
      return true;
    }
    function cancel(){
      if(mode !== 'selecting') return false;
      clearSelection();
      mode = 'idle';
      render();
      return true;
    }
    // Programmatic equivalent of clicking a die while in selection mode.
    function toggleDie(index){
      if(mode !== 'selecting') return false;
      const el = allDice()[index];
      if(!el || el.dataset.total !== '1' || el.classList.contains('emph-rerolled')) return false;
      el.classList.toggle('emph-selected');
      render();
      return true;
    }
    function confirm(rng){
      if(mode !== 'selecting' || emphasisRerollUsed()) return false;
      const dice = allDice();
      const indices = dice.map((el,i)=>el.classList.contains('emph-selected') ? i : -1).filter(i => i >= 0);
      if(!indices.length) return false;
      // Rebuild the pure input from the DOM. A die showing 1 provably has chain [1] (any
      // explosion would put its total at 11+), so this reconstruction is exact for every die
      // that is eligible to be re-rolled — and non-eligible dice are passed through untouched.
      const working = dice.map(el=>{
        const t = parseInt(el.dataset.total, 10);
        return { total: t, chain: [t] };
      });
      const next = rerollEmphasisDice(working, indices, explodeOn, rng);
      indices.forEach(i=>{
        const el = dice[i], d = next[i];
        el.dataset.total = d.total;
        const chainNote = d.chain.length > 1 ? '<span class="chain">' + d.chain.join('→') + '</span>' : '';
        el.innerHTML = d.total + chainNote + '<span class="emph-history">1→' + d.total + '</span>';
        el.classList.remove('emph-selected', 'emph-eligible');
        el.classList.add('emph-rerolled');
      });
      setEmphasisRerollUsed(true);
      clearSelection();
      applyTopNKeepSuggestion(allDice(), keepDice);
      updateRollKeepState(keepDice);          // recomputes total, keep-note AND TN pass/fail
      mode = 'used';
      render();
      return true;
    }
    function choose(name){
      if(mode !== 'picking') return false;
      const match = ctx.owned.find(o => normaliseEmphasisName(o) === normaliseEmphasisName(name));
      if(!match) return false;
      chosen = match;
      mode = 'idle';
      render();
      return true;
    }

    function render(){
      const n = eligible().length;
      const picked = selected().length;
      let html = '';
      if(mode === 'picking'){
        // VERSION B only: nothing to re-roll with until the player says which Emphasis applies.
        html =
          '<div class="emph-reroll-head">Which Emphasis applies to this roll?</div>' +
          '<div class="emph-reroll-actions">' +
            '<select class="emph-reroll-select">' +
              '<option value="">— select an Emphasis —</option>' +
              ctx.owned.map(o => '<option value="' + escAttr(o) + '">' + escHtml(o) + '</option>').join('') +
            '</select>' +
            '<button type="button" class="ghost emph-reroll-apply">Apply</button>' +
          '</div>' +
          '<div class="emph-reroll-hint">None of these apply? Just keep your dice as rolled.</div>';
      } else if(mode === 'used'){
        html =
          '<div class="emph-reroll-head used">Emphasis re-roll used (' + escHtml(emphLabel()) + ')</div>' +
          '<div class="emph-reroll-hint">Only one Emphasis re-roll is allowed per roll. Click dice to change what you keep.</div>';
      } else if(mode === 'selecting'){
        html =
          '<div class="emph-reroll-head">Emphasis (' + escHtml(emphLabel()) + ') — choose which 1s to re-roll</div>' +
          '<div class="emph-reroll-actions">' +
            '<button type="button" class="ghost emph-reroll-confirm"' + (picked ? '' : ' disabled') + '>Re-roll ' + picked + ' of ' + n + '</button>' +
            '<button type="button" class="ghost emph-reroll-cancel">Cancel</button>' +
          '</div>' +
          '<div class="emph-reroll-hint">Click the highlighted 1s to select them. Keeping is paused until you confirm or cancel.</div>';
      } else {
        const disabled = (n === 0) ? ' disabled' : '';
        html =
          '<div class="emph-reroll-head">Emphasis (' + escHtml(emphLabel()) + ')</div>' +
          '<div class="emph-reroll-actions">' +
            '<button type="button" class="ghost emph-reroll-start"' + disabled + '>Re-roll 1s' + (n ? ' (' + n + ')' : '') + '</button>' +
          '</div>' +
          '<div class="emph-reroll-hint">' +
            (n ? 'You may re-roll any number of 1s, once per roll.' : 'No dice came up 1, so there is nothing to re-roll.') +
          '</div>';
      }
      bar.innerHTML = html;
      const startBtn = bar.querySelector('.emph-reroll-start');
      if(startBtn) startBtn.addEventListener('click', ()=>enterSelection());
      const confirmBtn = bar.querySelector('.emph-reroll-confirm');
      if(confirmBtn) confirmBtn.addEventListener('click', ()=>confirm());
      const cancelBtn = bar.querySelector('.emph-reroll-cancel');
      if(cancelBtn) cancelBtn.addEventListener('click', ()=>cancel());
      const applyBtn = bar.querySelector('.emph-reroll-apply');
      if(applyBtn) applyBtn.addEventListener('click', ()=>{
        const sel = bar.querySelector('.emph-reroll-select');
        if(sel && sel.value) choose(sel.value);
      });
    }

    // Suspends the modal's own click-to-keep while selecting. A CAPTURE-phase listener on the
    // dice ROW runs before the per-die bubble handlers showRollResult() installed, and
    // stopPropagation() prevents them from firing at all — so keep-toggling is paused without
    // removing, rebinding or otherwise touching a single line of showRollResult().
    diceRow.addEventListener('click', function(e){
      if(mode !== 'selecting') return;
      e.stopPropagation();
      const die = e.target && e.target.closest ? e.target.closest('.roll-die') : null;
      if(!die || !diceRow.contains(die)) return;
      if(die.dataset.total !== '1' || die.classList.contains('emph-rerolled')) return;
      die.classList.toggle('emph-selected');
      render();
    }, true);

    render();
    return {
      ctx, bar,
      getMode: ()=>mode,
      getChosen: ()=>chosen,
      eligibleCount: ()=>eligible().length,
      enterSelection, toggleDie, confirm, cancel, choose,
    };
  }

  // ---- decorator wiring ------------------------------------------------------------------
  // rollSkill() is Part A and rollWeaponAttack() is Part B; both must stay byte-identical, so
  // neither function body is edited. Their BINDINGS are wrapped instead — the original runs
  // first and renders the modal exactly as before, then the decorator attaches to it. Every
  // existing call site (the Skills-tab dice button, the Weapons-tab dice button) resolves the
  // binding at call time, so both automatically pick this up. This is the decorator pattern
  // applied one level out, and it is the only way to satisfy "attach after showRollResult()"
  // and "these functions must remain byte-identical" at the same time.
  const __rollSkillBase = rollSkill;
  rollSkill = function(name, traitName, rank){
    __rollSkillBase(name, traitName, rank);
    attachEmphasisReroll({ skillName: name, rank: rank, explodeOn: null });
  };
  const __rollWeaponAttackBase = rollWeaponAttack;
  rollWeaponAttack = function(weaponRowOrKey){
    __rollWeaponAttackBase(weaponRowOrKey);
    const ctx = resolveWeaponContext(weaponRowOrKey);
    // An unlinked or manually-overridden row fell through to rollNotation(), which is out of
    // scope by rule — no Emphasis control there.
    if(!ctx.entry || ctx.manualAttack) return;
    attachEmphasisReroll({ weaponEntry: ctx.entry, skillName: ctx.skillName, rank: ctx.skillRank, explodeOn: null });
  };
  // rollWeaponDamage(), performSpellCastRoll() and rollNotation() are deliberately NOT wrapped.
  // ================= END PART C FEATURE 0 =================

