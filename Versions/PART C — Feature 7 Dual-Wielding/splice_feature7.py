import io, os, hashlib

SCRATCH = os.path.dirname(os.path.abspath(__file__))
BASE = r"C:\Users\jcrow\Documents\L5R character sheet creator\Versions"
SRC = os.path.join(BASE, "PART C \u2014 Feature 6 Ammo Tracking",
                   "l5r-character-sheet part C feature 6 ammo.html")
OUTDIR = os.path.join(BASE, "PART C \u2014 Feature 7 Dual-Wielding")
OUT = os.path.join(OUTDIR, "l5r-character-sheet part C feature 7 dualwield.html")

def read(p):
    with io.open(p,'r',encoding='utf-8',newline='') as f: return f.read()
def write(p,s):
    with io.open(p,'w',encoding='utf-8',newline='') as f: f.write(s)

# The Feature 7 code block. `f7_js.txt` is the build-time name; the deliverable folder ships the
# identical file as `feature7-code-block.js.txt`, so this script re-runs from either.
def find_block():
    for n in ('f7_js.txt', 'feature7-code-block.js.txt'):
        p = os.path.join(SCRATCH, n)
        if os.path.isfile(p): return p
    raise SystemExit('Feature 7 code block not found beside this script.')

src = read(SRC); js = read(find_block())
edits=[]
def once(t, needle, repl, label):
    n = t.count(needle)
    if n != 1: raise SystemExit("ANCHOR [%s]: %d occurrences, expected 1" % (label,n))
    edits.append(label); return t.replace(needle, repl, 1)

# ---- 1. CSS ----
CSS_ANCHOR = "  /* ---------- PART C FEATURE 6: ammo tracking ---------- */\n"
CSS_NEW = """  /* ---------- PART C FEATURE 7: dual-wielding ---------- */
  /* The handedness selector lives under the weapon's name rather than in a new column, so the
     weapons table keeps its six printed columns and the print layout is untouched. It is
     display:none until a second weapon row exists (see updateHandSelector). */
  .wp-hand-row{
    display:none;align-items:center;gap:5px;margin-top:3px;
    font-family:'Noto Sans JP',sans-serif;font-size:.62rem;
    letter-spacing:.05em;text-transform:uppercase;color:var(--ink-soft);
  }
  select.wp-hand{
    width:auto;padding:2px 5px;
    font-family:'Noto Sans JP',sans-serif;font-size:.64rem;
    border:1px solid var(--line);border-radius:4px;background:#fffdf8;color:var(--ink);
  }
  .wp-hand-row.is-offhand select.wp-hand{border-color:var(--shu);color:var(--shu-dark);}
  .wp-note-hand{color:var(--ink-soft);}
  .wp-note-exempt{color:var(--gold);}
  /* Attack-hand prompt. Same shape as Feature 1's .range-opt so the attack-time prompts read
     as one family. */
  #handPickBody{display:flex;flex-direction:column;gap:8px;}
  .hand-opt{
    display:flex;flex-direction:column;gap:2px;text-align:left;width:100%;
    padding:10px 12px;border:1px solid var(--line);border-radius:6px;
    background:#fffdf8;cursor:pointer;font-family:'EB Garamond',serif;color:var(--ink);
  }
  .hand-opt:hover{border-color:var(--gold);background:rgba(169,132,63,.08);}
  .hand-opt:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
  .hand-opt-title{font-size:.95rem;}
  .hand-opt-note{
    font-family:'Noto Sans JP',sans-serif;font-size:.66rem;color:var(--ink-soft);
    letter-spacing:.02em;line-height:1.4;
  }
  /* The "roll the other hand now" control injected into a finished main-hand roll. */
  .offhand-followup{
    display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;
    margin-top:10px;padding:8px 10px;
    border:1px solid var(--line);border-radius:6px;background:rgba(123,17,19,.05);
  }
  .offhand-followup-text{
    font-family:'Noto Sans JP',sans-serif;font-size:.68rem;line-height:1.4;color:var(--ink);
  }
  button.ghost#offHandRollBtn{padding:5px 12px;}

"""
src = once(src, CSS_ANCHOR, CSS_NEW + CSS_ANCHOR, "css")

