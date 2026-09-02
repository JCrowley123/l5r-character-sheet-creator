import io, os, hashlib

SCRATCH = os.path.dirname(os.path.abspath(__file__))
BASE = r"C:\Users\jcrow\Documents\L5R character sheet creator\Versions"
SRC = os.path.join(BASE, "PART C \u2014 Feature 3 Wound Penalties",
                   "l5r-character-sheet part C feature 3 wounds.html")
OUTDIR = os.path.join(BASE, "PART C \u2014 Feature 4 Void Automation")
OUT = os.path.join(OUTDIR, "l5r-character-sheet part C feature 4 void.html")

def read(p):
    with io.open(p,'r',encoding='utf-8',newline='') as f: return f.read()
def write(p,s):
    with io.open(p,'w',encoding='utf-8',newline='') as f: f.write(s)

src = read(SRC); js = read(os.path.join(SCRATCH,'f4_js.txt'))
edits=[]
def once(t, needle, repl, label):
    n = t.count(needle)
    if n != 1: raise SystemExit("ANCHOR [%s]: %d occurrences, expected 1" % (label,n))
    edits.append(label); return t.replace(needle, repl, 1)

# ---- 1. CSS ----
CSS_ANCHOR = "  /* ---------- PART C FEATURE 2: stance tiles ---------- */\n"
CSS_NEW = """  /* ---------- PART C FEATURE 4: Void spend panel ---------- */
  .void-panel{
    margin-top:14px;padding:9px 10px;
    border:1px solid var(--line);border-radius:6px;background:rgba(94,74,140,.06);
  }
  .void-panel-head{
    display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:7px;
    font-family:'Noto Sans JP',sans-serif;font-size:.72rem;
  }
  .void-panel-head label{
    display:flex;align-items:center;gap:5px;margin:0;
    font-size:.66rem;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-soft);
  }
  #voidSpendButtons{display:flex;flex-wrap:wrap;gap:6px;}
  .void-spend-btn{
    font-family:'Noto Sans JP',sans-serif;font-size:.68rem;padding:5px 9px;
    border:1px solid var(--line);border-radius:5px;background:#fffdf8;
    color:var(--ink);cursor:pointer;
  }
  .void-spend-btn:hover:not([disabled]){border-color:var(--gold);background:rgba(169,132,63,.10);}
  .void-spend-btn:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
  .void-spend-btn[disabled]{opacity:.42;cursor:not-allowed;}
  #voidPanelNote{
    font-family:'Noto Sans JP',sans-serif;font-size:.66rem;line-height:1.45;
    color:var(--ink-soft);margin-top:6px;
  }
  #voidDamageRow{display:none;align-items:center;gap:6px;margin-top:7px;}
  #voidDamageRow label{
    margin:0;font-family:'Noto Sans JP',sans-serif;font-size:.66rem;
    letter-spacing:.04em;text-transform:uppercase;color:var(--ink-soft);
  }
  #voidDamageInput{
    width:88px;padding:4px 6px;font-family:'EB Garamond',serif;font-size:.92rem;
    border:1px solid var(--line);border-radius:5px;background:#fffdf8;color:var(--ink);
  }

"""
src = once(src, CSS_ANCHOR, CSS_NEW + CSS_ANCHOR, "css")

# ---- 2. Void panel UI + ephemeral state, directly after the stance tiles ----
HTML_ANCHOR = '    <div class="combat-round-box print-hide">'
HTML_NEW = ('    <!-- PART C FEATURE 4: Void automation state. Both ids intentionally lack the\n'
            '         "f_" prefix so collectData() (frozen) never persists them. -->\n'
            '    <input type="hidden" id="voidPendingEffects" value="{}">\n'
            '    <input type="hidden" id="isCombatActive" value="0">\n'
            '    <input type="hidden" id="voidInitSkirmish" value="0">\n'
            '    <div class="void-panel print-hide">\n'
            '      <div class="void-panel-head">\n'
            '        <strong>Spend a Void Point</strong>\n'
            '        <label><input type="checkbox" id="combatActiveToggle"> Combat active</label>\n'
            '      </div>\n'
            '      <div id="voidSpendButtons"></div>\n'
            '      <div id="voidDamageRow">\n'
            '        <label for="voidDamageInput">Damage announced</label>\n'
            '        <input type="number" id="voidDamageInput" min="0" step="1" inputmode="numeric">\n'
            '        <button type="button" class="ghost" id="voidDamageApply">Reduce by 10 &amp; take Wounds</button>\n'
            '        <button type="button" class="ghost" id="voidDamageCancel">Cancel</button>\n'
            '      </div>\n'
            '      <div id="voidPanelNote"></div>\n'
            '    </div>\n\n' + HTML_ANCHOR)
