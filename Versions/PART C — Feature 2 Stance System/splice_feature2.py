import io, os, hashlib

SCRATCH = os.path.dirname(os.path.abspath(__file__))
BASE = r"C:\Users\jcrow\Documents\L5R character sheet creator\Versions"
SRC = os.path.join(BASE, "BUGFIX \u2014 School Skill Free Rank on Reload",
                   "l5r-character-sheet part C feature 1 + schoolfree fix.html")
OUTDIR = os.path.join(BASE, "PART C \u2014 Feature 2 Stance System")
OUT = os.path.join(OUTDIR, "l5r-character-sheet part C feature 2 stances.html")

def read(p):
    with io.open(p,'r',encoding='utf-8',newline='') as f: return f.read()
def write(p,s):
    with io.open(p,'w',encoding='utf-8',newline='') as f: f.write(s)

src = read(SRC); js = read(os.path.join(SCRATCH,'f2_js.txt'))
edits=[]
def once(t, needle, repl, label):
    n = t.count(needle)
    if n != 1: raise SystemExit("ANCHOR [%s]: %d occurrences, expected 1" % (label,n))
    edits.append(label); return t.replace(needle, repl, 1)

# ---- 1. CSS ----
CSS_ANCHOR = "  /* ---------- PART C FEATURE 1: range prompt ---------- */\n"
CSS_NEW = """  /* ---------- PART C FEATURE 2: stance tiles ---------- */
  .stance-tiles{
    display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));
    gap:8px;margin:10px 0 6px;
  }
  .stance-tile{position:relative;}
  .stance-tile-btn{
    width:100%;display:flex;flex-direction:column;align-items:center;gap:4px;
    padding:12px 8px 10px;border:1px solid var(--line);border-radius:8px;
    background:#fffdf8;cursor:pointer;color:var(--ink);
    font-family:'Noto Sans JP',sans-serif;transition:border-color .12s,background .12s,box-shadow .12s;
  }
  .stance-tile-btn:hover{border-color:var(--gold);background:rgba(169,132,63,.07);}
  .stance-tile-btn:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
  .stance-tile.selected .stance-tile-btn{
    border-color:var(--shu);background:rgba(123,17,19,.08);
    box-shadow:0 0 0 2px rgba(123,17,19,.20) inset;
  }
  .stance-icon{display:block;width:30px;height:30px;color:var(--gold);}
  .stance-tile.selected .stance-icon{color:var(--shu);}
  .stance-icon svg{width:100%;height:100%;display:block;}
  .stance-name{font-size:.76rem;font-weight:700;letter-spacing:.03em;text-align:center;line-height:1.2;}
  .stance-ring{font-size:.6rem;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft);}
  .stance-tile.selected .stance-name{color:var(--shu-dark);}
  .stance-info-btn{
    position:absolute;top:3px;right:3px;
    background:none;border:none;cursor:pointer;padding:2px 4px;
    font-size:.82rem;line-height:1;color:var(--ink-soft);opacity:.7;
  }
  .stance-info-btn:hover{opacity:1;color:var(--gold);}
  .stance-info-btn:focus-visible{outline:2px solid var(--gold);outline-offset:1px;border-radius:3px;}
  #stanceNote{
    font-family:'Noto Sans JP',sans-serif;font-size:.68rem;line-height:1.4;
    color:var(--shu-dark);margin-bottom:4px;
  }
  #stanceInfoBody{white-space:pre-line;font-family:'EB Garamond',serif;font-size:.95rem;line-height:1.5;}
  #stanceInfoRing{
    font-family:'Noto Sans JP',sans-serif;font-size:.62rem;letter-spacing:.08em;
    text-transform:uppercase;color:var(--gold);
  }

"""
src = once(src, CSS_ANCHOR, CSS_NEW + CSS_ANCHOR, "css")

# ---- 2. Tile UI + hidden state, above the round tracker ----
HTML_ANCHOR = '    <div class="combat-round-box print-hide">'
HTML_NEW = ('    <!-- PART C FEATURE 2: stance state. All three ids intentionally lack the "f_"\n'
            '         prefix so collectData() (frozen) never persists them. -->\n'
            '    <input type="hidden" id="combatStance" value="Attack">\n'
            '    <input type="hidden" id="fullDefenseBonus" value="0">\n'
            '    <input type="hidden" id="fullDefenseRound" value="0">\n'
            '    <div class="print-hide">\n'
            '      <label>Combat Stance</label>\n'
            '      <div class="stance-tiles" id="stanceTiles"></div>\n'
            '      <div id="stanceNote">No stance modifiers.</div>\n'
            '    </div>\n\n' + HTML_ANCHOR)