# ---- 2. SKILL_LIBRARY: declare the two off-hand masteries structurally ----
# Same shape as Phase 1/2's dmgBonus/explodeOn/reductionMod: the free text stays exactly as it
# was and a declared field carries the mechanical value. offHandMasteryAudit() cross-checks them.
OLD = """    {name:'Knives', trait:'Agility', cat:'Weapon', emph:'Aiguchi, Jitte, Kama, Sai, Tanto', m:{3:'No off-hand penalty when using a knife',5:'Sai/Jitte grant a Free Raise toward Disarm',7:'Any knife grants a Free Raise toward Extra Attack'}},"""
NEW = """    // PART C FEATURE 7 - offHandExempt declares, structurally, the Rank at which this Skill's
    // printed mastery removes the off-hand penalty. RAW (Core p.141): "Off-hand penalties do
    // not apply when using a knife."
    {name:'Knives', trait:'Agility', cat:'Weapon', emph:'Aiguchi, Jitte, Kama, Sai, Tanto', m:{3:'No off-hand penalty when using a knife',5:'Sai/Jitte grant a Free Raise toward Disarm',7:'Any knife grants a Free Raise toward Extra Attack'}, offHandExempt:3},"""
src = once(src, OLD, NEW, "skill-knives")

OLD = """    {name:'War Fan', trait:'Agility', cat:'Weapon', emph:'\u2014', m:{3:'No off-hand penalty',5:'+1 Armor TN while wielded',7:'+3 Armor TN total while wielded'}},"""
NEW = """    {name:'War Fan', trait:'Agility', cat:'Weapon', emph:'\u2014', m:{3:'No off-hand penalty',5:'+1 Armor TN while wielded',7:'+3 Armor TN total while wielded'}, offHandExempt:3},"""
src = once(src, OLD, NEW, "skill-warfan")

# ---- 3. Attack-hand prompt markup, beside the other two attack-time prompts ----
HTML_ANCHOR = "  <!-- PART C FEATURE 6: attack-time ammunition prompt. Shown for weapons that fire arrows,\n"
HTML_NEW = """  <!-- PART C FEATURE 7: attack-time handedness prompt. Shown only when the character has
       declared an off-hand weapon (see getDualWieldPair). Closing it cancels the attack. -->
  <div class="roll-modal-overlay" id="handPickModalOverlay" style="display:none;">
    <div class="roll-modal">
      <div class="roll-modal-head">
        <div>
          <h3>Attack with</h3>
          <div class="notation" id="handPickSubtitle"></div>
        </div>
        <button type="button" class="rm-btn" id="handPickClose" title="Cancel">\u2715</button>
      </div>
      <div id="handPickBody"></div>
    </div>
  </div>

"""
src = once(src, HTML_ANCHOR, HTML_NEW + HTML_ANCHOR, "hand-modal")

# ---- 4. Feature 7 JS block, immediately before the Feature 6 block ----
JS_ANCHOR = "  // ============ PART C FEATURE 6: AMMO TRACKING ============\n"
src = once(src, JS_ANCHOR, js + JS_ANCHOR, "js-block")

# ---- 5. Weapon row: the handedness selector ----
OLD = """        <div class="wp-link-note"></div>
        <input type="hidden" class="wp-key" value="${escAttr(key)}">"""
NEW = """        <!-- PART C FEATURE 7 - wp_hand. A visible control rather than a hidden field: RAW
             says handedness "is determined by the player", so it is the player's to set. Kept
             out of the table's columns so the printed sheet is unchanged, and hidden entirely
             until a second weapon row exists (updateHandSelector). -->
        <div class="wp-hand-row">
          <label>Hand</label>
          <select class="wp-hand">
            <option value="main">Main-hand</option>
            <option value="off">Off-hand</option>
          </select>
        </div>
        <div class="wp-link-note"></div>
        <input type="hidden" class="wp-key" value="${escAttr(key)}">"""
src = once(src, OLD, NEW, "hand-selector-markup")

