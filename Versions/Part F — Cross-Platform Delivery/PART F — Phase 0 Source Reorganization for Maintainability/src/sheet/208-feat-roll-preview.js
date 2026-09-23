  // ============ PART G PHASE 3: SMART ROLL PREVIEW ============
  // Shows the pool, the modifiers behind it, the TN where one exists, and any Void point the
  // player could still spend -- BEFORE the dice are thrown -- then rolls only on confirmation.
  //
  // WHY THIS NEEDED ALMOST NO NEW ARITHMETIC. Phase 1.5's audit established that the pipeline's
  // two calculating steps are already pure and already separated from the throw:
  // getPreRollModifiers(ctx) asks every registered contributor what applies, and
  // applyPreRollModifiers(base) folds the answers onto the base pool. Neither touches a die.
  // rollWithModifiers() simply called both and then rolled immediately. This phase inserts a
  // gate between those two halves and the throw; the numbers it shows are the pipeline's own,
  // not a second implementation that could drift from it. The roadmap's "introduce a RollContext
  // object that aggregates all roll factors" was, on inspection, already built -- as
  // makeRollContext() plus the registry -- so this phase renders it rather than rebuilding it.
  //
  // THE VOID PROJECTION, AND WHY CANCEL IS SAFE. Arming a one-roll Void effect normally goes
  // through spendVoid(), which deducts a point, writes the once-per-Round ledger entry, AND sets
  // a pending flag. Only that last step is what voidPreRollModifiers() actually reads. So while
  // the preview is open, toggling an option sets ONLY the pending flag -- no point leaves the
  // tracker, no ledger entry is written -- and the projected pool is then recomputed by asking
  // the real contributor, so the preview cannot drift from what the roll will do. Cancelling
  // restores the pending object as found: nothing was spent, because nothing was ever spent.
  // Confirming restores it too and then calls the canonical spendVoid() for each newly chosen
  // key, so the commit path is exactly the Void card's own path, with its own eligibility
  // checks, rather than a duplicate of it.
  //
  // WHICH OPTIONS GET OFFERED is decided the same drift-proof way: a Void option is listed only
  // if arming it actually changes the projected pool for THIS roll. Nothing here re-states the
  // rules about which effects apply to which roll kinds -- voidPreRollModifiers() owns those,
  // and this asks it rather than repeating it.
  //
  // DAMAGE ROLLS GET NO PREVIEW, and correctly so: they never enter rollWithModifiers() at all
  // (Part B rolls them directly; RAW says "Damage Rolls may not be enhanced"). See Phase 1.5's
  // README, "Damage rolls take a different path".
  //
  // Flip this to false to disable the preview everywhere without removing anything: every roll
  // then fires immediately, exactly as before this phase. See this phase's ROLLBACK.md.
  const ROLL_PREVIEW_ENABLED = true;

  // The one-roll Void keys this preview may offer. The non-one-roll spends (Armor TN, Initiative,
  // damage reduction, Kiho) are deliberately absent: they are not properties of the roll you are
  // about to make, so the Void card remains their home. Every key in this list is `oneRoll:true`
  // in VOID_SPEND_LIBRARY, and RAW allows spending on only ONE of those per expenditure -- so the
  // checkbox handler below treats this whole list as a mutually-exclusive group, enforced through
  // the same armOneRollVoidPending()/clearOneRollVoidPending() helpers spendVoid() itself uses
  // (160-feat-void.js), rather than a second definition of "mutually exclusive" living here.
  const ROLL_PREVIEW_VOID_KEYS = ['k1', 'skill'];

  // ---- The shared breakdown renderer -----------------------------------------------------
  // Returns [{label, txt}] describing every modifier that applied. Phase 4 ("Explain This Roll")
  // is the same information rendered AFTER the roll instead of before -- when it is built it can
  // call this rather than growing a second copy. attachRollModifierBreakdown() in
  // 130-round-and-pipeline.js deliberately does NOT call it today: the trunk must not depend on
  // a removable phase, or removing this one would break the post-roll bar. See this phase's
  // README, "What Phase 4 inherits".
  function buildRollModifierRows(adj, tenDiceBonus){
    const rows = [];
    if(tenDiceBonus) rows.push({ label:'Ten Dice Rule', txt:'+' + tenDiceBonus + ' to total' });
    ((adj && adj.applied) || []).forEach(m=>{
      const bits = [];
      if(m.rolledDelta || m.keptDelta){
        bits.push((m.rolledDelta >= 0 ? '+' : '') + m.rolledDelta + 'k' + (m.keptDelta >= 0 ? '' : '') + m.keptDelta);
      }
      if(m.totalDelta) bits.push((m.totalDelta >= 0 ? '+' : '') + m.totalDelta + ' to total');
      if(!bits.length && m.display) bits.push(m.display);
      rows.push({ label:m.label, txt:bits.join(', ') + (m.note ? ' — ' + m.note : '') });
    });
    return rows;
  }

  // ---- The dice graphic --------------------------------------------------------------------
  // The same faceted d10 the manual-roll dice picker uses (see .dice-picker in
  // 20-fixed-layers.html) -- gold for rolled, vermilion for kept, a count badge on each. Drawn
  // here rather than reusing that markup because the picker's dice are <button>s with add/remove
  // handlers on them, and these are read-only: a preview states the pool, it does not build it.
  // Same artwork, same palette, no interactive affordances to mislead.
  function previewDieSvg(kept){
    const c = kept
      ? ['--shu-soft', '--shu', '--shu-mid', '--shu-dark', '--shu-shadow']
      : ['--gold-soft', '--gold', '--gold-mid', '--gold-dark', '--gold-shadow'];
    return '<svg viewBox="0 0 512 512" width="54" height="54" aria-hidden="true">' +
      '<path d="M256,8 L352,250 L256,320 L160,250 Z" fill="var(' + c[0] + ')"/>' +
      '<path d="M256,8 L160,250 L10,270 Z" fill="var(' + c[1] + ')"/>' +
      '<path d="M160,250 L256,320 L256,504 L10,270 Z" fill="var(' + c[2] + ')"/>' +
      '<path d="M256,8 L502,270 L352,250 Z" fill="var(' + c[3] + ')"/>' +
      '<path d="M352,250 L502,270 L256,504 L256,320 Z" fill="var(' + c[4] + ')"/>' +
      '<path d="M256,8 L502,270 L256,504 L10,270 Z" fill="none" stroke="var(--paper)" ' +
        'stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M256,8 L160,250 M256,8 L352,250 M160,250 L256,320 L352,250 M256,320 L256,504 ' +
        'M160,250 L10,270 M352,250 L502,270" fill="none" stroke="#ffffff" stroke-width="6" ' +
        'stroke-linejoin="round" stroke-linecap="round"/>' +
      '<text x="256" y="228" text-anchor="middle" font-family="\'Shippori Mincho\', serif" ' +
        'font-weight="800" font-size="78" fill="var(--paper)" stroke="var(--ink)" ' +
        'stroke-width="2" paint-order="stroke">10</text>' +
      '</svg>';
  }
  function previewDiceHtml(rolled, kept){
    const col = (n, isKept, caption) =>
      '<div class="rp-dice-col"><div class="rp-die' + (isKept ? ' kept' : '') + '">' +
        previewDieSvg(isKept) +
        '<span class="rp-die-badge">' + n + '</span>' +
      '</div><div class="rp-die-caption">' + caption + '</div></div>';
    return '<div class="rp-dice">' + col(rolled, false, 'Rolled') +
           col(kept, true, 'Kept') + '</div>';
  }

  // ---- Where the pool came from --------------------------------------------------------------
  // A pool reads as an arbitrary pair of numbers unless you are told which Trait, Ring or Skill
  // Rank produced it. Only kinds whose composition this phase can state HONESTLY are described:
  // the context carries the names, and getTraitValueByName()/getRingValueByName() carry the
  // values, so nothing here is inferred. Kinds whose base pool the caller computed from
  // somewhere this phase cannot see (attacks, spells, manual notation) get no line at all rather
  // than a guessed one.
  function poolBasisText(context){
    if(!context) return '';
    const trait = context.traitName;
    if(context.kind === ROLL_KINDS.SKILL && trait){
      const tv = (typeof getTraitValueByName === 'function') ? getTraitValueByName(trait) : null;
      if(tv === null || tv === undefined) return '';
      const rank = parseInt(context.skillRank, 10) || 0;
      // An Unskilled roll is Trait alone: rank contributes nothing and 10s do not explode.
      if(context.unskilled || rank <= 0){
        return trait + ' ' + tv + ' — Unskilled, so the Trait rolls and keeps alone';
      }
      return trait + ' ' + tv + ' + ' + (context.skillName || 'Skill') + ' Rank ' + rank;
    }
    if(context.kind === ROLL_KINDS.TRAIT && trait){
      const tv = (typeof getTraitValueByName === 'function') ? getTraitValueByName(trait) : null;
      return (tv === null || tv === undefined) ? '' : trait + ' ' + tv + ', rolled and kept';
    }
    if(context.kind === ROLL_KINDS.RING && context.ringName){
      const rv = (typeof getRingValueByName === 'function') ? getRingValueByName(context.ringName) : null;
      return (rv === null || rv === undefined) ? '' : context.ringName + ' Ring ' + rv + ', rolled and kept';
    }
    return '';
  }

  // ---- Projection ------------------------------------------------------------------------
  // Pure with respect to the player's resources: reads the pipeline, writes nothing but the
  // pending flag its caller already saved and will restore.
  function projectRoll(context, baseRolled, baseKept){
    const mods = getPreRollModifiers(context);
    const adj = applyPreRollModifiers(baseRolled, baseKept, mods);
    return { mods, adj };
  }

  // Would arming `key` change this roll's pool? Asked by simulation rather than by re-stating
  // voidPreRollModifiers()'s own per-kind rules, so the two can never disagree. Uses
  // armOneRollVoidPending() for the trial (not a raw merge onto `saved`) so the simulation
  // reflects the same "arming one clears any other" rule the checkbox handler enforces --
  // otherwise this could ask "would arming Skill matter" while k1 is still sitting in `saved`
  // from a previous toggle, and get an answer computed against a pool no real roll can reach.
  // BUGFIX (Void Offer Measured Against The Wrong Baseline). The reference here MUST be the pool
  // with no one-roll Void effect armed -- deliberately NOT the pool currently on screen, which
  // is what this compared against before and is a subtly different question.
  //
  // "Does arming this key change what I am looking at" gives the wrong answer the moment any
  // key is ticked: arming one one-roll effect clears the others (RAW allows only one), so every
  // OTHER key then differs from the current pool simply because swapping to it would remove the
  // armed one. Reported live: on a trained Athletics roll, ticking +1k1 made "+1 Skill Rank
  // (0 -> 1)" appear -- an option the contributor correctly refuses to apply to a trained roll,
  // so taking it would have spent a Void Point for nothing.
  //
  // "Does arming this key change the pool from its unmodified state" is the question actually
  // being asked, and its answer does not depend on what else is ticked.
  function voidKeyWouldMatter(key, context, baseRolled, baseKept){
    const saved = getVoidPending();
    let changed = false;
    try {
      setVoidPending(clearOneRollVoidPending(saved));
      const none = projectRoll(context, baseRolled, baseKept);
      setVoidPending(armOneRollVoidPending(saved, key));
      const p = projectRoll(context, baseRolled, baseKept);
      changed = (p.adj.rolled !== none.adj.rolled) ||
                (p.adj.kept !== none.adj.kept) ||
                (p.adj.totalDelta !== none.adj.totalDelta) ||
                (p.adj.explodeOverride !== none.adj.explodeOverride);
    } finally {
      setVoidPending(saved);
    }
    return changed;
  }

  // ---- The modal ---------------------------------------------------------------------------
  // Resolves true to roll, false to cancel. Same self-contained Promise-modal pattern as
  // promptWeaponRange() and pickUniversalSpellElement(), which already sit in front of attacks
  // and universal spells -- a preview after one of those is a second step in the same flow, not
  // a competing overlay.
  function showRollPreview(req){
    return new Promise(resolve=>{
      const overlay = document.getElementById('rollPreviewOverlay');
      const body = document.getElementById('rollPreviewBody');
      const sub = document.getElementById('rollPreviewSubtitle');
      // No markup (fragment present but markup rolled back, or a stripped build): fail open and
      // roll, rather than making the sheet unable to roll at all.
      if(!overlay || !body){ resolve(true); return; }

      const context = req.context;
      const baseRolled = req.baseRolled;
      const baseKept = req.baseKept;
      const opts = req.opts || {};
      const pendingAtOpen = getVoidPending();
      const chosen = {};                       // void keys ticked inside this preview
      let done = false;
      // PART I PHASE 4.5 - Kharmic Tie has a deliberately ring-fenced preview decision.
      // It owns its own pending state; this Phase 3 modal only asks it for a guarded extension.
      if(typeof advConfigKharmicPreviewStart === 'function') advConfigKharmicPreviewStart(context);
      // PART I FEATURE 4.5.10 BEGIN preview-start
      // Cursed by the Realm (Maigo no Musha) clears its per-roll declaration every time this modal
      // opens. The audit forbids leaving a blanket all-roll penalty armed, so "fresh and unchecked"
      // is enforced here rather than trusted to the player unticking it.
      if(typeof realm4510PreviewStart === 'function') realm4510PreviewStart(context);
      // END REALM4510 preview-start
      // PART I FEATURE 4.5.11 BEGIN preview-start
      // Seven Fortunes' Curse (Ebisu, Jurojin) clears its per-roll declarations every time this
      // modal opens, for the same reason the block above does: the audit forbids leaving a blanket
      // all-roll penalty armed, so "fresh and unchecked" is enforced here rather than trusted to
      // the player unticking it. Its own statement rather than an extra call inside that block,
      // so removing either release leaves the other's reset intact.
      if(typeof fortune4511PreviewStart === 'function') fortune4511PreviewStart(context);
      // END FORTUNE4511 preview-start
      // PART I FEATURE 4.5.15 BEGIN preview-start
      // The general declaration registry binds a fresh, unarmed state to THIS roll's context.
      if(typeof rd4515PreviewStart === 'function') rd4515PreviewStart(context);
      // END DECL4515 preview-start

      const finish = (go)=>{
        if(done) return;
        done = true;
        document.removeEventListener('keydown', onKey);
        overlay.style.display = 'none';
        body.innerHTML = '';
        // Always hand the pending object back exactly as found. On confirm the canonical
        // spendVoid() re-arms whatever was chosen, with its own eligibility checks.
        setVoidPending(pendingAtOpen);
        if(go){
          // PART I PHASE 4.5 - confirm the declaration before any resource is spent. The
          // Kharmic module decrements only when the real post-preview pipeline asks for its
          // modifier, so a canceled preview never consumes a use.
          if(typeof advConfigKharmicPreviewCommit === 'function' && !advConfigKharmicPreviewCommit()){
            resolve(false); return;
          }
          const keys = Object.keys(chosen).filter(k=>chosen[k]);
          for(let i = 0; i < keys.length; i++){
            // spendVoid() returns false and explains itself if the point cannot be spent after
            // all (none left, or the Round's one spend already used). Abort rather than roll a
            // pool the player was shown but did not actually get.
            if(!spendVoid(keys[i])){ resolve(false); return; }
          }
        } else if(typeof advConfigKharmicPreviewCancel === 'function'){
          advConfigKharmicPreviewCancel();
        }
        // PART I FEATURE 4.5.10 BEGIN preview-cancel
        // Deliberately a separate statement rather than another arm of the else-if above: that
        // chain only reaches Kharmic Tie's cancel when its function exists, so an arm added there
        // would be skipped whenever Kharmic Tie is present. Cancelling must clear this phase's
        // declaration whatever else is installed. Confirm deliberately does NOT clear it -- the
        // real roll has not been asked for its modifiers yet at this point, and the next preview's
        // start hook above is what resets it.
        if(!go && typeof realm4510PreviewCancel === 'function') realm4510PreviewCancel();
        // END REALM4510 preview-cancel
        // PART I FEATURE 4.5.11 BEGIN preview-cancel
        // Same shape and same reasoning as the block above: a separate statement, not another arm
        // of any else-if chain, so cancelling clears this release's declarations whatever else is
        // installed. Confirm deliberately does NOT clear them -- the real roll has not been asked
        // for its modifiers yet at this point, and the start hook above is what resets them.
        if(!go && typeof fortune4511PreviewCancel === 'function') fortune4511PreviewCancel();
        // END FORTUNE4511 preview-cancel
        // PART I FEATURE 4.5.15 BEGIN preview-cancel
        // Its own statement, so cancelling disarms every registered declaration whatever else is
        // installed. Confirm keeps them: the real roll reads its modifiers after this point.
        if(!go && typeof rd4515PreviewCancel === 'function') rd4515PreviewCancel();
        // END DECL4515 preview-cancel
        resolve(!!go);
      };
      const onKey = (e)=>{ if(e.key === 'Escape') finish(false); };

      function render(){
        const basis = projectRoll(context, baseRolled, baseKept);
        const adj = basis.adj;
        const rows = buildRollModifierRows(adj, 0);
        const tn = (opts.tnConfig && typeof opts.tnConfig.tn === 'number') ? opts.tnConfig.tn : null;

        const poolChanged = (adj.rolled !== baseRolled) || (adj.kept !== baseKept);
        let html = previewDiceHtml(adj.rolled, adj.kept) +
          '<div class="rp-pool">' +
          '<span class="rp-pool-final">' + adj.rolled + 'k' + adj.kept + '</span>' +
          (adj.totalDelta ? '<span class="rp-pool-flat">' +
              (adj.totalDelta >= 0 ? '+' : '') + adj.totalDelta + ' to total</span>' : '') +
          (poolChanged ? '<span class="rp-pool-base">base ' + baseRolled + 'k' + baseKept + '</span>' : '') +
          '</div>';

        // PART G PHASE 4 - that phase itemises the base pool properly, for more roll kinds than
        // this phase's one-line summary covers (a Casting Roll's Ring + School Rank, and the
        // Affinity behind it, among them). Prefer its rows when it is present; fall back to the
        // prose line below when it is not, which is what this phase shipped with. Guarded, so
        // deleting that fragment restores the original behaviour exactly.
        const baseRows = (typeof buildRollBasePoolRows === 'function')
          ? buildRollBasePoolRows(context, baseRolled, baseKept)
          : [];
        if(baseRows.length){
          // .rp-baserow, NOT .rp-mod: these rows say where the pool came from, and anything
          // that counts modifiers -- this phase's own harness included -- must not find them.
          // They keep .rp-mod-label/.rp-mod-txt inside so the two groups share one row layout.
          html += '<div class="rp-base">' + baseRows.map(r=>
            '<div class="rp-baserow"><span class="rp-mod-label">' + escHtml(r.label) + '</span>' +
            '<span class="rp-mod-txt">' + escHtml(r.txt) + '</span></div>').join('') + '</div>';
        } else {
          const basisText = poolBasisText(context);
          if(basisText){
            html += '<div class="rp-basis">' + escHtml(basisText) + '</div>';
          }
        }

        if(tn !== null){
          html += '<div class="rp-tn">Target Number <b>' + tn + '</b></div>';
        }

        html += rows.length
          ? '<div class="rp-mods">' + rows.map(r=>
              '<div class="rp-mod"><span class="rp-mod-label">' + escHtml(r.label) + '</span>' +
              '<span class="rp-mod-txt">' + escHtml(r.txt) + '</span></div>').join('') + '</div>'
          : '<div class="rp-none">No modifiers apply to this roll.</div>';

        // Void offers, in two passes, because "not offered" has two very different causes and
        // only one of them is worth saying out loud:
        //
        //   * The key would not change this roll at all -- silence is the honest answer. There
        //     is nothing to tell the player about an effect that does not apply here.
        //   * The key WOULD help, but the character cannot spend it right now (no points left,
        //     or one already spent this Round). Hiding that silently is what made a tester who
        //     wrote this app read an empty section as a broken feature. canSpendVoid() already
        //     returns the exact reason; it was being discarded.
        const relevant = ROLL_PREVIEW_VOID_KEYS.filter(k=>
          chosen[k] || voidKeyWouldMatter(k, context, baseRolled, baseKept));
        const blocked = [];
        const offers = relevant.filter(k=>{
          if(chosen[k]) return true;                       // keep a ticked one listed
          const check = (typeof canSpendVoid === 'function') ? canSpendVoid(k) : { ok:true };
          if(!check.ok){
            if(check.reason && blocked.indexOf(check.reason) === -1) blocked.push(check.reason);
            return false;
          }
          return true;
        });
        // Every option that would have helped is refused for the same stateful reason: name it,
        // under the heading it would have appeared beneath, so the absence reads as a state the
        // player is in rather than as a missing feature.
        if(!offers.length && blocked.length){
          html += '<div class="rp-void"><div class="rp-void-head">Spend a Void Point on this roll</div>' +
            blocked.map(r=>'<div class="rp-void-blocked">' + escHtml(r) + '</div>').join('') +
            '</div>';
        }
        if(offers.length){
          html += '<div class="rp-void"><div class="rp-void-head">Spend a Void Point on this roll</div>' +
            offers.map(k=>{
              const opt = findVoidOption(k);
              return '<label class="rp-void-opt"><input type="checkbox" data-void-key="' + escAttr(k) + '"' +
                (chosen[k] ? ' checked' : '') + '><span>' + escHtml(opt ? opt.label : k) + '</span></label>';
            }).join('') +
            '<div class="rp-void-note">Nothing is spent until you roll.</div></div>';
        }

        // PART I PHASE 4.5 - only weapon attacks expose the manual Kharmic Tie declaration.
        // The module supplies no markup at all for every other roll kind.
        if(typeof advConfigKharmicPreviewHtml === 'function'){
          html += advConfigKharmicPreviewHtml(context) || '';
        }
        // PART I FEATURE 4.5.10 BEGIN preview-html
        // Cursed by the Realm (Maigo no Musha) contributes its own per-roll declaration. Like the
        // Kharmic block above it supplies no markup at all unless that realm is configured, so
        // every other character sees an unchanged preview.
        if(typeof realm4510PreviewHtml === 'function'){
          html += realm4510PreviewHtml(context) || '';
        }
        // END REALM4510 preview-html
        // PART I FEATURE 4.5.11 BEGIN preview-html
        // Seven Fortunes' Curse contributes its own per-roll declarations -- up to two on one roll,
        // since Ebisu and Jurojin can both be in scope. Like the blocks above it supplies no markup
        // at all unless one of those Fortunes is configured, so every other character sees an
        // unchanged preview.
        if(typeof fortune4511PreviewHtml === 'function'){
          html += fortune4511PreviewHtml(context) || '';
        }
        // END FORTUNE4511 preview-html
        // PART I FEATURE 4.5.15 BEGIN preview-html
        // Every registered provider's options in one block; no markup at all when none is offered.
        if(typeof rd4515PreviewHtml === 'function'){
          html += rd4515PreviewHtml(context) || '';
        }
        // END DECL4515 preview-html

        html += '<div class="rp-actions">' +
          '<button type="button" class="rm-btn" id="rollPreviewCancel">Cancel</button>' +
          '<button type="button" class="rm-btn primary" id="rollPreviewGo">Roll ' +
            adj.rolled + 'k' + adj.kept + '</button>' +
          '</div>';

        body.innerHTML = html;

        Array.prototype.forEach.call(body.querySelectorAll('[data-void-key]'), cb=>{
          cb.addEventListener('change', ()=>{
            const key = cb.getAttribute('data-void-key');
            // BUGFIX (Void One-Roll Effects Not Mutually Exclusive): `chosen` used to accumulate
            // every key ever ticked true and never clear one when another was picked, so ticking
            // both k1 and Trait (before that entry was merged into k1 -- see the fix's own
            // README) stacked +2k2 for two Void Points. Clearing every other key here first means
            // `chosen` can hold at most one true entry, matching RAW's "one of the following
            // effects", and the checkbox row for whatever was previously ticked visibly unchecks
            // itself on the next render() -- a radio group's behaviour, built from checkboxes so
            // a player can still untick back to "spend nothing" by clicking the active one again.
            Object.keys(chosen).forEach(k=>{ chosen[k] = false; });
            if(cb.checked) chosen[key] = true;
            setVoidPending(chosen[key]
              ? armOneRollVoidPending(pendingAtOpen, key)
              : clearOneRollVoidPending(pendingAtOpen));
            render();
          });
        });
        // PART I PHASE 4.5 - changing this checkbox only changes the Kharmic module's pending
        // declaration, then reprojects through the existing adv-config registry contributor.
        Array.prototype.forEach.call(body.querySelectorAll('[data-adv-config-kharmic-use]'), cb=>{
          cb.addEventListener('change', ()=>{
            if(typeof advConfigKharmicPreviewToggle === 'function'){
              advConfigKharmicPreviewToggle(cb.getAttribute('data-adv-config-kharmic-use'), cb.checked);
            }
            render();
          });
        });
        // PART I FEATURE 4.5.10 BEGIN preview-toggle
        // Ticking the declaration only changes this phase's transient pending flag and reprojects
        // through the existing adv-config contributor, exactly as the Kharmic listener above does.
        // Nothing is spent and nothing is written to the saved config.
        Array.prototype.forEach.call(body.querySelectorAll('[data-realm4510-declare]'), cb=>{
          cb.addEventListener('change', ()=>{
            if(typeof realm4510PreviewToggle === 'function') realm4510PreviewToggle(cb.checked);
            render();
          });
        });
        // END REALM4510 preview-toggle
        // PART I FEATURE 4.5.11 BEGIN preview-toggle
        // Same as the listener above, except the attribute carries WHICH Fortune was ticked --
        // Ebisu and Jurojin can both be on screen at once, so a bare boolean would not say which
        // one changed. Nothing is spent and nothing is written to the saved config.
        Array.prototype.forEach.call(body.querySelectorAll('[data-fortune4511-declare]'), cb=>{
          cb.addEventListener('change', ()=>{
            if(typeof fortune4511PreviewToggle === 'function'){
              fortune4511PreviewToggle(cb.getAttribute('data-fortune4511-declare'), cb.checked);
            }
            render();
          });
        });
        // END FORTUNE4511 preview-toggle
        // PART I FEATURE 4.5.15 BEGIN preview-toggle
        // The attribute names provider and option; only transient state changes, then reproject.
        Array.prototype.forEach.call(body.querySelectorAll('[data-rd4515-key]'), cb=>{
          cb.addEventListener('change', ()=>{
            if(typeof rd4515PreviewToggle === 'function') rd4515PreviewToggle(cb.getAttribute('data-rd4515-key'), cb.checked);
            render();
          });
        });
        // END DECL4515 preview-toggle
        const goBtn = document.getElementById('rollPreviewGo');
        const cancelBtn = document.getElementById('rollPreviewCancel');
        if(goBtn) goBtn.addEventListener('click', ()=>finish(true));
        if(cancelBtn) cancelBtn.addEventListener('click', ()=>finish(false));
      }

      if(sub) sub.textContent = req.title || '';
      overlay.style.display = 'flex';
      document.addEventListener('keydown', onKey);
      overlay.onclick = (e)=>{ if(e.target === overlay) finish(false); };
      const closeBtn = document.getElementById('rollPreviewClose');
      if(closeBtn) closeBtn.onclick = ()=>finish(false);
      render();
    });
  }

  // The gate rollWithModifiers() calls. Kept separate from showRollPreview() so the kill-switch
  // and the "is this roll previewable at all" decision live in one place.
  function rollPreviewGate(req){
    if(!ROLL_PREVIEW_ENABLED) return Promise.resolve(true);
    if(req && req.opts && req.opts.skipPreview) return Promise.resolve(true);
    return showRollPreview(req);
  }
  // ============ END PART G PHASE 3 ============