src = once(src, HTML_ANCHOR, HTML_NEW, "tiles-ui")

# ---- 3. Stance info modal ----
MODAL_ANCHOR = '  <!-- PART C FEATURE 1: attack-time range prompt (ranged weapons only). -->'
MODAL_NEW = ('  <!-- PART C FEATURE 2: stance rules tooltip. -->\n'
             '  <div class="roll-modal-overlay" id="stanceInfoOverlay" style="display:none;">\n'
             '    <div class="roll-modal">\n'
             '      <div class="roll-modal-head">\n'
             '        <div>\n'
             '          <h3 id="stanceInfoTitle">Stance</h3>\n'
             '          <div id="stanceInfoRing"></div>\n'
             '        </div>\n'
             '        <button type="button" class="rm-btn" id="stanceInfoClose" title="Close">\u2715</button>\n'
             '      </div>\n'
             '      <div id="stanceInfoBody"></div>\n'
             '    </div>\n'
             '  </div>\n\n' + MODAL_ANCHOR)
src = once(src, MODAL_ANCHOR, MODAL_NEW, "info-modal")

# ---- 4. JS block, before Feature 1 ----
JS_ANCHOR = "  // ============ PART C FEATURE 1: RANGE & RANGE PENALTIES ============\n"
src = once(src, JS_ANCHOR, js + JS_ANCHOR, "js-block")

# ---- 5. recalcAll: Armor TN + Initiative ----
OLD_TN = """    const armorTN = parseFloat(document.getElementById('f_armorTN').value||'0');
    document.getElementById('f_currentTN').value = baseTN + armorTN;"""
NEW_TN = """    const armorTN = parseFloat(document.getElementById('f_armorTN').value||'0');
    // PART C FEATURE 2 - Armor TN is character state, not a roll, so the Stance effects that
    // change it (Full Attack -10, Defense +Air+Defense Rank, Full Defense's half-roll) land here
    // rather than in the P2 pipeline.
    const stanceTN = (typeof getStanceArmorTNBonus === 'function') ? getStanceArmorTNBonus() : 0;
    document.getElementById('f_currentTN').value = baseTN + armorTN + stanceTN;"""
src = once(src, OLD_TN, NEW_TN, "recalc-tn")

OLD_INIT = "    document.getElementById('f_initiative').value = formatRollNotation(reflexes+insightRank, reflexes);"
NEW_INIT = """    // PART C FEATURE 2 - Center grants +10 to the Initiative Score for the round after it.
    const stanceInit = (typeof getStanceInitiativeBonus === 'function') ? getStanceInitiativeBonus() : 0;
    document.getElementById('f_initiative').value =
      formatRollNotation(reflexes+insightRank, reflexes) + (stanceInit ? ' +' + stanceInit : '');"""
src = once(src, OLD_INIT, NEW_INIT, "recalc-init")

# ---- 6. Initiative roll routed through P2 ----
OLD_IROLL = """    const insightRank = parseInt(document.getElementById('f_insightRank').value||'0',10);
    showRollResult('Initiative', rollDicePool(reflexes+insightRank, reflexes));"""
NEW_IROLL = """    const insightRank = parseInt(document.getElementById('f_insightRank').value||'0',10);
    // PART C FEATURE 2 - routed through P2 so Center's +10 reaches the total honestly.
    rollWithModifiers('Initiative', makeRollContext(ROLL_KINDS.INITIATIVE, {}),
      reflexes+insightRank, reflexes);"""
src = once(src, OLD_IROLL, NEW_IROLL, "init-roll")

# ---- 7. rollWeaponAttack: Full Attack forbids ranged; consume Center bonus ----
OLD_GATE = """    let rangeDecision = null;
    if(isRangedWeapon(ctx.entry)){"""
NEW_GATE = """    // PART C FEATURE 2 - "Characters may not use the Full Attack Stance to deliver ranged
    // attacks." Refused before the range prompt so the player is not asked a pointless question.
    if(getCurrentStance() === 'Full Attack' && isRangedWeapon(ctx.entry)){
      await appAlert('The Full Attack Stance cannot be used to deliver ranged attacks.\\n\\n' +
                     'Change stance, or attack with a melee weapon.');
      setStatus('Attack cancelled \\u2014 Full Attack forbids ranged attacks.');
      return;
    }
    let rangeDecision = null;
    if(isRangedWeapon(ctx.entry)){"""