# The selector's saved value, plus the listeners. Handedness changes ripple across the whole
# table (every other row's note depends on whether a pair exists) and into Armor TN, so this
# refreshes all rows and recalculates rather than touching only its own row.
OLD = """    tr.querySelector('.wp-skill').addEventListener('change', ()=>refreshWeaponRow(tr));"""
NEW = """    tr.querySelector('.wp-skill').addEventListener('change', ()=>refreshWeaponRow(tr));
    // PART C FEATURE 7 - handedness. normaliseHand keeps a pre-Feature-7 save (no `hand` key at
    // all) on the main-hand default, which is what makes an old character load as a
    // single-weapon character no matter how many weapons are listed.
    tr.querySelector('.wp-hand').value = normaliseHand(data.hand);
    tr.querySelector('.wp-hand').addEventListener('change', ()=>{
      refreshAllWeaponRows();
      recalcAll();
    });"""
src = once(src, OLD, NEW, "hand-selector-wiring")

# ---- 6. Adding or removing a row changes whether the selector should be visible at all ----
OLD = """    tr.querySelector('.rm-btn').addEventListener('click', ()=>tr.remove());"""
NEW = """    tr.querySelector('.rm-btn').addEventListener('click', ()=>{
      tr.remove();
      // PART C FEATURE 7 - dropping to one weapon must take the dual-wield UI, the penalties and
      // the Armor TN bonus away with it.
      refreshAllWeaponRows();
      recalcAll();
    });"""
src = once(src, OLD, NEW, "row-remove-refresh")

OLD = """          roll:'', dmg:'', manualAttack:false, manualDamage:false,
        }));
        setStatus(`Added ${lib.name}.`);"""
NEW = """          roll:'', dmg:'', manualAttack:false, manualDamage:false,
        }));
        refreshAllWeaponRows();   // PART C FEATURE 7 - a second weapon reveals the Hand selector
        setStatus(`Added ${lib.name}.`);"""
src = once(src, OLD, NEW, "quickadd-refresh")

OLD = """  document.getElementById('addWeapon').addEventListener('click', ()=>document.getElementById('weaponsBody').appendChild(makeWeaponRow({key:''})));"""
NEW = """  document.getElementById('addWeapon').addEventListener('click', ()=>{
    document.getElementById('weaponsBody').appendChild(makeWeaponRow({key:''}));
    refreshAllWeaponRows();   // PART C FEATURE 7 - a second weapon reveals the Hand selector
  });"""
src = once(src, OLD, NEW, "addweapon-refresh")

OLD = """    (data.weapons||[]).forEach(w=>document.getElementById('weaponsBody').appendChild(makeWeaponRow(w)));"""
NEW = """    (data.weapons||[]).forEach(w=>document.getElementById('weaponsBody').appendChild(makeWeaponRow(w)));
    refreshAllWeaponRows();   // PART C FEATURE 7 - selector visibility depends on the row COUNT,
                              // which is only final once every saved row has been appended."""
src = once(src, OLD, NEW, "applydata-refresh")

# ---- 7. refreshWeaponRow: selector visibility (before the unlinked-row early return) ----
OLD = """  function refreshWeaponRow(tr){
    const keyEl = tr.querySelector('.wp-key');"""
NEW = """  function refreshWeaponRow(tr){
    // PART C FEATURE 7 - before the unlinked-row early return below, so a custom weapon can be
    // declared off-hand too. (A custom row still rolls its free-text notation and takes no
    // automated penalty -- that is Part B's standing contract for unlinked rows, unchanged.)
    updateHandSelector(tr);
    const keyEl = tr.querySelector('.wp-key');"""
src = once(src, OLD, NEW, "refresh-selector")

# ---- 8. refreshWeaponRow: the handedness note bits ----
OLD = """      // PART C FEATURE 6 - only once ammo tracking is active for this row, so a bow belonging to
      // a character who has never bought arrows keeps exactly the note line it had before."""
NEW = """      // PART C FEATURE 7 - handedness, the penalty it carries, and what waives it. Returns
      // nothing at all unless the character is actually holding two weapons.
      handednessNoteBits(tr, entry, skillName, skillRank).forEach(b=>bits.push(b));
      // PART C FEATURE 6 - only once ammo tracking is active for this row, so a bow belonging to
      // a character who has never bought arrows keeps exactly the note line it had before."""
src = once(src, OLD, NEW, "refresh-hand-note")

# ---- 9. showWeaponInfoModal reports handedness ----
OLD = """    // PART C FEATURE 6 - ammunition, for the weapons that fire it.
    if(weaponUsesAmmo(entry)){"""
