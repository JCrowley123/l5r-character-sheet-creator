import io, os, hashlib

SCRATCH = os.path.dirname(os.path.abspath(__file__))
BASE = r"C:\Users\jcrow\Documents\L5R character sheet creator\Versions"
SRC = os.path.join(BASE, "PART C \u2014 Feature 4 Void Automation",
                   "l5r-character-sheet part C feature 4 void.html")
OUTDIR = os.path.join(BASE, "PART C \u2014 Feature 6 Ammo Tracking")
OUT = os.path.join(OUTDIR, "l5r-character-sheet part C feature 6 ammo.html")

def read(p):
    with io.open(p,'r',encoding='utf-8',newline='') as f: return f.read()
def write(p,s):
    with io.open(p,'w',encoding='utf-8',newline='') as f: f.write(s)

# The Feature 6 code block. `f6_js.txt` is the build-time name; the deliverable folder ships
# the identical file as `feature6-code-block.js.txt`, so this script re-runs from either.
def find_block():
    for n in ('f6_js.txt', 'feature6-code-block.js.txt'):
        p = os.path.join(SCRATCH, n)
        if os.path.isfile(p): return p
    raise SystemExit('Feature 6 code block not found beside this script.')
src = read(SRC); js = read(find_block())
edits=[]
def once(t, needle, repl, label):
    n = t.count(needle)
    if n != 1: raise SystemExit("ANCHOR [%s]: %d occurrences, expected 1" % (label,n))
    edits.append(label); return t.replace(needle, repl, 1)

# ---- 1. CSS ----
CSS_ANCHOR = "  /* ---------- PART C FEATURE 2: stance tiles ---------- */\n"
CSS_NEW = """  /* ---------- PART C FEATURE 6: ammo tracking ---------- */
  /* Attack-time ammunition popup. Deliberately shaped like Feature 1's .range-opt so the two
     attack-time prompts read as one family; what it adds is the icon, the quantity badge, and
     the disabled state that gates an arrow type the character does not own. */
  #arrowPickBody{display:flex;flex-direction:column;gap:8px;}
  .arrow-opt{
    display:flex;align-items:center;gap:10px;text-align:left;width:100%;
    padding:9px 12px;border:1px solid var(--line);border-radius:6px;
    background:#fffdf8;cursor:pointer;font-family:'EB Garamond',serif;color:var(--ink);
  }
  .arrow-opt:hover:not([disabled]){border-color:var(--gold);background:rgba(169,132,63,.08);}
  .arrow-opt:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
  .arrow-opt[disabled]{opacity:.40;cursor:not-allowed;}
  .arrow-opt-icon{display:block;width:26px;height:26px;flex:none;color:var(--gold);}
  .arrow-opt-icon svg{width:100%;height:100%;display:block;}
  .arrow-opt-main{display:flex;flex-direction:column;gap:2px;flex:1 1 auto;min-width:0;}
  .arrow-opt-title{font-size:.95rem;}
  .arrow-opt-note{
    font-family:'Noto Sans JP',sans-serif;font-size:.66rem;color:var(--ink-soft);
    letter-spacing:.02em;
  }
  .arrow-opt-qty{
    flex:none;min-width:30px;text-align:center;padding:2px 6px;border-radius:10px;
    font-family:'Noto Sans JP',sans-serif;font-size:.68rem;
    background:rgba(169,132,63,.14);color:var(--ink);
  }
  .arrow-opt-qty.zero{background:rgba(123,17,19,.10);color:var(--shu-dark);}
  .arrow-opt-empty{
    font-family:'Noto Sans JP',sans-serif;font-size:.68rem;line-height:1.45;
    color:var(--shu-dark);
  }
  /* Add Arrows picker (Equipment). Same scrollable-list idiom as .spell-scrolls-list. */
  .arrows-picker-list{
    max-height:min(50vh,360px);overflow-y:auto;
    border:1px solid var(--line);border-radius:6px;margin-top:6px;
  }
  .arrow-pick-row{
    display:flex;align-items:center;gap:8px;padding:7px 10px;
    border-bottom:1px dashed var(--line);font-size:.86rem;
  }
  .arrow-pick-row:last-child{border-bottom:none;}
  .arrow-pick-icon{display:block;width:24px;height:24px;flex:none;color:var(--gold);}
  .arrow-pick-icon svg{width:100%;height:100%;display:block;}
  .arrow-pick-main{display:flex;flex-direction:column;gap:1px;flex:1 1 auto;min-width:0;}
  .arrow-pick-name{font-weight:600;}
  .arrow-pick-meta{font-family:'Noto Sans JP',sans-serif;font-size:.66rem;color:var(--ink-soft);}
  .arrow-pick-have{
    font-family:'Noto Sans JP',sans-serif;font-size:.64rem;color:var(--ink-soft);
    flex:none;min-width:48px;text-align:right;
  }
  .arrow-ticker{display:flex;align-items:center;gap:3px;flex:none;}
  /* flex:none on the parts as well as the container: without it the row's own flexbox shrinks
     the two buttons below their stated 22px as soon as the list gets narrow. */
  .arrow-tick-btn{
    width:22px;height:22px;line-height:1;padding:0;flex:none;
    border:1px solid var(--line);border-radius:4px;background:#fffdf8;
    color:var(--ink);cursor:pointer;font-family:'Noto Sans JP',sans-serif;font-size:.8rem;
  }
  .arrow-tick-btn:hover{border-color:var(--gold);background:rgba(169,132,63,.10);}
  .arrow-tick-btn:focus-visible{outline:2px solid var(--gold);outline-offset:1px;}
  /* The type selector is deliberate. The sheet's global `input[type="number"]` rule is more
     specific than a bare class, so a plain .arrow-tick-input rule loses the cascade and the
     ticker inherits the full-width form styling. Matching on the type as well wins it back. */
  input[type="number"].arrow-tick-input{
    width:46px;flex:none;padding:3px 4px;text-align:center;
    font-family:'EB Garamond',serif;font-size:.88rem;
    border:1px solid var(--line);border-radius:4px;background:#fffdf8;color:var(--ink);
  }
  /* The shared .ghost padding is sized for full-width buttons under a table; in a list row it
     makes the row twice as tall as its text. */
  button.ghost.arrow-pick-add{padding:4px 10px;flex:none;}
  /* Equipment row: the arrow icon sits beside the Item name without disturbing the cell. */
  .eq-name-row{display:flex;align-items:center;gap:6px;}
  .eq-name-row .eq-name{flex:1 1 auto;min-width:0;}
  .eq-arrow-icon{display:none;width:20px;height:20px;flex:none;color:var(--gold);}
  .eq-arrow-icon svg{width:100%;height:100%;display:block;}

"""
src = once(src, CSS_ANCHOR, CSS_NEW + CSS_ANCHOR, "css")