src = once(src, HTML_ANCHOR, HTML_NEW, "void-panel")

# ---- 3. Feature 4 JS block, immediately before the Feature 3 block ----
JS_ANCHOR = "  // ============ PART C FEATURE 3: WOUND PENALTIES ============\n"
src = once(src, JS_ANCHOR, js + JS_ANCHOR, "js-block")

# ---- 4. P2: carry explodeOverride through, and consume one-roll Void effects -------------
# Three small additive edits to the pipeline (P2 is not a frozen function). explodeOverride exists
# because V5 changes how dice EXPLODE, not how many there are, and the normaliser would otherwise
# discard any field it does not know about.
OLD = """          totalDelta: parseInt(mod.totalDelta, 10) || 0,
          note: mod.note || '',
        };"""
NEW = """          totalDelta: parseInt(mod.totalDelta, 10) || 0,
          note: mod.note || '',
          // PART C FEATURE 4 - a modifier may also force exploding dice on (Void's +1 Skill Rank
          // lifts the Unskilled penalty). undefined means "do not care", which is the default.
          explodeOverride: (mod.explodeOverride === undefined) ? undefined : !!mod.explodeOverride,
        };"""
src = once(src, OLD, NEW, "p2-normalise-explode")

OLD = """        if(norm.rolledDelta || norm.keptDelta || norm.totalDelta) out.push(norm);"""
NEW = """        if(norm.rolledDelta || norm.keptDelta || norm.totalDelta || norm.explodeOverride !== undefined) out.push(norm);"""
src = once(src, OLD, NEW, "p2-keep-explode-only-mods")

OLD = """    let totalDelta = 0;
    (mods || []).forEach(m=>{ rolled += m.rolledDelta; kept += m.keptDelta; totalDelta += m.totalDelta; });
    rolled = Math.max(0, rolled);
    kept = Math.max(0, Math.min(kept, rolled));   // can never keep more dice than are rolled
    return { rolled, kept, totalDelta, applied: (mods || []).slice() };"""
NEW = """    let totalDelta = 0;
    let explodeOverride;                          // PART C FEATURE 4 - last explicit wins
    (mods || []).forEach(m=>{
      rolled += m.rolledDelta; kept += m.keptDelta; totalDelta += m.totalDelta;
      if(m.explodeOverride !== undefined) explodeOverride = m.explodeOverride;
    });
    rolled = Math.max(0, rolled);
    kept = Math.max(0, Math.min(kept, rolled));   // can never keep more dice than are rolled
    return { rolled, kept, totalDelta, explodeOverride, applied: (mods || []).slice() };"""
src = once(src, OLD, NEW, "p2-apply-explode")

OLD = """    const result = opts.explodeOn
      ? rollWeaponDicePool(adj.rolled, adj.kept, opts.explodeOn)
      : rollDicePool(adj.rolled, adj.kept, opts.explode);"""
NEW = """    // PART C FEATURE 4 - a modifier may override the caller's explode setting (Void's +1 Skill
    // Rank lifting the Unskilled penalty). Absent an override the caller's own value is used.
    const explodeSetting = (adj.explodeOverride === undefined) ? opts.explode : adj.explodeOverride;
    const result = opts.explodeOn
      ? rollWeaponDicePool(adj.rolled, adj.kept, opts.explodeOn)
      : rollDicePool(adj.rolled, adj.kept, explodeSetting);"""
src = once(src, OLD, NEW, "p2-explode-setting")

OLD = """    showRollResult(title, composed, opts.tnConfig);
    attachRollModifierBreakdown(adj, result.bonus);"""
NEW = """    showRollResult(title, composed, opts.tnConfig);
    attachRollModifierBreakdown(adj, result.bonus);
    // PART C FEATURE 4 - one-roll Void effects are spent by the roll that just happened. This is
    // the only place every roll kind passes through, which is why the consumption lives here
    // rather than in each orchestrator. Guarded so P2 stays usable without Feature 4.
    if(typeof consumeVoidOneRollEffects === 'function') consumeVoidOneRollEffects(adj);"""
src = once(src, OLD, NEW, "p2-consume-void")

# ---- 5. recalcAll: Void Armor TN + Initiative, additive with stance ----
OLD = """    const stanceTN = (typeof getStanceArmorTNBonus === 'function') ? getStanceArmorTNBonus() : 0;
    document.getElementById('f_currentTN').value = baseTN + armorTN + stanceTN;"""