NEW = """    // PART C FEATURE 7 - handedness, and what it costs, for a character holding two weapons.
    if(isDualWieldActive()){
      const hand = getRowHand(tr);
      const size = weaponSizeForRow(tr, entry);
      if(hand === 'off'){
        const p = getOffHandPenalty(entry, skillName, skillRank, size);
        lines.push(`Held in: off hand (${size || 'unsized'})`);
        lines.push(p.exempt
          ? `Off-hand penalty: none \u2014 waived by ${p.exemptSource}`
          : `Off-hand penalty: ${p.penalty} to the total of every attack roll`);
      } else {
        const m = getMainHandPenalty();
        lines.push('Held in: main hand');
        lines.push(m.exempt
          ? `Dual-wield penalty: none \u2014 waived by ${m.exemptSource}`
          : `Dual-wield penalty: ${m.penalty} to the total of every attack roll while a second weapon is held`);
      }
      lines.push(`Wielding two weapons: Armor TN +${getDualWieldArmorTNBonus()} (Insight Rank)`);
    }
    // PART C FEATURE 6 - ammunition, for the weapons that fire it.
    if(weaponUsesAmmo(entry)){"""
src = once(src, OLD, NEW, "info-modal-hand")

# ---- 10. resolveWeaponContext carries the row's handedness ----
OLD = """      // PART C FEATURE 6 - the arrow this roll uses: the one the last attack loosed, else the
      // one this row is loaded with, else none (and Part B falls back to DEFAULT_ARROW).
      arrow: getSelectedArrowForRow(row),"""
NEW = """      // PART C FEATURE 6 - the arrow this roll uses: the one the last attack loosed, else the
      // one this row is loaded with, else none (and Part B falls back to DEFAULT_ARROW).
      arrow: getSelectedArrowForRow(row),
      // PART C FEATURE 7 - which hand this row is declared to be in, and the Size the penalty
      // is scaled by. Reading them here keeps the contributor pure with respect to its context.
      hand: getRowHand(row),
      weaponSize: weaponSizeForRow(row, entry),"""
src = once(src, OLD, NEW, "ctx-hand-row")

OLD = """        // PART C FEATURE 6 - a keyless (string) lookup has no row to read, so only the arrow
        // currently in flight can apply.
        arrow: getLastArrowUsed(), manualAttack:false, manualDamage:false,"""
NEW = """        // PART C FEATURE 6 - a keyless (string) lookup has no row to read, so only the arrow
        // currently in flight can apply.
        arrow: getLastArrowUsed(),
        // PART C FEATURE 7 - and no row means no declared hand: a keyless lookup is always a
        // plain single-weapon attack.
        hand: DEFAULT_HAND, weaponSize: entry ? entry.size : '',
        manualAttack:false, manualDamage:false,"""
src = once(src, OLD, NEW, "ctx-hand-string")

# ---- 11. rollWeaponAttack splits into an orchestrator + the single-hand attack --------------
# The whole of the old body from the Skill check downwards becomes performWeaponAttack(), called
# with hand:null for a single-weapon character -- which is byte-for-byte the Feature 6 path.
OLD = """    if(!ctx.skillName){ setStatus('This weapon has no linked Weapon Skill to roll.'); return; }
    const atk = getWeaponAttackDice(ctx.skillName);"""