# ---- 2. ARROW_LIBRARY gains key / cost / special ----
# Every printed DR is unchanged, so Part B's bow arithmetic and its regression suite are
# untouched. What is added is the ammunition data Feature 6 needs but Part B had no use for:
# `key` (a DOM-safe id for icons and buttons), `cost` (bu, from the Equipment tables) and
# `special` (the short special-rules line the brief tabulates). `notes` keeps its longer
# free-text form because that is what an Equipment row's Notes column shows.
OLD = """  // Arrow DR table \u2014 a bow fires these; the bow contributes only its Strength rating.
  // Part C's Ammo Tracking feature will let a row select and consume a specific arrow type;
  // until then getWeaponDamageDice() uses DEFAULT_ARROW (the standard Willow Leaf).
  const ARROW_LIBRARY = [
    {name:'Willow Leaf', damage:{roll:2,keep:2}, notes:'Standard arrow.'},
    {name:'Armor Piercing', damage:{roll:1,keep:1}, notes:'Ignores the Armor TN bonus provided by armor.'},
    {name:'Flesh Cutter', damage:{roll:2,keep:3}, notes:'Double the Armor TN bonus provided by armor; 1/2 range.'},
    {name:'Humming Bulb', damage:{roll:0,keep:1}, notes:'Makes a loud whistling sound.'},
    {name:'Rope Cutter', damage:{roll:1,keep:1}, notes:'2 Free Raises for Called Shots against inanimate objects; 1/2 range.'},
  ];"""
