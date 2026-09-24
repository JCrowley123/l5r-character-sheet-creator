  // ============ BUGFIX — SPELL SLOT ACCOUNTING ============
  // Two defects in how spell slots are counted, fixed together because they write the same
  // counters. Each half has its own switch below so either can be turned off alone.
  //
  // 1. A CANCELLED CAST STILL USED ITS SLOT. castSpell() (110-modals-trackers.js) fills the slot
  //    first and only then calls performSpellCastRoll(), which opens the roll preview. When the
  //    preview is cancelled, rollWithModifiers() returns null, but nothing ever gave the slot
  //    back. Before Phase 3 (Part G) there was no step between paying and rolling, so there was
  //    nothing to cancel; that phase added a Cancel in front of every roll and made Void Points
  //    wait for the confirm, but slots were never moved. Found on the iPhone on 24 September
  //    through Void Versatility and reproduced with no Advantage at all. The same shape exists in
  //    castMahoSpell(): Own-Blood Wounds are taken before the preview.
  //
  //    THE FIX REFUNDS, IT DOES NOT MOVE THE SPEND. Every "no slots left" refusal and every
  //    payment dialog stays exactly where it is, before the preview. A snapshot of the counters
  //    is taken when a cast starts; when its Casting Roll reaches rollWithModifiers() the
  //    difference is what the cast paid, whichever route paid it (an Element slot, the shared
  //    bonus pool, release 4.5.20's Ring slot, Own-Blood Wounds). If that roll's own preview then
  //    answers Cancel, exactly that difference is given back. Nothing else is touched.
  //
  //    ONLY A CANCELLED PREVIEW REFUNDS. Release 4.5.2's Willpower checks run inside the same
  //    call, before the Casting Roll. Cancelling that check's own preview is a cancel before
  //    anything was rolled, so it refunds too. A check that is ROLLED AND FAILED is not a cancel:
  //    that release's approved rule is that a failed Enlightened Madness check ends the action
  //    with the slot still spent, and that path never answers Cancel to a preview, so it is
  //    unchanged here by construction.
  //
  //    A REFUND THAT ARRIVES LATE IS DROPPED. The preview answers asynchronously; if a reset or
  //    load has replaced the character by then, the counters no longer read what the cast left
  //    them at, and nothing is given back rather than subtracting from someone else's sheet.
  //
  // 2. A HAND-TAPPED BONUS PIP COULD OVERFILL THE SHARED POOL. The Spell Slots click handler
  //    (080-identity-build-ui.js) added a bonus pip with no pool check, so with the pool already
  //    full from casting a tap still raised that Element's fill (4 shown against a pool of 3).
  //    Taking one back then also stripped another Element's pip, because renderSpellBonusPips()
  //    trims every row to the shared total. Casting never did this: it checks the pool first.
  //    Now a tap on an empty bonus pip is refused while the pool is full, and a take-back only
  //    changes the row tapped.
  //
  //    AN ALREADY OVERFULL SAVE IS WARNED ABOUT, NEVER REPAIRED. A save does not record which
  //    Element's pips are the extra ones, so the owner ruled (24 September) that nothing is
  //    removed automatically. A line under the Spell Slots says so, and a take-back first uses
  //    up the excess without touching the pool, so tapping pips back corrects it one row at a
  //    time.
  const SPELL_SLOT_ACCOUNTING_FIX_ENABLED = true;
  const SPELL_SLOT_REFUND_ENABLED = true;
  const BONUS_PIP_GUARD_ENABLED = true;

  const SSA992 = (function(){
    const api = {};
    api.refundEnabled = function(){ return SPELL_SLOT_ACCOUNTING_FIX_ENABLED && SPELL_SLOT_REFUND_ENABLED; };
    api.pipEnabled = function(){ return SPELL_SLOT_ACCOUNTING_FIX_ENABLED && BONUS_PIP_GUARD_ENABLED; };
    api.capture = null;   // {before} from the first line of a cast until its Casting Roll starts
    api.pending = null;   // {delta} from the Casting Roll's start until its preview answers
    api.lastRefund = null;

    function read(id){
      const el = document.getElementById(id);
      return el ? (parseInt(el.value || '0', 10) || 0) : 0;
    }
    api.ids = function(){
      const ids = [];
      SPELL_ELEMENTS.forEach(function(el){ ids.push('spell_used_' + el.key, 'spell_bonus_used_visual_' + el.key); });
      ids.push('spell_bonus_used_shared', 'f_woundsTaken');
      return ids;
    };
    api.snapshot = function(){
      const values = {};
      api.ids().forEach(function(id){ values[id] = read(id); });
      return values;
    };

    // ---- 1. Refund on a cancelled Casting Roll ----
    api.open = function(){
      const capture = {before:api.snapshot()};
      api.capture = capture;
      return capture;
    };
    api.close = function(capture){ if(api.capture === capture) api.capture = null; };
    // Called for every roll; acts only on the first Spell Casting Roll of an open cast.
    api.take = function(context){
      const capture = api.capture;
      if(!capture || !context || context.kind !== ROLL_KINDS.SPELL) return null;
      api.capture = null;
      const after = api.snapshot(), delta = {};
      let paid = false;
      Object.keys(capture.before).forEach(function(id){
        const change = after[id] - capture.before[id];
        if(change > 0){ delta[id] = change; paid = true; }
      });
      return paid ? {delta:delta, after:after} : null;
    };
    api.describe = function(delta){
      const parts = [];
      SPELL_ELEMENTS.forEach(function(el){
        const n = delta['spell_used_' + el.key];
        if(n) parts.push(n === 1 ? 'the ' + el.name + ' slot' : n + ' ' + el.name + ' slots');
      });
      const bonus = delta.spell_bonus_used_shared;
      if(bonus) parts.push(bonus === 1 ? 'the bonus slot' : bonus + ' bonus slots');
      const wounds = delta.f_woundsTaken;
      if(wounds) parts.push(wounds + (wounds === 1 ? ' Wound' : ' Wounds'));
      return parts.join(' and ');
    };
    // True while every counter the cast paid from still reads what the cast left it at.
    api.unchanged = function(payment){
      const now = api.snapshot();
      return Object.keys(payment.delta).every(function(id){ return now[id] === payment.after[id]; });
    };
    api.refund = function(payment){
      const delta = payment.delta;
      if(!api.unchanged(payment)){ api.lastRefund = {dropped:true}; return false; }
      Object.keys(delta).forEach(function(id){
        const el = document.getElementById(id);
        if(el) el.value = Math.max(0, read(id) - delta[id]);
      });
      SPELL_ELEMENTS.forEach(function(el){ if(delta['spell_used_' + el.key]) renderSpellPips(el.key); });
      if(Object.keys(delta).some(function(id){ return id.indexOf('spell_bonus_used_') === 0; })) renderSpellBonusPips();
      if(delta.f_woundsTaken && typeof renderWounds === 'function') renderWounds();
      api.lastRefund = {delta:Object.assign({}, delta)};
      setStatus('Cast cancelled — ' + api.describe(delta) + ' given back.');
      return true;
    };

    // ---- 2. Hand-tapped bonus pips ----
    api.voidRank = function(){ return Math.max(0, Math.min(10, read('ring_void'))); };
    api.shown = function(){
      return SPELL_ELEMENTS.reduce(function(sum, el){ return sum + read('spell_bonus_used_visual_' + el.key); }, 0);
    };
    api.overfull = function(){
      const shown = api.shown(), used = read('spell_bonus_used_shared');
      return shown > used ? {shown:shown, used:used} : null;
    };
    api.tap = function(key, filled){
      const sharedEl = document.getElementById('spell_bonus_used_shared');
      const visualEl = document.getElementById('spell_bonus_used_visual_' + key);
      if(!sharedEl || !visualEl) return false;
      const shared = read('spell_bonus_used_shared'), visual = read('spell_bonus_used_visual_' + key);
      if(filled){
        // The excess (rows showing more than the pool records) is used up first, so a take-back
        // on an overfull save corrects the row tapped and never reaches another row.
        const excess = Math.max(0, api.shown() - shared);
        visualEl.value = Math.max(0, visual - 1);
        if(excess === 0) sharedEl.value = Math.max(0, shared - 1);
      } else {
        const rank = api.voidRank();
        if(shared >= rank){
          setStatus('No bonus slots left: all ' + rank + ' in the shared pool are used.');
          renderSpellBonusPips();
          return true;
        }
        sharedEl.value = shared + 1;
        visualEl.value = visual + 1;
      }
      renderSpellBonusPips();
      return true;
    };
    api.renderWarning = function(){
      let note = document.getElementById('ssa992BonusNote');
      const state = api.pipEnabled() ? api.overfull() : null;
      if(!state){ if(note) note.hidden = true; return; }
      if(!note){
        const wrap = document.getElementById('spellSlotsWrap');
        if(!wrap) return;
        note = document.createElement('p');
        note.id = 'ssa992BonusNote';
        note.className = 'ssa992-note';
        note.setAttribute('role', 'status');
        wrap.insertAdjacentElement('afterend', note);
      }
      note.textContent = 'The bonus pips show ' + state.shown + ' used, but the shared pool records ' + state.used +
        '. Tap a filled bonus pip to take one back; the sheet will not remove any for you.';
      note.hidden = false;
    };
    return api;
  })();

  // Reached from one guarded block in the Spell Slots click handler. Returning false leaves the
  // handler's original arithmetic to run, which is what the switch restores.
  function ssaBonusPipTap(pip){
    if(!SSA992.pipEnabled() || !pip) return false;
    const row = pip.closest('.spell-slot-row');
    if(!row || !row.dataset.element) return false;
    return SSA992.tap(row.dataset.element, pip.classList.contains('filled'));
  }

  // Ordered last among the sheet fragments, so each wrapper below is the outermost and sees
  // every earlier release's version of the function. All four are reached by name at call time.
  const ssa992PreviousCast = castSpell;
  castSpell = async function(){
    if(!SSA992.refundEnabled()) return ssa992PreviousCast.apply(this, arguments);
    const capture = SSA992.open();
    try { return await ssa992PreviousCast.apply(this, arguments); }
    finally { SSA992.close(capture); }
  };
  const ssa992PreviousMaho = castMahoSpell;
  castMahoSpell = async function(){
    if(!SSA992.refundEnabled()) return ssa992PreviousMaho.apply(this, arguments);
    const capture = SSA992.open();
    try { return await ssa992PreviousMaho.apply(this, arguments); }
    finally { SSA992.close(capture); }
  };
  const ssa992PreviousRoll = rollWithModifiers;
  rollWithModifiers = function(title, context){
    const payment = SSA992.refundEnabled() ? SSA992.take(context) : null;
    if(!payment) return ssa992PreviousRoll.apply(this, arguments);
    SSA992.pending = payment;
    const settle = function(){ if(SSA992.pending === payment) SSA992.pending = null; };
    const result = ssa992PreviousRoll.apply(this, arguments);
    Promise.resolve(result).then(settle, settle);
    return result;
  };
  // Soft dependency on Phase 3 (Part G): without its preview there is no Cancel to refund.
  if(typeof rollPreviewGate === 'function'){
    const ssa992PreviousGate = rollPreviewGate;
    rollPreviewGate = async function(req){
      const payment = SSA992.pending;
      const proceed = await ssa992PreviousGate.apply(this, arguments);
      const context = req && req.context;
      const spellRoll = !!context && context.kind === ROLL_KINDS.SPELL;
      const resistanceCheck = !!context && context.d45WillpowerGate === true;
      if(payment && SSA992.pending === payment && (spellRoll || resistanceCheck)){
        if(!proceed){ SSA992.pending = null; SSA992.refund(payment); }
        else if(spellRoll) SSA992.pending = null;
      }
      return proceed;
    };
  }
  const ssa992PreviousBonusRender = renderSpellBonusPips;
  renderSpellBonusPips = function(){
    const result = ssa992PreviousBonusRender.apply(this, arguments);
    SSA992.renderWarning();
    return result;
  };
  // ============ END BUGFIX — SPELL SLOT ACCOUNTING ============