NEW = """    // PART C FEATURE 7 - handedness. getDualWieldPair() returns null unless the player has
    // actually declared an off-hand weapon, and null takes the single-weapon path below with
    // hand:null -- no prompt, no penalty, and the same dice Feature 6 rolled.
    const pair = getDualWieldPair(ctx.row);
    if(!pair) return performWeaponAttack(ctx, { hand:null });
    const plan = await promptAttackHand(pair);
    if(!plan){ setStatus('Attack cancelled — no hand chosen.'); return false; }
    if(plan === 'main') return performWeaponAttack(resolveWeaponContext(pair.main), { hand:'main', pair });
    if(plan === 'off')  return performWeaponAttack(resolveWeaponContext(pair.off),  { hand:'off',  pair });
    // 'both' is two separate rolls. The main hand goes first; the off-hand roll is fired by a
    // control injected into the finished result, so the player can settle the first roll before
    // the second replaces it. A cancelled main-hand attack never offers the second.
    const struck = await performWeaponAttack(resolveWeaponContext(pair.main), { hand:'main', pair });
    if(struck) attachOffHandFollowUp(pair);
    return struck;
  }
  // One attack, with one weapon, in one hand. This is the entire pre-Feature-7 rollWeaponAttack()
  // body, unchanged except that it now records which hand it was made with and reports whether a
  // roll actually happened -- which is what lets the "both weapons" flow know not to offer the
  // second attack after the first was cancelled.
  async function performWeaponAttack(ctx, opts){
    opts = opts || {};
    const hand = opts.hand || null;
    if(!ctx.skillName){ setStatus('This weapon has no linked Weapon Skill to roll.'); return false; }
    const atk = getWeaponAttackDice(ctx.skillName);"""
src = once(src, OLD, NEW, "attack-split")

# Every early return inside the old body must now report "no roll happened".
OLD = """    if(atk.numDice <= 0){ setStatus(`Set your ${atk.traitName||'Trait'} before rolling ${ctx.label}.`); return; }
    const title = `${ctx.label} \u2014 Attack (${ctx.skillName}${atk.unskilled ? ', Unskilled' : ` ${atk.skillRank}`})`;"""
NEW = """    if(atk.numDice <= 0){ setStatus(`Set your ${atk.traitName||'Trait'} before rolling ${ctx.label}.`); return false; }
    // PART C FEATURE 7 - the hand is named in the title so a two-roll sequence is unambiguous.
    const handLabel = hand === 'off' ? ', off hand' : (hand === 'main' ? ', main hand' : '');
    const title = `${ctx.label} \u2014 Attack (${ctx.skillName}${atk.unskilled ? ', Unskilled' : ` ${atk.skillRank}`}${handLabel})`;"""
src = once(src, OLD, NEW, "attack-title")

OLD = """      setStatus('Attack cancelled \\u2014 Full Attack forbids ranged attacks.');
      return;
    }"""
NEW = """      setStatus('Attack cancelled \\u2014 Full Attack forbids ranged attacks.');
      return false;
    }"""
src = once(src, OLD, NEW, "attack-return-fullattack")

OLD = """      if(!rangeDecision){ setStatus('Attack cancelled.'); return; }"""
NEW = """      if(!rangeDecision){ setStatus('Attack cancelled.'); return false; }"""
src = once(src, OLD, NEW, "attack-return-range")

OLD = """        setStatus('Attack cancelled \u2014 target out of range.');
        return;
      }"""
NEW = """        setStatus('Attack cancelled \u2014 target out of range.');
        return false;
      }"""
src = once(src, OLD, NEW, "attack-return-outofrange")

OLD = """      if(!arrowChoice){ setStatus('Attack cancelled \u2014 no arrow nocked.'); return; }"""
NEW = """      if(!arrowChoice){ setStatus('Attack cancelled \u2014 no arrow nocked.'); return false; }"""
src = once(src, OLD, NEW, "attack-return-noarrow")

OLD = """        setStatus('Attack cancelled \u2014 out of ' + arrowChoice + '.');
        return;
      }"""
NEW = """        setStatus('Attack cancelled \u2014 out of ' + arrowChoice + '.');
        return false;
      }"""
src = once(src, OLD, NEW, "attack-return-outofarrows")

# The roll context gains the hand, and the function now reports success.
OLD = """      makeRollContext(ROLL_KINDS.ATTACK, { skillName:ctx.skillName, weaponEntry:ctx.entry,
        skillRank:ctx.skillRank, unskilled:atk.unskilled, range:rangeDecision,
        arrow:arrowChoice }),
      atk.numDice, atk.keepDice);"""
NEW = """      makeRollContext(ROLL_KINDS.ATTACK, { skillName:ctx.skillName, weaponEntry:ctx.entry,
        skillRank:ctx.skillRank, unskilled:atk.unskilled, range:rangeDecision,
        arrow:arrowChoice,
        // PART C FEATURE 7 - null for a single-weapon attack, which is what makes the off-hand
        // contributor silent for every character who is not dual-wielding.
        hand:hand, weaponSize:ctx.weaponSize }),
      atk.numDice, atk.keepDice);"""