NEW = """  // Arrow DR table \u2014 a bow fires these; the bow contributes only its Strength rating.
  // PART C FEATURE 6 filled in the ammunition half of this table. Every printed DR below is
  // exactly what Part B shipped, so bow damage is unchanged; what Feature 6 added is the data
  // Part B had no use for:
  //   key     \u2014 a DOM-safe identifier, used for icon lookup and for element ids.
  //   cost    \u2014 price in bu, from the Equipment tables.
  //   special \u2014 the short special-rules line, shown in tooltips and in the ammunition popup.
  //   notes   \u2014 unchanged: the longer free-text form an Equipment row's Notes column shows.
  // The special rules themselves (ignoring or doubling armour TN, halved range, the Free Raises
  // against objects) are printed, NOT automated \u2014 armour TN and Reduction are manual on this
  // sheet, and automating them is explicitly out of Feature 6's scope.
  const ARROW_LIBRARY = [
    {name:'Willow Leaf', key:'willowLeaf', cost:1, damage:{roll:2,keep:2},
     special:'None', notes:'Standard arrow.'},
    {name:'Armor Piercing', key:'armorPiercing', cost:2, damage:{roll:1,keep:1},
     special:'Ignores armor TN bonus', notes:'Ignores the Armor TN bonus provided by armor.'},
    {name:'Flesh Cutter', key:'fleshCutter', cost:5, damage:{roll:2,keep:3},
     special:'Doubles armor TN bonus, 1/2 range', notes:'Double the Armor TN bonus provided by armor; 1/2 range.'},
    {name:'Humming Bulb', key:'hummingBulb', cost:5, damage:{roll:0,keep:1},
     special:'Loud whistling sound', notes:'Makes a loud whistling sound.'},
    {name:'Rope Cutter', key:'ropeCutter', cost:3, damage:{roll:1,keep:1},
     special:'2 Free Raises vs objects, 1/2 range', notes:'2 Free Raises for Called Shots against inanimate objects; 1/2 range.'},
  ];"""
src = once(src, OLD, NEW, "arrow-library")

# ---- 3. Equipment: the "+ Add Arrows" button ----
OLD = """    <button class="ghost add-row-btn print-hide" id="addSpellScroll">+ Add Spell Scroll</button>"""
NEW = """    <button class="ghost add-row-btn print-hide" id="addSpellScroll">+ Add Spell Scroll</button>
    <!-- PART C FEATURE 6: arrows are ordinary Equipment rows; this picker just adds them with a
         quantity and merges repeats into the row that already exists. -->
    <button class="ghost add-row-btn print-hide" id="addArrows">+ Add Arrows</button>"""
src = once(src, OLD, NEW, "add-arrows-button")

# ---- 4. The two Feature 6 modals, beside Feature 1's range prompt ----
HTML_ANCHOR = "  <!-- PART C FEATURE 1: attack-time range prompt (ranged weapons only). -->\n"
HTML_NEW = """  <!-- PART C FEATURE 6: attack-time ammunition prompt. Shown for weapons that fire arrows,
       once ammo tracking is active for the row (see ammoTrackingActive). Closing it cancels the
       attack outright: no roll, no ammunition spent, no state changed. -->
  <div class="roll-modal-overlay" id="arrowPickModalOverlay" style="display:none;">
    <div class="roll-modal">
      <div class="roll-modal-head">
        <div>
          <h3>Choose your arrow</h3>
          <div class="notation" id="arrowPickSubtitle"></div>
        </div>
        <button type="button" class="rm-btn" id="arrowPickClose" title="Cancel">\u2715</button>
      </div>
      <div id="arrowPickBody"></div>
    </div>
  </div>

  <!-- PART C FEATURE 6: Add Arrows picker, opened from the Equipment section. -->
  <div class="roll-modal-overlay" id="arrowsPickerOverlay" style="display:none;">
    <div class="roll-modal" style="max-width:620px;">
      <div class="roll-modal-head">
        <div>
          <h3>Arrows</h3>
          <div class="notation">Set a quantity and click Add \u2014 adding a type you already carry raises its count</div>
        </div>
        <button type="button" class="rm-btn" id="arrowsPickerClose" title="Close">\u2715</button>
      </div>
      <div class="arrows-picker-list" id="arrowsPickerList"></div>
      <div class="roll-note" id="arrowsPickerNote" style="margin-top:8px; min-height:1em;"></div>
    </div>
  </div>

"""
src = once(src, HTML_ANCHOR, HTML_NEW + HTML_ANCHOR, "modals")

# ---- 5. Feature 6 JS block, immediately before the Feature 4 block ----
JS_ANCHOR = "  // ============ PART C FEATURE 4: VOID POINT AUTOMATION ============\n"
src = once(src, JS_ANCHOR, js + JS_ANCHOR, "js-block")