src = once(src, OLD_GATE, NEW_GATE, "fullattack-ranged-gate")

OLD_CONSUME = """    // PART C FEATURE 0 — post-render decorator hook. The wielded weapon resolves the
    // Emphasis unambiguously, so this never asks the player to pick one.
    attachEmphasisReroll(weaponAttackEmphasisContext(ctx.entry, ctx.skillName, rolled.finalKept));"""
NEW_CONSUME = """    // PART C FEATURE 2 - Center's next-round bonus is "one roll", so it is spent only once a
    // roll has actually happened. A cancelled attack never reaches this line and never burns it.
    consumeCenterBonusIfApplied(rolled);
    renderStanceTiles();
    // PART C FEATURE 0 — post-render decorator hook. The wielded weapon resolves the
    // Emphasis unambiguously, so this never asks the player to pick one.
    attachEmphasisReroll(weaponAttackEmphasisContext(ctx.entry, ctx.skillName, rolled.finalKept));"""
src = once(src, OLD_CONSUME, NEW_CONSUME, "consume-center")

# ---- 8. Init wiring (anchored on the reset handler, which is unique) ----
OLD_RESET = """    resetCombatRound(); setStatus('Combat rounds reset.');
  });
  renderCombatRoundUI();"""
NEW_RESET = """    resetCombatRound(); clearFullDefenseBonus(); setCurrentStance(DEFAULT_STANCE, {silent:true});
    setStatus('Combat rounds reset.');
  });
  renderCombatRoundUI();"""
src = once(src, OLD_RESET, NEW_RESET, "reset-handler")

# Stance wiring belongs in the init IIFE at the very bottom -- by then every `const` in the
# Feature 2 block has been initialised. Wiring it at the addWeapon point instead would run it
# ~2300 lines before `const STANCE_LIBRARY` exists and throw a temporal-dead-zone ReferenceError.
OLD_INIT_FN = """  (async function init(){
    resetToBaseline();
    await refreshCharSelect();
  })();"""
NEW_INIT_FN = """  (async function init(){
    resetToBaseline();
    // PART C FEATURE 2 - stance tiles + rules modal.
    renderStanceTiles();
    document.getElementById('stanceInfoClose').addEventListener('click', closeStanceInfo);
    document.getElementById('stanceInfoOverlay').addEventListener('click', e=>{
      if(e.target.id==='stanceInfoOverlay') closeStanceInfo();
    });
    document.addEventListener('keydown', e=>{
      if(e.key==='Escape' && document.getElementById('stanceInfoOverlay').style.display==='flex'){
        closeStanceInfo();
      }
    });
    await refreshCharSelect();
  })();"""
src = once(src, OLD_INIT_FN, NEW_INIT_FN, "init-fn-wiring")

OLD_NEXT = "    advanceCombatRound(); setStatus('Round ' + getCombatRound() + '.');"
NEW_NEXT = ("    advanceCombatRound(); recalcAll(); renderStanceTiles();\n"
            "    setStatus('Round ' + getCombatRound() + '.');")
src = once(src, OLD_NEXT, NEW_NEXT, "next-round-refresh")

# ---- 9. seam ----
SEAM = "    // ---- BUGFIX: school free-rank reconstruction ----"
SEAM_NEW = ("    // ---- PART C FEATURE 2: stance system ----\n"
            "    STANCE_LIBRARY, DEFAULT_STANCE, STANCE_ICONS, findStance,\n"
            "    getCurrentStance, setCurrentStance, renderStanceTiles, showStanceInfo, closeStanceInfo,\n"
            "    getStanceArmorTNBonus, getStanceInitiativeBonus, stancePreRollModifiers,\n"
            "    centerWasLastRound, centerBonusAvailable, consumeCenterBonus, consumeCenterBonusIfApplied,\n"
            "    getFullDefenseBonus, setFullDefenseBonus, clearFullDefenseBonus, rollFullDefenseDeclaration,\n"
            "    getRingValueByName,\n"
            + SEAM)
src = once(src, SEAM, SEAM_NEW, "seam")

if not os.path.isdir(OUTDIR): os.makedirs(OUTDIR)
write(OUT, src)
print("edits:", ", ".join(edits))
print("out: %d chars sha=%s" % (len(src), hashlib.sha256(src.encode('utf-8')).hexdigest()[:16]))