src = once(src, OLD, NEW, "attack-ctx-hand")

OLD = """    attachEmphasisReroll(weaponAttackEmphasisContext(ctx.entry, ctx.skillName, rolled.finalKept));
  }"""
NEW = """    attachEmphasisReroll(weaponAttackEmphasisContext(ctx.entry, ctx.skillName, rolled.finalKept));
    return true;   // PART C FEATURE 7 - a roll actually happened
  }"""
src = once(src, OLD, NEW, "attack-return-true")

# ---- 12. recalcAll: two weapons add Insight Rank to Armor TN ----
OLD = """    const voidTN = (typeof getVoidArmorTNBonus === 'function') ? getVoidArmorTNBonus() : 0;
    document.getElementById('f_currentTN').value = baseTN + armorTN + stanceTN + voidTN;"""
NEW = """    const voidTN = (typeof getVoidArmorTNBonus === 'function') ? getVoidArmorTNBonus() : 0;
    // PART C FEATURE 7 - RAW: "characters wielding two weapons add their Insight Rank to their
    // Armor TN". Additive with armour, stance and Void exactly as those are with each other,
    // and 0 for anyone not actually holding two weapons.
    const dualTN = (typeof getDualWieldArmorTNBonus === 'function') ? getDualWieldArmorTNBonus() : 0;
    document.getElementById('f_currentTN').value = baseTN + armorTN + stanceTN + voidTN + dualTN;"""
src = once(src, OLD, NEW, "recalc-tn")

# ---- 13. collectData saves the hand ----
OLD = """        // PART C FEATURE 6 - wp_arrowType: which arrow this bow is loaded with (spec 5.6.B).
        // The in-flight lastArrowUsed is deliberately NOT here: it is memory-only (spec 5.6.C).
        // Arrow ITEMS need nothing new \u2014 they are ordinary Equipment rows, already saved below.
        arrowType: (tr.querySelector('.wp-arrow-type') || {}).value || '',"""
NEW = """        // PART C FEATURE 6 - wp_arrowType: which arrow this bow is loaded with (spec 5.6.B).
        // The in-flight lastArrowUsed is deliberately NOT here: it is memory-only (spec 5.6.C).
        // Arrow ITEMS need nothing new \u2014 they are ordinary Equipment rows, already saved below.
        arrowType: (tr.querySelector('.wp-arrow-type') || {}).value || '',
        // PART C FEATURE 7 - wp_hand. Technique-based overrides deliberately get NO field of
        // their own: they are derived from the Techniques list, which is already saved, so they
        // round-trip by construction. A saved copy would be a second source of truth that could
        // drift away from the Technique that granted it.
        hand: getRowHand(tr),"""
src = once(src, OLD, NEW, "collect-hand")

# ---- 14. seam ----
SEAM = "    // ---- PART C FEATURE 6: ammo tracking ----"
SEAM_NEW = ("    // ---- PART C FEATURE 7: dual-wielding & off-hand penalties ----\n"
            "    OFF_HAND_RULES, HAND_VALUES, DEFAULT_HAND, normaliseHand,\n"
            "    getRowHand, setRowHand, weaponRows, getDualWieldPair, isDualWieldActive,\n"
            "    getOffHandRow, getOffHandExemptRank, skillExemptsOffHand, offHandMasteryAudit,\n"
            "    OFF_HAND_TECHNIQUE_PATTERNS, getDualWieldTechniqueExemption,\n"
            "    weaponSizeForRow, offHandPenaltyForSize, getOffHandPenalty, getMainHandPenalty,\n"
            "    getDualWieldArmorTNBonus, offHandPreRollModifiers,\n"
            "    promptAttackHand, attachOffHandFollowUp, performWeaponAttack,\n"
            "    updateHandSelector, handednessNoteBits, makeEntry,\n"
            + SEAM)
src = once(src, SEAM, SEAM_NEW, "seam")

if not os.path.isdir(OUTDIR): os.makedirs(OUTDIR)
write(OUT, src)
print("edits:", ", ".join(edits))
print("out: %d chars sha=%s" % (len(src), hashlib.sha256(src.encode('utf-8')).hexdigest()[:16]))