# ---- 6. P2: informational modifiers ----------------------------------------------------
# Two small additive edits (P2 is my own prerequisite, not a frozen function). An informational
# modifier carries text but no arithmetic: it exists so the breakdown bar can name a number that
# is ALREADY in the pool. Forcing its deltas to zero in the normaliser means applyPreRollModifiers
# needs no new case and no informational contributor can ever move a die.
OLD = """        const norm = {
          source: mod.source || m.id,
          label: mod.label || m.id,
          rolledDelta: parseInt(mod.rolledDelta, 10) || 0,
          keptDelta: parseInt(mod.keptDelta, 10) || 0,
          totalDelta: parseInt(mod.totalDelta, 10) || 0,
          note: mod.note || '',
          // PART C FEATURE 4 - a modifier may also force exploding dice on (Void's +1 Skill Rank
          // lifts the Unskilled penalty). undefined means "do not care", which is the default.
          explodeOverride: (mod.explodeOverride === undefined) ? undefined : !!mod.explodeOverride,
        };
        if(norm.rolledDelta || norm.keptDelta || norm.totalDelta || norm.explodeOverride !== undefined) out.push(norm);"""
NEW = """        // PART C FEATURE 6 - an INFORMATIONAL modifier documents where a number in the pool
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
           norm.explodeOverride !== undefined || norm.informational) out.push(norm);"""
src = once(src, OLD, NEW, "p2-informational")

OLD = """      if(m.totalDelta) bits.push((m.totalDelta >= 0 ? '+' : '') + m.totalDelta + ' to total');
      rows.push({ label:m.label, txt:bits.join(', ') + (m.note ? ' \u2014 ' + m.note : '') });"""
NEW = """      if(m.totalDelta) bits.push((m.totalDelta >= 0 ? '+' : '') + m.totalDelta + ' to total');
      // PART C FEATURE 6 - an informational modifier has no delta to print, so it prints itself.
      if(!bits.length && m.display) bits.push(m.display);
      rows.push({ label:m.label, txt:bits.join(', ') + (m.note ? ' \u2014 ' + m.note : '') });"""
src = once(src, OLD, NEW, "p2-bar-display")

# ---- 7. Weapon row: the saved wp_arrowType field ----
OLD = """        <input type="hidden" class="wp-keywords" value="${escAttr(data.keywords||'')}">"""
NEW = """        <input type="hidden" class="wp-keywords" value="${escAttr(data.keywords||'')}">
        <!-- PART C FEATURE 6 - wp_arrowType: which arrow this bow is loaded with. Hidden rather
             than a visible control because the ammunition popup is where it gets chosen. -->
        <input type="hidden" class="wp-arrow-type" value="${escAttr(data.arrowType||'')}">"""
src = once(src, OLD, NEW, "wp-arrow-type-input")

# ---- 8. resolveWeaponContext supplies the arrow ----
OLD = """        arrow: null, manualAttack:false, manualDamage:false,
      };"""
NEW = """        // PART C FEATURE 6 - a keyless (string) lookup has no row to read, so only the arrow
        // currently in flight can apply.
        arrow: getLastArrowUsed(), manualAttack:false, manualDamage:false,
      };"""
src = once(src, OLD, NEW, "ctx-arrow-string")

OLD = """      arrow: null, // Part C (Ammo Tracking) will read the row's selected arrow here."""
NEW = """      // PART C FEATURE 6 - the arrow this roll uses: the one the last attack loosed, else the
      // one this row is loaded with, else none (and Part B falls back to DEFAULT_ARROW).
      arrow: getSelectedArrowForRow(row),"""
src = once(src, OLD, NEW, "ctx-arrow-row")

# ---- 9. rollWeaponAttack: ammunition prompt + spend ----
# Placed AFTER the range prompt and its legality check on purpose. Both prompts can cancel the
# attack, but only this one has a side effect, so it must be the last thing that can be backed
# out of -- otherwise abandoning the range prompt would already have cost an arrow.
OLD = """    // PART C P2 \u2014 routed through the pre-roll modifier pipeline. The range decision travels in
    // the context, so the registered contributor stays pure and nothing leaks between rolls.
    const rolled = rollWithModifiers(title,
      makeRollContext(ROLL_KINDS.ATTACK, { skillName:ctx.skillName, weaponEntry:ctx.entry,
        skillRank:ctx.skillRank, unskilled:atk.unskilled, range:rangeDecision }),
      atk.numDice, atk.keepDice);"""
