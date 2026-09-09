  // ============ PART C FEATURE 6: AMMO TRACKING ============
  // RAW (Equipment, Bows and Arrows): a bow supplies no DR of its own — the ARROW does, and the
  // bow adds its own Strength rating (capped by the wielder's Strength) to the arrow's rolled
  // dice. Part B already implemented exactly that inside getWeaponDamageDice(), including the
  // "weak user" cap, and left an `opts.arrow` hook plus a DEFAULT_ARROW fallback for this
  // feature to fill in. Feature 6 therefore adds NO new damage arithmetic at all: it adds the
  // ammunition an archer actually owns, asks which arrow is being loosed, spends it, and hands
  // that arrow's name to the pure function Part B already wrote.
  //
  // WHERE EACH PIECE OF STATE LIVES, and why:
  //   * The arrows you OWN live in the Equipment table as ordinary rows, named
  //     "Arrow — {type}" (the same label convention the Spell Scrolls picker already uses for
  //     "Spell Scroll — {spell}"). Nothing new is added to the save shape for them: the
  //     existing {name, qty, notes} triple is exactly what an arrow row needs, so arrows are
  //     saved, loaded, edited and removed by machinery that already existed and is untouched.
  //   * The arrow a ROW last nocked lives in a hidden .wp-arrow-type input on the weapon row
  //     and IS saved (spec 5.6.B, `wp_arrowType`), so re-opening a character remembers which
  //     ammunition that bow is loaded with.
  //   * The arrow currently IN FLIGHT lives in `lastArrowUsed`, a module variable, and is
  //     deliberately NOT saved (spec 5.6.C). It is set by an attack roll and cleared by the
  //     damage roll that resolves it.
  //
  // OPT-IN, AND WHY IT MATTERS. The ammunition prompt only appears once ammo tracking is ACTIVE
  // for a row — that is, once the character owns any arrow item, or once that row has already
  // fired one. A character who has never put arrows in Equipment fires a bow exactly as they
  // did in Feature 4: no prompt, no spend, Willow Leaf's DR by default. That is the spec's
  // "zero-change guarantee when no ammo is selected" (section 3) taken literally, and it is
  // what keeps every pre-existing save, and every pre-existing regression suite, valid. Once a
  // character HAS opted in the gating is fully enforced: running out of arrows leaves every
  // option in the popup disabled and the shot can only be cancelled.

  // ---- Arrow icons. One per arrow type, inline SVG in the same idiom as STANCE_ICONS ------
  // (currentColor so they inherit the surrounding text colour, no external assets, no font
  // glyphs, no escape sequences). Each shaft points the same way; only the head differs, which
  // is the part that actually distinguishes one piece of ammunition from another.
  const ARROW_ICONS = {
    willowLeaf:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21 L13 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M13 11 c2-4 5-7 8-8 -1 3-4 6-8 8 Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 21 l1.5-4 M3 21 l4-1.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    armorPiercing: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21 L14 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M14 10 L21 3 L18.5 12 Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 21 l1.5-4 M3 21 l4-1.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    fleshCutter:   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21 L12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 12 L21 3 M21 3 L20 9 L15 9 M21 3 L15 4 L15 9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><path d="M3 21 l1.5-4 M3 21 l4-1.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    hummingBulb:   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21 L11 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="14" cy="10" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M18.5 6.5 c1.6-1.6 1.6-3.4 0-5 M21 8 c2.6-2.6 2.6-6.4 0-9" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M3 21 l1.5-4 M3 21 l4-1.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    ropeCutter:    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21 L13 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M13 11 L20 4 M16 4 a4 4 0 0 0 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M3 21 l1.5-4 M3 21 l4-1.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  };
  function arrowIcon(arrow){
    const a = (typeof arrow === 'string') ? findArrow(arrow) : arrow;
    return (a && ARROW_ICONS[a.key]) ? ARROW_ICONS[a.key] : '';
  }

  // ---- Equipment label convention --------------------------------------------------------
  // Deliberately the same shape as spellNameFromScrollLabel()/hasSpellScroll(): a row IS an
  // arrow row because of what its Item name says, not because of a hidden flag. That buys three
  // things for free — the save shape does not change, a player can type or edit an arrow row by
  // hand exactly like any other item, and a character saved by this build still loads on a build
  // that has never heard of Feature 6.
  const ARROW_EQUIP_PREFIX = 'Arrow';
  function arrowEquipLabel(arrow){
    const a = (typeof arrow === 'string') ? findArrow(arrow) : arrow;
    return a ? (ARROW_EQUIP_PREFIX + ' — ' + a.name) : '';
  }
  // Inverse of the above. Accepts "Arrow" or "Arrows", and any of the three dashes the sheet's
  // own labels use, so a hand-typed row is recognised as readily as a generated one.
  function arrowFromEquipLabel(label){
    const m = /^arrows?\s*[—–-]\s*(.+)$/i.exec(String(label || '').trim());
    return m ? findArrow(m[1]) : null;
  }
  function arrowEquipNotes(arrow){
    const a = (typeof arrow === 'string') ? findArrow(arrow) : arrow;
    if(!a) return '';
    return 'DR ' + a.damage.roll + 'k' + a.damage.keep + ' · ' + a.cost + ' bu · ' + a.special;
  }
  // The text every arrow tooltip shows, in one place so the Equipment row, the ammunition popup
  // and the Add Arrows picker can never disagree about what an arrow does (spec 5.1.D / 5.2.C).
  function arrowTooltip(arrow){
    const a = (typeof arrow === 'string') ? findArrow(arrow) : arrow;
    if(!a) return '';
    return a.name +
      '\nDR: ' + a.damage.roll + 'k' + a.damage.keep +
      '\nCost: ' + a.cost + ' bu' +
      '\nSpecial: ' + a.special;
  }

  // ---- Quantities, held in the Equipment table (DOM-as-model, like every other total) ------
  function arrowEquipRows(arrowName){
    const a = (typeof arrowName === 'string') ? findArrow(arrowName) : arrowName;
    if(!a) return [];
    const target = a.name.toLowerCase();
    return Array.from(document.querySelectorAll('#equipBody tr')).filter(tr=>{
      const el = tr.querySelector('.eq-name');
      const found = el ? arrowFromEquipLabel(el.value) : null;
      return !!found && found.name.toLowerCase() === target;
    });
  }
  // Sums across rows rather than reading the first one. Rows are merged on add (spec 5.1.B), but
  // a player can always type a second row by hand, and silently ignoring it would be a lie.
  function getArrowQuantity(arrowName){
    return arrowEquipRows(arrowName).reduce((sum, tr)=>{
      const q = parseInt((tr.querySelector('.eq-qty') || {}).value || '0', 10) || 0;
      return sum + Math.max(0, q);
    }, 0);
  }
  function anyArrowEquipRows(){
    return Array.from(document.querySelectorAll('#equipBody .eq-name'))
      .some(el=>!!arrowFromEquipLabel(el.value));
  }
  // Adding the SAME arrow type again increments the existing row instead of creating a second
  // one (spec 5.1.B: "Never create duplicate rows for the same arrow type").
  function addArrowToEquipment(arrowName, qty){
    const a = (typeof arrowName === 'string') ? findArrow(arrowName) : arrowName;
    if(!a) return null;
    const add = Math.max(1, parseInt(qty, 10) || 1);
    const rows = arrowEquipRows(a.name);
    if(rows.length){
      const tr = rows[0];
      const qtyEl = tr.querySelector('.eq-qty');
      qtyEl.value = Math.max(0, parseInt(qtyEl.value || '0', 10) || 0) + add;
      refreshEquipRow(tr);
      recalcAll();
      return tr;
    }
    const tr = makeEquipRow({ name: arrowEquipLabel(a), qty: add, notes: arrowEquipNotes(a) });
    document.getElementById('equipBody').appendChild(tr);
    recalcAll();
    return tr;
  }
  // Spec 5.1.C: an arrow row at zero is removed. Scoped to ARROW rows only — an ordinary item
  // at quantity 0 ("Spare bowstring: 0") is a perfectly reasonable thing to write down, and this
  // feature has no business deleting it.
  function pruneEmptyArrowRows(){
    let removed = 0;
    Array.from(document.querySelectorAll('#equipBody tr')).forEach(tr=>{
      const el = tr.querySelector('.eq-name');
      if(!el || !arrowFromEquipLabel(el.value)) return;
      const q = parseInt((tr.querySelector('.eq-qty') || {}).value || '0', 10) || 0;
      if(q <= 0){ tr.remove(); removed++; }
    });
    return removed;
  }
  // Returns true only if the full count was actually available. A partial spend is never left
  // half-applied: the quantity is checked before a single row is touched, so the caller can
  // cancel the shot knowing nothing was consumed.
  function spendArrow(arrowName, count){
    const a = (typeof arrowName === 'string') ? findArrow(arrowName) : arrowName;
    if(!a) return false;
    const want = Math.max(1, parseInt(count, 10) || 1);
    if(getArrowQuantity(a.name) < want) return false;
    let remaining = want;
    arrowEquipRows(a.name).forEach(tr=>{
      if(remaining <= 0) return;
      const qtyEl = tr.querySelector('.eq-qty');
      const have = Math.max(0, parseInt(qtyEl.value || '0', 10) || 0);
      const take = Math.min(have, remaining);
      qtyEl.value = have - take;
      remaining -= take;
    });
    pruneEmptyArrowRows();
    recalcAll();
    return remaining === 0;
  }

  // ---- The arrow in flight ----------------------------------------------------------------
  // Module-scope on purpose: spec 5.6.C says this must live in memory only and never reach the
  // save file, and the surest way to guarantee that is for it not to be in the DOM at all.
  //
  // THE MISSED-SHOT RULE (spec 5.3.B). Ammunition is spent by the ATTACK roll, not by the damage
  // roll, and nothing ever refunds it. So an archer who rolls an attack, does not click damage,
  // and then rolls again has simply missed: the first arrow is gone. That falls out of spending
  // at attack time rather than needing a rule of its own — there is no code path anywhere that
  // gives an arrow back, which is exactly the property the spec is asking for.
  let lastArrowUsed = null;
  function getLastArrowUsed(){ return lastArrowUsed; }
  function setLastArrowUsed(name){ lastArrowUsed = name || null; }
  function clearLastArrowUsed(){ lastArrowUsed = null; }

  function weaponUsesAmmo(entry){ return !!(entry && entry.ammo === 'Arrow'); }
  function getRowArrowType(row){
    const el = (row && row.querySelector) ? row.querySelector('.wp-arrow-type') : null;
    const v = el ? String(el.value || '').trim() : '';
    return v || null;
  }
  function setRowArrowType(row, name){
    const el = (row && row.querySelector) ? row.querySelector('.wp-arrow-type') : null;
    if(el) el.value = name || '';
  }
  // Resolution order for "which arrow is this damage roll using":
  //   1. the arrow the last attack actually loosed (lastArrowUsed), cleared by the damage roll;
  //   2. failing that, the arrow this row is loaded with (.wp-arrow-type), which survives a
  //      save/load and is what lets a reloaded character re-roll that shot's damage;
  //   3. failing that, nothing — and getWeaponDamageDice() falls back to DEFAULT_ARROW exactly
  //      as it did before this feature existed.
  function getSelectedArrowForRow(row){
    return lastArrowUsed || getRowArrowType(row);
  }
  // Ammo tracking is dormant until the character owns an arrow, or this bow has already fired
  // one. The second half matters: an archer who looses their last arrow still gets the popup
  // (with every option disabled) rather than silently reverting to free ammunition.
  function ammoTrackingActive(row){
    return anyArrowEquipRows() || !!getRowArrowType(row);
  }

  // ---- P2 contributor (spec 5.5) ----------------------------------------------------------
  // INFORMATIONAL, not arithmetic. The arrow's DR is already inside the pool — Part B's
  // getWeaponDamageDice() added it in step 2 — so this contributor must explain the number
  // without touching it. That is what `informational:true` means in the P2 normaliser: its
  // deltas are forced to zero there, so it can never move a die, and it survives the "drop
  // empty modifiers" filter only so the breakdown bar has something to print.
  //
  // Priority 25 places it between range (20) and stance (30), per spec. Negative scope lives
  // here in one place: this contributor is silent on every roll kind except damage, and silent
  // on damage unless an arrow was actually SELECTED (a bow falling back to DEFAULT_ARROW is not
  // a selection, and gets no entry — spec 5.5, "If no arrow selected, no entry").
  function arrowPreRollModifiers(ctx){
    if(!ctx || ctx.kind !== ROLL_KINDS.DAMAGE) return null;
    if(!weaponUsesAmmo(ctx.weaponEntry)) return null;
    const arrow = ctx.arrow ? findArrow(ctx.arrow) : null;
    if(!arrow) return null;
    return [{
      source: 'arrow', label: 'Arrow', informational: true,
      display: arrow.name + ' (+' + arrow.damage.roll + 'k' + arrow.damage.keep + ')',
    }];
  }
  registerPreRollModifier('arrow', 25, arrowPreRollModifiers);
  // Damage rolls deliberately do NOT go through rollWithModifiers() — Part B rolls them
  // directly, and Features 3 and 4 both encode "damage rolls are never enhanced" by returning
  // null for ROLL_KINDS.DAMAGE. Rather than change that, rollWeaponDamage() asks the same PURE
  // half of the P2 pipeline for its modifier list and decorates the already-rendered modal with
  // it. Every other registered contributor still returns null for damage, so in practice this
  // list is either empty or exactly one arrow line.
  function attachArrowDamageBreakdown(ctx, dmg, result){
    const mods = getPreRollModifiers(makeRollContext(ROLL_KINDS.DAMAGE, {
      weaponEntry: ctx.entry, skillName: ctx.skillName, skillRank: ctx.skillRank, arrow: ctx.arrow,
    }));
    if(!mods.length) return null;
    return attachRollModifierBreakdown(
      applyPreRollModifiers(dmg.numDice, dmg.keepDice, mods), result.bonus);
  }

  // ---- Attack-time ammunition popup (spec 5.2) --------------------------------------------
  // Self-contained Promise modal, the same pattern promptWeaponRange() and
  // pickUniversalSpellElement() use. Resolves with an arrow NAME, or null if the player backs
  // out — and backing out cancels the attack outright: no roll, no spend, no state (spec 5.2.D).
  //
  // Every arrow type is always listed, so the player can see what exists; only the ones they
  // actually own are clickable (spec 5.2.A). Each option carries its icon and the shared
  // tooltip, so hovering shows the full DR / cost / special-rules breakdown (spec 5.2.B/C).
  function promptArrowSelection(entry){
    return new Promise(resolve=>{
      const overlay = document.getElementById('arrowPickModalOverlay');
      const body = document.getElementById('arrowPickBody');
      const sub = document.getElementById('arrowPickSubtitle');
      let done = false;
      const finish = value => {
        if(done) return;
        done = true;
        overlay.style.display = 'none';
        body.innerHTML = '';
        resolve(value);
      };
      const bowName = (entry && entry.name) ? entry.name : 'Bow';
      const strengthNote = (entry && entry.bowStrength !== undefined && entry.bowStrength !== null)
        ? ' · bow Strength ' + entry.bowStrength : '';
      sub.textContent = bowName + strengthNote + ' · one arrow is spent by the shot';

      const owned = ARROW_LIBRARY.reduce((n, a)=>n + getArrowQuantity(a.name), 0);
      body.innerHTML =
        ARROW_LIBRARY.map(a=>{
          const qty = getArrowQuantity(a.name);
          return '<button type="button" class="arrow-opt" id="arrowOpt_' + a.key + '" ' +
              'data-arrow="' + escAttr(a.name) + '" title="' + escAttr(arrowTooltip(a)) + '"' +
              (qty > 0 ? '' : ' disabled') + '>' +
              '<span class="arrow-opt-icon">' + arrowIcon(a) + '</span>' +
              '<span class="arrow-opt-main">' +
                '<span class="arrow-opt-title">' + escHtml(a.name) + '</span>' +
                '<span class="arrow-opt-note">DR ' + a.damage.roll + 'k' + a.damage.keep +
                  ' · ' + escHtml(a.special) + '</span>' +
              '</span>' +
              '<span class="arrow-opt-qty' + (qty > 0 ? '' : ' zero') + '">' + qty + '</span>' +
            '</button>';
        }).join('') +
        (owned ? '' :
          '<div class="arrow-opt-empty">You have no arrows. Add some from the Equipment section ' +
          'before firing this bow.</div>');

      body.querySelectorAll('.arrow-opt').forEach(btn=>{
        if(btn.disabled) return;
        btn.addEventListener('click', ()=>finish(btn.dataset.arrow));
      });
      const closeBtn = document.getElementById('arrowPickClose');
      const onClose = ()=>{ closeBtn.removeEventListener('click', onClose); finish(null); };
      closeBtn.addEventListener('click', onClose);
      overlay.style.display = 'flex';
    });
  }

  // ---- "Add Arrows" picker, with the quantity ticker (spec 5.1.B) -------------------------
  // Deliberately built like renderSpellScrollsList(): one scrollable list, rebuilt from the
  // library on every open, with the buttons wired fresh because the rows themselves are
  // recreated each render. The ticker is a plain number input flanked by two buttons, so it
  // works with a keyboard and on a phone without any custom drag handling.
  function renderArrowsPicker(){
    const list = document.getElementById('arrowsPickerList');
    if(!list) return;
    list.innerHTML = ARROW_LIBRARY.map(a=>
      '<div class="arrow-pick-row" title="' + escAttr(arrowTooltip(a)) + '">' +
        '<span class="arrow-pick-icon">' + arrowIcon(a) + '</span>' +
        '<span class="arrow-pick-main">' +
          '<span class="arrow-pick-name">' + escHtml(a.name) + '</span>' +
          '<span class="arrow-pick-meta">DR ' + a.damage.roll + 'k' + a.damage.keep +
            ' · ' + a.cost + ' bu · ' + escHtml(a.special) + '</span>' +
        '</span>' +
        '<span class="arrow-ticker">' +
          '<button type="button" class="arrow-tick-btn" data-step="-1" data-key="' + a.key + '" ' +
            'aria-label="One fewer ' + escAttr(a.name) + '">&minus;</button>' +
          '<input type="number" class="arrow-tick-input" id="arrowQty_' + a.key + '" ' +
            'value="1" min="1" step="1" inputmode="numeric" ' +
            'aria-label="' + escAttr(a.name) + ' quantity">' +
          '<button type="button" class="arrow-tick-btn" data-step="1" data-key="' + a.key + '" ' +
            'aria-label="One more ' + escAttr(a.name) + '">+</button>' +
        '</span>' +
        '<span class="arrow-pick-have">have ' + getArrowQuantity(a.name) + '</span>' +
        '<button type="button" class="ghost arrow-pick-add" data-arrow="' + escAttr(a.name) + '" ' +
          'data-key="' + a.key + '">+ Add</button>' +
      '</div>').join('');
    list.querySelectorAll('.arrow-tick-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const input = document.getElementById('arrowQty_' + btn.dataset.key);
        if(!input) return;
        const step = parseInt(btn.dataset.step, 10) || 0;
        input.value = Math.max(1, (parseInt(input.value || '1', 10) || 1) + step);
      });
    });
    list.querySelectorAll('.arrow-pick-add').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const input = document.getElementById('arrowQty_' + btn.dataset.key);
        const n = Math.max(1, parseInt((input && input.value) || '1', 10) || 1);
        addArrowToEquipment(btn.dataset.arrow, n);
        const note = document.getElementById('arrowsPickerNote');
        if(note){
          note.textContent = 'Added ' + n + ' × ' + btn.dataset.arrow + ' — you now have ' +
            getArrowQuantity(btn.dataset.arrow) + '.';
        }
        renderArrowsPicker();   // refresh every "have N" readout, not just this one
      });
    });
  }
  function openArrowsPicker(){
    const note = document.getElementById('arrowsPickerNote');
    if(note) note.textContent = '';
    renderArrowsPicker();
    document.getElementById('arrowsPickerOverlay').style.display = 'flex';
  }
  function closeArrowsPicker(){
    const overlay = document.getElementById('arrowsPickerOverlay');
    if(overlay) overlay.style.display = 'none';
  }

  // ---- Equipment row decoration (spec 5.1.D) ----------------------------------------------
  // An arrow row gains its icon and its tooltip; every other row is left exactly as it was, so
  // this is safe to call on any equipment row at any time. Called on creation and on every edit
  // of an Item name, so renaming a row into or out of arrow-hood updates it immediately — the
  // same live-update behaviour the spell-scroll gating already has.
  function refreshEquipRow(tr){
    if(!tr || !tr.querySelector) return;
    const nameEl = tr.querySelector('.eq-name');
    const iconEl = tr.querySelector('.eq-arrow-icon');
    if(!nameEl || !iconEl) return;
    const arrow = arrowFromEquipLabel(nameEl.value);
    if(arrow){
      iconEl.innerHTML = arrowIcon(arrow);
      // 'block', not '': the slot's resting state is display:none in the stylesheet, so clearing
      // the inline style would hand it straight back to that rule and the icon would never show.
      iconEl.style.display = 'block';
      iconEl.setAttribute('title', arrowTooltip(arrow));
      nameEl.setAttribute('title', arrowTooltip(arrow));
      tr.dataset.arrowType = arrow.name;
    } else {
      iconEl.innerHTML = '';
      iconEl.style.display = 'none';
      iconEl.removeAttribute('title');
      nameEl.removeAttribute('title');
      delete tr.dataset.arrowType;
    }
  }
  function refreshAllEquipRows(){
    document.querySelectorAll('#equipBody tr').forEach(refreshEquipRow);
  }
  // ============ END PART C FEATURE 6 ============