NEW = """    const stanceTN = (typeof getStanceArmorTNBonus === 'function') ? getStanceArmorTNBonus() : 0;
    // PART C FEATURE 4 - a spent Void Point raises Armor TN until end of round, stacking
    // additively with armour and with every stance effect.
    const voidTN = (typeof getVoidArmorTNBonus === 'function') ? getVoidArmorTNBonus() : 0;
    document.getElementById('f_currentTN').value = baseTN + armorTN + stanceTN + voidTN;"""
src = once(src, OLD, NEW, "recalc-tn")

OLD = """    const stanceInit = (typeof getStanceInitiativeBonus === 'function') ? getStanceInitiativeBonus() : 0;
    document.getElementById('f_initiative').value =
      formatRollNotation(reflexes+insightRank, reflexes) + (stanceInit ? ' +' + stanceInit : '');"""
NEW = """    const stanceInit = (typeof getStanceInitiativeBonus === 'function') ? getStanceInitiativeBonus() : 0;
    const voidInit = (typeof getVoidInitiativeBonus === 'function') ? getVoidInitiativeBonus() : 0;
    const totalInit = stanceInit + voidInit;      // PART C FEATURE 4 - additive with Center
    document.getElementById('f_initiative').value =
      formatRollNotation(reflexes+insightRank, reflexes) + (totalInit ? ' +' + totalInit : '');"""
src = once(src, OLD, NEW, "recalc-init")

# ---- 6. Init wiring (in the init IIFE, after every const has initialised) ----
OLD = """    // PART C FEATURE 2 - stance tiles + rules modal.
    renderStanceTiles();"""
NEW = """    // PART C FEATURE 2 - stance tiles + rules modal.
    renderStanceTiles();
    // PART C FEATURE 4 - Void spend panel.
    renderVoidPanel();
    document.getElementById('combatActiveToggle').addEventListener('change', e=>{
      setCombatActive(e.target.checked); recalcAll();
    });
    document.getElementById('voidDamageApply').addEventListener('click', ()=>{
      const res = applyVoidDamageReduction(document.getElementById('voidDamageInput').value);
      if(res) toggleVoidDamageRow(false);
    });
    document.getElementById('voidDamageCancel').addEventListener('click', ()=>toggleVoidDamageRow(false));"""
src = once(src, OLD, NEW, "init-wiring")

# Round advance / reset must refresh the Void panel too (V2/V3 expire with the round).
OLD = """    advanceCombatRound(); recalcAll(); renderStanceTiles();
    setStatus('Round ' + getCombatRound() + '.');"""
NEW = """    advanceCombatRound(); recalcAll(); renderStanceTiles(); renderVoidPanel();
    setStatus('Round ' + getCombatRound() + '.');"""
src = once(src, OLD, NEW, "next-round-refresh")

OLD = """    resetCombatRound(); clearFullDefenseBonus(); setCurrentStance(DEFAULT_STANCE, {silent:true});
    setStatus('Combat rounds reset.');"""
NEW = """    resetCombatRound(); clearFullDefenseBonus(); setCurrentStance(DEFAULT_STANCE, {silent:true});
    clearVoidPending(); clearVoidSkirmishEffects(); recalcAll(); renderVoidPanel();
    setStatus('Combat rounds reset.');"""
src = once(src, OLD, NEW, "reset-round-refresh")

# ---- 7. seam ----
SEAM = "    // ---- PART C FEATURE 3: wound penalties ----"
SEAM_NEW = ("    // ---- PART C FEATURE 4: void automation ----\n"
            "    VOID_SPEND_LIBRARY, VOID_EFFECT_VALUES, findVoidOption,\n"
            "    getVoidPending, setVoidPending, clearVoidPending,\n"
            "    isCombatActive, setCombatActive, getVoidPoints, consumeVoidPoint,\n"
            "    canSpendVoid, spendVoid, applyVoidDamageReduction,\n"
            "    getVoidArmorTNBonus, getVoidInitiativeBonus, clearVoidSkirmishEffects,\n"
            "    voidPreRollModifiers, consumeVoidOneRollEffects, renderVoidPanel,\n"
            "    renderVoidPips,\n"
            + SEAM)
src = once(src, SEAM, SEAM_NEW, "seam")

if not os.path.isdir(OUTDIR): os.makedirs(OUTDIR)
write(OUT, src)
print("edits:", ", ".join(edits))
print("out: %d chars sha=%s" % (len(src), hashlib.sha256(src.encode('utf-8')).hexdigest()[:16]))