NEW = """    // PART C FEATURE 6 \u2014 ammunition. Asked AFTER the range prompt on purpose: both prompts can
    // cancel the attack, but only this one has a side effect, so it must be the last thing the
    // player can back out of. Cancelling here spends nothing and rolls nothing (spec 5.2.D).
    // The prompt only appears once ammo tracking is active for this row, so a character who has
    // never put arrows in Equipment fires exactly as they did before Feature 6 existed.
    let arrowChoice = null;
    if(weaponUsesAmmo(ctx.entry) && ammoTrackingActive(ctx.row)){
      arrowChoice = await promptArrowSelection(ctx.entry);
      if(!arrowChoice){ setStatus('Attack cancelled \u2014 no arrow nocked.'); return; }
      // spendArrow() checks the quantity before touching a single row, so a refusal here has
      // consumed nothing. Reachable if the quiver changed while the popup was open.
      if(!spendArrow(arrowChoice, 1)){
        await appAlert('You have no ' + arrowChoice + ' arrows left.');
        setStatus('Attack cancelled \u2014 out of ' + arrowChoice + '.');
        return;
      }
      setLastArrowUsed(arrowChoice);
      setRowArrowType(ctx.row, arrowChoice);
      ctx.arrow = arrowChoice;
      if(ctx.row) refreshWeaponRow(ctx.row);
      setStatus(arrowChoice + ' loosed \u2014 ' + getArrowQuantity(arrowChoice) + ' left in your quiver.');
    }
    // PART C P2 \u2014 routed through the pre-roll modifier pipeline. The range decision travels in
    // the context, so the registered contributor stays pure and nothing leaks between rolls.
    const rolled = rollWithModifiers(title,
      makeRollContext(ROLL_KINDS.ATTACK, { skillName:ctx.skillName, weaponEntry:ctx.entry,
        skillRank:ctx.skillRank, unskilled:atk.unskilled, range:rangeDecision,
        arrow:arrowChoice }),
      atk.numDice, atk.keepDice);"""
src = once(src, OLD, NEW, "attack-ammo")

# ---- 10. rollWeaponDamage: name the arrow, then release it ----
OLD = """    const result = dmg.explodeOn
      ? rollWeaponDicePool(dmg.numDice, dmg.keepDice, dmg.explodeOn)
      : rollDicePool(dmg.numDice, dmg.keepDice);
    showRollResult(title, result);
  }"""
NEW = """    const result = dmg.explodeOn
      ? rollWeaponDicePool(dmg.numDice, dmg.keepDice, dmg.explodeOn)
      : rollDicePool(dmg.numDice, dmg.keepDice);
    showRollResult(title, result);
    // PART C FEATURE 6 \u2014 name the arrow this roll used, then release it. The breakdown is a
    // post-render decoration: the pool ALREADY contains the arrow's DR (getWeaponDamageDice
    // added it), so the entry is informational and moves nothing. Clearing lastArrowUsed here
    // is what makes the NEXT attack's choice the one that counts. The row's .wp-arrow-type is
    // deliberately not cleared \u2014 it is the saved record of what this bow is loaded with.
    attachArrowDamageBreakdown(ctx, dmg, result);
    clearLastArrowUsed();
  }"""
src = once(src, OLD, NEW, "damage-arrow")

# ---- 11. refreshWeaponRow previews the loaded arrow ----
OLD = """    const atk = getWeaponAttackDice(skillName);
    const dmg = getWeaponDamageDice(entry, skillRank);
    tr.querySelector('.wp-dmg-roll').value = dmg.numDice;"""
NEW = """    const atk = getWeaponAttackDice(skillName);
    // PART C FEATURE 6 - the row previews the arrow it is loaded with, so the Damage box always
    // reads what the damage button will actually roll. With no arrow selected this resolves to
    // the library default and the box is byte-identical to Feature 4.
    const dmg = getWeaponDamageDice(entry, skillRank, { arrow: getRowArrowType(tr) });
    tr.querySelector('.wp-dmg-roll').value = dmg.numDice;"""
src = once(src, OLD, NEW, "refresh-row-arrow")

OLD = """      const kw = [entry.size].concat(entry.keywords||[]).filter(Boolean);
      if(kw.length) bits.push(`<span class="wp-note-kw">${escHtml(kw.join(' \u00b7 '))}</span>`);"""
NEW = """      const kw = [entry.size].concat(entry.keywords||[]).filter(Boolean);
      if(kw.length) bits.push(`<span class="wp-note-kw">${escHtml(kw.join(' \u00b7 '))}</span>`);
      // PART C FEATURE 6 - only once ammo tracking is active for this row, so a bow belonging to
      // a character who has never bought arrows keeps exactly the note line it had before.
      if(weaponUsesAmmo(entry) && ammoTrackingActive(tr)){
        const nocked = getRowArrowType(tr);
        // With an arrow nocked the count is that TYPE's; with none nocked it is everything the
        // character is carrying, because "0 in quiver" beside a full quiver would be a lie.
        const left = nocked ? getArrowQuantity(nocked)
                            : ARROW_LIBRARY.reduce((n,a)=>n + getArrowQuantity(a.name), 0);
        bits.push(`<span class="wp-note-kw">Arrow: ${escHtml(nocked || 'none nocked')} \u00b7 ${left} in quiver</span>`);
      }"""
src = once(src, OLD, NEW, "refresh-row-note")

# ---- 12. showWeaponInfoModal reports the ammunition ----
OLD = """    const atk = getWeaponAttackDice(skillName);
    const dmg = getWeaponDamageDice(entry, skillRank);
    const kw = [entry.size].concat(entry.keywords||[]).filter(Boolean).join(', ');"""
NEW = """    const atk = getWeaponAttackDice(skillName);
    // PART C FEATURE 6 - explain the row as it is actually loaded, not as an empty quiver.
    const dmg = getWeaponDamageDice(entry, skillRank, { arrow: getRowArrowType(tr) });
    const kw = [entry.size].concat(entry.keywords||[]).filter(Boolean).join(', ');"""
src = once(src, OLD, NEW, "info-modal-dmg")

OLD = """    if(entry.range) lines.push(`Range: ${entry.range} ft`);
    lines.push('');"""
NEW = """    if(entry.range) lines.push(`Range: ${entry.range} ft`);
    // PART C FEATURE 6 - ammunition, for the weapons that fire it.
    if(weaponUsesAmmo(entry)){
      const nocked = findArrow(getRowArrowType(tr) || DEFAULT_ARROW);
      if(nocked){
        lines.push(`Loaded with: ${nocked.name} \u2014 DR ${nocked.damage.roll}k${nocked.damage.keep}, ${nocked.cost} bu`);
        lines.push(`Arrow special rules: ${nocked.special}`);
        lines.push(`In your quiver: ${getArrowQuantity(nocked.name)}`);
      }
    }
    lines.push('');"""
src = once(src, OLD, NEW, "info-modal-ammo")

# ---- 13. Equipment row: icon slot, tooltip, and zero-quantity removal ----
OLD = """      <td><input type="text" class="eq-name" value="${escAttr(data.name||'')}"></td>"""
NEW = """      <td>
        <div class="eq-name-row">
          <span class="eq-arrow-icon" aria-hidden="true"></span>
          <input type="text" class="eq-name" value="${escAttr(data.name||'')}">
        </div>
      </td>"""
src = once(src, OLD, NEW, "equip-row-icon")

OLD = """      tr.remove();
      recalcAll(); // re-locks (or unlocks) every visible spell in techQuickAdd against the new Equipment state
    });
    return tr;
  }"""
NEW = """      tr.remove();
      recalcAll(); // re-locks (or unlocks) every visible spell in techQuickAdd against the new Equipment state
    });
    // PART C FEATURE 6 - an arrow row carries its icon and its DR/cost/special tooltip, kept in
    // step as the Item name is edited, so renaming a row into or out of arrow-hood is immediate.
    // An arrow row whose quantity is COMMITTED at 0 removes itself (spec 5.1.C). That is bound
    // to `change`, not `input`, so typing the "1" of "10" over a "0" never deletes the row
    // mid-keystroke, and it is scoped to arrow rows so an ordinary item may sit at 0 in peace.
    tr.querySelector('.eq-name').addEventListener('input', ()=>refreshEquipRow(tr));
    tr.querySelector('.eq-qty').addEventListener('change', ()=>{
      if(!arrowFromEquipLabel(tr.querySelector('.eq-name').value)) return;
      if((parseInt(tr.querySelector('.eq-qty').value || '0', 10) || 0) <= 0){
        tr.remove();
        recalcAll();
      }
    });
    refreshEquipRow(tr);
    return tr;
  }"""
src = once(src, OLD, NEW, "equip-row-wiring")

# ---- 14. collectData saves wp_arrowType ----
OLD = """        manualAttack: tr.dataset.manualAttack === '1',
        manualDamage: tr.dataset.manualDamage === '1',
      });
    });"""
NEW = """        manualAttack: tr.dataset.manualAttack === '1',
        manualDamage: tr.dataset.manualDamage === '1',
        // PART C FEATURE 6 - wp_arrowType: which arrow this bow is loaded with (spec 5.6.B).
        // The in-flight lastArrowUsed is deliberately NOT here: it is memory-only (spec 5.6.C).
        // Arrow ITEMS need nothing new \u2014 they are ordinary Equipment rows, already saved below.
        arrowType: (tr.querySelector('.wp-arrow-type') || {}).value || '',
      });
    });"""
src = once(src, OLD, NEW, "collect-arrow-type")

# ---- 15. Clearing the sheet clears the shot that was in the air ----
# Found by the harness (F6-F10): loading a character while an arrow was nocked carried that
# arrow onto the newly-loaded sheet. clearAllRows() is the one place BOTH applyData() and
# resetToBaseline() pass through, which makes it the right home for the teardown.
OLD = """  function clearAllRows(){
    ['skillsBody','weaponsBody','equipBody'].forEach(id=>document.getElementById(id).innerHTML='');
    ['advList','disadvList','techList'].forEach(id=>document.getElementById(id).innerHTML='');
  }"""
NEW = """  function clearAllRows(){
    ['skillsBody','weaponsBody','equipBody'].forEach(id=>document.getElementById(id).innerHTML='');
    ['advList','disadvList','techList'].forEach(id=>document.getElementById(id).innerHTML='');
    // PART C FEATURE 6 - the arrow in flight is memory-only, and it belongs to the character
    // whose weapon rows have just been thrown away. Loading or resetting a sheet must not carry
    // it across, for exactly the reason applyData() resets prevVoidRank.
    clearLastArrowUsed();
  }"""
src = once(src, OLD, NEW, "clear-arrow-in-flight")

# ---- 16. Init wiring ----
OLD = """    // PART C FEATURE 4 - Void spend panel.
    renderVoidPanel();"""
NEW = """    // PART C FEATURE 6 - Add Arrows picker, and a first decoration pass over Equipment.
    document.getElementById('addArrows').addEventListener('click', openArrowsPicker);
    document.getElementById('arrowsPickerClose').addEventListener('click', closeArrowsPicker);
    document.getElementById('arrowsPickerOverlay').addEventListener('click', e=>{
      if(e.target.id === 'arrowsPickerOverlay') closeArrowsPicker();
    });
    refreshAllEquipRows();
    // PART C FEATURE 4 - Void spend panel.
    renderVoidPanel();"""
src = once(src, OLD, NEW, "init-wiring")

# ---- 17. seam ----
SEAM = "    // ---- PART C FEATURE 4: void automation ----"
SEAM_NEW = ("    // ---- PART C FEATURE 6: ammo tracking ----\n"
            "    ARROW_ICONS, ARROW_EQUIP_PREFIX, arrowIcon,\n"
            "    arrowEquipLabel, arrowFromEquipLabel, arrowEquipNotes, arrowTooltip,\n"
            "    arrowEquipRows, getArrowQuantity, anyArrowEquipRows,\n"
            "    addArrowToEquipment, spendArrow, pruneEmptyArrowRows,\n"
            "    getLastArrowUsed, setLastArrowUsed, clearLastArrowUsed,\n"
            "    weaponUsesAmmo, getRowArrowType, setRowArrowType, getSelectedArrowForRow,\n"
            "    ammoTrackingActive, arrowPreRollModifiers, attachArrowDamageBreakdown,\n"
            "    promptArrowSelection, renderArrowsPicker, openArrowsPicker, closeArrowsPicker,\n"
            "    makeEquipRow, refreshEquipRow, refreshAllEquipRows,\n"
            + SEAM)
src = once(src, SEAM, SEAM_NEW, "seam")

if not os.path.isdir(OUTDIR): os.makedirs(OUTDIR)
write(OUT, src)
print("edits:", ", ".join(edits))
print("out: %d chars sha=%s" % (len(src), hashlib.sha256(src.encode('utf-8')).hexdigest()[:16]))
